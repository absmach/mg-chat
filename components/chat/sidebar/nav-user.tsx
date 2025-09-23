"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { UpdateServerSession } from "@/lib/actions";
import { UpdateUser, UpdateUserEmail, UpdateUsername } from "@/lib/users";
import { User } from "@absmach/magistrala-sdk";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogOut, Mail, UserIcon } from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";
import PasswordSettingsForm from "./password-settings";

interface Props {
  user: User;
}

const userNameRegex = /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,31}$/;

const emailLikeRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const usernameField = () =>
  z
    .string()
    .min(3, { error: "User name must be 8 characters long" })
    .max(32, { error: "Username must be at most 32 characters." })
    .refine((val) => !emailLikeRegex.test(val), {
      error: "Username cannot be an email address.",
    })
    .refine((val) => userNameRegex.test(val), {
      error:
        "Username must start with a letter or number and can include hyphens or underscores.",
    })
    .refine((val) => !val.includes("__") && !val.includes("--"), {
      error: "Username cannot contain double underscores or double hyphens.",
    });

const formSchema = () =>
  z.object({
    email: z.email("Please enter a valid email"),
    username: usernameField(),
    // biome-ignore lint/style/useNamingConvention: This is from an outside library
    first_name: z.string(),
    // biome-ignore lint/style/useNamingConvention: This is from an outside library
    last_name: z.string(),
  });

