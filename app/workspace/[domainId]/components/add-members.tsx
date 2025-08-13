"use client";

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
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
// import { RequiredAsterisk } from "@/custom/required";
// import type { EntityFetchData } from "@/lib/actions";
import {
    AddDomainRoleMembers,
    GetDomainBasicInfo,
    GetUserBasicInfo,
    ListDomainRoles,
} from "@/lib/domains";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Client, User } from "@absmach/magistrala-sdk";
import UserSearchInput from "./user-search-input";
import { Plus } from "lucide-react";
import { ConnectClients, CreateClient } from "@/lib/clients";
import { Metadata } from "@/types/entities";
import { UpdateUser } from "@/lib/users";
import { toast } from "sonner";

const addMembersSchema = () =>
    z.object({
        clientIds: z
            .string()
            .array()
            .nonempty({ message: "Please select at least one user" }),
    });

interface AddMemberProps {
    channelId: string;
    disabled?: boolean;
}
export function AddMember({
    channelId,
    disabled,
}: AddMemberProps) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const form = useForm<z.infer<ReturnType<typeof addMembersSchema>>>({
        resolver: zodResolver(addMembersSchema()),
        defaultValues: {
            clientIds: [],
        },
    });

    async function onSubmit(
        values: z.infer<ReturnType<typeof addMembersSchema>>,
    ) {
        setProcessing(true);
        const toastId = toast("Sonner");
         toast.loading("Adding members ...", {
             id: toastId,
        });

        const response = await ConnectClients(values.clientIds, channelId, ["publish", "subscribe"]);


        setProcessing(false);
        if (response.error === null) {
            toast.success(
                "User(s) successfully added.",
                {
                    id: toastId,
                },
            );
            form.reset();
            setOpen(false);
        } else {
            toast.error(
                `Failed to add members with error "${response.error
                }"`,
                {
                    id: toastId,
                },
            );
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild={true}>
                <Button disabled={disabled} variant="ghost" className="text-gray-500">
                    <Plus className="h-5 mr-2" />
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-md w-[90%] max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Add User
                    </DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 md:space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="clientIds"
                            render={({ field, fieldState: { error } }) => (
                                <FormItem>
                                    <FormLabel>
                                        Users
                                    </FormLabel>
                                    <UserSearchInput field={field} />
                                    <FormMessage>{error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="flex flex-row justify-end gap-2">
                            <DialogClose asChild={true}>
                                <Button disabled={processing} type="button" variant="secondary">
                                    Close
                                </Button>
                            </DialogClose>
                            <Button disabled={processing} type="submit">
                                Add
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
