"use server";

import { PageMetadata, User } from "@absmach/magistrala-sdk";
import { mgSdk, validateOrGetToken } from "./magistrala";
import { HttpError } from "@/types/errors";
import { revalidatePath } from "next/cache";

export const CreateUser = async (user: User) => {
  try {
    const { accessToken } = await validateOrGetToken("");
    const created = await mgSdk.Users.Create(user, accessToken);
    return {
      data: created.credentials?.username as string,
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
  const { accessToken } = await validateOrGetToken("");
  try {
    const updated = await mgSdk.Users.Update(user, accessToken);
    return {
      data: updated,
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

export const UpdateUserEmail = async (user: User) => {
  try {
    const { accessToken } = await validateOrGetToken("");
    const updated = await mgSdk.Users.UpdateEmail(user, accessToken);
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
    revalidatePath("/chat");
  }
};

export const UpdateUsername = async (user: User) => {
  try {
    const { accessToken } = await validateOrGetToken("");
    const updated = await mgSdk.Users.UpdateUsername(user, accessToken);
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
    revalidatePath("/chat");
  }
};

export const UpdateUserPassword = async (
  oldSecret: string,
  newSecret: string,
) => {
  try {
    const { accessToken } = await validateOrGetToken("");
    await mgSdk.Users.UpdateUserPassword(oldSecret, newSecret, accessToken);
    return {
      data: "Password Updated Successfully",
      error: null,
    };
  } catch (err: unknown) {
    const knownError = err as HttpError;
    return {
      error: knownError.message || knownError.toString(),
    };
  } finally {
    revalidatePath("/chat");
  }
};