export function NavUser({ user }: Props) {
  const route = useRouter();
  const { update } = useSession();
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false)
  const [processing, setProcessing] = useState(false);
  const initialEmail = user?.email;
  const initialUsername = user?.credentials?.username;
  const initialFirstName = user?.first_name;
  const initialLastName = user?.last_name;
  const id = user?.id
  const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
    resolver: zodResolver(formSchema()),
    defaultValues: {
      email: initialEmail ?? "",
      username: initialUsername ?? "",
      // biome-ignore lint/style/useNamingConvention: This is from an outside library
      first_name: initialFirstName ?? "",
      // biome-ignore lint/style/useNamingConvention: This is from an outside library
      last_name: initialLastName ?? "",
    },
  });

  async function onSubmit(values: z.infer<ReturnType<typeof formSchema>>) {
    setProcessing(true);
    const updates: Partial<User> = {};
    const hasChanged = (
      key: keyof typeof values,
      initialValue: string | undefined,
    ) => values[key] !== initialValue;

    if (hasChanged("email", initialEmail)) {
      updates.email = values.email;
    }
    if (hasChanged("username", initialUsername)) {
      updates.credentials = { username: values.username };
    }
    if (hasChanged("first_name", initialFirstName)) {
      updates.first_name = values.first_name;
    }
    if (hasChanged("last_name", initialLastName)) {
      updates.last_name = values.last_name;
    }

    toast.promise(
      (async () => {
        try {
          if (updates.email) {
            const result = await UpdateUserEmail({ id, email: updates.email });
            if (result.error) {
              form.setError("email", {
                type: "manual",
                message: result.error,
              });
              throw new Error(result.error);
            }
          }
          if (updates.credentials) {
            const result = await UpdateUsername({
              id,
              credentials: updates.credentials,
            });
            if (result.error) {
              form.setError("username", {
                type: "manual",
                message: result.error,
              });
              throw new Error(result.error);
            }
          }
          if (updates.first_name || updates.last_name) {
            const result = await UpdateUser({ id, ...updates });
            if (result?.error) {
              if (updates.first_name) {
                form.setError("first_name", {
                  type: "manual",
                  message: result.error,
                });
              } else if (updates.last_name) {
                form.setError("last_name", {
                  type: "manual",
                  message: result.error,
                });
              } else {
                throw new Error(result.error);
              }
            }
          }
          if (Object.keys(updates).length > 0) {
            await UpdateServerSession();
            update({
              ...user,
              ...updates,
              ...(updates.credentials && {
                username: updates.credentials.username,
              }),
            });
          }
        } finally {
          setProcessing(false);
          setIsEditDialogOpen(false);
        }
      })(),
      {
        loading: "Updating account details ...",
        duration: 7000,
        success: () => "Account details updated successfully",
        error: () => "Failed to update account details",
      },
    );
  }

  return (
    <div className="p-4 border-t border-gray-700">
      <Sheet open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <SheetTrigger asChild>
          <div className="flex items-center space-x-3 cursor-pointer hover:bg-gray-700 rounded-lg p-2 -m-2">
            <Avatar>
              <AvatarImage src={user?.profile_picture || "/placeholder.svg"} />
              <AvatarFallback className="bg-purple-600 text-white">{user?.credentials?.username?.charAt(0) || "U"}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.credentials?.username || "User"}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email || "user@example.com"}</p>
            </div>
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700 cursor-pointer"
                onClick={async (e) => {
                  e.stopPropagation()
                  const data = await signOut({
                    redirect: false,
                    callbackUrl: "/auth",
                  })
                  route.push(data.url)
                }}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </SheetTrigger>

        <SheetContent side="right" className="w-[400px] sm:w-[540px] bg-gray-900 border-gray-700 p-4">
          <SheetHeader className="flex flex-row items-center justify-between">
            <SheetTitle className="text-white">Profile</SheetTitle>
          </SheetHeader>

          <div className="py-6 space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="h-32 w-32">
                <AvatarImage src={user?.profile_picture} />
                <AvatarFallback className="bg-purple-600 text-white text-4xl">
                  {user?.credentials?.username?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>

              <div className="text-center">
                <h2 className="text-2xl font-bold text-white">{user?.credentials?.username}</h2>
              </div>
            </div>
            <Separator className="bg-gray-700" />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">About me</h3>
                <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-blue-400 bg-transparent"
                    >
                      Edit
                    </Button>
                  </DialogTrigger>

                  <DialogContent className="sm:max-w-[600px] bg-gray-900 border-gray-700 text-white max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle className="text-white">Edit your account details</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      <div className="items-center mb-8 space-x-6">
                        <div className="flex flex-col items-center space-y-3">
                          <Avatar className="h-36 w-36">
                            <AvatarImage src={user?.profile_picture} />
                            <AvatarFallback className="bg-purple-600 text-white text-2xl">
                              {(user?.credentials?.username as string).charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                      </div>
                      <Form {...form}>
                        <form
                          onSubmit={form.handleSubmit(onSubmit)}
                          className="space-y-6 p-4 md:p-6"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="email"
                              render={({ field, fieldState: { error } }) => (
                                <FormItem>
                                  <FormLabel>
                                    Email Address
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="email"
                                      placeholder={"Enter email ..."}
                                    />
                                  </FormControl>
                                  <FormMessage>{error?.message}</FormMessage>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="username"
                              render={({ field, fieldState: { error } }) => (
                                <FormItem>
                                  <FormLabel>
                                    User name
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      {...field}
                                      type="username"
                                      placeholder={"Enter username ..."}
                                    />
                                  </FormControl>
                                  <FormMessage>{error?.message}</FormMessage>
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={form.control}
                              name="first_name"
                              render={({ field, fieldState: { error } }) => (
                                <FormItem className="w-full">
                                  <FormLabel>First Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder={"Enter first name ..."} />
                                  </FormControl>
                                  <FormMessage>{error?.message}</FormMessage>
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={form.control}
                              name="last_name"
                              render={({ field, fieldState: { error } }) => (
                                <FormItem className="w-full">
                                  <FormLabel>Last Name</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder={"Enter last name"} />
                                  </FormControl>
                                  <FormMessage>{error?.message}</FormMessage>
                                </FormItem>
                              )}
                            />
                          </div>
                          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
                            <Button type="submit" disabled={processing} className="bg-green-600 hover:bg-green-700 text-white">
                              Save Changes
                            </Button>
                          </div>
                        </form>
                      </Form>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-300">Email Address</p>
                  <p className="text-sm text-blue-400">{user?.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-300">User names</p>
                  <p className="text-sm text-blue-400">{user?.first_name} {""} {user?.last_name}</p>
                </div>
              </div>
            </div>

            <Separator className="bg-gray-700" />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-white">Passwords</h3>
                <PasswordSettingsForm isPasswordDialogOpen={isPasswordDialogOpen} setIsPasswordDialogOpen={setIsPasswordDialogOpen}/>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div >
  )
}
