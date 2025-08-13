"use server";

import type {
  Rule
} from "@absmach/magistrala-sdk";
import { mgSdk, validateOrGetToken } from "@/lib/magistrala";
import type { HttpError } from "@/types/errors";

export const CreateRule = async (rule: Rule) => {
  console.log("rule", rule);
  const { accessToken, domainId } = await validateOrGetToken("");
  try {
    const newRule = await mgSdk.Rules.create(domainId, rule, accessToken);
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