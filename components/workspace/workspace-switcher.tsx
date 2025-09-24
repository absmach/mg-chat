"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { CreateWorkspaceDialog } from "./create-workspace-dialog";
import { WorkspaceLogin } from "@/lib/actions";
import { DomainsPage } from "@absmach/magistrala-sdk";

interface Workspace {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  isOwner: boolean;
}

interface Props {
  selectedWorkspaceId: string | null;
  workspaces: DomainsPage;
}

export function WorkspaceSwitcher({ selectedWorkspaceId, workspaces }: Props) {
  const getWorkspaceInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-16 bg-gray-900 flex flex-col items-center py-3 space-y-2">
      <ScrollArea className="flex-1 w-full">
        <div className="flex flex-col items-center space-y-2 px-2">
          {workspaces.domains.map((workspace) => (
            <div key={workspace.id} className="relative">
              <Button
                variant="ghost"
                size="sm"
                className={`h-12 w-12 p-0 rounded-xl transition-all duration-200 ${
                  selectedWorkspaceId === workspace.id
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-gray-700 hover:bg-gray-600 hover:rounded-lg"
                }`}
                onClick={async () => {
                  await WorkspaceLogin(workspace.id as string);
                }}
                title={workspace.name}
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={`/workspace-${workspace.id}.png`} />
                  <AvatarFallback className="text-xs font-semibold text-white bg-transparent">
                    {getWorkspaceInitials(workspace.name as string)}
                  </AvatarFallback>
                </Avatar>
              </Button>

              {selectedWorkspaceId === workspace.id && (
                <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r"></div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <Separator className="w-8 bg-gray-700" />

      <CreateWorkspaceDialog isMobile={true} />
    </div>
  );
}
