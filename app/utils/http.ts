import type { MiddlewareOf, NitroFetchOptions, NitroFetchRequest } from 'nitropack';

type RemovePrefix<T> = T extends `/api${infer R}` ? R | (string & {}) : never;
type ApiPath = RemovePrefix<NitroFetchRequest>;

export const http = {
  get: async <T = unknown, R extends ApiPath = ApiPath>(
    url: R,
    query?: Record<string, any>,
    options?: NitroFetchOptions<NitroFetchRequest>
  ) => {
    const { $api } = useNuxtApp();
    const res = await $api(url as string, {
      ...options,
      method: 'GET',
      query: query,
    });

    return res as unknown extends T ? MiddlewareOf<`/api${R}`, 'get'> : T;
  },

  post: async <T = unknown, R extends ApiPath = ApiPath>(
    url: R,
    data: RequestInit['body'] | Record<string, any>,
    options?: NitroFetchOptions<NitroFetchRequest>
  ) => {
    const { $api } = useNuxtApp();
    const res = await $api(url as string, {
      ...options,
      method: 'POST',
      body: data,
    });

    return res as unknown extends T ? MiddlewareOf<`/api${R}`, 'post'> : T;
  },

  put: async <T = unknown, R extends ApiPath = ApiPath>(
    url: R,
    data: RequestInit['body'] | Record<string, any>,
    options?: NitroFetchOptions<NitroFetchRequest>
  ) => {
    const { $api } = useNuxtApp();
    const res = await $api(url as string, {
      ...options,
      method: 'PUT',
      body: data,
    });

    return res as unknown extends T ? MiddlewareOf<`/api${R}`, 'put'> : T;
  },

  delete: async <T = unknown, R extends ApiPath = ApiPath>(url: R, options?: NitroFetchOptions<NitroFetchRequest>) => {
    const { $api } = useNuxtApp();
    const res = await $api(url as string, {
      ...options,
      method: 'DELETE',
    });

    return res as unknown extends T ? MiddlewareOf<`/api${R}`, 'delete'> : T;
  },
};
