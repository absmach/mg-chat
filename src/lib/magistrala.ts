import SDK, {
  type PageMetadata,
  type SDKConfig,
} from "@absmach/magistrala-sdk";
import { getServerSession } from "@/lib/nextauth";

export const sdkConf: SDKConfig = {
  domainsUrl: process.env.MG_DOMAINS_URL || "",
  usersUrl: process.env.MG_USERS_URL || "",
  clientsUrl: process.env.MG_CLIENTS_URL || "",
  channelsUrl: process.env.MG_CHANNELS_URL || "",
  groupsUrl: process.env.MG_GROUPS_URL || "",
  readersUrl: process.env.MG_READER_URL || "",
  httpAdapterUrl: process.env.MG_HTTP_ADAPTER_URL || "",
  journalUrl: process.env.MG_JOURNAL_URL || "",
  bootstrapUrl: process.env.MG_BOOTSTRAP_URL || "",
  rulesUrl: process.env.MG_RE_URL || "",
  reportsUrl: process.env.MG_REPORTS_URL || "",
  authUrl: process.env.MG_AUTH_URL || "",
  alarmsUrl: process.env.MG_ALARMS_URL || "",
};

export interface RequestOptions {
  token?: string;
  id?: string;
  roleName?: string;
  userId?: string;
  queryParams: PageMetadata;
}

export const mgSdk = new SDK(sdkConf);

export const validateOrGetToken = async (
  token: string,
): Promise<{ accessToken: string; domainId: string }> => {
  if (token) {
    return { accessToken: token, domainId: "" };
  }
  const session = await getServerSession();
  if (session && session.accessToken !== "") {
    if (session.domain?.id) {
      return { accessToken: session.accessToken, domainId: session.domain.id };
    }
    return { accessToken: session.accessToken, domainId: "" };
  }
  return { accessToken: "", domainId: "" };
};
