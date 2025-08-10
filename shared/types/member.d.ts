type MemberRole = 'ADMIN' | 'DEVELOPER' | 'GUEST';

interface UserLite {
  id: string;
  username: string;
  name: string | null;
  email: string;
}

interface GroupMemberRes {
  user: UserLite;
  role: MemberRole;
}

interface GroupMembersGetRes {
  members: GroupMemberRes[];
  selfRole: MemberRole;
}

interface ProjectMembersGetRes {
  inherited: GroupMemberRes[];
  local: GroupMemberRes[];
  selfRole: MemberRole;
}
