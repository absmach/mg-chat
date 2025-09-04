"use server"

import { HttpError } from "@/types/errors";
import { mgSdk, validateOrGetToken } from "./magistrala";
import { revalidatePath } from "next/cache";
import { GetDomainBasicInfo, GetUserBasicInfo } from "./workspace";
import { DomainBasicInfo, Invitation, InvitationPageMeta, InvitationsPage, UserBasicInfo } from "@absmach/magistrala-sdk";

export const SendInvitation = async (
  userId: string,
  roleId: string,
  domainId: string,
  resend?: boolean,
) => {
  try {
    const { accessToken } = await validateOrGetToken("");
    await mgSdk.Domains.SendInvitation(
      userId,
      domainId,
      roleId,
      accessToken,
      resend,
    );
    return {
      data: "Invitation sent successfully",
      error: null,
    };
  } catch (err: unknown) {
    const knownError = err as HttpError;
    const errorMessage =
      knownError.error || knownError.message || JSON.stringify(knownError);
    return {
      data: null,
      error: errorMessage,
    };
  } finally {
    revalidatePath("/");
  }
};

export const InviteMultipleUsersToDomain = async (
  userIds: string[],
  roleId: string,
  domainId: string,
) => {
  const { accessToken } = await validateOrGetToken("");

  const results = await Promise.all(
    userIds.map((userId) => SendInvitation(userId, roleId, domainId)),
  );

  const errors = results
    .filter((result) => result.error)
    .map((result) => result.error);

  const usernames = await Promise.all(
    userIds.map(async (userId) => {
      const user = await GetUserBasicInfo(userId, accessToken);
      return typeof user === "string"
        ? user
        : user?.credentials?.username || userId;
    }),
  );

  const domainInfo = await GetDomainBasicInfo(domainId);
  const domainName =
    typeof domainInfo === "string" ? domainInfo : domainInfo.name;

  return {
    results,
    errors,
    metadata: {
      usernames,
      domainName,
      roleId,
    },
  };
};

export const AcceptInvitation = async (domainId: string) => {
  const { accessToken } = await validateOrGetToken("");
  try {
    await mgSdk.Domains.AcceptInvitation(domainId, accessToken);
    return {
      data: "Invitation Accepted Successfully",
      error: null,
    };
  } catch (err: unknown) {
    const knownError = err as HttpError;
    return {
      data: null,
      error: knownError.message || knownError.toString(),
    };
  } finally {
    revalidatePath(`/`);
  }
};

export const DeclineInvitation = async (domainId: string) => {
  const { accessToken } = await validateOrGetToken("");
  try {
    await mgSdk.Domains.RejectInvitation(domainId, accessToken);
    return {
      data: "Inviatation Declined Successfully",
      error: null,
    };
  } catch (err: unknown) {
    const knownError = err as HttpError;
    return {
      data: null,
      error: knownError.error || knownError.message || knownError.toString(),
    };
  } finally {
    revalidatePath(`/`);
  }
};

export const GetUserInvitations = async (queryParams: InvitationPageMeta) => {
  try {
    const { accessToken } = await validateOrGetToken("");
    const invitationsPage = await mgSdk.Domains.ListUserInvitations(
      queryParams,
      accessToken,
    );
    const invitations = await processInvitations(
      invitationsPage.invitations,
      accessToken,
    );
    return {
    //   data: {
    //     total: invitationsPage.total,
    //     offset: invitationsPage.offset,
    //     limit: invitationsPage.limit,
    //     invitations,
    //   } as InvitationsPage,
      data: invitationsPage,
      error: null,
    };
  } catch (err: unknown) {
    const knownError = err as HttpError;
    return {
      data: null,
      error: knownError.error || knownError.message || knownError.toString(),
    };
  }
};

async function processInvitations(
  invitations: Invitation[],
  token: string,
): Promise<Invitation[]> {
  const processedInvitations: Invitation[] = [];
  if (invitations && invitations.length > 0) {
    for (const invitation of invitations) {
      try {
        const invitedBy: UserBasicInfo | string =
          typeof invitation.invited_by === "string"
            ? invitation.invited_by === ""
              ? invitation.invited_by
              : await GetUserBasicInfo(invitation.invited_by, token)
            : (invitation.invited_by as UserBasicInfo);

        const user: UserBasicInfo | string =
          typeof invitation.invitee_user_id === "string"
            ? invitation.invitee_user_id === ""
              ? invitation.invitee_user_id
              : await GetUserBasicInfo(invitation.invitee_user_id, token)
            : (invitation.invitee_user_id as UserBasicInfo);

        const domainId: DomainBasicInfo | string =
          typeof invitation.domain_id === "string"
            ? invitation.domain_id === ""
              ? invitation.domain_id
              : await GetDomainBasicInfo(invitation.domain_id)
            : (invitation.domain_id as DomainBasicInfo);
        const processedInvitation: Invitation = {
          ...invitation,
          // biome-ignore lint/style/useNamingConvention: This is from an external library
          invited_by: invitedBy,
          // biome-ignore lint/style/useNamingConvention: This is from an external library
          invitee_user_id: user,
          // biome-ignore lint/style/useNamingConvention: This is from an external library
          domain_id: domainId,
        };

        processedInvitations.push(processedInvitation);
      } catch (_error) {
        processedInvitations.push(invitation);
      }
    }
    return processedInvitations;
  }
  return invitations;
}

