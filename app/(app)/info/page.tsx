import type { Domain } from "@absmach/magistrala-sdk";
import InfoPage from "@/components/info/info-page";
import { GetWorkspaceInfo, ListWorkspaces } from "@/lib/workspace";

export default async function Page() {
  const workspaces = await ListWorkspaces({
    queryParams: { limit: 100, offset: 0 },
  });

  if (workspaces.error !== null) {
    return <div>{workspaces.error}</div>;
  }
  const workspaceResponse = await GetWorkspaceInfo(true);

  return <InfoPage workspace={workspaceResponse?.data as Domain} />;
}
