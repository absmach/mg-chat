"use server";

import { PageMetadata, User } from "@absmach/magistrala-sdk";
import { mgSdk, validateOrGetToken } from "./magistrala";
import { HttpError } from "@/types/errors";

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
