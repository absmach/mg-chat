"use client";

import { TableCell, TableHead, TableRow } from "@/components/ui/table";
import { CopyButton } from "@/components/custom/copy";

interface EntityIdRowProps {
    id: string;
    label: string;
}

export function EntityIdRow({ id, label }: EntityIdRowProps) {
    return (
        <TableRow className="h-20">
            <TableHead>{label}</TableHead>
            <TableCell>
                <div className="flex flex-row justify-between">
                    <span className="me-1">{id}</span>
                    <CopyButton data={id} />
                </div>
            </TableCell>
        </TableRow>
    );
}
