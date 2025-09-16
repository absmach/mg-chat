"use server";

import type { Rule } from "@absmach/magistrala-sdk";
import { mgSdk, validateOrGetToken } from "@/lib/magistrala";
import type { HttpError } from "@/types/errors";

export const CreateRule = async ({rule, domain}: {rule: Rule, domain?: string}) => {
  const { accessToken, domainId } = await validateOrGetToken("");
  try {
    const newRule = await mgSdk.Rules.create(domain ?? domainId, rule, accessToken);
    return {
      data: newRule,
      error: null,
    };
  } catch (err: unknown) {
    console.log("err", err);
    const knownError = err as HttpError;
    return {
      data: null,
      error: knownError.error || knownError.message || knownError.toString(),
    };
  }
};
