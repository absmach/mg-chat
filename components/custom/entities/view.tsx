"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function DisplayDescription({
    description,
    className,
}: {
    description: string;
    className?: string;
}) {
    return (
        <div className="flex space-x-2">
            <span
                className={cn("max-w-[200px] md:max-w-[400px] truncate", className)}
            >
                {description}
            </span>
        </div>
    );
}

export function DisplayTags({
    tags,
    className,
}: {
    tags?: string[];
    className?: string;
}) {
    if (!tags) {
        return null;
    }
    return (
        <div className={cn("text-wrap font-medium", className)}>
            {tags.map((tag, index) => (
                <Badge
                    // biome-ignore lint/suspicious/noArrayIndexKey: Tags are not unique
                    key={index}
                    variant="secondary"
                    className="rounded-sm px-1 font-normal text-xs mx-1 my-1"
                >
                    {tag}
                </Badge>
            ))}
        </div>
    );
}
