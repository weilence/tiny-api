# API Doc Project - Agent Documentation

## 项目概述

这是一个基于 **Nuxt 4 + Nuxt UI** 的全栈 API 文档管理系统，用于管理、展示和测试 API 文档。

**核心功能:**
- 📚 API 文档管理（支持 OpenAPI/Swagger 导入）
- 👥 用户、分组、项目多级权限管理
- 🔐 本地认证 + LDAP 企业认证
- 🌳 树形结构展示 API 分组
- ✏️ 在线编辑 API 文档

**技术栈:**
- 前端: Nuxt 4, Vue 3, Nuxt UI
- 后端: Nitro (Nuxt server)
- 数据库: PostgreSQL + Drizzle ORM
- 缓存: Redis (会话管理)
- 包管理: pnpm 10.24.0

**架构特点:**
- SSR 关闭 (`ssr: false`) - 纯客户端渲染
- 前后端共享类型定义 (`shared/types/`)
- 基于文件的路由系统
- API 层自动类型推断

---

## 项目结构

```
api-doc/
├── app/              # 客户端代码 → 详见 app/AGENTS.md
├── server/           # 服务端代码 → 详见 server/AGENTS.md
├── shared/           # 前后端共享代码 → 详见 shared/AGENTS.md
├── public/           # 静态资源
├── nuxt.config.ts    # Nuxt 配置
├── drizzle.config.ts # Drizzle ORM 配置
└── package.json      # 项目依赖
```

---

## 快速开始

### 开发环境

```bash
# 安装依赖
pnpm install

# 配置环境变量（.env）
NUXT_DATABASE_URL="postgresql://user:pass@localhost:5432/api-doc"
NUXT_REDIS_URL="redis://localhost:6379"

# 运行数据库迁移
pnpm db:migrate

# 启动开发服务器
pnpm dev  # http://localhost:3000
```

### 首次使用

1. 访问 `http://localhost:3000`，系统自动重定向到初始化页面
2. 创建管理员账户
3. 登录后即可开始使用

---

## 核心概念

### 1. 数据模型

```
User (用户)
  ├─ GroupUser (多对多) → Group (分组)
  │                         └─ Project (项目)
  │                              └─ EndpointGroup (API 分组)
  │                                   └─ Endpoint (API 端点)
  └─ ProjectUser (多对多) → Project (直接权限覆盖)
```

### 2. 权限模型

**用户角色:**
- `MEMBER`: 普通用户
- `ADMIN`: 系统管理员

**组织角色（Group/Project）:**
- `GUEST`: 只读
- `DEVELOPER`: 可编辑
- `ADMIN`: 可管理成员

**权限继承:**
- Project 继承 Group 的成员权限
- Project 可单独设置成员权限（覆盖继承）

### 3. 认证流程

```
客户端                    服务端                   Redis
  │                        │                        │
  ├──POST /api/auth/login──→ 验证凭据               │
  │                        ├──生成 UUID token────→ 存储 session:token → userId
  │←─────返回 token────────┤                        │
  │                        │                        │
  ├──请求 API (Header: Token)→ 验证 token          │
  │                        ├───查询 session:token──→ 返回 userId
  │                        └──处理请求              │
```

---

## 常用命令

```bash
# 开发
pnpm dev              # 启动开发服务器
pnpm build            # 生产构建
pnpm preview          # 预览生产构建

# 数据库
pnpm db:generate      # 生成迁移文件
pnpm db:migrate       # 应用迁移
```

---

## 详细文档索引

### 客户端（app/）
→ **[app/AGENTS.md](./app/AGENTS.md)**
- 页面结构与路由
- Composables 使用
- 组件规范
- 状态管理

### 服务端（server/）
→ **[server/AGENTS.md](./server/AGENTS.md)**
- API 端点列表
- 中间件机制
- 权限检查
- 数据库操作

### 共享代码（shared/）
→ **[shared/AGENTS.md](./shared/AGENTS.md)**
- 类型定义
- 常量定义
- 接口规范

---

## 重要提示

⚠️ **开发注意事项:**
1. 所有 API（除 `/api/auth/*` 和 `/api/system/*`）都需要认证
2. 修改资源前必须检查权限（使用 `checkProjectPermission` 等函数）
3. 多表操作使用 `db.transaction()` 保证一致性
4. 使用 `createError()` 抛出标准化错误
5. Redis session TTL 为 3600s（1小时）

📝 **类型安全:**
- 前后端共享类型定义在 `shared/types/`
- API 返回类型通过 `FetchResult<path, method>` 自动推断
- 使用 `h3-valibot` 进行运行时验证

🔍 **调试技巧:**
- 数据库查询: Drizzle 会打印 SQL 到控制台
- Redis 会话: `redis-cli` → `KEYS session:*`
- API 请求: 浏览器开发者工具 Network 面板

---

## 技术支持

**关键文件位置:**
- 数据库模式: `server/db/schema.ts`
- Nuxt 配置: `nuxt.config.ts`
- 认证逻辑: `app/composables/use-auth.ts`
- 权限系统: `server/utils/permission.ts`

**依赖版本:**
- Nuxt: 4.1.3
- Nuxt UI: 4.1.0
- Drizzle ORM: 0.44.6
- Vue: 3.5.22
