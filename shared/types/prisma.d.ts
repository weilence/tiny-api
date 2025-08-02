declare global {
  namespace PrismaJson {
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

    type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch';
  }
}

export {};
