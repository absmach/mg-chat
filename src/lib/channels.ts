"use server";

import type { Channel } from "@absmach/magistrala-sdk";
import { mgSdk } from "@/lib/magistrala";
import {
  type RequestOptions,
  validateOrGetToken,
} from "@/lib/magistrala";
import type { HttpError } from "@/types/errors";
import { revalidatePath } from "next/cache";

export const CreateChannel = async (channel: Channel) => {
  const { accessToken, domainId } = await validateOrGetToken("");
  try {
    const newChannel = await mgSdk.Channels.CreateChannel(
      channel,
      domainId,
      accessToken,
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
    revalidatePath(`/workspace/${domainId}`);
  }
};

interface ChannelsProps {
  queryParams: RequestOptions["queryParams"];
  domainId: string;
}

export const GetChannels = async ({ queryParams, domainId }: ChannelsProps) => {
  const { accessToken } = await validateOrGetToken("");
  try {
    const channels = await mgSdk.Channels.Channels(
      queryParams,
      domainId,
      accessToken,
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
