import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UpdateUserPassword } from "@/lib/users";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

const formSchema = () =>
    z
        .object({
            currentPassword: passwordField(),
            newPassword: passwordSchema(),
            confirmPassword: confirmPasswordField(),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
            error: ("Passwords do not match"),
            path: ["confirmPassword"],
        });

export default function PasswordSettingsForm({ isPasswordDialogOpen, setIsPasswordDialogOpen }: { isPasswordDialogOpen: boolean; setIsPasswordDialogOpen: Dispatch<SetStateAction<boolean>> }) {
    const [processing, setProcessing] = useState(false);
    const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
        resolver: zodResolver(formSchema()),
        defaultValues: {
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        },
    });

    async function onSubmit(values: z.infer<ReturnType<typeof formSchema>>) {
        setProcessing(true);
        const oldSecret = values.currentPassword;
        const newSecret = values.newPassword;

        const toastId = toast("Sonner");

        toast.loading("Updating account details ...", {
            id: toastId,
        });

        const result = await UpdateUserPassword(oldSecret, newSecret);
        setProcessing(false);
        if (result.error) {
            toast.error("Failed to update account details", {
                id: toastId,
            });
            form.reset();
            return;
        }

        toast.success("Account details updated successfully", {
            id: toastId,
        });
        form.reset();
    }


    return (
        <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="text-blue-400 bg-transparent"
                >
                    Edit
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] bg-gray-900 text-white max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-white">Edit your account password</DialogTitle>
                </DialogHeader>
                <DialogDescription />
                <div className="space-y-6 py-4">
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-4 md:space-y-8 p-4"
                        >
                            <FormField
                                control={form.control}
                                name="currentPassword"
                                render={({ field, fieldState: { error } }) => (
                                    <FormItem>
                                        <FormLabel>
                                            Current password
                                        </FormLabel>
                                        <FormControl>
                                            <PasswordFormInput processing={processing} field={field} />
                                        </FormControl>
                                        <FormMessage>{error?.message}</FormMessage>
                                    </FormItem>
                                )}
                            />
                            <div className="flex flex-col sm:flex-row gap-2 sm:gap-8 justify-between">
                                <div className="w-full space-y-4">
                                    <FormField
                                        control={form.control}
                                        name="newPassword"
                                        render={({ field, fieldState: { error } }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    New password
                                                </FormLabel>
                                                <FormControl>
                                                    <PasswordFormInput processing={processing} field={field} />
                                                </FormControl>
                                                <FormMessage>{error?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="flex flex-col w-full">
                                    <FormField
                                        control={form.control}
                                        name="confirmPassword"
                                        render={({ field, fieldState: { error } }) => (
                                            <FormItem>
                                                <FormLabel>
                                                    Confirm password
                                                </FormLabel>
                                                <FormControl>
                                                    <PasswordFormInput processing={processing} field={field} />
                                                </FormControl>
                                                <FormMessage>{error?.message}</FormMessage>
                                            </FormItem>
                                        )}
                                    />
                                </div>
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
    )
}

type RegisterController = ControllerRenderProps<
    {
        email: string;
        password: string;
        name: string;
    },
    "password"
>;

type LoginController = ControllerRenderProps<
    {
        email: string;
        password: string;
    },
    "password"
>;

type ResetPasswordController = ControllerRenderProps<
    {
        password: string;
        confirmPassword: string;
    },
    "confirmPassword"
>;

type UpdatePasswordController = ControllerRenderProps<{
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}>;

type Props = {
    processing?: boolean;
    autoComplete?: string;
    field:
    | RegisterController
    | LoginController
    | ResetPasswordController
    | UpdatePasswordController;
    className?: string;
};

export function PasswordFormInput({
    processing,
    field,
    autoComplete,
    className,
}: Props) {
    const [seePassword, toggleSeePassword] = useState(false);

    return (
        <div className="flex items-center space-x-2">
            <Input
                disabled={processing}
                autoComplete={autoComplete}
                type={seePassword ? "text" : "password"}
                placeholder={"Enter password ..."}
                {...field}
                className={cn("text-white", className)}
            />
            <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => toggleSeePassword((prev) => !prev)}
            >
                <span className="sr-only">toggle view password</span>
                {seePassword ? (
                    <EyeOffIcon className="size-4 text-zinc-700" />
                ) : (
                    <EyeIcon className="size-4 text-zinc-700" />
                )}
            </Button>
        </div>
    );
}

export const passwordField = () =>
    z.string().min(8, { error: "Password should be 8 characters long" });

export const confirmPasswordField = () =>
    z.string().min(8, { error: "Password should be 8 characters long" });

export const passwordSchema = () => {
    return z
        .string()
        .min(8, {
            error: "Password should be 8 characters long",
        })
};