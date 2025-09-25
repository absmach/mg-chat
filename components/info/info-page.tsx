import { Domain } from "@absmach/magistrala-sdk";
import WorkspaceInfo from "./components/workspace-info";

interface Props {
    workspace: Domain;
}

export default function InfoPage({ workspace }: Props) {

    return (
        <div className="flex-1 flex flex-col">
            <WorkspaceInfo workspace={workspace} />
        </div>
    );
}
