"use server";

import type {
  MemberRolesPage,
  PageMetadata,
  User,
} from "@absmach/magistrala-sdk";
import {
  type RequestOptions,
  mgSdk,
  validateOrGetToken,
} from "@/lib/magistrala";
import {
  type EntityMembersPage,
  type Member,
} from "@/types/entities";
import type { HttpError } from "@/types/errors";
import { revalidatePath } from "next/cache";

export const GetUsers = async ({ token = "", queryParams }: RequestOptions) => {
  try {
    const { accessToken } = await validateOrGetToken(token);
    const users = await mgSdk.Users.Users(queryParams, accessToken);
    return {
      data: users,
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

export const UserProfile = async (token?: string) => {
  try {
    const { accessToken } = await validateOrGetToken(token as string);
    const user = await mgSdk.Users.UserProfile(accessToken);
    return {
      data: user,
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

export const ViewUser = async (id: string) => {
  try {
    const { accessToken } = await validateOrGetToken("");
    const user = await mgSdk.Users.User(id, accessToken);
    return {
      data: user,
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

export async function ProcessEntityMembers(
  members: MemberRolesPage,
  queryParams: PageMetadata,
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
            `Error fetching user with ID ${member.member_id} with error "${response.error}"`,
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
      }),
    );

    const filteredMembers = processedMembers.filter(
      (member): member is Member => member !== null,
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

export const SearchUsers = async (queryParams: PageMetadata) => {
  try {
    const { accessToken } = await validateOrGetToken("");
    const users = await mgSdk.Users.SearchUsers(queryParams, accessToken);
    return {
      data: users,
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

export const UpdateUser = async (user: User) => {
  const { domainId, accessToken } = await validateOrGetToken("");
  try {
    const updated = await mgSdk.Users.Update(user, accessToken);
    return {
      data: updated.credentials?.username as string,
      error: null,
    };
  } catch (err: unknown) {
    const knownError = err as HttpError;
    return {
      data: null,
      error: knownError.error || knownError.message || knownError.toString(),
    };
  } finally {
    revalidatePath(`/workspace/${domainId}`);
  }
};
