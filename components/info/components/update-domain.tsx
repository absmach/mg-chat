"use client";

import type { Domain } from "@absmach/magistrala-sdk";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Status } from "@/types/entities";
import { useState } from "react";
import { DomainStatusDialog } from "./domain-satus";

interface StatusProps {
    status: Status;
    domain: Domain;
}

export function UpdateStatusDialog({ status, domain }: StatusProps) {
    const isEntityEnabled = status === "enabled";
    const [open, setOpen] = useState(false);
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
            <DomainStatusDialog
                showStatusDialog={open}
                setShowStatusDialog={setOpen}
                name={domain.name as string}
                id={domain.id as string}
                isEnabled={isEntityEnabled}
            />
        </>
    );
}
