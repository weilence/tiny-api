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
// 判断一个类型是否是 $ref
type is<T> = [keyof T] extends ['description' | 'summary' | '$ref']
  ? ['$ref'] extends [keyof T]
    ? true
    : false
  : false;

// 从联合类型中过滤掉含有 $ref 的部分
type excludeRef<T> = T extends any ? (is<T> extends true ? never : T) : never;

// 递归处理
type Schema<T> =
  // 如果是数组，递归处理元素，并过滤 $ref
  T extends (infer U)[]
    ? Schema<excludeRef<U>>[]
    : // 如果是联合类型，过滤 $ref 并递归处理
    T extends object
    ? is<T> extends true
      ? never
      : {
          [K in keyof T]: Schema<T[K]>;
        }
    : // 其他类型原样返回
      T;
