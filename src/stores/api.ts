import { defineStore } from "pinia";

export interface ApiGroup {
  id: number;
  parentId: number;
  name: string;
  description: string;
  children: ApiGroup[];
  apis: Api[];
}

export interface Api {
  id: number;
  name: string;
  groupId: number;
  description: string;
  method: string;
  path: string;
  queryStrings: QueryString[];
  headers: Header[];
  cookies: Cookie[];
  body: string;
  params: Param[];
}

export interface QueryString {
  key: string;
  value: string;
  description: string;
}

export interface Header {
  key: string;
  value: string;
  description: string;
}

export interface Cookie {
  key: string;
  value: string;
  description: string;
}

export interface Param {
  key: string;
  value: string;
  description: string;
}

export const useApiStore = defineStore("api", {
  state: () => ({
    groups: [] as ApiGroup[],
    apis: [] as Api[],
  }),
  actions: {
    async addApiGroup(group: Omit<ApiGroup, "id">) {
      const groups = this.groups;
      groups.push({ ...group, id: groups.length + 1 });
      return Promise.resolve();
    },
    async addApi(api: Omit<Api, "id">) {
      const apis = this.apis;
      apis.push({ ...api, id: apis.length + 1 });
      return Promise.resolve();
    },
    async deleteApiGroup(id: number) {
      const groups = this.groups;
      const index = groups.findIndex((group) => group.id === id);
      if (index !== -1) {
        groups.splice(index, 1);
      }
      return Promise.resolve();
    },
    async deleteApi(id: number) {
      const apis = this.apis;
      const index = apis.findIndex((api) => api.id === id);
      if (index !== -1) {
        apis.splice(index, 1);
      }
      return Promise.resolve();
    },
  },
});
