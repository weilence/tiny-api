# Shared 层文档 (共享代码)

> 本文档描述 `shared/` 目录的前后端共享代码结构

---

## 目录结构

```
shared/
├── types/        # TypeScript 类型定义
└── constants/    # 常量定义
```

---

## 类型定义（types/）

所有类型定义文件使用 `.d.ts` 后缀，自动全局可用（无需导入）

### auth.d.ts

认证相关类型

```typescript
// 注册请求
interface UserRegisterReq {
  email: string;
  username: string;
  password: string;
}

// 登录请求
interface UserLoginReq {
  credential: string;  // 邮箱或用户名
  password: string;
  provider?: 'local' | 'ldap';
}

// 用户信息
interface UserInfo {
  id: string;
  email: string;
  username: string;
  name?: string;
  role?: 'MEMBER' | 'ADMIN';
  lastLoginAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

// 登录响应
interface UserLoginRes extends UserInfo {
  token: string;
}
```

### user.d.ts

用户管理类型

```typescript
// 更新用户信息
interface UserUpdateReq {
  email?: string;
  username?: string;
  name?: string;
}

// 修改密码
interface UserUpdatePasswordReq {
  oldPassword: string;
  newPassword: string;
}
```

### group.d.ts

分组管理类型

```typescript
// 分组查询响应
interface GroupQueryRes {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 创建分组
interface GroupCreateReq {
  name: string;
  description?: string;
}

// 更新分组
interface GroupUpdateReq {
  name?: string;
  description?: string;
}
```

### project.d.ts

项目和 API 管理类型

```typescript
// 项目查询响应
interface ProjectQueryRes {
  id: string;
  name: string;
  description: string | null;
  icon: string | null;
  groupId: string;
  createdAt: Date;
  updatedAt: Date;
}

// 创建项目
interface ProjectCreateReq {
  name: string;
  description: string | null;
  icon: string | null;
  groupId: string;
}

// 更新项目
interface ProjectUpdateReq {
  name?: string;
  description?: string | null;
  icon?: string | null;
  groupId?: string;
}

// API 树形结构节点
interface ProjectApiTreeGetRes {
  id: string;
  name: string;
  description: string | null;
  method: HttpMethod | null;
  path: string | null;
  parentId: string | null;
  isFolder: boolean;
  children: ProjectApiTreeGetRes[];
}

// API 列表项
interface ProjectApiListGetRes {
  id: string;
  name: string;
  description: string | null;
  method: HttpMethod | null;
  path: string | null;
  groupId: string | null;
  tags: string[] | null;
}

// HTTP 方法
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'HEAD' | 'OPTIONS';

// 参数定义（核心数据结构）
interface Parameter {
  key: string;          // 参数名
  value: string;        // 示例值
  type: string;         // 类型：string, number, boolean, object, array
  isArray: boolean;     // 是否为数组
  required: boolean;    // 是否必填
  description: string;  // 说明
  enabled: boolean;     // 是否启用
  children?: Parameter[]; // 子参数（对象类型）
  options?: string[];   // 枚举值
}

// API 响应定义
interface EndpointResponse {
  status: number;         // HTTP 状态码
  headers: Parameter[];   // 响应头
  contentType: string;    // Content-Type
  body?: Parameter;       // 响应体
}

// 更新 API 端点
interface EndpointUpdateReq {
  name?: string;
  description?: string | null;
  method?: HttpMethod | null;
  path?: string | null;
  tags?: string[] | null;
  headers?: Parameter[] | null;
  queryParams?: Parameter[] | null;
  body?: Parameter | null;
  response?: EndpointResponse[] | null;
}

// 导入 API
interface ProjectImportReq {
  importType: 'file' | 'url';
  url: string | null;
  file: string | null;
}
```

### member.d.ts

成员管理类型

```typescript
// 成员角色
type MemberRole = 'GUEST' | 'DEVELOPER' | 'ADMIN';

// 添加成员
interface MemberAddReq {
  userId: string;
  role: MemberRole;
}

// 更新成员角色
interface MemberUpdateReq {
  role: MemberRole;
}
```

### settings.d.ts

系统设置类型

```typescript
// LDAP 设置
interface LdapSettings {
  enabled: boolean;
  url: string;
  baseDn: string;
  bindDn?: string;
  bindPassword?: string;
  searchFilter?: string;
  usernameAttribute?: string;
  emailAttribute?: string;
  nameAttribute?: string;
}

// 系统设置
interface SystemSettings {
  initialized: boolean;
  allowRegister?: boolean;
  ldap?: LdapSettings;
}
```

### admin.d.ts

管理员功能类型

```typescript
// 管理员创建用户
interface AdminUserCreateReq {
  email: string;
  username: string;
  password: string;
  name?: string;
  role: 'MEMBER' | 'ADMIN';
}

// 管理员更新用户
interface AdminUserUpdateReq {
  email?: string;
  username?: string;
  name?: string;
  role?: 'MEMBER' | 'ADMIN';
}
```

### system.d.ts

系统功能类型

```typescript
// 系统状态
interface SystemStatusRes {
  initialized: boolean;
  allowRegister: boolean;
}

// 系统初始化
interface SystemInitReq {
  username: string;
  email: string;
  password: string;
}
```

### common.d.ts

通用类型

```typescript
// 用于类型安全的辅助类型
type Schema<T> = T;

// 序列化对象（Date -> string）
type SerializeObject<T> = T extends Date
  ? string
  : T extends object
  ? { [K in keyof T]: SerializeObject<T[K]> }
  : T;
```

