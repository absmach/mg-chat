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

export default function DomainInfo({ workspace }: { workspace: Domain }) {
    const roles = workspace?.roles || [];
    const isDomainAdmin = roles.some(
        (role: MemberRoleActions) => role.role_name === "admin",
    );
    const status = workspace?.status;

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
                                {workspace?.name}
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        <UpdateNameRow
                            id={workspace?.id as string}
                            name={workspace?.name as string}
                            entity={EntityType.Workspace}
                            updateName={UpdateDomain}
                            disabled={disabled}
                        />
                        <EntityIdRow id={workspace?.id as string} label={"id"} />
                        <TableRow className="h-20">
                            <TableHead>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild={true}>
                                            <span>Route</span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            Unique workspace route used for subscribing. Cannot be
                                            changed after creation.
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </TableHead>

                            <TableCell>
                                <div className="flex flex-row justify-between">
                                    <span className="me-1">{workspace?.route}</span>
                                    {workspace?.route && workspace?.route.length > 0 && (
                                        <CopyButton data={workspace?.route as string} />
                                    )}
                                </div>
                            </TableCell>
                        </TableRow>
                        <TableRow className="h-20">
                            <TableHead>Tags</TableHead>
                            <TableCell>
                                <div
                                    className={cn("flex flex-row", {
                                        "justify-between": workspace?.tags && workspace?.tags.length > 0,
                                        "justify-end": !workspace?.tags || workspace?.tags.length === 0,
                                    })}
                                >
                                    <DisplayTags tags={workspace?.tags} />
                                    <div className=" flex flex-row gap-4">
                                        <UpdateTagsDialog
                                            id={workspace?.id as string}
                                            tags={workspace?.tags ? (workspace?.tags as string[]) : []}
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
                                    metadata={workspace?.metadata || {}}
                                    id={workspace?.id as string}
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
                                        className={workspace?.status === Status.Enabled ? "text-green-600" : "text-red-600"}
                                    >
                                        {toSentenseCase(workspace?.status as string)}
                                    </span>
                                    <div className="flex">
                                        <UpdateStatusDialog
                                            status={workspace?.status as Status}
                                            workspace={workspace as Domain}
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
