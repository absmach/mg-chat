"use client";

import type { Domain } from "@absmach/magistrala-sdk";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { CreateDomain } from "@/lib/domains";

const routeRegex = /^[a-zA-Z][a-zA-Z0-9_-]{0,35}$/;

const formSchema = () =>
    z
        .object({
            name: z.string().min(1, { message: "Name is Required" }),
            route: z
                .string()
                .min(1, { message: "Route is required" })
                .max(36, { message: "Route must be 36 characters or fewer" })
                .regex(routeRegex, {
                    message:
                        "Route must start with a letter and contain only letters, numbers, hyphens, or underscores.",
                })
                .refine((val) => !val.includes("__") && !val.includes("--"), {
                    message: "Route cannot contain double underscores or double hyphens.",
                }),
        });

export const CreateWorkspaceForm = () => {
    const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
        resolver: zodResolver(formSchema()),
        defaultValues: {
            name: "",
            route: "",
        },
    });
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    async function onSubmit(values: z.infer<ReturnType<typeof formSchema>>) {
        setProcessing(true);

        const domain: Domain = {
            name: values.name,
            route: values.route,
        };

        // toast.loading(
        //     `${t("ToastMessages.creating")} ${t("Entity.channel").toLowerCase()}...`,
        //     {
        //         id: toastId,
        //     },
        // );

        const result = await CreateDomain(domain);
        setProcessing(false);
        if (result.error === null) {
            // toast.success(
            //     `${t("Entity.channel")}  "${result.data.name}" ${t(
            //         "ToastMessages.createdSuccessfully",
            //     )}`,
            //     {
            //         id: toastId,
            //     },
            // );
            form.reset();
            setOpen(false);
        } else {
            // toast.error(
            //     `${t("ToastMessages.failedToCreate")}${t(
            //         "Entity.channel",
            //     )} with error "${result.error}"`,
            //     {
            //         id: toastId,
            //     },
            // );
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild={true}>
                <Button className=" hover:bg-gray-600">
                    <Plus className="w-5 h-5" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[90%] max-w-md max-h-[95%] overflow-auto">
                <DialogHeader>
                    <DialogTitle>Create a workspace</DialogTitle>
                    <DialogDescription>
                       A workspace is a shared hub where you and your team can work together.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 md:space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field, fieldState: { error } }) => (
                                <FormItem>
                                    <FormLabel>
                                        Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter name ..."  {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is the name of your company, team or organization.
                                    </FormDescription>
                                    <FormMessage>{error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="route"
                            render={({ field, fieldState: { error } }) => (
                                <FormItem>
                                    <FormLabel>
                                        Route
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Enter route ..."  {...field} />
                                    </FormControl>
                                    <FormDescription className="mt-2">
                                        A user-friendly alias for this domain’s ID, useful for
                                        referencing or subscribing without the full UUID.
                                        <br />
                                        <strong>
                                            It is set only during creation and cannot be changed
                                            later.
                                        </strong>{" "}
                                        Choose something short and descriptive.
                                    </FormDescription>
                                    <FormMessage>{error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="flex flex-row justify-end gap-2">
                            <DialogClose asChild={true}>
                                <Button
                                    type="reset"
                                    variant="secondary"
                                    disabled={processing}
                                    onClick={() => {
                                        form.reset();
                                    }}
                                >
                                    Close
                                </Button>
                            </DialogClose>
                            <Button disabled={processing} type="submit">
                                Create
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
