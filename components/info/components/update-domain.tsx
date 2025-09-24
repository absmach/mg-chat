"use client";

import type { Domain } from "@absmach/magistrala-sdk";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Status } from "@/types/entities";
import { useState } from "react";
import { DomainStatusDialog } from "./domain-satus";
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { DisableWorkspace, EnableWorkspace } from "@/lib/workspace";

interface StatusProps {
    status: Status;
    workspace: Domain;
}

export function UpdateStatusDialog({ status, workspace }: StatusProps) {
    const isEntityEnabled = status === "enabled";
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);
    return (
        <>
            <Button
                variant="outline"
                className={cn(
                    isEntityEnabled
                        ? "border-disabled text-disabled hover:text-disabled hover:border-disabled"
                        : "border-enabled text-enabled hover:text-enabled hover:border-enabled",
                )}
                onClick={() => setOpen(true)}
            >
                {isEntityEnabled ? "Disable" : "Enable"}
            </Button>
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent className="rounded-md w-[90%] max-w-md">
                    <AlertDialogHeader>
                        <AlertDialogTitle> Are you sure? </AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to {" "}
                            <span
                                className={`font-bold ${isEntityEnabled ? "text-red-500" : "text-green-500"
                                    }`}
                            >
                                {isEntityEnabled ? "disable" : "enable"}
                            </span>
                            <span className="overflow-auto">{` ${workspace?.name}? `}</span>
                            {isEntityEnabled
                                ? "Disabling the workspace will revoke the access for users who are not workspace admins."
                                : "Enabling the workspace will make it accessible to all other members of the workspace."}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={processing}>
                            Cancel
                        </AlertDialogCancel>
                        <Button
                            variant={isEntityEnabled ? "destructive" : "default"}
                            disabled={processing}
                            onClick={async () => {
                                setProcessing(true);
                                const toastId = toast("Sonner");
                                // biome-ignore lint/style/useDefaultSwitchClause: Only two cases
                                switch (isEntityEnabled) {
                                    case true: {
                                        toast.loading("Disabling workspace ...", {
                                            id: toastId,
                                        });

                                        const response = await DisableWorkspace(workspace?.id as string);
                                        setProcessing(false);
                                        if (response.error === null) {
                                            toast.success(
                                                `Workspace "${workspace?.name}" disabled successfully`,
                                                {
                                                    id: toastId,
                                                },
                                            );
                                            setOpen(false);
                                        } else {
                                            toast.error(
                                                `Failes to disable "${workspace?.name}" with error ${response.error}`,
                                                {
                                                    id: toastId,
                                                },
                                            );
                                        }
                                        break;
                                    }

                                    case false: {
                                        toast.loading("Enabling workspace ...", {
                                            id: toastId,
                                        });

                                        const response = await EnableWorkspace(workspace?.id as string);
                                        setProcessing(false);
                                        if (response.error === null) {
                                            toast.success(
                                                `Workspace "${name}" enabled successfully`,
                                                {
                                                    id: toastId,
                                                },
                                            );
                                            setOpen(false);
                                        } else {
                                            toast.error(
                                                `Failed to enable workspace "${workspace?.name}" with error ${response.error}`,
                                                {
                                                    id: toastId,
                                                },
                                            );
                                        }
                                        break;
                                    }
                                }
                            }}
                        >
                            {isEntityEnabled ? "Disable" : "Enable"}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
