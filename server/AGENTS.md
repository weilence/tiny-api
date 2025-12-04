# Server 层文档 (服务端)

> 本文档描述 `server/` 目录的服务端代码结构和开发规范

---

## 目录结构

```
server/
├── api/              # API 路由处理器（按功能分组）
├── db/               # 数据库相关
├── middleware/       # 服务端中间件
├── plugins/          # 服务端插件
└── utils/            # 服务端工具函数
```

---

## API 路由（api/）

基于文件系统的 API 路由，自动映射为 HTTP 端点：

```
server/api/
├── auth/                           # 认证相关
│   ├── login.post.ts              → POST /api/auth/login
│   ├── register.post.ts           → POST /api/auth/register
│   └── logout.post.ts             → POST /api/auth/logout
├── user/                           # 用户管理
│   ├── index.get.ts               → GET /api/user
│   ├── index.put.ts               → PUT /api/user
│   ├── password.put.ts            → PUT /api/user/password
│   └── search.get.ts              → GET /api/user/search
├── group/                          # 分组管理
│   ├── index.get.ts               → GET /api/group
│   ├── index.post.ts              → POST /api/group
│   ├── [id]/
│   │   ├── index.put.ts           → PUT /api/group/:id
│   │   ├── index.delete.ts        → DELETE /api/group/:id
│   │   └── members/
│   │       ├── index.get.ts       → GET /api/group/:id/members
│   │       ├── index.post.ts      → POST /api/group/:id/members
│   │       ├── [userId].put.ts    → PUT /api/group/:id/members/:userId
│   │       ├── [userId].patch.ts  → PATCH /api/group/:id/members/:userId
│   │       └── [userId].delete.ts → DELETE /api/group/:id/members/:userId
├── project/                        # 项目管理
│   ├── index.get.ts               → GET /api/project
│   ├── index.post.ts              → POST /api/project
│   └── [id]/
│       ├── index.put.ts           → PUT /api/project/:id
│       ├── index.delete.ts        → DELETE /api/project/:id
│       ├── import.ts              → POST /api/project/:id/import
│       ├── api-tree.get.ts        → GET /api/project/:id/api-tree
│       ├── api-list.ts            → GET /api/project/:id/api-list
│       ├── endpoint.get.ts        → GET /api/project/:id/endpoint
│       ├── endpoint.put.ts        → PUT /api/project/:id/endpoint
│       └── members/               (同 group/[id]/members/)
├── admin/                          # 管理员功能
│   ├── user/
│   │   ├── index.get.ts           → GET /api/admin/user
│   │   ├── index.post.ts          → POST /api/admin/user
│   │   ├── [id].put.ts            → PUT /api/admin/user/:id
│   │   └── [id].delete.ts         → DELETE /api/admin/user/:id
│   └── settings/
│       ├── index.get.ts           → GET /api/admin/settings
│       └── index.post.ts          → POST /api/admin/settings
└── system/                         # 系统功能
    ├── status.get.ts              → GET /api/system/status
    └── init.post.ts               → POST /api/system/init
```

---

## 数据库（db/）

### schema.ts

Drizzle ORM 数据库模式定义

**表结构:**

```typescript
// 用户表
export const users = pgTable('User', {
  id: uuid().defaultRandom().primaryKey(),
  email: text().notNull().unique(),
  username: text().notNull().unique(),
  password: text().notNull(),
  name: text(),
  role: userRole().default('MEMBER').notNull(),
  lastLoginAt: timestamp({ mode: 'string' }),
  createdAt: timestamp({ mode: 'string' }).defaultNow().notNull(),
  updatedAt: timestamp({ mode: 'string' }).$onUpdate(() => new Date().toUTCString()).notNull(),
});

// 分组表
export const groups = pgTable('Group', { ... });

// 分组成员关系表
export const groupUsers = pgTable('GroupUser', {
  groupId: uuid().notNull().references(() => groups.id),
  userId: uuid().notNull().references(() => users.id),
  role: projectRole().default('GUEST').notNull(),
}, (table) => [primaryKey({ columns: [table.groupId, table.userId] })]);

// 项目表
export const projects = pgTable('Project', { ... });

// 项目成员关系表
export const projectUsers = pgTable('ProjectUser', { ... });

// API 端点分组表（树形结构）
export const endpointGroups = pgTable('EndpointGroup', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  description: text(),
  parentId: uuid(), // 自引用，形成树形结构
  projectId: uuid().notNull().references(() => projects.id),
  ...
});

// API 端点表
export const endpoints = pgTable('Endpoint', {
  id: uuid().defaultRandom().primaryKey(),
  name: text().notNull(),
  method: httpMethod().notNull(),
  path: text().notNull(),
  description: text().notNull(),
  tags: text().array().default([]),
  headers: jsonb().array().$type<Parameter[]>().default([]),
  queryParams: jsonb().array().$type<Parameter[]>().default([]),
  body: jsonb().$type<Parameter>(),
  response: jsonb().$type<EndpointResponse[]>(),
  groupId: uuid().notNull().references(() => endpointGroups.id),
  ...
});

// 系统设置表
export const settings = pgTable('Setting', {
  id: uuid().defaultRandom().primaryKey(),
  key: text().notNull().unique(),
  value: jsonb().notNull(),
  ...
});
```

