import { Domain } from "@absmach/magistrala-sdk";
import DomainInfo from "./components/domain-info";

interface Props {
    workspace: Domain;
}

export default function InfoPage({ workspace }: Props) {

    return (
        <div className="flex-1 flex flex-col">
            <DomainInfo workspace={workspace} />
        </div>
    );
}
