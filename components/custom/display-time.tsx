"use client";

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { DateTime } from "luxon";
import { useEffect, useState } from "react";

export enum Action {
    Created = "created",
    Updated = "updated",
    Confirmed = "confirmed",
    Rejected = "rejected",
    LastUsed = "lastused",
    Expired = "expired",
    Resolved = "resolved",
    Acknowledged = "acknowledged",
    Assigned = "assigned",
}

type Props = {
    time: string;
    action?: Action;
    className?: string;
    serverNow?: string;
};

export function DisplayTimeCell({
    time,
    action = Action.Created,
    className,
    serverNow,
}: Props) {
    const now = serverNow ? DateTime.fromISO(serverNow) : DateTime.now();
    const dateTime = DateTime.fromISO(time);
    const [isMounted, setIsMounted] = useState(false);
    const [timeString, setTimeString] = useState<string>();
    const [expirationString, setExpirationString] = useState<string | null>(null);

    useEffect(() => {
        setIsMounted(true);
        setTimeString(dateTime.toLocaleString(DateTime.DATETIME_FULL_WITH_SECONDS));

        if (action === Action.Expired) {
            const diff = dateTime.diff(now, ["hours", "minutes", "seconds"]);
            if (diff.toMillis() <= 0) {
                setExpirationString(
                    `Expired at ${dateTime.toLocaleString(
                        DateTime.DATETIME_FULL_WITH_SECONDS,
                    )}`,
                );
            } else {
                setExpirationString(
                    `Expires in ${diff.hours}h ${diff.minutes}m ${diff.seconds.toFixed(
                        0,
                    )}s`,
                );
            }
        }
    }, [dateTime, now, action]);

    if (
        dateTime.toString() ===
        DateTime.fromISO("0001-01-01T00:00:00.000Z").toString()
    ) {
        switch (action) {
            case Action.Created: {
                return <span>Not created yet</span>;
            }
            case Action.Updated: {
                return <span>Not updated yet</span>;
            }
            case Action.Confirmed: {
                return <span>Not confirmed yet</span>;
            }
            case Action.Rejected: {
                return <span>Not rejected yet</span>;
            }
            case Action.LastUsed: {
                return <span>Not used yet</span>;
            }
            case Action.Resolved: {
                return <span>Not resolved yet</span>;
            }
            case Action.Acknowledged: {
                return <span>Not acknowledged yet</span>;
            }
            case Action.Assigned: {
                return <span>Not assigned yet</span>;
            }
            default: {
                return <span>Invalid date</span>;
            }
        }
    }

    if (!isMounted) {
        return <span className="animate-pulse">...</span>;
    }

    if (action === Action.Expired && expirationString) {
        return <span className={className}>{expirationString}</span>;
    }

    const diff = now.diff(dateTime, ["hours", "minutes", "seconds"]);

    if (diff.hours === 0 && diff.minutes === 0 && diff.seconds <= 6) {
        return withTimestampTooltip("Just now", timeString);
    }

    if (diff.hours < 1) {
        return withTimestampTooltip(
            `${diff.minutes}m ${diff.seconds.toFixed(0)}s ago`,
            timeString,
        );
    }
    if (diff.hours < 24) {
        return withTimestampTooltip(
            `${diff.hours}h ${diff.minutes}m ago`,
            timeString,
        );
    }

    return <span className={className}>{timeString}</span>;
}

function withTimestampTooltip(display: string, timeString: string | undefined) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild={true}>
                    <span className="inline-block">{display}</span>
                </TooltipTrigger>
                <TooltipContent>
                    <span>{timeString}</span>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
