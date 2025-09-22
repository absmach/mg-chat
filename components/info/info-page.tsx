import { Domain } from "@absmach/magistrala-sdk";
import DomainInfo from "./components/domain-info";

interface Props {
    domain: Domain;
}

export default function InfoPage({ domain }: Props) {

    return (
        <>
            <div className="flex-1 flex flex-col">
                <DomainInfo domain={domain} />
            </div>
        </>
    );
}
