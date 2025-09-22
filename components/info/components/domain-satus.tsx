"use client";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { DisableDomain, EnableDomain } from "@/lib/workspace";
import { useState } from "react";
import { toast } from "sonner";

type DomainStatusDialogProps = {
    showStatusDialog: boolean;
    setShowStatusDialog: (show: boolean) => void;
    isEnabled: boolean;
    name: string;
    id: string;
};
export function DomainStatusDialog({
    showStatusDialog,
    isEnabled,
    setShowStatusDialog,
    name,
    id,
}: DomainStatusDialogProps) {
    const [processing, setProcessing] = useState(false);
    return (
        <AlertDialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
            <AlertDialogContent className="rounded-md w-[90%] max-w-md">
                <AlertDialogHeader>
                    <AlertDialogTitle> Are you sure? </AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to {" "}
                        <span
                            className={`font-bold ${isEnabled ? "text-red-500" : "text-green-500"
                                }`}
                        >
                            {isEnabled ? "disable" : "enable"}
                        </span>
                        <span className="overflow-auto">{` ${name}? `}</span>
                        {isEnabled
                            ? "Disabling the workspace will revoke the access for users who are not workspace admins."
                            : "Enabling the workspace will make it accessible to all other members of the workspace."}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={processing}>
                        Cancel
                    </AlertDialogCancel>
                    <Button
                        variant={isEnabled ? "destructive" : "default"}
                        disabled={processing}
                        onClick={async () => {
                            setProcessing(true);
                            const toastId = toast("Sonner");
                            // biome-ignore lint/style/useDefaultSwitchClause: Only two cases
                            switch (isEnabled) {
                                case true: {
                                    toast.loading("Disabling workspace ...", {
                                        id: toastId,
                                    });

                                    const response = await DisableDomain(id);
                                    setProcessing(false);
                                    if (response.error === null) {
                                        toast.success(
                                            `Workspace "${name}" disabled successfully`,
                                            {
                                                id: toastId,
                                            },
                                        );
                                        setShowStatusDialog(false);
                                    } else {
                                        toast.error(
                                            `Failes to disable "${name}" with error ${response.error}`,
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

                                    const response = await EnableDomain(id);
                                    setProcessing(false);
                                    if (response.error === null) {
                                        toast.success(
                                            `Workspace "${name}" enabled successfully`,
                                            {
                                                id: toastId,
                                            },
                                        );
                                        setShowStatusDialog(false);
                                    } else {
                                        toast.error(
                                            `Failed to enable workspace "${name}" with error ${response.error}`,
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
                        {isEnabled ? "Disable" : "Enable"}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
