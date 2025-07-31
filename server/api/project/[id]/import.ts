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
      endpoints = handleSwaggerSpec(spec as OpenAPIV2.Document, projectId);
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
      const operation = v as Schema<OpenAPIV3.OperationObject>;
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

function handleSwaggerSpec(spec: OpenAPIV2.Document, projectId: string) {
  const endpoints: Prisma.EndpointCreateManyInput[] = [];

  for (const [path, methods] of Object.entries(spec.paths || {})) {
    for (const [method, operation] of Object.entries(methods || {})) {
      if (!['get', 'post', 'put', 'delete'].includes(method)) continue;

      const op = operation as Schema<OpenAPIV2.OperationObject>;
      const headers: Parameter[] = [];
      const queryParams: Parameter[] = [];
      const formDataParams: Parameter[] = [];
      let body: Parameter | null = null;

      // 处理参数
      for (const param of op.parameters || []) {
        if (param.in === 'body') {
          if (param.schema) {
            body = convertSwaggerSchemaToParameter(param.schema);
          }
        } else {
          const generalParam = param as Schema<OpenAPIV2.GeneralParameterObject>;
          const p: Parameter = {
            key: generalParam.name,
            value: '',
            type: generalParam.type || 'string',
            description: generalParam.description || '',
            required: generalParam.required || false,
            enabled: true,
            options: generalParam.enum,
            isArray: generalParam.type === 'array',
          };

          if (p.type === 'array') {
            p.type = generalParam.items?.type || 'string';
          }

          switch (generalParam.in) {
            case 'query':
              queryParams.push(p);
              break;
            case 'header':
              headers.push(p);
              break;
            case 'formData':
              formDataParams.push(p);
              break;
            // path参数通常不需要在API测试工具中单独处理
          }
        }
      }

      // 如果有formData参数，将它们转换为body
      if (formDataParams.length > 0) {
        body = {
          key: '',
          value: '',
          type: 'object',
          description: 'Form data parameters',
          required: false,
          enabled: true,
          isArray: false,
          children: formDataParams,
        };
      }

      const endpoint = {
        projectId: projectId,
        method: method,
        path: path,
        tags: op.tags || [],
        name: op.summary || '',
        description: op.description || '',
        headers: headers as unknown as Prisma.InputJsonValue,
        queryParams: queryParams as unknown as Prisma.InputJsonValue,
        body: body as unknown as Prisma.InputJsonValue,
      };
      endpoints.push(endpoint);
    }
  }

  return endpoints;
}

// 用于处理Swagger 2.0的schema转换
function convertSwaggerSchemaToParameter(schema: OpenAPIV2.SchemaObject): Parameter {
  if (schema.type === 'object') {
    const children: Parameter[] = [];
    for (const [key, subSchema] of Object.entries(schema.properties || {})) {
      const subParameter = convertSwaggerSchemaToParameter(subSchema);
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
    const subParameter = convertSwaggerSchemaToParameter(schema.items as OpenAPIV2.ItemsObject);
    subParameter.isArray = true;
    return subParameter;
  } else {
    return {
      key: schema.title || '',
      value: '',
      type: Array.isArray(schema.type) ? schema.type[0] || 'string' : schema.type || 'string',
      description: schema.description || '',
      required: false,
      enabled: true,
      isArray: false,
      options: schema.enum,
    };
  }
}

function convertSchemaToParameter(schema: Schema<OpenAPIV3.SchemaObject>): Parameter {
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
      options: schema.enum,
    };
  }
}
