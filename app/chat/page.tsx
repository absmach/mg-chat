import { getServerSession } from "@/lib/nextauth";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { ListDomainUsers, ListWorkspaces } from "@/lib/workspace";
import ChatPage from "@/components/chat/chat-page";
import { ViewUser } from "@/lib/users";
import { Member, Metadata } from "@/types/entities";
import { GetDomainInvitations } from "@/lib/invitations";
import { InvitationsPage } from "@absmach/magistrala-sdk";

export type Props = {
  searchParams?: Promise<{
    status: string;
  }>;
};

export default async function Page({searchParams}: Props) {
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
  const searchParamsValue = await searchParams;
  const status = searchParamsValue?.status || "pending";
  const inviResponse = await GetDomainInvitations({
          offset: 0,
          limit: 100,
          state: status,
      });

  return (
    <div className="h-screen flex bg-gray-100">
      <WorkspaceSwitcher
        selectedWorkspaceId={session?.domain?.id as string}
        workspaces={workspaces.data}
      />
      <ChatPage 
      session={session} 
      metadata={userResponse.data?.metadata as Metadata} 
      members={memResponse.data?.members as Member[]}
      invitationsPage={inviResponse?.data as InvitationsPage}
      status={status}
      />
    </div>
  );
}
