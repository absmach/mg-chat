"use server"

import { Client, MessagesPageMetadata } from "@absmach/magistrala-sdk";
import { type RequestOptions, mgSdk, validateOrGetToken } from "./magistrala";
import { HttpError } from "@/types/errors";
import { revalidatePath } from "next/cache";

export interface MessagesRequestOptions {
  id: string;
  queryParams: MessagesPageMetadata;
  token?: string;
}

export const CreateClient = async ({client, domainId}: {client: Client; domainId: string}) => {
  const { accessToken } = await validateOrGetToken("");
  console.log("domainId", domainId);
  try {
    const created = await mgSdk.Clients.CreateClient(
      client,
      domainId,
      accessToken,
    );
    return {
      data: created,
      error: null,
    };
  } catch (err: unknown) {
    const knownError = err as HttpError;
    return {
      data: null,
      error: knownError.error || knownError.message || knownError.toString(),
    };
  } finally {
    revalidatePath(`/workspace`);
  }
};

export const GetClients = async ({ queryParams }: RequestOptions) => {
  try {
    const { accessToken, domainId } = await validateOrGetToken("");
    const clients = await mgSdk.Clients.Clients(
      queryParams,
      domainId,
      accessToken,
    );

    return {
      data: clients,
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

export const ConnectClients = async (
  clientIds: string[],
  channelId: string,
  connectionTypes: string[],
) => {
  const { accessToken, domainId } = await validateOrGetToken("");
  try {
    const response = await mgSdk.Channels.ConnectClient(
      clientIds,
      channelId,
      connectionTypes,
      domainId,
      accessToken,
    );
    return {
      data: response.message,
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
