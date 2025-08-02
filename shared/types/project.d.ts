interface ProjectGetRes {
  id: string;
  name: string;
  description: string | null;
  groupId: string;
  endpointGroups: ProjectGetResEndpointGroup[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectGetResEndpointGroup {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  children: ProjectGetResEndpointGroup[];
  endpoints: ProjectGetResEndpoint[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectGetResEndpoint {
  id: string;
  name: string;
  method: PrismaJson.HttpMethod;
  path: string;
  description: string;
  tags: string[];
  headers: PrismaJson.Parameter[];
  queryParams: PrismaJson.Parameter[];
  body: PrismaJson.Parameter | null;
  response: PrismaJson.EndpointResponse | null;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectQueryRes {
  id: string;
  name: string;
  description: string | null;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectCreateReq {
  name: string;
  description: string | null;
  groupId: string;
}

interface ProjectUpdateReq {
  name?: string;
  description?: string | null;
  groupId?: string;
}

interface ProjectImportReq {
  importType: 'file' | 'url';
  url: string | null;
  file: string | null;
}
