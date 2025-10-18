import type { FetchResult } from '#app';
import type { NitroFetchOptions, NitroFetchRequest } from 'nitropack';

export const http = {
  get: async <T = unknown, R extends NitroFetchRequest = NitroFetchRequest>(
    url: R,
    query?: Record<string, any>,
    options?: NitroFetchOptions<R>
  ) => {
    const { $api } = useNuxtApp();
    const res = await $api(url, {
      ...options,
      method: 'GET' as any,
      query: query,
    });

    // @ts-expect-error type inference
    return res as unknown extends T ? FetchResult<R, 'get'> : T;
  },

  post: async <T = unknown, R extends NitroFetchRequest = NitroFetchRequest>(
    url: R,
    data?: RequestInit['body'] | Record<string, any>,
    options?: NitroFetchOptions<NitroFetchRequest>
  ) => {
    const { $api } = useNuxtApp();
    const res = await $api(url, {
      ...options,
      method: 'POST' as any,
      body: data,
    });

    // @ts-expect-error type inference
    return res as unknown extends T ? FetchResult<R, 'post'> : T;
  },

  put: async <T = unknown, R extends NitroFetchRequest = NitroFetchRequest>(
    url: R,
    data: RequestInit['body'] | Record<string, any>,
    options?: NitroFetchOptions<NitroFetchRequest>
  ) => {
    const { $api } = useNuxtApp();
    const res = await $api(url, {
      ...options,
      method: 'PUT' as any,
      body: data,
    });

    // @ts-expect-error type inference
    return res as unknown extends T ? FetchResult<R, 'put'> : T;
  },

  delete: async <T = unknown, R extends NitroFetchRequest = NitroFetchRequest>(
    url: R,
    options?: NitroFetchOptions<NitroFetchRequest>
  ) => {
    const { $api } = useNuxtApp();
    const res = await $api(url, {
      ...options,
      method: 'DELETE' as any,
    });

    // @ts-expect-error type inference
    return res as unknown extends T ? FetchResult<R, 'delete'> : T;
  },
};
