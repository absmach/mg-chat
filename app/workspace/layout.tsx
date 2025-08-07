import { ReactNode } from "react";
import RootLayout from "../_components/rootlayout";
import { GetDomains } from "@/lib/domains";
import { Domain } from "@absmach/magistrala-sdk";

export type Props = {
    children: ReactNode;
};


export default async function DomainRootLayout({
    children }: Props) {
    const response = await GetDomains({
        queryParams: {
            offset: 0,
            limit: 10,
            dir: "desc",
        },
    });
    return (
        <RootLayout domains={response.data?.domains as Domain[]}>
            {children}
        </RootLayout>

    )
}