import { Dispatch, SetStateAction } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "../ui/dialog";
import {
    Invitation,
    UserBasicInfo,
} from "@absmach/magistrala-sdk";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "../ui/card";
import { Badge } from "../ui/badge";
import { ResendInvitation } from "./resend-invitation";
import { Delete } from "./delete-invitation";
import StatusButton from "../custom/status-button";

export const InvitationsDialog = ({
    showInvitationDialog,
    setShowInvitationDialog,
    invitations,
    workspaceId,
}: {
    showInvitationDialog: boolean;
    setShowInvitationDialog: Dispatch<SetStateAction<boolean>>;
    invitations: Invitation[];
    workspaceId: string;
}) => {
    return (
        <Dialog open={showInvitationDialog} onOpenChange={setShowInvitationDialog}>
            <DialogContent className="w-4xl min-h-60 min-w-5xl max-h-[90%] overflow-auto">
                <DialogHeader className="p-0 ">
                    <DialogTitle className="flex flex-row justify-between mt-4">
                        <span>Manage Invitations</span>
                        <StatusButton />
                    </DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <InvitationManager workspaceId={workspaceId} invitations={invitations} />
            </DialogContent>
        </Dialog>
    );
};

interface InvitationManagerProps {
    invitations: Invitation[];
    workspaceId: string;
}

const InvitationManager = ({
    invitations,
    workspaceId,
}: InvitationManagerProps) => {
    const isValidDate = (date?: Date): boolean => {
        if (!date) return false;

        const dateObj = new Date(date);
        const invalidDate = new Date("0001-01-01T00:00:00Z");
        return (
            dateObj.getTime() !== invalidDate.getTime() && !isNaN(dateObj.getTime())
        );
    };

    const formatDate = (date?: Date): string => {
        if (!isValidDate(date)) return "";

        const dateObj = new Date(date!);
        return dateObj.toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        });
    };

    const getUserDisplayName = (user: string | UserBasicInfo) => {
        if (typeof user === "string") return user;
        return user.credentials?.username || user.email || user.id;
    };

    function getInvitationState(
        invitation: Invitation
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

    if (invitations.length === 0) {
        return (
            <Card className="text-center py-12">
                <CardContent>
                    <div className="text-muted-foreground text-6xl mb-4">🎯</div>
                    <CardTitle className="text-lg font-medium mb-2">
                        No invitations
                    </CardTitle>
                    <CardDescription>
                        You do not have any invitations at the moment.
                    </CardDescription>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            {invitations.map((invitation, index) => {
                const invitationId = `${invitation.invitee_user_id}-${invitation.domain_id}-${index}`;
                const status = getInvitationState(invitation);

                return (
                    <Card key={invitationId} className="overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                        Invited by
                                    </h4>
                                    <p className="text-lg font-semibold">
                                        {getUserDisplayName(invitation.invited_by)}
                                    </p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                        Invitee
                                    </h4>
                                    <p className="text-lg font-semibold">
                                        {getUserDisplayName(invitation.invitee_user_id)}
                                    </p>
                                </div>
                                {invitation.role_name && (
                                    <div>
                                        <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                            Assigned Role
                                        </h4>
                                        <Badge className="capitalize text-sm">
                                            {invitation.role_name}
                                        </Badge>
                                    </div>
                                )}
                                <div>
                                    <h4 className="text-sm font-medium text-muted-foreground mb-2">
                                        Status{" "}
                                    </h4>
                                    <Badge variant={"outline"} className="capitalize text-sm ">
                                        {status}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-muted-foreground">Created:</span>
                                    <p className="font-medium">
                                        {formatDate(invitation.created_at)}
                                    </p>
                                </div>
                                {(invitation.confirmed_at && status === "accepted") && (
                                    <div>
                                        <span className="text-muted-foreground">Confirmed:</span>
                                        <p className="font-medium">
                                            {formatDate(invitation.confirmed_at)}
                                        </p>
                                    </div>
                                )}
                                {(invitation.rejected_at && status === "rejected") && (
                                    <div>
                                        <span className="text-muted-foreground">Rejected:</span>
                                        <p className="font-medium">
                                            {formatDate(invitation.rejected_at)}
                                        </p>
                                    </div>
                                )}
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-row justify-end gap-4">
                            {status !== "accepted" &&
                                (status === "rejected" ? (
                                    <ResendInvitation
                                        roleId={invitation.role_id || ""}
                                        userId={
                                            typeof invitation.invitee_user_id === "string"
                                                ? invitation.invitee_user_id
                                                : (invitation.invitee_user_id?.id as string)
                                        }
                                        domainId={workspaceId}
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
                        </CardFooter>
                    </Card>
                );
            })}
        </div>
    );
};

export default InvitationManager;
