"use client";

import  { InvitationsDialog }  from "@/components/invitations/invitation-dialog";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { InvitationsPage } from "@absmach/magistrala-sdk";
import { SettingsIcon } from "lucide-react";
import { useState } from "react";

export function Settings({
domainId,
invitationsPage,
}:{
domainId: string;
invitationsPage: InvitationsPage
}) {
  const [showInvitationDialog, setShowInvitationDialog] = useState(false);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild={true}>
          <Button variant="ghost" className="mt-2 text-gray-400 p-2 hover:bg-muted/50">
            <SettingsIcon className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-(--radix-dropdown-menu-trigger-width) mt-12 min-w-48 rounded-lg ml-2"
          side="right"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuGroup>
            <DropdownMenuItem
              onSelect={() => {
                setShowInvitationDialog(true);
              }}
            >
              <span>Manage Invitations</span>
              <DropdownMenuShortcut>⇧⌘I</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <InvitationsDialog
        showInvitationDialog={showInvitationDialog}
        setShowInvitationDialog={setShowInvitationDialog}
        invitations={invitationsPage.invitations}
        domainId={domainId}
      />
    </>
  );
}
