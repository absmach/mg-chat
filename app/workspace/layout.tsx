import { ReactNode } from "react";
import RootLayout from "../_components/rootlayout";
import { GetDomains } from "@/lib/domains";
import { Domain, User } from "@absmach/magistrala-sdk";
import { getServerSession, Session } from "next-auth";
import { UserProfile } from "@/lib/users";

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
    const session = await getServerSession();
    const user = await UserProfile((session as Session).accessToken);
    return (
        <RootLayout domains={response.data?.domains as Domain[]} user={user?.data as User}>
            {children}
        </RootLayout>

    )
}