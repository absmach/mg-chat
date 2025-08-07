"use client";

import type { Channel } from "@absmach/magistrala-sdk";
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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CreateChannel } from "@/lib/channels";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = () =>
    z
        .object({
            name: z.string().min(1, { message: "Name is Required" }),
        });

interface Props {
    groupId?: string;
    disabled?: boolean;
}
export const CreateChannelForm = ({ groupId, disabled }: Props) => {
    const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
        resolver: zodResolver(formSchema()),
        defaultValues: {
            name: "",
        },
    });
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    async function onSubmit(values: z.infer<ReturnType<typeof formSchema>>) {
        setProcessing(true);

        const channel: Channel = {
            name: values.name,
            // biome-ignore lint/style/useNamingConvention: This is from an external library
            parent_group_id: groupId,
        };

        // toast.loading(
        //     `${t("ToastMessages.creating")} ${t("Entity.channel").toLowerCase()}...`,
        //     {
        //         id: toastId,
        //     },
        // );

        const result = await CreateChannel(channel);
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
                <Button disabled={disabled} variant="ghost" className="w-full justify-start px-2 py-1 h-auto text-gray-500">
                    <Plus className="h-5 mr-2" />
                    <span>Add Channel</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[90%] max-w-md max-h-[95%] overflow-auto">
                <DialogHeader>
                    <DialogTitle>Create a channel</DialogTitle>
                    <DialogDescription>
                        Channels are where your team communicates. They are best when organized around a topic — #marketing, for example.
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
