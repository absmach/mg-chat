import { getServerSession } from "@/lib/nextauth";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { ListDomainUsers, ListWorkspaces } from "@/lib/workspace";
import ChatPage from "@/components/chat/chat-page";
import { ViewUser } from "@/lib/users";
import { Member, Metadata } from "@/types/entities";

export default async function Page() {
  const session = await getServerSession();
  const workspaces = await ListWorkspaces({
    queryParams: { limit: 100, offset: 0 },
  });
  const userResponse = await ViewUser(session?.user?.id as string)

  if (workspaces.error !== null) {
    return <div>{workspaces.error}</div>;
  }
  const domainId = session?.domain?.id as string;
  const memResponse = await ListDomainUsers(domainId, 
    {
      offset: 0,
      limit: 100,
    },
  );

  return (
    <div className="h-screen flex bg-gray-100">
      <WorkspaceSwitcher
        selectedWorkspaceId={session?.domain?.id as string}
        workspaces={workspaces.data}
      />
      <ChatPage session={session} metadata={userResponse.data?.metadata as Metadata} members={memResponse.data?.members as Member[]}/>
    </div>
  );
}
