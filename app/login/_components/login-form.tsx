"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const formSchema = () =>
    z.object({
        identity: z
            .union([
                z.string().email({ message: "ZodMessages.usernameRequired" }),
                z.string().min(3, { message: "ZodMessages.usernameRequired" }),
            ])
            .refine((val) => val.trim() !== "", {
                message: ("Username and email required"),
            }),
        password: z.string().min(8, { message: "Password must be 8 characters long" })
    });

const Loginform = ({ basePath }: { basePath: string }) => {
    const [processing, setProcessing] = useState(false);
    const [seePassword, toggleSeePassword] = useState(false);
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl");
    const error = searchParams.get("error")?.replace(/^"|"$/g, "");
    const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
        resolver: zodResolver(formSchema()),
        defaultValues: {
            identity: "",
            password: "",
        },
    });

    async function onsubmit(values: z.infer<ReturnType<typeof formSchema>>) {
        setProcessing(true);
        await signIn("credentials", {
            redirect: true,
            callbackUrl: callbackUrl ?? `${basePath || "/"}`,
            identity: values.identity,
            password: values.password,
        });
        setProcessing(false);
    }
    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onsubmit)}
                    className="space-y-4 md:space-y-8 text-logincard-foreground"
                >
                    <FormField
                        control={form.control}
                        name="identity"
                        render={({ field, fieldState: { error } }) => (
                            <FormItem>
                                <FormLabel className="text-black">Email or Username</FormLabel>
                                <FormControl>
                                    <Input
                                        disabled={processing}
                                        placeholder="Enter email or username"
                                        {...field}
                                        className="text-popover-foreground bg-background"
                                    />
                                </FormControl>
                                <FormMessage>{error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field, fieldState: { error } }) => (
                            <FormItem>
                                <FormLabel className="text-black">Password</FormLabel>
                                <FormControl>
                                    <div className="flex items-center space-x-2">
                                        <Input
                                            disabled={processing}
                                            type={seePassword ? "text" : "password"}
                                            placeholder={"Enter password"}
                                            {...field}
                                            className={"text-card-foreground"}
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
                                </FormControl>
                                <FormMessage>{error?.message}</FormMessage>
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="flex w-full justify-center bg-accent text-card-foreground hover:bg-accent/50 hover:text-popover-foreground/80 rounded-md text-sm font-semibold leading-6"
                    >
                        Sign In
                    </Button>
                </form>
            </Form>
            {error ? (
                <div className="text-md place-content-center mt-2 font-bold text-red-600  ">
                    {error}
                </div>
            ) : null}
        </>
    );
};

export default Loginform;
