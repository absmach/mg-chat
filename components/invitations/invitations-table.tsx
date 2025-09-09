"use client";

import type { Invitation, InvitationsPage } from "@absmach/magistrala-sdk";
import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Action, DisplayTimeCell } from "@/components/custom/display-time";
import DataTable from "@/components/invitations/table/data-table";
import { DataTableColumnHeader } from "./table/column-header";
import { Delete } from "@/components/invitations/delete-invitation";
import { ResendInvitation } from "@/components/invitations/resend-invitation";
import { DisplayStatusWithIcon } from "./status-display";
import { useCallback, useEffect, useMemo, useState } from "react";

export function InvitationsTable({
    invitationsPage,
    page,
    limit,
    status,
    domainId,
}: {
    invitationsPage: InvitationsPage;
    page: number;
    limit: number;
    status: string;
    domainId: string;
}) {
    const allColumns: ColumnDef<Invitation>[] = useMemo(
        () => [
            {
                accessorKey: "user",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Name" />
                ),
                cell: ({ row }) => {
                    return (
                        <div className="flex flex-col">
                            {typeof row.original.invitee_user_id === "object" ? (
                                <>
                                    {`${row.original.invitee_user_id.first_name ?? ""} ${row.original.invitee_user_id.last_name ?? ""
                                        }`.trim()}
                                </>
                            ) : (
                                <p>{row.original.invitee_user_id}</p>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "role",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Role" />
                ),
                cell: ({ row }) => {
                    return (
                        <Badge variant="outline">
                            {row.original.role_name
                                ? row.original.role_name
                                : row.original.role_id}
                        </Badge>
                    );
                },
            },
            {
                accessorKey: "invited_by",
                header: "Invited By",
                cell: ({ row }) => {
                    return (
                        <div className="flex flex-col ">
                            {typeof row.original.invited_by === "object" ? (
                                <>
                                    <p>
                                        {`${row.original.invited_by.first_name ?? ""} ${row.original.invited_by.last_name ?? ""
                                            }`.trim()}
                                    </p>
                                </>
                            ) : (
                                <p>{row.original.invited_by}</p>
                            )}
                        </div>
                    );
                },
            },
            {
                id: "status",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Status" />
                ),
                cell: ({ row }) => {
                    const state = getInvitationState(row.original);
                    return <DisplayStatusWithIcon status={state} />;
                },
            },
            {
                accessorKey: "confirmed_at",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="Confirmed At"
                    />
                ),
                cell: ({ row }) => {
                    return (
                        <DisplayTimeCell
                            time={row.getValue("confirmed_at")}
                            action={Action.Confirmed}
                        />
                    );
                },
            },
            {
                accessorKey: "rejected_at",
                header: ({ column }) => (
                    <DataTableColumnHeader
                        column={column}
                        title="Rejected At"
                    />
                ),
                cell: ({ row }) => {
                    return (
                        <DisplayTimeCell
                            time={row.getValue("rejected_at")}
                            action={Action.Rejected}
                        />
                    );
                },
            },
            {
                id: "actions",
                cell: ({ row }) => {
                    const invitation = row.original;
                    const state = getInvitationState(invitation);
                    return (
                        <ActionCol
                            invitation={invitation}               
                            status={state}
                            domainId={domainId}
                        />
                    );
                },
            },
        ],
        [domainId],
    );

    const filteredColumns = useMemo(() => {
        switch (status) {
            case "accepted":
                return allColumns.filter(
                    // biome-ignore lint/suspicious/noExplicitAny: This is a valid use case for any
                    (col: any) => col.accessorKey !== "rejected_at",
                );
            case "rejected":
                return allColumns.filter(
                    // biome-ignore lint/suspicious/noExplicitAny: This is a valid use case for any
                    (col: any) => col.accessorKey !== "confirmed_at",
                );
            default:
                return allColumns;
        }
    }, [status, allColumns]);

    const baseColumns: ColumnDef<Invitation>[] = useMemo(
        () => [
            {
                accessorKey: "user",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="User name" />
                ),
                cell: ({ row }) => {
                    return (
                        <div className="flex flex-col">
                            {typeof row.original.invitee_user_id === "object" ? (
                                <>
                                    <p>
                                        {`${row.original.invitee_user_id.first_name ?? ""} ${row.original.invitee_user_id.last_name ?? ""
                                            }`.trim()}
                                    </p>
                                </>
                            ) : (
                                <p>{row.original.invitee_user_id}</p>
                            )}
                        </div>
                    );
                },
            },
            {
                accessorKey: "role",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Role" />
                ),
                cell: ({ row }) => {
                    return (
                        <Badge variant="outline">
                            {row.original.role_name
                                ? row.original.role_name
                                : row.original.role_id}
                        </Badge>
                    );
                },
            },
            {
                id: "status",
                header: ({ column }) => (
                    <DataTableColumnHeader column={column} title="Status" />
                ),
                cell: ({ row }) => {
                    const state = getInvitationState(row.original);
                    return <DisplayStatusWithIcon status={state} />;
                },
            },
            {
                id: "actions",
                cell: ({ row }) => {
                    const invitation = row.original;
                    const state = getInvitationState(invitation);
                    return (
                        <ActionCol
                            invitation={invitation}
                            status={state}
                            domainId={domainId}
                        />
                    );
                },
            },
        ],
        [domainId],
    );

    const [columns, setColumns] =
        useState<ColumnDef<Invitation>[]>(filteredColumns);

    const handleResize = useCallback(() => {
        const isSmallScreen = window?.innerWidth < 768;
        setColumns(isSmallScreen ? baseColumns : filteredColumns);
    }, [baseColumns, filteredColumns]);

    useEffect(() => {
        if (columns) {
            handleResize();
            window?.addEventListener("resize", handleResize);
            return () => window?.removeEventListener("resize", handleResize);
        }
    }, [handleResize, columns]);

    return (
        <DataTable
            columns={columns}
            currentPage={page}
            total={invitationsPage.total}
            limit={limit}
            data={invitationsPage.invitations}
            showStatusFilter={true}
        />
    );
}

function ActionCol({
    invitation,
    status,
    domainId,
}: {
    invitation: Invitation;
    status: string;
    domainId: string;
}) {
    return (
        <>
            {status !== "accepted" &&
                (status === "rejected" ? (
                    <ResendInvitation
                        roleId={invitation.role_id || ""}
                        userId={
                            typeof invitation.invitee_user_id === "string"
                                ? invitation.invitee_user_id
                                : (invitation.invitee_user_id?.id as string)
                        }
                        domainId={domainId}
                    />
                ) : (
                    <Delete
                        domainId={
                            typeof invitation.domain_id === "string"
                                ? invitation.domain_id
                                : (invitation.domain_id?.id as string)
                        }
                        userId={
                            typeof invitation.invitee_user_id === "string"
                                ? invitation.invitee_user_id
                                : (invitation.invitee_user_id?.id as string)
                        }             
                    />
                ))}
        </>
    );
}

function getInvitationState(
    invitation: Invitation,
): "accepted" | "rejected" | "pending" {
    const { confirmed_at, rejected_at } = invitation;
    const isValidDate = (value?: Date | null) => {
        if (!value) {
            return false;
        }

        const time = new Date(value).getTime();
        const goZeroTime = new Date("0001-01-01T00:00:00Z").getTime();

        return !Number.isNaN(time) && time !== goZeroTime;
    };
    if (isValidDate(confirmed_at)) {
        return "accepted";
    }
    if (isValidDate(rejected_at)) {
        return "rejected";
    }
    return "pending";
}
