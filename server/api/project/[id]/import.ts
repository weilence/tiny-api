// @ts-expect-error - swagger-client doesn't have TypeScript definitions
import SwaggerClient from 'swagger-client';
import type { OpenAPI, OpenAPIV2, OpenAPIV3, OpenAPIV3_1 } from 'openapi-types';
import prisma from '~~/lib/prisma';
import type { Prisma } from '@prisma/client';

export async function parseMultipartObject<T>(event: any) {
  const parts = await readMultipartFormData(event);
  const body: Record<string, any> = {};

  for (const part of parts || []) {
    const { name, data } = part;
    if (!name) {
      continue; // 跳过没有名称的部分
    }

    if (part.type === 'file') {
      // 文件处理：可能是单个或多个同名文件
      if (body[name]) {
        if (Array.isArray(body[name])) {
          body[name].push(part);
        } else {
          body[name] = [body[name], part];
        }
      } else {
        body[name] = part;
      }
    } else {
      // 字符串字段处理
      const value = data.toString();
      if (body[name]) {
        if (Array.isArray(body[name])) {
          body[name].push(value);
        } else {
          body[name] = [body[name], value];
        }
      } else {
        body[name] = value;
      }
    }
  }

  return body as T;
}

export default defineEventHandler(async (event) => {
  const req = await parseMultipartObject<ProjectImportReq>(event);
  const projectId = event.context.params?.id || '';

  let apiDoc: any;
  if (req.importType === 'url') {
    apiDoc = await SwaggerClient(req.url);
  } else if (req.importType === 'file') {
    const text = req.file || '';
    const obj = JSON.parse(text);
    apiDoc = await SwaggerClient({ spec: obj });
  }

  let endpoints: Prisma.EndpointCreateManyInput[] = [];
  const spec: OpenAPI.Document = apiDoc.spec;
  if ('openapi' in spec && typeof spec.openapi === 'string') {
    const version = spec.openapi;
    if (version.startsWith('3.1')) {
      endpoints = handleOpenApi31Spec(spec as OpenAPIV3_1.Document, projectId);
    } else if (version.startsWith('3.0')) {
      endpoints = handleOpenApi30Spec(spec as OpenAPIV3.Document, projectId);
    } else {
      console.error('Unsupported OpenAPI version:', version);
      return { error: 'Unsupported OpenAPI version' };
    }
  } else if ('swagger' in spec && typeof spec.swagger === 'string') {
    if (spec.swagger.startsWith('2')) {
      endpoints = handleSwaggerSpec(spec, projectId);
    } else {
      console.error('Unsupported Swagger version:', spec.swagger);
      return { error: 'Unsupported Swagger version' };
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.endpoint.deleteMany({
      where: {
        projectId: projectId,
      },
    });

    await tx.endpoint.createMany({
      data: endpoints,
    });
  });
});

function handleOpenApi31Spec(_spec: OpenAPIV3_1.Document, _projectId: string) {
  return [];
}

function handleOpenApi30Spec(spec: OpenAPIV3.Document, projectId: string) {
  const endpoints: Prisma.EndpointCreateManyInput[] = [];
  for (const [path, methods] of Object.entries(spec.paths!)) {
    for (const [method, v] of Object.entries(methods!)) {
      if (!['get', 'post', 'put', 'delete'].includes(method)) continue;
      const operation = v as DeepExcludeRef<OpenAPIV3.OperationObject>;
      const headers: Parameter[] = [];
      const queryParams: Parameter[] = [];
      for (const parameter of operation.parameters || []) {
        const p = {} as Parameter;
        p.key = parameter.name;
        p.value = '';
        p.description = parameter.description || '';
        p.required = parameter.required || false;
        p.enabled = true;
        if (parameter.schema) {
          p.type = parameter.schema.type || '';
        }

        switch (parameter.in) {
          case 'query':
            queryParams.push(p);
            break;
          case 'header':
            headers.push(p);
            break;
        }
      }

      let body: Parameter | null = null;
      if (operation.requestBody) {
        const schema = operation.requestBody.content?.['application/json']?.schema;
        if (schema) {
          body = convertSchemaToParameter(schema);
        }
      }

      const endpoint = {
        projectId: projectId,
        method: method,
        path: path,
        tags: operation.tags || [],
        name: operation.summary || '',
        description: operation.description || '',
        headers: headers as unknown as Prisma.InputJsonValue,
        queryParams: queryParams as unknown as Prisma.InputJsonValue,
        body: body as unknown as Prisma.InputJsonValue,
      };
      endpoints.push(endpoint);
    }
  }

  return endpoints;
}

function convertSchemaToParameter(schema: DeepExcludeRef<OpenAPIV3.SchemaObject>): Parameter {
  if (schema.type === 'object') {
    const children: Parameter[] = [];
    for (const [key, subSchema] of Object.entries(schema.properties || {})) {
      const subParameter = convertSchemaToParameter(subSchema);
      subParameter.key = key;
      subParameter.required = schema.required?.includes(key) || false;

      children.push(subParameter);
    }

    return {
      key: '',
      value: '',
      type: 'object',
      description: schema.description || '',
      required: false,
      enabled: true,
      children: children,
      isArray: false,
    };
  } else if (schema.type === 'array') {
    const subParameter = convertSchemaToParameter(schema.items);
    subParameter.isArray = true;
    return subParameter;
  } else {
    return {
      key: schema.title || '',
      value: '',
      type: schema.type || '',
      description: schema.description || '',
      required: false,
      enabled: true,
      isArray: false,
    };
  }
}

// 判断一个类型是否是 $ref
type IsRef<T> = T extends { $ref: any } ? true : false;

// 从联合类型中过滤掉含有 $ref 的部分
type FilterOutRef<T> = T extends any ? (IsRef<T> extends true ? never : T) : never;

// 递归处理
type DeepExcludeRef<T> =
  // 如果是数组，递归处理元素，并过滤 $ref
  T extends (infer U)[]
    ? DeepExcludeRef<FilterOutRef<U>>[]
    : // 如果是联合类型，过滤 $ref 并递归处理
    T extends object
    ? IsRef<T> extends true
      ? never
      : {
          [K in keyof T]: DeepExcludeRef<T[K]>;
        }
    : // 其他类型原样返回
      T;

function handleSwaggerSpec(_spec: OpenAPIV2.Document, _projectId: string) {
  return [];
}
