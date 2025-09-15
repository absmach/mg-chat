"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Separator } from "@radix-ui/react-dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { createPageUrl } from "@/lib/utils";
import { CircleDashed, ListFilter, ShieldBan, ShieldCheck, ShieldMinus } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Status = "all" | "rejected" | "pending" | "accepted";
export default function StatusButton() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [selectedOption, setSelectedOption] = useState<Status>("pending");

    const router = useRouter();
    const handleStatusChange = (status: Status) => {
        setSelectedOption(status);
        router.push(createPageUrl(searchParams, pathname, status, "status"));
    };
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild={true}>
                <Button variant="outline" className="hover:bg-primary/10">
                    <ListFilter className="size-4 mr-2 text-popover-foreground" />
                    {selectedOption ? (
                        <div className="text-center flex flex-row ">
                            <span className="hidden sm:block text-popover-foreground">
                                Status: {" "}
                            </span>
                            <Badge
                                variant="outline"
                                className="ml-2 rounded text-popover-foreground"
                            >
                                {selectedOption}
                            </Badge>
                        </div>
                    ) : (
                        <span className="text-popover-foreground">
                            Status
                        </span>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="max-w-44 ">
                <div className="flex items-center space-x-2 hover:bg-primary/10 p-2">
                    <Checkbox
                        id="pending"
                        className="border-slate-600"
                        checked={selectedOption === "pending"}
                        onCheckedChange={() =>
                            handleStatusChange(
                                selectedOption === "pending"
                                    ? ("all" as Status)
                                    : ("pending" as Status),
                            )
                        }
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label
                            htmlFor="pending"
                            className="text-sm font-sm flex flex-row items-center gap-2 cursor-pointer"
                        >
                            {" "}
                            <CircleDashed className="size-4" />
                            Pending
                        </label>
                    </div>
                </div>
                <Separator />
                <div className="flex items-center space-x-2 hover:bg-primary/10 p-2">
                    <Checkbox
                        id="accepted"
                        className="border-slate-600"
                        checked={selectedOption === "accepted"}
                        onCheckedChange={() =>
                            handleStatusChange(
                                selectedOption === "accepted"
                                    ? ("all" as Status)
                                    : ("accepted" as Status),
                            )
                        }
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label
                            htmlFor="accepted"
                            className="text-sm font-sm flex flex-row items-center gap-2 cursor-pointer"
                        >
                            {" "}
                            <ShieldCheck className="size-4 text-green" />
                            Accepted
                        </label>
                    </div>
                </div>
                <Separator />
                <div className="flex items-center space-x-2 hover:bg-primary/10 p-2">
                    <Checkbox
                        id="rejected"
                        checked={selectedOption === "rejected"}
                        className="border-slate-600"
                        onCheckedChange={() =>
                            handleStatusChange(
                                selectedOption === "rejected"
                                    ? ("all" as Status)
                                    : ("rejected" as Status),
                            )
                        }
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label
                            htmlFor="rejected"
                            className="text-sm font-sm flex flex-row items-center gap-2 cursor-pointer"
                        >
                            {" "}
                            <ShieldBan className="size-4 text-disabled" />
                            Rejected
                        </label>
                    </div>
                </div>
                <Separator />
                <div className="flex items-center space-x-2 mb-2 hover:bg-primary/10 p-2">
                    <Checkbox
                        id="all"
                        checked={selectedOption === "all"}
                        className="border-slate-600"
                        onCheckedChange={() =>
                            handleStatusChange(
                                selectedOption === "all"
                                    ? ("accepted" as Status)
                                    : ("all" as Status),
                            )
                        }
                    />
                    <div className="grid gap-1.5 leading-none">
                        <label
                            htmlFor="all"
                            className="text-sm font-sm flex flex-row items-center gap-2 cursor-pointer"
                        >
                            {" "}
                            <ShieldMinus color="grey" className="size-4" />
                            All
                        </label>
                    </div>
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
