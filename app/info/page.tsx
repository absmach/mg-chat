import { getServerSession } from "@/lib/nextauth";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { GetWorkspaceInfo, ListWorkspaces } from "@/lib/workspace";
import { Domain } from "@absmach/magistrala-sdk";
import InfoPage from "@/components/info/info-page";

export default async function Page() {
    const session = await getServerSession();
    const workspaces = await ListWorkspaces({
        queryParams: { limit: 100, offset: 0 },
    });

    if (workspaces.error !== null) {
        return <div>{workspaces.error}</div>;
    }
    const domainResponse = await GetWorkspaceInfo(true);

    return (
        <div className="h-screen flex bg-gray-100">
            <WorkspaceSwitcher
                selectedWorkspaceId={session?.domain?.id as string}
                workspaces={workspaces.data}
            />
            <InfoPage
                domain={domainResponse?.data as Domain}
            />
        </div>
    );
}
