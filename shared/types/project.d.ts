interface ProjectGetRes {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
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

interface ProjectGetResEndpoint {
  id: string;
  name: string;
  method: HttpMethod;
  path: string;
  description: string;
  tags: string[];
  headers: Parameter[];
  queryParams: Parameter[];
  body: Parameter | null;
  response: EndpointResponse | null;
  createdAt: Date;
  updatedAt: Date;
}

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