**枚举类型:**
```typescript
export const userRole = pgEnum('UserRole', ['MEMBER', 'ADMIN']);
export const projectRole = pgEnum('ProjectRole', ['GUEST', 'DEVELOPER', 'ADMIN']);
export const httpMethod = pgEnum('HttpMethod', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS']);
```

---

## 中间件（middleware/）

### auth.ts

全局 API 认证中间件

**功能:**
1. 检查请求路径，排除匿名路径
2. 验证 `Authorization: Token xxx` 头
3. 从 Redis 获取用户会话
4. 检查管理员权限（`/api/admin/*`）
5. 将用户信息注入 `event.context.auth`

**排除路径:**
```typescript
const excludedPaths = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/forgot-password',
  '/api/system/status',
  '/api/system/init',
];
```

**使用:**
```typescript
export default defineEventHandler(async (event) => {
  // 获取当前用户
  const userId = event.context.auth.user;
  const token = event.context.auth.token;
  
  // 检查权限
  if (!userId) {
    throw createError({ statusCode: 401, message: '未认证' });
  }
});
```

---

## 工具函数（utils/）

### db.ts

导出全局数据库实例

```typescript
import { drizzle } from 'drizzle-orm/node-postgres';

export const db = drizzle(/* config */);
```

### redis.ts

Redis 会话管理

```typescript
export const redis = {
  // 设置用户会话
  async setUserSession(token: string, userId: string, ttl = 3600) {
    await storage.setItem(`session:${token}`, userId, { ttl });
  },

  // 获取用户会话
  async getUserSession(token: string): Promise<string | null> {
    return await storage.getItem(`session:${token}`);
  },

  // 删除用户会话
  async deleteUserSession(token: string) {
    await storage.removeItem(`session:${token}`);
  },
};
```

### permission.ts

权限检查工具函数

```typescript
// 检查 Group 权限
export async function checkGroupPermission(
  userId: string,
  groupId: string,
  minRole: 'GUEST' | 'DEVELOPER' | 'ADMIN'
): Promise<boolean>

// 检查 Project 权限（考虑继承）
export async function checkProjectPermission(
  userId: string,
  projectId: string,
  minRole: 'GUEST' | 'DEVELOPER' | 'ADMIN'
): Promise<boolean>

// 获取 Group 角色
export async function getGroupRole(userId: string, groupId: string): Promise<MemberRole | null>

// 获取 Project 角色（考虑继承）
export async function getProjectRole(userId: string, projectId: string): Promise<MemberRole | null>

// 抛出权限错误
export function throwPermissionError(message = '权限不足')

// 抛出资源不存在错误
export function throwNotFoundError(message = '资源不存在')
```

### password.ts

密码哈希与验证

```typescript
import argon2 from 'argon2';

// 哈希密码
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password);
}

// 验证密码
export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return await argon2.verify(hash, password);
}
```

### ldap.ts

LDAP 认证

```typescript
// 执行 LDAP 认证
export async function ldapAuthenticate(
  username: string,
  password: string
): Promise<LdapProfile | null>

// 获取 LDAP 配置
export async function getLdapConfig(): Promise<LdapSettings | null>
```

### settings.ts

系统设置管理

```typescript
// 获取设置
export async function getSetting<T>(key: string): Promise<T | null>

// 设置值
export async function setSetting<T>(key: string, value: T): Promise<void>
```

---

## 插件（plugins/）

### storage.ts

配置 Redis 存储驱动

```typescript
export default defineNitroPlugin(() => {
  const storage = useStorage();
  
  const driver = redisDriver({
    url: useRuntimeConfig().redisUrl,
    base: 'redis',
  });
  
  storage.mount('redis', driver);
});
```

---

## API 开发规范

### 1. 基本结构

