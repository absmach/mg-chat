"use server";

import { DomainLoginSession } from "@/lib/auth";
import { getServerSession } from "@/lib/nextauth";
import { generateUrl } from "@/lib/utils";
import { EntityMembersPage, Member } from "@/types/entities";
import { MemberRolesPage, PageMetadata } from "@absmach/magistrala-sdk";
import type { RequestCookie } from "next/dist/compiled/@edge-runtime/cookies";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ViewUser } from "./users";

export const absoluteUrl = async () => {
  const headersList = await headers();
  let hostHeader =
    headersList.get("x-forwarded-host") ||
    headersList.get("host") ||
    "localhost";
  if (!/^https?:\/\//i.test(hostHeader)) {
    hostHeader = `http://${hostHeader}`;
  }
  const hostUrl = new URL(hostHeader);

  const host = hostUrl.hostname;

  const protocol = headersList.get("x-forwarded-proto") || "http";
  const port = headersList.get("x-forwarded-port") || "3000";

  return {
    protocol,
    host: host || "",
    port,
    origin: `${protocol}://${host}:${port}`,
  };
};

export async function DomainLogin(workspaceId: string) {
  const cookiesStore = await cookies();
  const session = await getServerSession();
  const urlPath = await absoluteUrl();
  const secure = urlPath.protocol === "https";
  const cookiesSessionKey =
    urlPath.protocol === "https"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";
  const cookiesCsrfKey =
    urlPath.protocol === "https"
      ? "__Host-next-auth.csrf-token"
      : "next-auth.csrf-token";

  const port =
    urlPath.port !== "443" && urlPath.port !== "80" ? `:${urlPath.port}` : "";
  const redirectPrefix = generateUrl(
    urlPath.protocol,
    urlPath.host,
    port,
    process.env.MG_UI_BASE_PATH || "/"
  );

  if (session.error) {
    cookiesStore.delete(cookiesSessionKey);
    redirect(`${redirectPrefix}/auth?error=${session.error}`);
  }

  if (session.domain?.id && session.domain.id === workspaceId) {
    redirect(`${redirectPrefix}/chat`);
  }

  const sessionTokenCookie = cookiesStore.get(
    cookiesSessionKey
  ) as RequestCookie;
  const csrfTokenCookie = cookiesStore.get(cookiesCsrfKey) as RequestCookie;

  if (!csrfTokenCookie?.value || !sessionTokenCookie?.value) {
    redirect(`${redirectPrefix}/auth?error=invalid_session}`);
  }

  const domainSession = await DomainLoginSession(
    csrfTokenCookie.value,
    sessionTokenCookie.value,
    workspaceId
  );

  if (!domainSession) {
    return;
  }

  cookiesStore.set({
    name: cookiesSessionKey,
    value: domainSession,
    httpOnly: true,
    path: "/",
    secure: secure,
  });

  redirect(`/chat`);
}

export async function ProcessEntityMembers(
  members: MemberRolesPage,
  queryParams: PageMetadata
): Promise<EntityMembersPage> {
  try {
    let isFiltered = false;
    const processedMembers = await Promise.all(
      members.members.map(async (member) => {
        if (!member.member_id) {
          throw new Error("Member ID is missing");
        }

        const response = await ViewUser(member.member_id);

        if (response.error) {
          throw new Error(
            `Error fetching user with ID ${member.member_id} with error "${response.error}"`
          );
        }

        const user = response.data;
        const roles = member.roles || [];

        // This filters out the users based on the query params. It performs case-insensitive matching
        // and partial mmatching
        if (queryParams) {
          if (
            (queryParams.status !== "all" &&
              user?.status !== queryParams.status) ||
            (queryParams.username &&
              !user?.credentials?.username
                ?.toLowerCase()
                .includes(queryParams.username.toLowerCase())) ||
            (queryParams.first_name &&
              !user?.first_name
                ?.toLowerCase()
                .includes(queryParams.first_name.toLowerCase())) ||
            (queryParams.last_name &&
              !user?.last_name
                ?.toLowerCase()
                .includes(queryParams.last_name.toLowerCase())) ||
            (queryParams.email &&
              !user?.email
                ?.toLowerCase()
                .includes(queryParams.email.toLowerCase())) ||
            (queryParams.id &&
              !user?.id?.toLowerCase().includes(queryParams.id.toLowerCase()))
          ) {
            isFiltered = true;
            return null;
          }
        }

        return {
          ...user,
          roles,
        } as Member;
      })
    );

    const filteredMembers = processedMembers.filter(
      (member): member is Member => member !== null
    );

    return {
      total: isFiltered ? filteredMembers.length : members.total,
      limit: members.limit,
      offset: members.offset,
      members: filteredMembers,
    };
  } catch (error) {
    console.error("Error processing entity members:", error);
    throw error;
  }
}
