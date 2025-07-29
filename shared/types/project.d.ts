interface Parameter {
  key: string;
  value: string;
  type: string;
  isArray: boolean;
  required: boolean;
  description: string;
  enabled: boolean;
  children?: Parameter[];
}

interface ApiDetail {
  id: string;
  name: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
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

interface ProjectImportReq {
  importType: 'file' | 'url';
  url: string | null;
  file: string | null;
}
