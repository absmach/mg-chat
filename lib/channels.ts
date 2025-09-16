"use server";

import type { Channel } from "@absmach/magistrala-sdk";

import { revalidatePath } from "next/cache";
import { mgSdk, RequestOptions, validateOrGetToken } from "./magistrala";
import { HttpError } from "@/types/errors";

export const CreateChannel = async (channel: Channel, domainId: string) => {
  const { accessToken } = await validateOrGetToken("");
  try {
    const newChannel = await mgSdk.Channels.CreateChannel(
      channel,
      domainId,
      accessToken
    );
    return {
      data: newChannel,
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

export const ListChannels = async ({ queryParams }: RequestOptions) => {
  const { accessToken, domainId } = await validateOrGetToken("");
  try {
    const channels = await mgSdk.Channels.Channels(
      queryParams,
      domainId,
      accessToken
    );
    return {
      data: channels,
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

export const ViewChannel = async (id: string, listRoles?: boolean) => {
  const { accessToken, domainId } = await validateOrGetToken("");
  try {
    const channel = await mgSdk.Channels.Channel(
      id,
      domainId,
      accessToken,
      listRoles
    );
    return {
      data: channel,
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


export const ListChannelMembers = async (
  { token = "", id = "", queryParams }: RequestOptions,
  domainId: string
) => {
  try {
    const { accessToken } = await validateOrGetToken(token);
    const members = await mgSdk.Channels.ListChannelMembers(
      id,
      domainId,
      queryParams,
      accessToken
    );
    return {
      data: members,
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
