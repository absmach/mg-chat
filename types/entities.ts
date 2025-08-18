import type { MemberRoleActions, UserBasicInfo } from "@absmach/magistrala-sdk";

export enum OutputType {
  CHANNELS = "channels",
  SAVE_SENML = "save_senml",
  ALARMS = "alarms",
  EMAIL = "email",
  SAVE_REMOTE_PG = "save_remote_pg",
}

export interface Member extends UserBasicInfo {
  roles: MemberRoleActions[];
}

export interface EntityMembersPage {
  total: number;
  limit: number;
  offset: number;
  members: Member[];
}

export interface Metadata {
  [key: string]: any;
}
