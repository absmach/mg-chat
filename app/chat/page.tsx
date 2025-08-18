import { getServerSession } from "@/lib/nextauth";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { ListWorkspaces } from "@/lib/workspace";
import ChatPage from "@/components/chat/chat-page";

export default async function Page() {
  const session = await getServerSession();
  const workspaces = await ListWorkspaces({
    queryParams: { limit: 10, offset: 0 },
  });

  if (workspaces.error !== null) {
    return <div>{workspaces.error}</div>;
  }

  return (
    <div className="h-screen flex bg-gray-100">
      <WorkspaceSwitcher
        selectedWorkspaceId={session?.domain?.id as string}
        workspaces={workspaces.data}
      />
      <ChatPage session={session} />
    </div>
  );
}
