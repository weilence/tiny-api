import type { SerializeObject as OriginSerializeObject } from 'nitropack';

declare global {
  type SerializeObject<T extends object> = OriginSerializeObject<T>;
}

// 判断一个类型是否是 $ref
type is<T> = [keyof T] extends ['description' | 'summary' | '$ref']
  ? ['$ref'] extends [keyof T]
    ? true
    : false
  : false;

// 从联合类型中过滤掉含有 $ref 的部分
type excludeRef<T> = T extends any ? (is<T> extends true ? never : T) : never;

// 递归处理
export type Schema<T> =
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
