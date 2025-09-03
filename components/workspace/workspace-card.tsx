"use client";
import { ArrowRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Domain } from "@absmach/magistrala-sdk";
import { Button } from "@/components/ui/button";
import { DomainLogin } from "@/lib/actions";

interface Props {
  workspace: Domain;
}
export function WorkspaceCard({ workspace }: Props) {
  return (
    <Card key={workspace.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{workspace.name}</CardTitle>
          {workspace.role_name === "admin" && (
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
              Owner
            </span>
          )}
        </div>
        {workspace.route && (
          <CardDescription>{workspace.route}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Button
            size="sm"
            className="cursor-pointer"
            onClick={async () => {
              await DomainLogin(workspace.id as string);
            }}
          >
            Open
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
