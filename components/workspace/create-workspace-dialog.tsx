"use client";

import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Client, Domain, User } from "@absmach/magistrala-sdk";
import { CreateWorkspace } from "@/lib/workspace";
import { toast } from "sonner";
import { Plus } from "lucide-react";
import { CreateClient } from "@/lib/clients";
import { UpdateUser, UserProfile } from "@/lib/users";
import { Metadata } from "@/types/entities";

interface Props {
  isMobile: boolean;
}

export function CreateWorkspaceDialog({ isMobile }: Props) {
  const [name, setName] = useState("");
  const [route, setRoute] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && !route.trim()) return;

    setIsLoading(true);

    const newWorkspace: Domain = {
      name: name.trim(),
      route: route.trim(),
    };

    const result = await CreateWorkspace(newWorkspace);
    if (result.error === null) {
      const userResponse = await UserProfile();
      if (userResponse.error !== null) {
        toast.error(`Failed to fetch user with error: ${userResponse.error}`);
      } else {
        const user = userResponse.data;
        const client: Client = {
          name: user.credentials?.username,
        };
        const response = await CreateClient(client, result.data.id as string);
        if (response.error !== null) {
          toast.error(`Failed to create client with error: ${response.error}`);
        } else {
          const updatedMetadata: Metadata = {
            ...user?.metadata,
            ui: {
              ...user?.metadata?.ui,
              client: {
                id: response?.data.id,
                secret: response?.data.credentials?.secret,
              },
            },
          };
          const updatedUser: User = {
            ...user,
            metadata: updatedMetadata,
          };
          const updatedUserResponse = await UpdateUser(updatedUser);
          if (updatedUserResponse.error !== null) {
            toast.error(
              `Failed to update user with error: ${updatedUserResponse.error}`
            );
          } else {
            setOpen(false);
            setName("");
            setRoute("");
            toast.success("Workspace created successfully");
          }
        }
      }
    } else {
      toast.error(`Failed to create workspace with error: ${result.error}`);
      console.error(result.error);
    }
    setIsLoading(false);
  };
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild={true}>
        {isMobile ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-12 w-12 p-0 rounded-xl bg-gray-700 hover:bg-gray-600 hover:rounded-lg transition-all duration-200"
            title="Create workspace"
          >
            <Plus className="h-5 w-5 text-gray-300" />
          </Button>
        ) : (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            <span>Create Workspace</span>
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Create a new workspace to organize your team conversations and
            collaborate effectively.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Workspace Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter workspace name"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="route">Route</Label>
              <Input
                id="route"
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder=" A user-friendly alias for this workspace"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={!name.trim() || isLoading}>
              {isLoading ? "Creating..." : "Create Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
