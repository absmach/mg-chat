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
import CodeMirrorEditor from "@/components/custom/codemirror";
import {
    lightDialogTheme,
    toSentenseCase,
} from "@/lib/utils";
import {
    EntityType,
    type Metadata,
} from "@/types/entities";
import { Pencil } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { JSONTree } from "react-json-tree";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
    metadata: Metadata;
    entity: EntityType;
    updateMetadata: (entity: { id: string; metadata: Metadata }) => Promise<
        | {
            data: string;
            error: null;
        }
        | {
            data: null;
            error: string;
        }
    >;
    id: string;
    disabled?: boolean;
}
export function MetadataComponent({
    metadata,
    entity,
    id,
    updateMetadata,
    disabled,
}: Props) {
    const [currentMeta, setCurrentMeta] = useState<Metadata>({});
    useEffect(() => {
        setCurrentMeta(metadata);
    }, [metadata]);

    return (
        <div className="flex flex-row justify-between">
            <ViewMetadataDialog metadata={currentMeta} entity={entity} />
            <UpdateMetadataDialog
                id={id}
                entity={entity}
                updateMetadata={updateMetadata}
                metadata={metadata}
                setMetadata={setCurrentMeta}
                disabled={disabled}
            />
        </div>
    );
}

export function ViewMetadataDialog({
    metadata,
    entity,
}: {
    metadata: Metadata;
    entity: EntityType;
}) {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild={true}>
                <Button variant="outline">View Metadata</Button>
            </DialogTrigger>
            <DialogContent className="space-x-2 overflow-y-auto md:max-h-[700px] w-[90%] max-w-lg">
                <DialogHeader>
                    <DialogTitle>Metadata</DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <JSONTree
                    data={
                        entity === EntityType.User
                            ? (metadata?.admin ?? {})
                            : (metadata?.ui ?? {})
                    }
                    theme={lightDialogTheme}
                    shouldExpandNodeInitially={(_keyName, _data, level) => level < 2}
                />
                <DialogFooter className="flex flex-row justify-end gap-2">
                    <DialogClose asChild={true}>
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => {
                                setOpen(false);
                            }}
                        >
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type UpdateMetadataProps = {
    metadata: Metadata;
    id: string;
    entity: EntityType;
    updateMetadata: (entity: { id: string; metadata: Metadata }) => Promise<
        | {
            data: string;
            error: null;
        }
        | {
            data: null;
            error: string;
        }
    >;
    setMetadata: Dispatch<SetStateAction<Metadata>>;
    disabled?: boolean;
};

const formSchema = z
    .object({
        metadata: z.string().optional(),
    })
    .superRefine((data, ctx) => {
        try {
            if (data.metadata) {
                JSON.parse(data.metadata);
            }
        } catch (error) {
            ctx.addIssue({
                code: "custom",
                message: `${error}`,
                path: ["metadata"],
            });
        }
    });

export default function UpdateMetadataDialog({
    metadata,
    id,
    entity,
    updateMetadata,
    setMetadata,
    disabled,
}: UpdateMetadataProps) {
    const adminMetadata = metadata?.admin || {};

    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const initialValue = JSON.stringify(
        entity === EntityType.User ? adminMetadata : metadata?.ui,
        null,
        2,
    );

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            metadata: initialValue,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (disabled) {
            return;
        }

        setProcessing(true);

        const toastId = toast("Sonner");
        toast.loading(`Updating ${entity} ...`, {
            id: toastId,
        });

        try {
            const updatedMetadata: Metadata = metadata;
            const parsed = JSON.parse(values.metadata as string);

            if (entity === EntityType.User) {
                updatedMetadata.admin = parsed;
            } else {
                updatedMetadata.ui = parsed;
            }

            const updatedEntity = {
                id: id,
                metadata: updatedMetadata,
            };

            const response = await updateMetadata(updatedEntity);
            setProcessing(false);

            if (response.error === null) {
                setMetadata(updatedMetadata);
                toast.success("Metadata updated successfully", { id: toastId });
                setOpen(false);
            } else {
                toast.error(
                    `Failed to update metadata with error "${response.error}".`,
                    { id: toastId },
                );
            }
        } catch (_err) {
            toast.error("Invalid JSON format", { id: toastId });
            setProcessing(false);
            return;
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
            <DialogContent className="overflow-y-auto md:max-h-[700px] w-[90%] max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        Update {toSentenseCase(entity)} metadata
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
                            name="metadata"
                            render={({ field, fieldState: { error } }) => (
                                <FormItem>
                                    <FormLabel>Metadata</FormLabel>
                                    <FormControl>
                                        <CodeMirrorEditor
                                            value={field.value || "{}"}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage>{error?.message}</FormMessage>
                                </FormItem>
                            )}
                        />

                        <DialogFooter className="flex flex-row justify-end gap-2">
                            <DialogClose asChild={true}>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    disabled={processing}
                                    onClick={() => {
                                        setOpen(false);
                                        form.reset({ metadata: initialValue });
                                    }}
                                >
                                    Close
                                </Button>
                            </DialogClose>
                            <Button type="submit" disabled={processing}>
                                Update
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
