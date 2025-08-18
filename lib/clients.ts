"use server";

import { Client } from "@absmach/magistrala-sdk";
import { mgSdk, validateOrGetToken } from "./magistrala";
import { HttpError } from "@/types/errors";

export const CreateClient = async (client: Client, domainId: string) => {
  const { accessToken } = await validateOrGetToken("");
  try {
    const created = await mgSdk.Clients.CreateClient(
      client,
      domainId,
      accessToken
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
  }
};
