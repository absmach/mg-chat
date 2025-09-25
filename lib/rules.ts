"use server";

import type { Rule } from "@absmach/magistrala-sdk";
import { mgSdk, validateOrGetToken } from "@/lib/magistrala";
import type { HttpError } from "@/types/errors";

export const CreateRule = async ({rule, workspace}: {rule: Rule, workspace?: string}) => {
  const { accessToken, workspaceId } = await validateOrGetToken("");
  try {
    const newRule = await mgSdk.Rules.create(workspace ?? workspaceId, rule, accessToken);
    return {
      data: newRule,
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
