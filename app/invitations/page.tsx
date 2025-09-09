import { getServerSession } from "@/lib/nextauth";
import { InvitationsTable } from "@/components/invitations/invitations-table";
import { GetDomainInvitations } from "@/lib/invitations";
import { InvitationsPage } from "@absmach/magistrala-sdk";

export type Props = {
    searchParams?: Promise<{
        status: string;
    }>;
};

export default async function Page({ searchParams }: Props) {
    const session = await getServerSession();
    const domainId = session?.domain?.id as string;

    const searchParamsValue = await searchParams;
    const status = searchParamsValue?.status || "pending";
    const response = await GetDomainInvitations({
        offset: 0,
        limit: 100,
        state: status, // can be "pending", "all", "rejected", "accepted"
    });

    return (
        <div className="h-screen flex bg-gray-100">
            <div className="flex w-full mt-8 item-center">
                <InvitationsTable
                    invitationsPage={response.data as InvitationsPage}
                    page={1}
                    limit={100}
                    status={status}
                    domainId={domainId} />
            </div>
        </div>
    );
}
