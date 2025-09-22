import type { Domain, MemberRoleActions } from "@absmach/magistrala-sdk";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { CopyButton } from "@/components/custom/copy";
import { EntityIdRow } from "@/components/custom/entity-id-row";
import { MetadataComponent } from "@/components/custom/metadata";
import {
    UpdateNameRow,
    UpdateTagsDialog,
} from "@/components/custom/entities/update";
import { DisplayTags } from "@/components/custom/entities/view";
import { UpdateDomain } from "@/lib/workspace";
import { cn, toSentenseCase } from "@/lib/utils";
import { UpdateStatusDialog } from "./update-domain";
import {
    EntityType,
    Status,
} from "@/types/entities";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoveLeft } from 'lucide-react';

export default function DomainInfo({ domain }: { domain: Domain }) {
    const roles = domain?.roles || [];
    const isDomainAdmin = roles.some(
        (role: MemberRoleActions) => role.role_name === "admin",
    );
    const status = domain?.status;

    const disabled = (!isDomainAdmin && status === Status.Disabled);

    return (
        <>
            <div className="mt-4 pl-4">
                <Link href="/chat">
                    <Button variant="outline">
                        <MoveLeft className="size-4" />
                        Back to chat
                    </Button>
                </Link>
            </div>
            <div className="p-4 sm:max-2xl:container sm:max-2xl:mx-auto mt-20 pb-4 md:pb-8 bg-background border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow className="hover:bg-transparent h-20">
                            <TableHead
                                colSpan={3}
                                className="text-2xl font-bold whitespace-pre-wrap break-normal"
                            >
                                {domain?.name}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <UpdateNameRow
                            id={domain?.id as string}
                            name={domain?.name as string}
                            entity={EntityType.Workspace}
                            updateName={UpdateDomain}
                            disabled={disabled}
                        />
                        <EntityIdRow id={domain?.id as string} label={"id"} />
                        <TableRow className="h-20">
                            <TableHead>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild={true}>
                                            <span>Route</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Unique domain route used for subscribing. Cannot be
                                            changed after creation.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableHead>

                            <TableCell>
                                <div className="flex flex-row justify-between">
                                    <span className="me-1">{domain?.route}</span>
                                    {domain?.route && domain?.route.length > 0 && (
                                        <CopyButton data={domain?.route as string} />
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                        <TableRow className="h-20">
                            <TableHead>Tags</TableHead>
                            <TableCell>
                                <div
                                    className={cn("flex flex-row", {
                                        "justify-between": domain?.tags && domain?.tags.length > 0,
                                        "justify-end": !domain?.tags || domain?.tags.length === 0,
                                    })}
                                >
                                    <DisplayTags tags={domain?.tags} />
                                    <div className=" flex flex-row gap-4">
                                        <UpdateTagsDialog
                                            id={domain?.id as string}
                                            tags={domain?.tags ? (domain?.tags as string[]) : []}
                                            entity={EntityType.Workspace}
                                            updateTags={UpdateDomain}
                                            disabled={disabled}
                                        />
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                        <TableRow className="h-20">
                            <TableHead>Metadata</TableHead>
                            <TableCell>
                                <MetadataComponent
                                    metadata={domain?.metadata || {}}
                                    id={domain?.id as string}
                                    entity={EntityType.Workspace}
                                    updateMetadata={UpdateDomain}
                                    disabled={disabled}
                                />
                            </TableCell>
                        </TableRow>
                        <TableRow className="h-20">
                            <TableHead>Status</TableHead>
                            <TableCell>
                                <div className="flex flex-row justify-between">
                                    <span
                                        className={domain?.status === Status.Enabled ? "text-green-600" : "text-red-600"}
                                    >
                                        {toSentenseCase(domain?.status as string)}
                                    </span>
                                    <div className="flex">
                                        <UpdateStatusDialog
                                            status={domain?.status as Status}
                                            domain={domain as Domain}
                                        />
                                    </div>
                                </div>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </>
    );
}
