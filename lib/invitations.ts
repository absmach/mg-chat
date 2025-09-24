"use server"

import { HttpError } from "@/types/errors";
import { mgSdk, validateOrGetToken } from "./magistrala";
import { revalidatePath } from "next/cache";
import { GetWorkspaceBasicInfo, GetUserBasicInfo } from "./workspace";
import { DomainBasicInfo, Invitation, InvitationPageMeta, InvitationsPage, UserBasicInfo } from "@absmach/magistrala-sdk";

export const SendInvitation = async (
  userId: string,
  roleId: string,
  workspaceId: string,
  resend?: boolean,
) => {
  try {
    const { accessToken } = await validateOrGetToken("");
    await mgSdk.Domains.SendInvitation(
      userId,
      workspaceId,
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

export const InviteMultipleUsersToWorkspace = async (
  userIds: string[],
  roleId: string,
  workspaceId: string,
) => {
  const { accessToken } = await validateOrGetToken("");

  const results = await Promise.all(
    userIds.map((userId) => SendInvitation(userId, roleId, workspaceId)),
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

  const workspaceInfo = await GetWorkspaceBasicInfo(workspaceId);
  const workspaceName =
    typeof workspaceInfo === "string" ? workspaceInfo : workspaceInfo.name;

  return {
    results,
    errors,
    metadata: {
      usernames,
      workspaceName,
      roleId,
    },
  };
};

export const AcceptInvitation = async (workspaceId: string) => {
  const { accessToken } = await validateOrGetToken("");
  try {
    await mgSdk.Domains.AcceptInvitation(workspaceId, accessToken);
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
    revalidatePath("/");
  }
};

export const DeclineInvitation = async (workspaceId: string) => {
  const { accessToken } = await validateOrGetToken("");
  try {
    await mgSdk.Domains.RejectInvitation(workspaceId, accessToken);
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
    revalidatePath("/");
  }
};

export const DeleteInvitation = async ({
  workspaceId,
  userId
}: {
  workspaceId: string;
  userId: string;
}) => {
  const { accessToken } = await validateOrGetToken("");
  try {
    await mgSdk.Domains.DeleteInvitation(userId, workspaceId, accessToken);
    return {
      data: "Inviatation Deleted Successfully",
      error: null,
    };
  } catch (err: unknown) {
    const knownError = err as HttpError;
    return {
      data: null,
      error: knownError.error || knownError.message || knownError.toString(),
    };
  } finally {
    revalidatePath("/");
  }
};

export const GetUserInvitations = async (queryParams: InvitationPageMeta) => {
  try {
    const { accessToken } = await validateOrGetToken("");
    const invitationsPage = await mgSdk.Domains.ListUserInvitations(
      queryParams,
      accessToken,
    );
    return {
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

        const workspaceId: DomainBasicInfo | string =
          typeof invitation.domain_id === "string"
            ? invitation.domain_id === ""
              ? invitation.domain_id
              : await GetWorkspaceBasicInfo(invitation.domain_id)
            : (invitation.domain_id as DomainBasicInfo);
        const processedInvitation: Invitation = {
          ...invitation,
          // biome-ignore lint/style/useNamingConvention: This is from an external library
          invited_by: invitedBy,
          // biome-ignore lint/style/useNamingConvention: This is from an external library
          invitee_user_id: user,
          // biome-ignore lint/style/useNamingConvention: This is from an external library
          domain_id: workspaceId,
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

export const GetWorkspaceInvitations = async (queryParams: InvitationPageMeta) => {
  const { workspaceId, accessToken } = await validateOrGetToken("");
  try {
    const invitationsPage = await mgSdk.Domains.ListDomainInvitations(
      queryParams,
      workspaceId,
      accessToken,
    );
    const invitations = await processInvitations(
      invitationsPage.invitations,
      accessToken,
    );
    return {
      data: {
        total: invitationsPage.total,
        offset: invitationsPage.offset,
        limit: invitationsPage.limit,
        invitations,
      } as InvitationsPage,
      error: null,
    };
  } catch (err: unknown) {
    const knownError = err as HttpError;
    throw new Error(
      knownError.error || knownError.message || knownError.toString(),
    );
  }
};
