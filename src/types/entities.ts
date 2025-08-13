import { MemberRoleActions, UserBasicInfo } from "@absmach/magistrala-sdk";

export interface Member extends UserBasicInfo {
  roles: MemberRoleActions[];
}
export interface EntityMembersPage {
  total: number;
  limit: number;
  offset: number;
  members: Member[];
}

export interface Option {
  value: string;
  label: string;
  disable?: boolean;
  /** fixed option that can't be removed. */
  fixed?: boolean;
  /** Group the options by providing key. */
  [key: string]: string | boolean | undefined;
}

export interface Metadata {
  // biome-ignore lint/suspicious/noExplicitAny: This is a valid use case for any
  [key: string]: any;
}

export enum OutputType {
  // biome-ignore lint/style/useNamingConvention: This is from an external library
  CHANNELS = "channels",
  // biome-ignore lint/style/useNamingConvention: This is from an external library
  SAVE_SENML = "save_senml",
  // biome-ignore lint/style/useNamingConvention: This is from an external library
  ALARMS = "alarms",
  // biome-ignore lint/style/useNamingConvention: This is from an external library
  EMAIL = "email",
  // biome-ignore lint/style/useNamingConvention: This is from an external library
  SAVE_REMOTE_PG = "save_remote_pg",
}
