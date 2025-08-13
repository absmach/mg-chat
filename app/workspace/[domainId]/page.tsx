
import { getServerSession } from "@/lib/nextauth";
import { Channel, User } from "@absmach/magistrala-sdk";
import { ListDomainUsers, ViewDomain } from "@/lib/domains";
import { GetChannels } from "@/lib/channels";
import { Member } from "@/types/entities";
import WorkspacePage from "./components/page-component";
import { UserProfile } from "@/lib/users";
import { Session } from "next-auth";

type Props = {
    params: Promise<{ domainId: string }>;
};

export default async function Workspace({params}: Props) {
    const session = await getServerSession();
    const { domainId } = await params;
    const basePath = process.env.MG_UI_BASE_PATH || "";
    const chanResponse = await GetChannels({
        queryParams: {
            offset: 0,
            limit: 10,
            dir: "desc",
        },
        domainId,
    });
    const memResponse = await ListDomainUsers({
       queryParams: {
            offset: 0,
            limit: 10,
            status: "enabled",
            dir: "desc",
        },
   });
    const domainResponse = await ViewDomain (domainId);
    const user = await UserProfile((session as Session).accessToken);

    return (
        <WorkspacePage 
        channels={chanResponse.data?.channels as Channel[]} 
        members={memResponse.data?.members as Member[]}
        userInfo={session.user} 
        domainId={domainId}
        domainName={domainResponse.data?.name as string}
        user={user?.data as User}
        />
    )
}
