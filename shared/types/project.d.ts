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

interface ProjectGetRes {
  id: string;
  name: string;
  description: string | null;
  groupId: string;
  endpoints: ProjectGetResEndpoint[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectGetResEndpoint {
  id: string;
  name: string;
  method: 'get' | 'post' | 'put' | 'delete' | 'patch';
  path: string;
  description: string;
  tags: string[];
  headers: Parameter[];
  queryParams: Parameter[];
  body: Parameter;
  response: {
    status: number;
    headers: Record<string, string>;
    body: string;
  } | null;
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
