"use server";

import type { Domain, DomainsPage } from "@absmach/magistrala-sdk";
import { mgSdk, RequestOptions, validateOrGetToken } from "@/lib/magistrala";
import type { HttpError } from "@/types/errors";
import { revalidatePath } from "next/cache";

export const CreateWorkspace = async (workspace: Domain) => {
  const { accessToken } = await validateOrGetToken("");
  try {
    const response = await mgSdk.Domains.CreateDomain(workspace, accessToken);
    return {
      data: response,
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

export const ListWorkspaces = async ({ queryParams }: RequestOptions) => {
  try {
    const { accessToken } = await validateOrGetToken("");
    const domainsPage = await mgSdk.Domains.Domains(queryParams, accessToken);

    return {
      data: domainsPage,
      error: null,
    };
  } catch (err: unknown) {
    const knownError = err as HttpError;
    const error =
      knownError.error || knownError.message || knownError.toString();
    return {
      data: null,
      error: error,
    };
  }
};
