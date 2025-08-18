import { Button } from "@/components/ui/button";
import { getServerSession } from "@/lib/nextauth";
import { ListWorkspaces } from "@/lib/workspace";
import { ArrowRight, Plus, Users } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CreateWorkspaceDialog } from "@/components/workspace/create-workspace-dialog";
import { DomainLogin } from "@/lib/actions";
import { WorkspaceCard } from "@/components/workspace/workspace-card";

export default async function Home() {
  const response = await ListWorkspaces({
    queryParams: { limit: 10, offset: 0 },
  });

  if (response.error) {
    return <div>{response.error}</div>;
  }

  const workspacesPage = response.data;
  const session = await getServerSession();

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.username}!
          </h1>
          <p className="text-gray-600">
            Choose a workspace to continue or create a new one
          </p>
        </div>

        {workspacesPage?.domains?.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No workspaces found
            </h3>
            <p className="text-gray-500 mb-6">
              Create your first workspace to get started
            </p>
            <div className="space-x-4">
              <CreateWorkspaceDialog isMobile={false} />
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {workspacesPage?.domains?.map((workspace) => (
                <WorkspaceCard key={workspace.id} workspace={workspace} />
              ))}
            </div>

            <div className="text-center">
              <div className="space-x-4">
                <CreateWorkspaceDialog isMobile={false} />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
