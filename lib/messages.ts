"use server";

import { ClientBasicInfo, MessagesPage, MessagesPageMetadata, SenMLMessage } from "@absmach/magistrala-sdk";
import { mgSdk, validateOrGetToken } from "./magistrala";
import { HttpError } from "@/types/errors";

export interface MessagesRequestOptions {
  id: string;
  queryParams: MessagesPageMetadata;
  token?: string;
}

export const GetMessages = async ({
  id,
  queryParams,
}: MessagesRequestOptions) => {
  try {
    const { accessToken, workspaceId} = await validateOrGetToken("");
    const messagesPage = await mgSdk.Messages.Read(
      workspaceId,
      id,
      queryParams,
      accessToken,
    );
    const messages = await processMessages(messagesPage.messages, accessToken);
    return {
      data: {
        total: messagesPage.total,
        offset: messagesPage.offset,
        limit: messagesPage.limit,
        messages: messages,
      } as MessagesPage,
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

async function processMessages(
  messages: SenMLMessage[],
  token: string,
): Promise<SenMLMessage[]> {
  const processedMessages: SenMLMessage[] = [];
  if (messages && messages.length > 0) {
    for (const message of messages) {
      try {
        const publisher: ClientBasicInfo | string =
          typeof message.publisher === "string"
            ? message.publisher === ""
              ? message.publisher
              : await GetClientBasicInfo(message.publisher, token)
            : (message.publisher as ClientBasicInfo);

        const processedMessage: SenMLMessage = {
          ...message,
          publisher: publisher,
        };
        processedMessages.push(processedMessage);
      } catch {
        processedMessages.push(message);
      }
    }
    return processedMessages;
  }
  return messages;
}

async function GetClientBasicInfo(clientId: string, token = "") {
  try {
    const { accessToken, workspaceId} = await validateOrGetToken(token);
    const clientInfo = await mgSdk.Clients.Client(
      clientId,
      workspaceId,
      accessToken,
    );
    return {
      id: clientInfo.id,
      name: clientInfo.name,
      status: clientInfo.status,
      credentials: clientInfo.credentials,
    } as ClientBasicInfo;
  } catch (err: unknown) {
    const knownError = err as HttpError;
    throw new Error(
      knownError.error || knownError.message || knownError.toString(),
    );
  }
}
