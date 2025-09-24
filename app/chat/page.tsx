import { getServerSession } from "@/lib/nextauth";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { ListDomainUsers, ListWorkspaces } from "@/lib/workspace";
import ChatPage from "@/components/chat/chat-page";
import { Member } from "@/types/entities";
import { GetDomainInvitations } from "@/lib/invitations";
import { InvitationsPage, User } from "@absmach/magistrala-sdk";
import { ListChannels } from "@/lib/channels";
import { UserProfile } from "@/lib/users";

export type Props = {
  searchParams?: Promise<{
    status: string;
  }>;
};

export default async function Page({ searchParams }: Props) {
  const session = await getServerSession();
  const workspaces = await ListWorkspaces({
    queryParams: { limit: 100, offset: 0 },
  });

  if (workspaces.error !== null) {
    return <div>{workspaces.error}</div>;
  }
  const workspaceId = session?.workspace?.id as string;
  const memResponse = await ListDomainUsers(workspaceId,
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
  const dmChannelResponse = await ListChannels({
    queryParams: { offset: 0, limit: 1, tag: "dm" },
  });
  const dmChannelId = dmChannelResponse?.data?.channels?.[0]?.id;
  const user = await UserProfile(session.accessToken);

  return (
    <div className="h-screen flex bg-gray-100">
      <WorkspaceSwitcher
        selectedWorkspaceId={session?.workspace?.id as string}
        workspaces={workspaces.data}
      />
      <ChatPage
        session={session}
        members={memResponse.data?.members as Member[]}
        invitationsPage={inviResponse?.data as InvitationsPage}
        dmChannelId={dmChannelId as string} 
        user={user.data as User}
        />
    </div>
  );
}
