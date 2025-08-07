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