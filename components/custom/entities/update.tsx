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
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
    CancelButton,
    EditButton,
    SaveButton,
} from "@/components/custom/entities/buttons";
import { UpdateServerSession } from "@/lib/actions";
import { AddWorkspaceRoleMembers } from "@/lib/workspace";
import { toSentenseCase } from "@/lib/utils";
import { EntityType } from "@/types/entities";
import { type Tag, TagInput } from "emblor";
import { Pencil } from "lucide-react";
import React, { type Dispatch, type SetStateAction, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export function StringArrayToTags(tags: string[]): Tag[] {
    return tags
        .map((tag) => tag.trim())
        .filter((tag) => tag !== "")
        .map((tag) => ({ id: tag, text: tag }));
}

export function TagsToStringArray(tags: Tag[]): string[] {
    const updatedTags: string[] = [];
    for (const tag of tags) {
        updatedTags.push(tag.text);
    }
    return updatedTags;
}

type UpdateTagsProps = {
    tags: string[];
    id: string;
    entity: EntityType;
    isTags?: boolean;
    roleName?: string;
    updateTags: (entity: { id: string; tags: string[] }) => Promise<
        | {
            data: string;
            error: null;
        }
        | {
            data: null;
            error: string;
        }
    >;
    disabled?: boolean;
};

export function UpdateTagsDialog({
    tags,
    id,
    entity,
    isTags = true,
    roleName,
    updateTags,
    disabled,
}: UpdateTagsProps) {
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const [newTags, setNewTags] = useState<Tag[]>(StringArrayToTags(tags));

    const formSchema = z.object({
        tags: z.array(z.object({ id: z.string(), text: z.string() })).optional(),
    });

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            tags: [],
        },
    });

    async function onSubmit(_values: z.infer<typeof formSchema>) {
        if (disabled) {
            return;
        }

        setProcessing(true);
        const toastId = toast("Sonner");
        toast.loading(`Updating ${entity} ...`, {
            id: toastId,
        });

        const updatedEntity = {
            id: id,
            tags: TagsToStringArray(newTags),
        };

        const result = isTags
            ? await updateTags(updatedEntity)
            : await AddWorkspaceRoleMembers(id, roleName as string, updatedEntity.tags);
        setProcessing(false);
        if (result.error === null) {
            toast.success(
                `${toSentenseCase(entity)} "${result.data}" updated successfully`,
                {
                    id: toastId,
                },
            );
            form.reset();
            setOpen(false);
        } else {
            toast.error(
                `Failed to update ${entity} with error "${result.error
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
                <Button
                    variant="outline"
                    size="icon"
                    className="hover:bg-primary/10"
                    disabled={disabled}
                >
                    <span className="sr-only">Edit</span>
                    <Pencil className="size-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="w-[90%] max-w-md max-h-[95%] overflow-auto">
                <DialogHeader>
                    <DialogTitle>
                        Update {toSentenseCase(entity)}
                    </DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 md:space-y-8 flex flex-col"
                    >
                        <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                                <TagsFormInput
                                    newTags={newTags}
                                    setTags={setNewTags}
                                    field={field}
                                />
                            )}
                        />
                        <DialogFooter className="flex flex-row justify-end gap-2">
                            <DialogClose asChild={true}>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={processing}
                                    onClick={() => form.reset()}
                                >
                                    Close
                                </Button>
                            </DialogClose>
                            <Button disabled={processing} type="submit">
                                Update
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

export function TagsFormInput({
    newTags,
    setTags,
    field,
    label = "Tags",
    placeholder = "Enter tags",
    allowDuplicates,
}: {
    newTags: Tag[];
    setTags: Dispatch<SetStateAction<Tag[]>>;
    // biome-ignore lint: field can be of type any
    field: any;
    label?: string;
    placeholder?: string;
    allowDuplicates?: boolean;
}) {
    const [activeTagIndex, setActiveTagIndex] = React.useState<number | null>(
        null,
    );

    return (
        <FormItem className="flex flex-col items-start">
            <FormLabel className="text-left">{label}</FormLabel>
            <FormControl className="w-full">
                <TagInput
                    {...field}
                    placeholder={placeholder}
                    tags={newTags}
                    setTags={(updatedTags) => {
                        setTags(updatedTags);
                    }}
                    showCounter={true}
                    name="tags"
                    shape="rounded"
                    truncate={45}
                    className="pl-2"
                    styleClasses={{
                        input: "shadow-none p-4",
                        inlineTagsContainer: "p-2",
                    }}
                    activeTagIndex={activeTagIndex}
                    setActiveTagIndex={setActiveTagIndex}
                    allowDuplicates={allowDuplicates}
                />
            </FormControl>
            <FormMessage />
        </FormItem>
    );
}

type UpdateNameProps = {
    name: string;
    id: string;
    entity: EntityType;
    // biome-ignore lint/suspicious/noExplicitAny: This is a valid use for any
    updateName: (entity: any) => Promise<
        | {
            data: string;
            error: null;
        }
        | {
            data: null;
            error: string;
        }
    >;
    updateGroup?: (name: string) => void;
    disabled?: boolean;
};

export function UpdateNameRow({
    name,
    id,
    entity,
    updateName,
    updateGroup,
    disabled,
}: UpdateNameProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [processing, setProcessing] = useState(false);

    const formSchema = () =>
        z.object({
            name: z.string().min(1, { error: "Name is required"}),
        });
    const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
        resolver: zodResolver(formSchema()),
        defaultValues: {
            name: name,
        },
    });

    async function onSubmit(values: z.infer<ReturnType<typeof formSchema>>) {
        if (disabled) {
            return;
        }

        setProcessing(true);
        const toastId = toast("Sonner");
        toast.loading(`Updating ${entity} ...`, {
            id: toastId,
        });

        const updatedEntity = {
                id: id,
                name: values.name,
            };

        const result = await updateName(updatedEntity);
        setProcessing(false);
        if (result.error === null) {
            toast.success(
                `${toSentenseCase(entity)} "${result.data}" updated successfully`,
                {
                    id: toastId,
                },
            );
            if (entity === EntityType.Workspace) {
                UpdateServerSession();
            }
            setIsEditing(false);
        } else {
            toast.error(
                `Failed to update ${entity} with error "${result.error
                }"`,
                {
                    id: toastId,
                },
            );
        }
    }

    return (
        <TableRow className="h-20">
            <TableHead>
               Name
            </TableHead>

            <TableCell>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-row justify-between"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            defaultValue={name}
                            render={({ field, fieldState: { error } }) => (
                                <FormItem className="w-full ">
                                    <FormLabel className="sr-only">Name</FormLabel>
                                    <FormControl className="w-4/5 ">
                                        <Input
                                            {...field}
                                            disabled={!isEditing || disabled}
                                            className="truncate ..."
                                        />
                                    </FormControl>
                                    <FormMessage>{error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-row gap-2">
                            {isEditing ? (
                                <div className="flex flex-row gap-2">
                                    <SaveButton disabled={processing} />
                                    <CancelButton
                                        disabled={processing}
                                        onClick={() => {
                                            form.reset({ name: name }, { keepValues: false });
                                            setIsEditing(false);
                                        }}
                                    />
                                </div>
                            ) : (
                                <EditButton
                                    onClick={() => setIsEditing(true)}
                                    disabled={disabled}
                                />
                            )}
                        </div>
                    </form>
                </Form>
            </TableCell>
        </TableRow>
    );
}

type UpdateDescriptionProps = {
    description: string;
    id: string;
    entity: EntityType;
    disabled?: boolean;
    updateDescription: (entity: { id: string; description: string }) => Promise<
        | {
            data: string;
            error: null;
        }
        | {
            data: null;
            error: string;
        }
    >;
};

export function UpdateDescriptionRow({
    description,
    id,
    entity,
    updateDescription,
    disabled,
}: UpdateDescriptionProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [processing, setProcessing] = useState(false);

    const formSchema = z.object({
        description: z.string().optional(),
    });
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            description: description,
        },
    });

    function getTextAreaHeight(length: number) {
        if (length > 300) {
            return "min-h-[130px]";
        }
        if (length > 200) {
            return "min-h-[100px]";
        }
        if (length > 100) {
            return "min-h-[70px]";
        }
        if (length > 50) {
            return "min-h-[50px]";
        }
        return "min-h-[30px]";
    }

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (disabled) {
            return;
        }

        setProcessing(true);
        const toastId = toast("Sonner");
        toast.loading(`Updating ${entity} ...`, {
            id: toastId,
        });

        const updatedEntity = {
            id: id,
            description: values.description as string,
        };
        const result = await updateDescription(updatedEntity);
        setProcessing(false);
        if (result.error === null) {
            toast.success(
                `${toSentenseCase(entity)} "${result.data}" updated successfully`,
                {
                    id: toastId,
                },
            );
            setIsEditing(false);
        } else {
            toast.error(
                `Failed to update ${entity} with error "${result.error
                }"`,
                {
                    id: toastId,
                },
            );
        }
    }

    return (
        <TableRow className="h-20">
            <TableHead>Description</TableHead>
            <TableCell>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="flex flex-row justify-between"
                    >
                        <FormField
                            control={form.control}
                            name="description"
                            defaultValue={description}
                            render={({ field, fieldState: { error } }) => (
                                <FormItem className="w-full">
                                    <FormLabel className="sr-only">
                                        Description
                                    </FormLabel>
                                    <FormControl className="w-4/5">
                                        <Textarea
                                            placeholder={"Enter description ..."}
                                            {...field}
                                            disabled={!isEditing || disabled}
                                            className={getTextAreaHeight(description?.length)}
                                        />
                                    </FormControl>
                                    <FormMessage>{error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                        <div className="flex flex-row gap-2">
                            {isEditing ? (
                                <div className="flex flex-row gap-2">
                                    <SaveButton disabled={processing} />
                                    <CancelButton
                                        disabled={processing}
                                        onClick={() => {
                                            form.reset(
                                                { description: description },
                                                { keepValues: false },
                                            );
                                            setIsEditing(false);
                                        }}
                                    />
                                </div>
                            ) : (
                                <EditButton
                                    onClick={() => setIsEditing(true)}
                                    disabled={disabled}
                                />
                            )}
                        </div>
                    </form>
                </Form>
            </TableCell>
        </TableRow>
    );
}

type UpdateNameDialogProps = {
    name: string;
    id: string;
    entity: EntityType;
    open: boolean;
    setOpen: Dispatch<SetStateAction<boolean>>;
    // biome-ignore lint/suspicious/noExplicitAny: This is a valid use for any
    updateName: (entity: any) => Promise<
        | {
            data: string;
            error: null;
        }
        | {
            data: null;
            error: string;
        }
    >;
};

export function UpdateNameDialog({
    name,
    id,
    entity,
    updateName,
    open,
    setOpen,
}: UpdateNameDialogProps) {
    const [processing, setProcessing] = useState(false);

    const formSchema = () =>
        z.object({
            name: z.string().min(1, { error: "Name is required" }),
        });
    const form = useForm<z.infer<ReturnType<typeof formSchema>>>({
        resolver: zodResolver(formSchema()),
        defaultValues: {
            name: name,
        },
    });

    async function onSubmit(values: z.infer<ReturnType<typeof formSchema>>) {
        setProcessing(true);
        const toastId = toast("Sonner");
        toast.loading(`Updating ${entity} ...`, {
            id: toastId,
        });

        const updatedEntity = {
                id: id,
                name: values.name,
            };

        const result = await updateName(updatedEntity);
        setProcessing(false);
        if (result.error === null) {
            toast.success(
                `${toSentenseCase(entity)} "${result.data}" updated successfully`,
                {
                    id: toastId,
                },
            );
            if (entity === EntityType.Domain) {
                UpdateServerSession();
            }
        } else {
            toast.error(
                `Failed to update ${entity} with error "${result.error
                }"`,
                {
                    id: toastId,
                },
            );
        }
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Update {entity} name</DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4 md:space-y-8"
                    >
                        <FormField
                            control={form.control}
                            name="name"
                            defaultValue={name}
                            render={({ field, fieldState: { error } }) => (
                                <FormItem className="w-full">
                                    <FormLabel>
                                       Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input {...field} className="truncate ..." />
                                    </FormControl>
                                    <FormMessage>{error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />
                        <DialogFooter className="flex flex-row justify-end">
                            <DialogClose asChild={true}>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={processing}
                                    onClick={() => form.reset()}
                                >
                                    Close
                                </Button>
                            </DialogClose>
                            <Button disabled={processing} type="submit">
                                Update
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
