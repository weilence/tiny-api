/**
 * 将服务端类型转换为客户端类型（将 Date 转换为 string）
 * 用于处理 Nuxt 服务端渲染时 Date 类型序列化为字符串的问题
 */
type Serialized<T> = T extends Date
  ? string
  : T extends Array<infer U>
  ? Array<Serialized<U>>
  : T extends object
  ? {
      [K in keyof T]: Serialized<T[K]>;
    }
  : T;
