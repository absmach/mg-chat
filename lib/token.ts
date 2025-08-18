import { encodeSessionToken, getTokenExpiry } from "@/lib/nextauth";
import { absoluteUrl, generateUrl } from "@/lib/utils";
import type { UserInfo } from "@/types/auth";
import { cookies } from "next/headers";
import { type NextRequest, NextResponse } from "next/server";
import { UserProfile } from "@/lib/users";

export async function Get(req: NextRequest) {
  const cookiesStore = await cookies();
  const accessToken = cookiesStore.get("access_token")?.value;
  const refreshToken = cookiesStore.get("refresh_token")?.value;

  const response = await UserProfile(accessToken);
  if (response.error !== null) {
    return NextResponse.redirect(`/auth?error=${response.error}`);
  }

  const user = response.data;
  const userSession = await encodeSessionToken({
    user: {
      id: user.id as string,
      username: user.credentials?.username as string,
      // biome-ignore lint/style/useNamingConvention: This is from an external library
      first_name: user.first_name,
      // biome-ignore lint/style/useNamingConvention: This is from an external library
      last_name: user.last_name,
      email: user.email as string,
      image: user.profile_picture,
      role: user.role,
    } as UserInfo,
    accessToken,
    refreshToken,
    refreshTokenExpiry: getTokenExpiry(refreshToken as string),
    accessTokenExpiry: getTokenExpiry(accessToken as string),
  });

  const urlPath = absoluteUrl(req);
  const secure = urlPath.protocol === "https";
  const cookiesSessionKey =
    urlPath.protocol === "https"
      ? "__Secure-next-auth.session-token"
      : "next-auth.session-token";

  const port =
    urlPath.port !== "443" && urlPath.port !== "80" ? `:${urlPath.port}` : "";
  const redirectUrl = generateUrl(
    urlPath.protocol,
    urlPath.host,
    port,
    process.env.BASE_PATH || "/"
  );

  cookiesStore.set({
    name: cookiesSessionKey,
    value: userSession,
    httpOnly: true,
    path: "/",
    secure: secure,
  });

  return NextResponse.redirect(redirectUrl);
}
