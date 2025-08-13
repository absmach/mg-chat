"use server";

import type {
  Domain,
  DomainBasicInfo,
  DomainsPage,
  Role,
  RolePage,
  UserBasicInfo,
} from "@absmach/magistrala-sdk";
import {
  type RequestOptions,
  mgSdk,
  validateOrGetToken,
} from "@/lib/magistrala";
import type { HttpError } from "@/types/errors";
import { revalidatePath } from "next/cache";
import { ProcessEntityMembers } from "./users";

export const CreateDomain = async (domain: Domain) => {
  const { accessToken } = await validateOrGetToken("");
  try {
    const response = await mgSdk.Domains.CreateDomain(domain, accessToken);
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
    revalidatePath("/domains");
  }
};


export const GetDomains = async ({ queryParams }: RequestOptions) => {
  try {
    const { accessToken } = await validateOrGetToken("");
    const domainsPage = await mgSdk.Domains.Domains(queryParams, accessToken);
    const domains = await processDomains(domainsPage.domains, accessToken);
    return {
      data: {
        total: domainsPage.total,
        offset: domainsPage.offset,
        limit: domainsPage.limit,
        domains,
      } as DomainsPage,
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

export async function GetUserBasicInfo(userId: string, token = "") {
  try {
    const { accessToken } = await validateOrGetToken(token);
    const userInfo = await mgSdk.Users.User(userId, accessToken);
    return {
      id: userInfo.id,
      email: userInfo.email,
      // biome-ignore lint/style/useNamingConvention: This is from an external library
      first_name: userInfo.first_name,
      // biome-ignore lint/style/useNamingConvention: This is from an external library
      last_name: userInfo.last_name,
      status: userInfo.status,
      credentials: userInfo.credentials,
    } as UserBasicInfo;
  } catch (_error) {
    return userId;
  }
}

async function processDomains(
  domains: Domain[],
  token: string,
): Promise<Domain[]> {
  const processedDomains: Domain[] = [];
  if (domains && domains.length > 0) {
    for (const domain of domains) {
      try {
        const createdBy: UserBasicInfo | string =
          typeof domain.created_by === "string"
            ? domain.created_by === ""
              ? domain.created_by
              : await GetUserBasicInfo(domain.created_by, token)
            : (domain.created_by as UserBasicInfo);

        const updatedBy: UserBasicInfo | string =
          typeof domain.updated_by === "string"
            ? domain.updated_by === ""
              ? domain.updated_by
              : await GetUserBasicInfo(domain.updated_by, token)
            : (domain.updated_by as UserBasicInfo);

        const processedDomain: Domain = {
          ...domain,
          // biome-ignore lint/style/useNamingConvention: This is from an external library
          created_by: createdBy,
          // biome-ignore lint/style/useNamingConvention: This is from an external library
          updated_by: updatedBy,
        };
        processedDomains.push(processedDomain);
      } catch {
        processedDomains.push(domain);
      }
    }
    return processedDomains;
  }
  return domains;
}

export const ListDomainUsers = async ({queryParams} : RequestOptions) => {
  try {
    const {domainId, accessToken } = await validateOrGetToken("");
    const domainMembers = await mgSdk.Domains.ListDomainMembers(
      domainId,
      queryParams,
      accessToken,
    );
    const processedMembers = await ProcessEntityMembers(
      domainMembers,
      queryParams,
    );
    return {
      data: processedMembers,
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

export const ViewDomain = async (domainId: string) => {
  try {
    const { accessToken } = await validateOrGetToken("");
    const domain = await mgSdk.Domains.Domain(domainId, accessToken);
    return {
      data: domain,
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

export const GetDomainBasicInfo = async (domainId: string) => {
  try {
    const { accessToken } = await validateOrGetToken("");
    const domain = await mgSdk.Domains.Domain(domainId, accessToken);
    return {
      id: domain.id,
      name: domain.name,
      route: domain.route,
    } as DomainBasicInfo;
  } catch (_error) {
    return domainId;
  }
};

export const ListDomainRoles = async ({ queryParams }: RequestOptions) => {
  const { domainId, accessToken } = await validateOrGetToken("");
  try {
    const rolesPage = await mgSdk.Domains.ListDomainRoles(
      domainId,
      queryParams,
      accessToken,
    );
    const roles = await ProcessRoles(rolesPage.roles, accessToken);
    return {
      data: {
        total: rolesPage.total,
        offset: rolesPage.offset,
        limit: rolesPage.limit,
        roles,
      } as RolePage,
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

export async function ProcessRoles(
  roles: Role[],
  token: string,
): Promise<Role[]> {
  const processedDomains: Role[] = [];
  if (roles && roles.length > 0) {
    for (const role of roles) {
      try {
        const createdBy: UserBasicInfo | string =
          typeof role.created_by === "string"
            ? role.created_by === ""
              ? role.created_by
              : await GetUserBasicInfo(role.created_by, token)
            : role.created_by
              ? (role.created_by as UserBasicInfo)
              : "";

        const updatedBy: UserBasicInfo | string =
          typeof role.updated_by === "string"
            ? role.updated_by === ""
              ? role.updated_by
              : await GetUserBasicInfo(role.updated_by, token)
            : role.updated_by
              ? (role.updated_by as UserBasicInfo)
              : "";

        const processedRole: Role = {
          ...role,
          // biome-ignore lint/style/useNamingConvention: This is from an external library
          created_by: createdBy as string,
          // biome-ignore lint/style/useNamingConvention: This is from an external library
          updated_by: updatedBy as string,
        };
        processedDomains.push(processedRole);
      } catch {
        processedDomains.push(role);
      }
    }
    return processedDomains;
  }
  return roles;
}

export const AddDomainRoleMembers = async (
  roleId: string,
  domainId: string,
  members: string[],
) => {
  const { accessToken } = await validateOrGetToken("");
  try {
    const addedMembers = await mgSdk.Domains.AddDomainRoleMembers(
      domainId,
      roleId,
      members,
      accessToken,
    );
    return {
      data: addedMembers,
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
