interface GroupQueryRes {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

interface GroupCreateReq {
  name: string;
  description?: string;
}

interface GroupUpdateReq {
  name?: string;
  description?: string;
}
