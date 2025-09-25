import type { ReactNode } from "react";
import { WorkspaceSwitcher } from "@/components/workspace/workspace-switcher";
import { getServerSession } from "@/lib/nextauth";
import { ListWorkspaces } from "@/lib/workspace";

interface Props {
	children: ReactNode;
}

export default async function Layout({ children }: Props) {
	const session = await getServerSession();
	const workspaces = await ListWorkspaces({
		queryParams: { limit: 100, offset: 0 },
	});

	if (workspaces.error !== null) {
		return <div>{workspaces.error}</div>;
	}

	return (
		<div className="h-screen flex bg-gray-100">
			<WorkspaceSwitcher
				selectedWorkspaceId={session?.workspace?.id as string}
				workspaces={workspaces.data}
			/>
			{children}
		</div>
	);
}
