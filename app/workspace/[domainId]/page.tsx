
import { getServerSession } from "@/lib/nextauth";
import { Channel } from "@absmach/magistrala-sdk";
import { ListDomainUsers } from "@/lib/domains";
import { GetChannels } from "@/lib/channels";
import { Member } from "@/types/entities";
import WorkspacePage from "./components/page-component";

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
            dir: "desc",
        },
        domainId,
    });
    return (
        <WorkspacePage 
        channels={chanResponse.data?.channels as Channel[]} 
        members={memResponse.data?.members as Member[]}
        user={session.user} />
    )
}
