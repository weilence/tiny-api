interface ProjectApiTreeGetRes {
  id: string;
  name: string;
  description: string | null;
  method: HttpMethod | null;
  path: string | null;
  parentId: string | null;
  isFolder: boolean;
  children: ProjectApiTreeGetRes[];
}

interface ProjectApiListGetRes {
  id: string;
  name: string;
  description: string | null;
  method: HttpMethod | null;
  path: string | null;
  groupId: string | null;
  tags: string[] | null;
}

type ProjectEndpointGetRes = InferInsertModel<typeof endpoints>;

interface EndpointResponse {
  status: number;
  headers: Record<string, string>;
  body: string;
}

interface Parameter {
  key: string;
  value: string;
  type: string;
  isArray: boolean;
  required: boolean;
  description: string;
  enabled: boolean;
  children?: Parameter[];
  options?: string[];
}

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

interface ProjectQueryRes {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectCreateReq {
  name: string;
  description: string | null;
  icon: string | null;
  groupId: string;
}

interface ProjectUpdateReq {
  name?: string;
  description?: string | null;
  icon?: string | null;
  groupId?: string;
}

interface ProjectImportReq {
  importType: 'file' | 'url';
  url: string | null;
  file: string | null;
}