```typescript
export default defineEventHandler(async (event) => {
  // 1. 获取当前用户
  const userId = event.context.auth.user;
  
  // 2. 获取参数
  const { id } = await useValidatedParams(event, v.object({ id: v.string() }));
  const body = await readBody<SomeType>(event);
  
  // 3. 检查权限
  const hasPermission = await checkProjectPermission(userId, id, 'DEVELOPER');
  if (!hasPermission) {
    throwPermissionError();
  }
  
  // 4. 执行业务逻辑
  const result = await db.query.something.findFirst({ ... });
  
  // 5. 返回结果
  return result;
});
```

### 2. 参数验证

使用 `h3-valibot` 进行参数验证：

```typescript
import { useValidatedParams, useValidatedBody, v } from 'h3-valibot';

// 验证路径参数
const { id } = await useValidatedParams(event, v.object({
  id: v.string(),
}));

// 验证请求体
const body = await useValidatedBody(event, v.object({
  name: v.string(),
  email: v.pipe(v.string(), v.email()),
}));

// 验证查询参数
const query = await useValidatedQuery(event, v.object({
  page: v.optional(v.number()),
}));
```

### 3. 错误处理

使用 `createError` 抛出标准化错误：

```typescript
// 401 未认证
throw createError({ statusCode: 401, message: '未认证' });

// 403 权限不足
throw createError({ statusCode: 403, message: '权限不足' });

// 404 资源不存在
throw createError({ statusCode: 404, message: '资源不存在' });

// 400 请求参数错误
throw createError({ statusCode: 400, message: '参数错误' });
```

### 4. 数据库操作

```typescript
// 查询
const user = await db.query.users.findFirst({
  where: eq(users.id, userId),
});

// 插入
const [newUser] = await db.insert(users)
  .values({ ... })
  .returning();

// 更新
const [updated] = await db.update(users)
  .set({ name: 'New Name' })
  .where(eq(users.id, userId))
  .returning();

// 删除
await db.delete(users).where(eq(users.id, userId));

// 事务
await db.transaction(async (tx) => {
  await tx.insert(groups).values({ ... });
  await tx.insert(groupUsers).values({ ... });
});
```

### 5. 权限检查模式

```typescript
// Group 操作
const hasPermission = await checkGroupPermission(userId, groupId, 'ADMIN');
if (!hasPermission) {
  throwPermissionError('您没有权限管理此分组');
}

// Project 操作
const hasPermission = await checkProjectPermission(userId, projectId, 'DEVELOPER');
if (!hasPermission) {
  throwPermissionError('您没有权限编辑此项目');
}
```

---

## 核心功能实现

### 1. 认证流程

**登录（auth/login.post.ts）:**
```typescript
1. 验证凭据（本地或 LDAP）
2. 生成 UUID token
3. 存储 session:token -> userId 到 Redis（TTL: 3600s）
4. 返回 token 和用户信息
```

**认证中间件（middleware/auth.ts）:**
```typescript
1. 检查 Authorization 头
2. 从 Redis 获取 userId
3. 查询完整用户信息
4. 检查管理员权限（如需要）
5. 注入 event.context.auth
```

### 2. 权限继承

**Project 权限查询:**
```typescript
1. 查询 ProjectUser 表（直接权限）
2. 如果没有，查询 Project 所属的 Group
3. 查询 GroupUser 表（继承权限）
4. 返回最终角色
```

### 3. API 导入

**导入流程（project/[id]/import.ts）:**
```typescript
1. 接收文件或 URL
2. 使用 swagger-client 解析
3. 提取 paths, methods, parameters, schemas
4. 转换为内部 Parameter 结构
5. 按 tags 分组
6. 事务中删除旧数据，插入新数据
```

---

## 常见任务

### 添加新 API 端点

1. 在 `server/api/` 创建文件（如 `something.post.ts`）
2. 定义请求/响应类型（`shared/types/`）
3. 实现 handler
4. 添加权限检查

### 修改数据库模式

1. 修改 `server/db/schema.ts`
2. 运行 `pnpm db:generate` 生成迁移
3. 运行 `pnpm db:migrate` 应用迁移

### 添加工具函数

在 `server/utils/` 创建文件，函数自动全局可用

---

## 调试技巧

- 数据库查询日志: Drizzle 自动打印 SQL
- Redis 会话: `redis-cli` → `KEYS session:*` → `GET session:xxx`
- API 请求: 浏览器开发者工具 Network 面板
- 服务端日志: 控制台输出（`console.log`）
