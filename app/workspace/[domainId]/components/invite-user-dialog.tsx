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
import { Client, User } from "@absmach/magistrala-sdk";
import UserSearchInput from "./user-search-input";
import { Plus } from "lucide-react";
import { CreateClient } from "@/lib/clients";
import { Metadata } from "@/types/entities";
import { UpdateUser } from "@/lib/users";
import { toast } from "sonner";

const assignMembersSchema = () =>
    z.object({
        userIds: z
            .string()
            .array()
            .nonempty({ message: "ZodMessages.pleaseSelectAtLeastOneUser" }),
    });

interface AssignMemberProps {
    domainId: string;
    user: User;
    disabled?: boolean;
}
export function AssignMember({
    domainId,
    user,
    disabled,
}: AssignMemberProps) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    const form = useForm<z.infer<ReturnType<typeof assignMembersSchema>>>({
        resolver: zodResolver(assignMembersSchema()),
        defaultValues: {
            userIds: [],
        },
    });

    async function onSubmit(
        values: z.infer<ReturnType<typeof assignMembersSchema>>,
    ) {
        setProcessing(true);
        const toastId = toast("Sonner");
        toast.loading("Adding user to workspace", {
            id: toastId,
        });

        const domainRoles = await ListDomainRoles({
            queryParams: { offset: 0, limit: 10 },
        });
        const adminRole = domainRoles?.data?.roles?.find(
            (role) => role.name === "admin"
        );
        const response = await AddDomainRoleMembers(adminRole?.id as string, domainId, values.userIds);
        console.log("resp", response);

        const userNames = await Promise.all(
            values.userIds.map(async (id) => {
                const user = await GetUserBasicInfo(id);
                return typeof user === "string"
                    ? user
                    : user?.credentials?.username || id;
            }),
        );

        const domain = await GetDomainBasicInfo(domainId);
        const domainName =
            typeof domain === "object" && "name" in domain ? domain.name : domainId;

        if (response.error === null) {
            toast.success(
                `User(s) "${userNames.join(", ")}" added to workspace "${domainName}"`,
                {
                    id: toastId,
                },
            );
            const client: Client = {
                name: user.credentials?.username
            }
            const clientResult = await CreateClient({client, domainId});
            console.log("clientRes", clientResult);
            if (clientResult.error === null) {
                console.log("client created");
                const updatedMetadata: Metadata = {
                    ...user?.metadata,
                    ui:{
                    ...user?.metadata?.ui,
                    clientid: clientResult?.data.id,
                    secret: clientResult?.data.credentials?.secret,
                    }
                };
                const updatedUser: User = {
                    ...user,
                    metadata: updatedMetadata,
                };
                console.log("updtuser", updatedUser);
                const userResult = await UpdateUser(updatedUser);
                if (userResult.error === null) {
                    console.log("userResult", userResult);
                }
            }
            setProcessing(false);
            form.reset();
            setOpen(false);
        } else {
            toast.error(
                `Failed to add user to workspace with error "${response.error
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
                    <span>Invite user to workspace</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="rounded-md w-[90%] max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Invite User
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
                            name="userIds"
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
                                Invite
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
