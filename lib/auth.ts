import SDK, {
  type Token,
  type Login,
  type Domain,
} from "@absmach/magistrala-sdk";
import camelcaseKeysDeep from "camelcase-keys-deep";
import { decodeJwt } from "jose";

import { sdkConf } from "@/lib/magistrala";
import {
  decodeSessionToken,
  encodeSessionToken,
} from "@/lib/nextauth";
import type {
  User as AuthUser,
  UserInfo as AuthUserInfo,
} from "@/types/auth";
import { HttpError } from "@/types/errors";


export function LoginAndGetUser(credential: Login): Promise<AuthUser> {
  return new Promise((resolve, reject) => {
    const mgSdk = new SDK(sdkConf);
    mgSdk.Users.CreateToken(credential)
      .then((token) => {
        mgSdk.Users.UserProfile(token.access_token)
          .then((mgUserProfile) => {
            const user = {
              id: mgUserProfile.id,
              username: mgUserProfile.credentials?.username,
              // biome-ignore lint/style/useNamingConvention: This is from an external library
              first_name: mgUserProfile.first_name,
              // biome-ignore lint/style/useNamingConvention: This is from an external library
              last_name: mgUserProfile.last_name,
              image: mgUserProfile.profile_picture,
              email: mgUserProfile.email,
              role: mgUserProfile.role,
            } as AuthUserInfo;

            const accessDecoded = decodeJwt(token?.access_token);

            if (accessDecoded.domain && accessDecoded.domain !== "") {
              mgSdk.Domains.Domain(
                accessDecoded.domain as string,
                token.access_token,
              )
                .then((mgDomain) => {
                  const domain = {
                    id: mgDomain.id,
                    name: mgDomain.name,
                    route: mgDomain.route,
                  } as Domain;
                  resolve({
                    user,
                    domain,
                    ...camelcaseKeysDeep(token),
                  } as AuthUser);
                })
                .catch((error: unknown) => {
                  const knownError = error as HttpError;
                  reject(
                    knownError.error ||
                      knownError.message ||
                      knownError.toString(),
                  );
                });
            } else {
              resolve({
                user,
                ...camelcaseKeysDeep(token),
              } as AuthUser);
            }
          })
          .catch((error: unknown) => {
            const knownError = error as HttpError;
            reject(
              knownError.error || knownError.message || knownError.toString(),
            );
          });
      })
      .catch((error: unknown) => {
        const knownError = error as HttpError;
        reject(knownError.error || knownError.message || knownError.toString());
      });
  });
}

export const RefreshToken = (refreshToken: string): Promise<Token> => {
  return new Promise((resolve, reject) => {
    try {
      const mgSdk = new SDK(sdkConf);
      resolve(mgSdk.Users.RefreshToken(refreshToken));
    } catch (error: unknown) {
      const knownError = error as HttpError;
      reject(knownError.error || knownError.message || knownError.toString());
    }
  });
};

export const WorkspaceLoginSession = async (
  csrfToken: string,
  sessionToken: string,
  domainId: string,
): Promise<string | undefined> => {
  try {
    const decodedToken = await decodeSessionToken(csrfToken, sessionToken);
    if (!decodedToken) {
      return;
    }
    const mgSdk = new SDK(sdkConf);

    const mgDomain = await mgSdk.Domains.Domain(
      domainId,
      decodedToken.accessToken as string,
      true,
    );

    if (!mgDomain) {
      return;
    }

    return await encodeSessionToken({
      ...decodedToken,
      domain: {
        id: mgDomain.id,
        name: mgDomain.name,
        route: mgDomain.route,
        roles: mgDomain.roles,
      } as Domain,
    });
  } catch (err: unknown) {
    const knownError = err as HttpError;
    const error =
      knownError.error || knownError.message || knownError.toString();
    throw new Error(error);
  }
};

export enum UserRole {
  Admin = "admin",
  User = "user",
}
