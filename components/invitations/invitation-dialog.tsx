import { Dispatch, SetStateAction } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import { InvitationsTable } from "./invitations-table";
import { InvitationsPage } from "@absmach/magistrala-sdk";

export const InvitationsDialog = ({
    showInvitationDialog,
    setShowInvitationDialog,
    invitationsPage,
    status,
    domainId,
}: {
    showInvitationDialog: boolean;
    setShowInvitationDialog: Dispatch<SetStateAction<boolean>>;
    invitationsPage: InvitationsPage;
    status: string;
    domainId: string;
}) => {
    return (
        <Dialog
            open={showInvitationDialog}
            onOpenChange={setShowInvitationDialog}
        >
            <DialogContent className="w-[90%] max-w-md max-h-[95%] overflow-auto">
                <DialogHeader>
                    <DialogTitle> Manage Invitations </DialogTitle>
                    <DialogDescription />
                </DialogHeader>
                <InvitationsTable
                    invitationsPage={invitationsPage}
                    page={1}
                    limit={100}
                    status={status}
                    domainId={domainId}
                />
            </DialogContent>
        </Dialog>
    );
}