### h3.d.ts

H3 框架类型扩展

```typescript
// 扩展 H3Event 上下文
declare module 'h3' {
  interface H3EventContext {
    auth: {
      user: string;  // 用户 ID
      token: string; // 认证 token
    };
  }
}
```

---

## 常量定义（constants/）

### icons.ts

图标常量（待查看具体实现）

---

## 使用规范

### 1. 类型自动推断

由于使用 `.d.ts` 全局类型定义，在前后端代码中可直接使用：

```typescript
// 前端
const login = async (data: UserLoginReq) => {
  const res: UserLoginRes = await http.post('/api/auth/login', data);
  return res;
};

// 后端
export default defineEventHandler(async (event) => {
  const body = await readBody<UserLoginReq>(event);
  // ...
  return result as UserLoginRes;
});
```

### 2. API 类型推断

使用 `FetchResult` 辅助类型自动推断：

```typescript
// 自动推断返回类型
const data = await http.get('/api/group'); // 类型: GroupQueryRes[]
const user = await http.get('/api/user');  // 类型: UserInfo
```

### 3. 添加新类型

1. 在 `shared/types/` 创建或编辑 `.d.ts` 文件
2. 定义 interface 或 type
3. 前后端自动可用（无需导入）

### 4. 命名约定

- **请求类型**: `<Resource><Action>Req`（如 `UserLoginReq`）
- **响应类型**: `<Resource><Action>Res`（如 `UserLoginRes`）
- **查询响应**: `<Resource>QueryRes`（如 `GroupQueryRes`）
- **通用类型**: `<Resource>Info`（如 `UserInfo`）

---

## 核心数据结构详解

### Parameter（参数定义）

这是系统中最重要的数据结构之一，用于描述 API 的参数、请求体、响应体。

**字段说明:**
```typescript
interface Parameter {
  key: string;          // 参数名（如 "username", "age"）
  value: string;        // 示例值（如 "admin", "18"）
  type: string;         // 数据类型：string, number, boolean, object, array
  isArray: boolean;     // 是否为数组类型
  required: boolean;    // 是否必填
  description: string;  // 参数说明
  enabled: boolean;     // 是否启用（用于测试时开关参数）
  children?: Parameter[]; // 子参数（type 为 object 时）
  options?: string[];   // 枚举值（如 ["active", "inactive"]）
}
```

**示例 - 简单参数:**
```json
{
  "key": "username",
  "value": "admin",
  "type": "string",
  "isArray": false,
  "required": true,
  "description": "用户名",
  "enabled": true
}
```

**示例 - 对象参数:**
```json
{
  "key": "user",
  "value": "",
  "type": "object",
  "isArray": false,
  "required": true,
  "description": "用户信息",
  "enabled": true,
  "children": [
    {
      "key": "name",
      "value": "张三",
      "type": "string",
      "isArray": false,
      "required": true,
      "description": "姓名",
      "enabled": true
    },
    {
      "key": "age",
      "value": "18",
      "type": "number",
      "isArray": false,
      "required": false,
      "description": "年龄",
      "enabled": true
    }
  ]
}
```

**示例 - 数组参数:**
```json
{
  "key": "tags",
  "value": "",
  "type": "string",
  "isArray": true,
  "required": false,
  "description": "标签列表",
  "enabled": true
}
```

**示例 - 枚举参数:**
```json
{
  "key": "status",
  "value": "active",
  "type": "string",
  "isArray": false,
  "required": true,
  "description": "状态",
  "enabled": true,
  "options": ["active", "inactive", "pending"]
}
```

### EndpointResponse（API 响应定义）

用于描述 API 的响应结构。

```typescript
interface EndpointResponse {
  status: number;         // HTTP 状态码（200, 404, 500 等）
  headers: Parameter[];   // 响应头参数
  contentType: string;    // Content-Type（如 "application/json"）
  body?: Parameter;       // 响应体（可选）
}
```

**示例:**
```json
{
  "status": 200,
  "contentType": "application/json",
  "headers": [],
  "body": {
    "key": "",
    "value": "",
    "type": "object",
    "isArray": false,
    "required": false,
    "description": "成功响应",
    "enabled": true,
    "children": [
      {
        "key": "code",
        "value": "0",
        "type": "number",
        "isArray": false,
        "required": true,
        "description": "状态码",
        "enabled": true
      },
      {
        "key": "message",
        "value": "success",
        "type": "string",
        "isArray": false,
        "required": true,
        "description": "消息",
        "enabled": true
      }
    ]
  }
}
```

---

## 类型安全最佳实践

### 1. 使用严格类型

```typescript
// ✅ 好
const data: UserLoginReq = { ... };

// ❌ 避免
const data: any = { ... };
```

### 2. 利用类型推断

```typescript
// ✅ 好 - 自动推断
const user = await http.get('/api/user');

// ❌ 冗余
const user: UserInfo = await http.get('/api/user');
```

### 3. 使用可选属性

```typescript
// ✅ 好
interface UpdateReq {
  name?: string;
  email?: string;
}

// ❌ 避免全部必填
interface UpdateReq {
  name: string;
  email: string;
}
```

### 4. 区分请求和响应类型

```typescript
// ✅ 好 - 明确区分
interface UserCreateReq { ... }
interface UserCreateRes { ... }

// ❌ 避免混用
interface User { ... }
```
