import { getServerSession } from "@/lib/nextauth";
import { ListWorkspaceUsers, ListWorkspaces } from "@/lib/workspace";
import ChatPage from "@/components/chat/chat-page";
import { Member } from "@/types/entities";
import { GetWorkspaceInvitations } from "@/lib/invitations";
import { InvitationsPage, User } from "@absmach/magistrala-sdk";
import { ListChannels } from "@/lib/channels";
import { UserProfile, ViewUser } from "@/lib/users";

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
	const userResponse = await ViewUser(session?.user?.id as string);

	if (workspaces.error !== null) {
		return <div>{workspaces.error}</div>;
	}
  const workspaceId = session?.workspace?.id as string;
  const memResponse = await ListWorkspaceUsers(workspaceId,
    {
      offset: 0,
      limit: 100,
    },
  );
  const searchParamsValue = await searchParams;
  const status = searchParamsValue?.status || "pending";
  const inviResponse = await GetWorkspaceInvitations({
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
      <ChatPage
        session={session}
        members={memResponse.data?.members as Member[]}
        invitationsPage={inviResponse?.data as InvitationsPage}
        dmChannelId={dmChannelId as string} 
        user={user.data as User}
        />
  );
}
