"use client";

import { Button } from "@/components/ui/button";
import { CheckCheck, CopyIcon } from "lucide-react";
import { useState } from "react";

export const CopyButton = ({
    data,
    className,
}: {
    data: string;
    className?: string;
}) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(data);
            setCopied(true);
            setTimeout(() => {
                setCopied(false);
            }, 2000);
        } catch (error) {
            console.error("Failed to copy", error);
        }
    };

    return (
        <Button
            className={className}
            type="button"
            size="sm"
            variant="ghost"
            onClick={handleCopy}
        >
            <span className="sr-only">Copy</span>
            {copied ? (
                <CheckCheck className="size-4" color="green" />
            ) : (
                <CopyIcon className="size-4" />
            )}
        </Button>
    );
};
