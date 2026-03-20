# ClawReef 虚拟桌面管理平台 - 详细任务拆解文档

**版本**: 1.0  
**创建日期**: 2026-03-15  
**开发周期**: 22周（约5.5个月）  

---

## 目录

1. [功能需求](#功能需求)
2. [用户场景](#用户场景)
3. [技术需求](#技术需求)
4. [边界条件](#边界条件)
5. [非功能需求](#非功能需求)
6. [项目目录结构规划](#项目目录结构规划)
7. [开发阶段详细拆解](#开发阶段详细拆解)
8. [关键里程碑与交付物](#关键里程碑与交付物)
9. [风险点与应对建议](#风险点与应对建议)

---

## 功能需求

### 核心功能模块

| 模块 | 功能点 | 优先级 | 描述 |
|------|--------|--------|------|
| **认证中心** | 用户注册 | P0 | 支持邮箱注册，密码bcrypt加密 |
| | 用户登录/登出 | P0 | JWT Token认证，支持Token刷新 |
| | 密码修改 | P1 | 需验证旧密码 |
| **用户管理** | 用户信息管理 | P0 | CRUD操作，管理员可管理所有用户 |
| | 角色权限(RBAC) | P0 | admin/user两种角色 |
| | 用户配额 | P1 | 实例数、CPU、内存、存储、GPU限制 |
| **实例管理** | 创建实例 | P0 | 支持多种类型(OpenClaw/Ubuntu/Debian/CentOS) |
| | 生命周期管理 | P0 | 启动/停止/重启/删除 |
| | 实例配置 | P1 | CPU/内存/磁盘/GPU/操作系统配置 |
| | 实例列表/详情 | P0 | 分页列表，详情页展示 |
| **存储管理** | PVC管理 | P1 | 创建/删除持久化存储卷 |
| | 存储扩容 | P2 | 在线扩容存储空间 |
| **备份管理** | 手动备份 | P1 | 创建/删除/恢复备份 |
| | 备份计划 | P2 | 定时自动备份(Cron) |
| | 备份保留策略 | P2 | 按天数自动清理 |
| **实例访问** | 访问URL生成 | P0 | 生成带Token的安全访问链接 |
| | iframe嵌入 | P0 | 无感知嵌入虚拟桌面 |
| **监控仪表盘** | 平台统计 | P1 | 总用户数/实例数/资源使用 |
| | 实例监控 | P1 | CPU/内存/磁盘实时使用率 |
| | 用户仪表盘 | P1 | 个人资源使用情况 |
| **审计日志** | 操作审计 | P1 | 记录所有用户操作 |
| | 审计查询 | P2 | 按用户/时间/操作类型筛选 |

---

## 用户场景

### 场景一：新用户首次使用
**角色**: 普通用户  
**流程**:
1. 访问平台，点击"注册"
2. 填写邮箱、用户名、密码
3. 系统自动分配默认配额（10实例/40核/100GB内存/500GB存储）
4. 登录后进入仪表盘
5. 点击"创建实例"，选择Ubuntu 22.04，配置2核4GB
6. 等待实例创建完成（约2-3分钟）
7. 点击"访问"按钮，在新标签页打开虚拟桌面

### 场景二：管理员管理用户
**角色**: 管理员  
**流程**:
1. 登录后进入管理后台
2. 查看用户列表，筛选出资源使用较高的用户
3. 点击某用户，查看其配额使用情况
4. 调整该用户的GPU配额（从2个提升到4个）
5. 查看审计日志，确认操作已记录

### 场景三：开发者备份工作环境
**角色**: 普通用户  
**流程**:
1. 进入实例详情页
2. 点击"备份"标签
3. 点击"立即备份"，输入备份名称
4. 等待备份完成
5. 设置自动备份计划（每周日凌晨3点）
6. 配置保留策略（保留最近30天备份）

### 场景四：故障恢复
**角色**: 普通用户  
**流程**:
1. 发现当前实例环境损坏
2. 进入备份列表
3. 选择3天前的备份
4. 点击"恢复"，确认恢复操作
5. 等待实例恢复（约5分钟）
6. 重新访问实例，验证环境正常

---

## 技术需求

### 后端技术栈

| 技术 | 版本 | 用途 | 学习成本 |
|------|------|------|----------|
| Golang | 1.21+ | 后端开发语言 | 中 |
| Gin | 1.9+ | Web框架 | 低 |
| upper/db | 4.x | 数据库ORM | 低 |
| MySQL | 8.0+ | 关系型数据库 | 低 |
| client-go | 最新 | K8s API客户端 | 高 |
| JWT | - | Token认证 | 低 |
| bcrypt | - | 密码加密 | 低 |

### 前端技术栈

| 技术 | 版本 | 用途 | 学习成本 |
|------|------|------|----------|
| React | 19 | UI框架 | 中 |
| TypeScript | 5.9+ | 类型系统 | 中 |
| Tailwind CSS | 4 | 样式系统 | 低 |
| shadcn/ui | 最新 | UI组件库 | 低 |
| Vite | 7+ | 构建工具 | 低 |
| React Router | 6+ | 路由管理 | 低 |
| TanStack Query | 5+ | 数据获取 | 中 |

### 基础设施

| 技术 | 用途 | 复杂度 |
|------|------|--------|
| Kubernetes 1.24+ | 容器编排、实例调度 | 高 |
| Docker | 应用容器化 | 中 |
| MySQL 8.0+ | 数据持久化 | 中 |
| Nginx/Ingress | 反向代理、负载均衡 | 中 |

### 关键集成点

1. **K8s API集成**
   - Pod生命周期管理
   - PVC动态创建
   - Service/Ingress配置
   - 资源监控(metrics-server)

2. **WebSocket支持**
   - 实例状态实时推送
   - 日志实时流

3. **文件存储**
   - 备份文件存储（对象存储/S3兼容）
   - 镜像仓库集成

---

## 边界条件

### 输入限制

| 字段 | 限制条件 | 错误提示 |
|------|----------|----------|
| 用户名 | 3-32字符，仅字母数字下划线 | "用户名格式不正确" |
| 密码 | 8-64字符，至少包含大小写+数字 | "密码强度不足" |
| 邮箱 | 有效邮箱格式 | "邮箱格式不正确" |
| 实例名称 | 2-64字符，唯一性校验 | "实例名称已存在" |
| CPU | 1-64核 | "超出最大限制" |
| 内存 | 1-256GB | "超出最大限制" |
| 磁盘 | 10-2000GB | "超出最大限制" |

### 配额限制

```
默认用户配额:
- 最大实例数: 10
- 最大CPU核数: 40
- 最大内存: 100GB
- 最大存储: 500GB
- 最大GPU数: 2

管理员配额: 无限制
```

### 异常情况

| 异常类型 | 触发条件 | 处理方式 |
|----------|----------|----------|
| 配额不足 | 创建/修改超出配额 | 返回409，提示具体限制 |
| K8s资源不足 | 集群节点资源耗尽 | 返回503，提示稍后重试 |
| PVC绑定失败 | 存储类配置错误 | 标记实例状态为error，记录日志 |
| 镜像拉取失败 | 镜像不存在或网络问题 | 重试3次后标记失败 |
| 实例启动超时 | 健康检查失败 | 自动标记为error，允许用户查看日志 |

### 并发限制

- 单用户同时创建实例数：1（防止滥用）
- 全局实例创建QPS：10
- API请求频率限制：100/分钟/用户

---

## 非功能需求

### 性能需求

| 指标 | 目标值 | 测试方法 |
|------|--------|----------|
| 登录响应时间 | < 200ms | API压测 |
| 实例列表查询 | < 300ms（100条数据） | 数据库基准测试 |
| 实例创建时间 | < 180s（含PVC创建） | 端到端测试 |
| 页面首屏加载 | < 2s | Lighthouse |
| 仪表盘数据刷新 | < 1s | 接口测试 |
| 并发用户数 | 支持500+同时在线 | 压力测试 |

### 安全需求

| 安全措施 | 实现方式 | 优先级 |
|----------|----------|--------|
| 传输加密 | 全站HTTPS | P0 |
| 密码安全 | bcrypt哈希，加盐 | P0 |
| Token安全 | JWT RS256签名，过期机制 | P0 |
| SQL注入防护 | upper/db参数化查询 | P0 |
| XSS防护 | React自动转义+内容安全策略 | P1 |
| CSRF防护 | SameSite Cookie + Token验证 | P1 |
| 审计日志 | 记录所有敏感操作 | P1 |
| 访问控制 | RBAC权限模型 | P0 |
| 速率限制 | 基于Token桶算法 | P1 |
| 输入验证 | 前后端双重校验 | P0 |

### 可扩展性需求

| 扩展点 | 设计考虑 |
|--------|----------|
| 水平扩展 | 后端无状态设计，支持多副本 |
| 数据库 | 读写分离支持，预留分库分表方案 |
| K8s集群 | 支持联邦集群，跨可用区部署 |
| 存储后端 | 抽象存储接口，支持多种StorageClass |
| 虚拟桌面类型 | 插件化设计，易于添加新类型 |

### 可维护性需求

| 方面 | 要求 |
|------|------|
| 代码规范 | Go/TypeScript遵循官方规范 |
| 文档 | API文档(OpenAPI)、部署文档、运维手册 |
| 监控 | Prometheus + Grafana，关键指标告警 |
| 日志 | 结构化日志，集中收集(ELK/Loki) |
| 测试覆盖率 | 后端>70%，前端>60% |
| 部署 | GitOps工作流，自动化CI/CD |

---

## 项目目录结构规划

### 后端目录结构（Golang）

```
backend/
├── cmd/
│   └── server/
│       └── main.go                 # 应用入口
├── internal/
│   ├── config/
│   │   ├── config.go               # 配置定义
│   │   └── config.yaml             # 配置文件模板
│   ├── db/
│   │   ├── db.go                   # 数据库连接初始化
│   │   └── migrations/             # 数据库迁移脚本
│   │       ├── 001_init_schema.sql
│       │   └── 002_add_indexes.sql
│   ├── models/
│   │   ├── user.go                 # 用户模型
│   │   ├── instance.go             # 实例模型
│   │   ├── persistent_volume.go    # 持久化存储模型
│   │   ├── backup.go               # 备份模型
│   │   ├── backup_schedule.go      # 备份计划模型
│   │   ├── user_quota.go           # 用户配额模型
│   │   ├── instance_usage.go       # 实例使用统计模型
│   │   └── audit_log.go            # 审计日志模型
│   ├── repository/
│   │   ├── user_repository.go
│   │   ├── instance_repository.go
│   │   ├── volume_repository.go
│   │   ├── backup_repository.go
│   │   ├── quota_repository.go
│   │   └── audit_repository.go
│   ├── services/
│   │   ├── auth_service.go         # 认证服务
│   │   ├── user_service.go         # 用户服务
│   │   ├── instance_service.go     # 实例服务
│   │   ├── k8s_service.go          # K8s集成服务
│   │   ├── quota_service.go        # 配额服务
│   │   ├── backup_service.go       # 备份服务
│   │   ├── monitoring_service.go   # 监控服务
│   │   └── audit_service.go        # 审计服务
│   ├── handlers/
│   │   ├── auth_handler.go
│   │   ├── user_handler.go
│   │   ├── instance_handler.go
│   │   ├── volume_handler.go
│   │   ├── backup_handler.go
│   │   ├── monitoring_handler.go
│   │   └── audit_handler.go
│   ├── middleware/
│   │   ├── auth_middleware.go      # JWT认证中间件
│   │   ├── rbac_middleware.go      # 权限中间件
│   │   ├── cors_middleware.go      # 跨域中间件
│   │   ├── rate_limit.go           # 限流中间件
│   │   └── audit_middleware.go     # 审计中间件
│   ├── k8s/
│   │   ├── client.go               # K8s客户端初始化
│   │   ├── pod_manager.go          # Pod管理
│   │   ├── pvc_manager.go          # PVC管理
│   │   ├── service_manager.go      # Service管理
│   │   └── event_watcher.go        # 事件监听
│   ├── utils/
│   │   ├── jwt.go                  # JWT工具
│   │   ├── password.go             # 密码工具
│   │   ├── validator.go            # 验证工具
│   │   ├── response.go             # 响应封装
│   │   └── logger.go               # 日志工具
│   └── scheduler/
│       └── backup_scheduler.go     # 定时备份任务
├── pkg/
│   └── constants/
│       └── constants.go            # 全局常量
├── api/
│   └── swagger.yaml                # OpenAPI文档
├── configs/
│   ├── dev.yaml
│   ├── staging.yaml
│   └── prod.yaml
├── deployments/
│   ├── docker/
│   │   ├── Dockerfile
│   │   └── docker-compose.yml
│   └── k8s/
│       ├── deployment.yaml
│       ├── service.yaml
│       ├── configmap.yaml
│       └── secret.yaml
├── scripts/
│   ├── migrate.sh
│   └── seed.sh
├── Makefile
├── go.mod
├── go.sum
└── README.md
```

### 前端目录结构（React + TypeScript）

```
frontend/
├── public/
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── components/
│   │   ├── ui/                     # shadcn/ui 基础组件
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── table.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── ...
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx       # 应用主布局
│   │   │   ├── Sidebar.tsx         # 侧边栏
│   │   │   ├── Header.tsx          # 顶部导航
│   │   │   └── Footer.tsx          # 页脚
│   │   ├── common/
│   │   │   ├── LoadingSpinner.tsx
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── Pagination.tsx
│   │   │   ├── SearchInput.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── instances/
│   │   │   ├── InstanceCard.tsx
│   │   │   ├── InstanceList.tsx
│   │   │   ├── InstanceStatus.tsx
│   │   │   ├── ResourceDisplay.tsx
│   │   │   └── InstanceActions.tsx
│   │   ├── dashboard/
│   │   │   ├── StatsCard.tsx
│   │   │   ├── ResourceChart.tsx
│   │   │   └── ActivityFeed.tsx
│   │   └── forms/
│   │       ├── InstanceForm.tsx
│   │       ├── UserForm.tsx
│   │       └── QuotaForm.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   └── ForgotPasswordPage.tsx
│   │   ├── dashboard/
│   │   │   ├── UserDashboard.tsx
│   │   │   └── AdminDashboard.tsx
│   │   ├── instances/
│   │   │   ├── InstanceListPage.tsx
│   │   │   ├── InstanceCreatePage.tsx
│   │   │   ├── InstanceDetailPage.tsx
│   │   │   └── InstanceAccessPage.tsx
│   │   ├── admin/
│   │   │   ├── UserManagementPage.tsx
│   │   │   ├── QuotaManagementPage.tsx
│   │   │   ├── AuditLogsPage.tsx
│   │   │   └── SystemSettingsPage.tsx
│   │   ├── profile/
│   │   │   ├── ProfilePage.tsx
│   │   │   └── SettingsPage.tsx
│   │   └── errors/
│   │       ├── NotFoundPage.tsx
│   │       └── ErrorPage.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useInstances.ts
│   │   ├── useQuota.ts
│   │   ├── useMonitoring.ts
│   │   └── useApi.ts
│   ├── services/
│   │   ├── api.ts                  # axios实例
│   │   ├── authService.ts
│   │   ├── instanceService.ts
│   │   ├── userService.ts
│   │   ├── backupService.ts
│   │   └── monitoringService.ts
│   ├── stores/
│   │   ├── authStore.ts            # 认证状态管理
│   │   ├── instanceStore.ts
│   │   └── uiStore.ts              # UI状态管理
│   ├── types/
│   │   ├── auth.ts
│   │   ├── instance.ts
│   │   ├── user.ts
│   │   ├── backup.ts
│   │   └── api.ts
│   ├── lib/
│   │   ├── utils.ts                # 工具函数
│   │   ├── constants.ts
│   │   └── validators.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── router/
│   │   ├── index.tsx               # 路由配置
│   │   └── guards.tsx              # 路由守卫
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── .env.development
├── .env.production
├── .eslintrc.cjs
├── .prettierrc
├── components.json                 # shadcn配置
├── tailwind.config.ts
├── tsconfig.json
├── vite.config.ts
├── package.json
└── README.md
```

---

## 开发阶段详细拆解

### 📌 Phase 1: 基础设施与认证（第 1-2 周）

#### Week 1: 项目初始化与环境搭建

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P1-T1 | 后端项目初始化 | 创建Golang项目结构，初始化go.mod | 4h | P0 | - | 后端 |
| P1-T2 | 后端依赖安装 | 安装Gin、upper/db、JWT等依赖 | 2h | P0 | P1-T1 | 后端 |
| P1-T3 | 前端项目初始化 | 使用Vite创建React+TS项目 | 2h | P0 | - | 前端 |
| P1-T4 | 前端依赖安装 | 安装Tailwind、shadcn、路由等 | 2h | P0 | P1-T3 | 前端 |
| P1-T5 | 数据库环境搭建 | Docker运行MySQL，创建数据库 | 2h | P0 | - | 后端 |
| P1-T6 | 数据库表设计 | 创建所有8个表的SQL脚本 | 6h | P0 | - | 后端 |
| P1-T7 | 数据库连接层 | 实现upper/db连接初始化 | 4h | P0 | P1-T6 | 后端 |
| P1-T8 | 模型层开发 | 创建8个模型结构体 | 6h | P0 | P1-T7 | 后端 |

#### Week 2: 认证系统开发

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P1-T9 | JWT工具封装 | 实现Token生成、验证、刷新 | 4h | P0 | P1-T2 | 后端 |
| P1-T10 | 密码加密工具 | 封装bcrypt加密/验证 | 2h | P0 | P1-T2 | 后端 |
| P1-T11 | 用户Repository | 实现用户CRUD | 4h | P0 | P1-T8 | 后端 |
| P1-T12 | 注册API | POST /api/v1/auth/register | 4h | P0 | P1-T10,P1-T11 | 后端 |
| P1-T13 | 登录API | POST /api/v1/auth/login | 4h | P0 | P1-T9,P1-T11 | 后端 |
| P1-T14 | Token刷新API | POST /api/v1/auth/refresh | 2h | P0 | P1-T9 | 后端 |
| P1-T15 | 登出API | POST /api/v1/auth/logout | 2h | P1 | P1-T9 | 后端 |
| P1-T16 | 认证中间件 | JWT验证中间件 | 4h | P0 | P1-T9 | 后端 |
| P1-T17 | 前端登录页面 | React登录表单 | 6h | P0 | P1-T4 | 前端 |
| P1-T18 | 前端注册页面 | React注册表单 | 4h | P0 | P1-T17 | 前端 |
| P1-T19 | 前端认证状态 | AuthContext/Store实现 | 4h | P0 | P1-T17 | 前端 |

**Phase 1 交付物**:
- ✅ 完整的项目目录结构
- ✅ MySQL数据库初始化脚本
- ✅ 8个数据模型
- ✅ 用户注册/登录/刷新Token API
- ✅ JWT认证中间件
- ✅ 登录/注册页面

---

### 📌 Phase 2: 用户管理系统（第 3-4 周）

#### Week 3: 用户管理API

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P2-T1 | RBAC中间件 | 角色权限验证中间件 | 4h | P0 | P1-T16 | 后端 |
| P2-T2 | 用户列表API | GET /api/v1/users（分页） | 4h | P0 | P2-T1 | 后端 |
| P2-T3 | 用户详情API | GET /api/v1/users/:id | 2h | P0 | P2-T2 | 后端 |
| P2-T4 | 更新用户API | PUT /api/v1/users/:id | 4h | P0 | P2-T3 | 后端 |
| P2-T5 | 删除用户API | DELETE /api/v1/users/:id | 4h | P0 | P2-T3 | 后端 |
| P2-T6 | 修改角色API | PUT /api/v1/users/:id/role | 2h | P1 | P2-T1 | 后端 |
| P2-T7 | 获取当前用户API | GET /api/v1/auth/me | 2h | P0 | P1-T16 | 后端 |
| P2-T8 | 修改密码API | POST /api/v1/auth/change-password | 4h | P1 | P1-T10 | 后端 |

#### Week 4: 配额系统与前端用户管理

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P2-T9 | 配额Repository | 实现配额CRUD | 4h | P1 | P1-T8 | 后端 |
| P2-T10 | 配额Service | 配额检查逻辑 | 6h | P1 | P2-T9 | 后端 |
| P2-T11 | 配额API | CRUD API for quota | 4h | P1 | P2-T10 | 后端 |
| P2-T12 | 前端用户管理页面 | 用户列表/搜索/分页 | 8h | P1 | P1-T18 | 前端 |
| P2-T13 | 前端配额管理 | 配额设置表单 | 6h | P1 | P2-T12 | 前端 |
| P2-T14 | 前端个人资料 | 用户Profile页面 | 6h | P1 | P2-T12 | 前端 |
| P2-T15 | 前端布局组件 | Sidebar/Header/Footer | 8h | P0 | P1-T18 | 前端 |

**Phase 2 交付物**:
- ✅ 完整的用户管理API
- ✅ RBAC权限控制
- ✅ 用户配额系统
- ✅ 用户管理页面
- ✅ 配额管理页面
- ✅ 统一布局组件

---

### 📌 Phase 3: 虚拟桌面实例管理基础（第 5-7 周）

#### Week 5: K8s集成基础

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P3-T1 | K8s Client初始化 | client-go配置 | 6h | P0 | - | 后端 |
| P3-T2 | Pod管理器 | Pod创建/删除/查询 | 8h | P0 | P3-T1 | 后端 |
| P3-T3 | PVC管理器 | PVC创建/删除 | 6h | P0 | P3-T1 | 后端 |
| P3-T4 | Service管理器 | Service/Ingress创建 | 6h | P1 | P3-T1 | 后端 |
| P3-T5 | 实例Repository | 实例CRUD | 4h | P0 | P1-T8 | 后端 |

#### Week 6: 实例生命周期API

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P3-T6 | 配额检查Service | 创建前配额校验 | 4h | P0 | P2-T10 | 后端 |
| P3-T7 | 创建实例API | POST /api/v1/instances | 8h | P0 | P3-T2,P3-T3,P3-T6 | 后端 |
| P3-T8 | Pod状态监听 | Watch Pod状态变化 | 6h | P0 | P3-T2 | 后端 |
| P3-T9 | 启动实例API | POST /api/v1/instances/:id/start | 4h | P0 | P3-T2 | 后端 |
| P3-T10 | 停止实例API | POST /api/v1/instances/:id/stop | 4h | P0 | P3-T2 | 后端 |
| P3-T11 | 重启实例API | POST /api/v1/instances/:id/restart | 2h | P0 | P3-T9,P3-T10 | 后端 |
| P3-T12 | 删除实例API | DELETE /api/v1/instances/:id | 6h | P0 | P3-T2,P3-T3 | 后端 |

#### Week 7: 实例查询与配置

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P3-T13 | 实例列表API | GET /api/v1/instances（分页/筛选） | 4h | P0 | P3-T5 | 后端 |
| P3-T14 | 实例详情API | GET /api/v1/instances/:id | 2h | P0 | P3-T13 | 后端 |
| P3-T15 | 更新实例API | PUT /api/v1/instances/:id | 4h | P1 | P3-T14 | 后端 |
| P3-T16 | 实例配置验证 | 配置合法性检查 | 4h | P1 | - | 后端 |
| P3-T17 | Docker Compose开发环境 | 完整的本地开发环境 | 4h | P1 | - | DevOps |
| P3-T18 | 前端实例列表页面 | 实例列表展示 | 8h | P0 | P2-T15 | 前端 |
| P3-T19 | 前端实例创建表单 | 实例配置向导 | 10h | P0 | P3-T18 | 前端 |
| P3-T20 | 前端实例详情页面 | 实例信息展示 | 8h | P0 | P3-T18 | 前端 |

**Phase 3 交付物**:
- ✅ K8s集成（Pod/PVC/Service管理）
- ✅ 实例完整生命周期API
- ✅ Pod状态实时监听
- ✅ 实例列表/创建/详情页面
- ✅ Docker Compose开发环境

---

### 📌 Phase 4: 前端核心页面（第 8-10 周）

#### Week 8: 仪表盘与实例管理

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P4-T1 | 用户仪表盘API | 统计数据聚合 | 6h | P1 | P3-T13 | 后端 |
| P4-T2 | 前端仪表盘页面 | 统计卡片/快捷操作 | 10h | P0 | P3-T20 | 前端 |
| P4-T3 | 实例状态组件 | 实时状态显示 | 6h | P0 | P3-T8 | 前端 |
| P4-T4 | 实例操作按钮 | 启动/停止/删除等 | 6h | P0 | P4-T3 | 前端 |
| P4-T5 | 实例搜索筛选 | 按状态/类型筛选 | 4h | P1 | P4-T2 | 前端 |
| P4-T6 | 批量操作功能 | 批量启动/停止/删除 | 6h | P2 | P4-T4 | 前端 |

#### Week 9: 实例配置优化

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P4-T7 | 镜像配置 | 支持自定义镜像 | 6h | P1 | - | 后端 |
| P4-T8 | GPU配置支持 | GPU类型和数量配置 | 6h | P1 | P3-T7 | 后端 |
| P4-T9 | 实例日志API | 获取Pod日志 | 4h | P1 | P3-T2 | 后端 |
| P4-T10 | 前端实例日志 | 日志查看组件 | 6h | P1 | P4-T9 | 前端 |
| P4-T11 | 前端实例设置 | 配置修改页面 | 8h | P1 | P3-T15 | 前端 |
| P4-T12 | 表单验证优化 | 前端实时验证 | 4h | P1 | P4-T11 | 前端 |

#### Week 10: UI/UX优化

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P4-T13 | 全局状态管理 | Zustand/Redux配置 | 6h | P0 | P4-T2 | 前端 |
| P4-T14 | API错误处理 | 统一错误提示 | 4h | P0 | P4-T13 | 前端 |
| P4-T15 | 加载状态优化 | Skeleton/Loading | 4h | P1 | P4-T14 | 前端 |
| P4-T16 | 响应式布局 | 移动端适配 | 8h | P1 | P4-T15 | 前端 |
| P4-T17 | 主题切换 | 深色/浅色模式 | 4h | P2 | P4-T16 | 前端 |
| P4-T18 | 面包屑导航 | 路径导航组件 | 3h | P2 | P4-T16 | 前端 |

**Phase 4 交付物**:
- ✅ 完整的用户仪表盘
- ✅ 实例管理完整功能
- ✅ 实例日志查看
- ✅ 全局状态管理
- ✅ 响应式布局
- ✅ 统一的错误处理

---

### 📌 Phase 5: 实例访问与 iframe 嵌入（第 11-12 周）

#### Week 11: 访问URL与Token

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P5-T1 | 访问Token生成 | 短期访问Token | 4h | P0 | P1-T9 | 后端 |
| P5-T2 | 访问URL API | 生成实例访问链接 | 4h | P0 | P5-T1,P3-T2 | 后端 |
| P5-T3 | Token验证中间件 | 验证访问Token | 4h | P0 | P5-T1 | 后端 |
| P5-T4 | 访问日志记录 | 记录访问行为 | 4h | P1 | P5-T2 | 后端 |
| P5-T5 | 前端访问按钮 | 打开实例访问 | 4h | P0 | P4-T4 | 前端 |
| P5-T6 | 新窗口访问 | 弹出窗口打开桌面 | 4h | P0 | P5-T5 | 前端 |

#### Week 12: iframe嵌入

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P5-T7 | iframe访问页面 | 嵌入页面路由 | 6h | P0 | P5-T6 | 前端 |
| P5-T8 | iframe容器组件 | 自适应iframe | 6h | P0 | P5-T7 | 前端 |
| P5-T9 | iframe权限控制 | 跨域/安全策略 | 6h | P0 | P5-T3 | 后端 |
| P5-T10 | 访问控制条 | 顶部控制按钮 | 6h | P1 | P5-T8 | 前端 |
| P5-T11 | 连接状态检测 | iframe加载检测 | 4h | P1 | P5-T8 | 前端 |
| P5-T12 | 错误处理 | 访问失败提示 | 4h | P1 | P5-T11 | 前端 |
| P5-T13 | Token过期处理 | 自动刷新Token | 4h | P1 | P5-T1 | 后端+前端 |

**Phase 5 交付物**:
- ✅ 安全访问Token机制
- ✅ 实例访问URL生成
- ✅ iframe嵌入虚拟桌面
- ✅ 访问控制功能
- ✅ Token过期自动刷新

---

### 📌 Phase 6: 存储与备份管理（第 13-15 周）

#### Week 13: 持久化存储

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P6-T1 | Volume Repository | 存储卷CRUD | 4h | P1 | P1-T8 | 后端 |
| P6-T2 | 创建Volume API | POST /api/v1/instances/:id/volumes | 6h | P1 | P6-T1,P3-T3 | 后端 |
| P6-T3 | 删除Volume API | DELETE /api/v1/volumes/:id | 4h | P1 | P6-T2 | 后端 |
| P6-T4 | 存储使用情况API | 获取使用量 | 4h | P1 | P6-T1 | 后端 |
| P6-T5 | 前端存储管理 | Volume列表/创建 | 8h | P1 | P3-T20 | 前端 |

#### Week 14: 备份功能

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P6-T6 | 备份Repository | 备份CRUD | 4h | P1 | P1-T8 | 后端 |
| P6-T7 | 创建备份API | 快照式备份 | 8h | P1 | P6-T6,P3-T3 | 后端 |
| P6-T8 | 列出备份API | 分页列表 | 2h | P1 | P6-T7 | 后端 |
| P6-T9 | 删除备份API | 清理备份文件 | 4h | P1 | P6-T7 | 后端 |
| P6-T10 | 恢复备份API | 从备份恢复 | 8h | P1 | P6-T7 | 后端 |
| P6-T11 | 前端备份管理 | 备份列表/创建/恢复 | 10h | P1 | P6-T5 | 前端 |

#### Week 15: 备份计划

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P6-T12 | 备份计划Repository | 计划CRUD | 4h | P2 | P1-T8 | 后端 |
| P6-T13 | Cron表达式解析 | 支持标准Cron | 4h | P2 | - | 后端 |
| P6-T14 | 定时任务调度器 | 基于gocron | 6h | P2 | P6-T13 | 后端 |
| P6-T15 | 备份计划API | CRUD for schedule | 4h | P2 | P6-T12 | 后端 |
| P6-T16 | 保留策略实现 | 自动清理过期备份 | 6h | P2 | P6-T7 | 后端 |
| P6-T17 | 前端备份计划 | 计划配置页面 | 8h | P2 | P6-T11 | 前端 |

**Phase 6 交付物**:
- ✅ PVC管理功能
- ✅ 手动备份/恢复
- ✅ 定时备份计划
- ✅ 备份保留策略
- ✅ 完整的备份管理页面

---

### 📌 Phase 7: 资源监控与仪表盘（第 16-18 周）

#### Week 16: 监控数据收集

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P7-T1 | Usage Repository | 使用统计CRUD | 4h | P1 | P1-T8 | 后端 |
| P7-T2 | 指标收集Service | 定时收集K8s metrics | 8h | P1 | P3-T1 | 后端 |
| P7-T3 | 平台统计API | 聚合统计数据 | 6h | P1 | P7-T2 | 后端 |
| P7-T4 | 实例使用API | 实时/历史使用数据 | 4h | P1 | P7-T2 | 后端 |
| P7-T5 | WebSocket服务 | 实时数据推送 | 8h | P1 | - | 后端 |

#### Week 17: 仪表盘开发

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P7-T6 | 管理员仪表盘API | 全平台统计 | 4h | P1 | P7-T3 | 后端 |
| P7-T7 | 前端图表库 | Recharts/ECharts集成 | 4h | P1 | P4-T17 | 前端 |
| P7-T8 | 管理员仪表盘页面 | 统计图表/列表 | 10h | P1 | P7-T7 | 前端 |
| P7-T9 | 用户仪表盘优化 | 个人统计展示 | 8h | P1 | P7-T8 | 前端 |
| P7-T10 | 实时监控组件 | WebSocket连接 | 6h | P1 | P7-T5 | 前端 |
| P7-T11 | 资源使用图表 | CPU/内存/磁盘趋势 | 6h | P1 | P7-T10 | 前端 |

#### Week 18: 日志与告警

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P7-T12 | 实例日志优化 | 实时日志流 | 4h | P1 | P4-T9 | 后端 |
| P7-T13 | 日志搜索API | 关键词搜索 | 4h | P2 | P7-T12 | 后端 |
| P7-T14 | 前端日志优化 | 实时日志组件 | 6h | P1 | P7-T13 | 前端 |
| P7-T15 | 日志筛选功能 | 按时间/级别筛选 | 4h | P2 | P7-T14 | 前端 |
| P7-T16 | 告警规则设计 | 资源阈值告警 | 4h | P2 | P7-T3 | 后端 |
| P7-T17 | 告警通知 | Webhook/邮件通知 | 6h | P2 | P7-T16 | 后端 |

**Phase 7 交付物**:
- ✅ 实时资源监控
- ✅ 管理员仪表盘
- ✅ 增强的用户仪表盘
- ✅ 实时日志流
- ✅ 日志搜索功能

---

### 📌 Phase 8: 审计与安全（第 19 周）

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P8-T1 | Audit Repository | 审计日志CRUD | 4h | P1 | P1-T8 | 后端 |
| P8-T2 | 审计中间件 | 自动记录操作 | 6h | P1 | P8-T1 | 后端 |
| P8-T3 | 审计日志API | 查询/筛选API | 4h | P1 | P8-T2 | 后端 |
| P8-T4 | 前端审计日志 | 审计日志页面 | 8h | P1 | P8-T3 | 前端 |
| P8-T5 | 审计筛选功能 | 多维度筛选 | 4h | P2 | P8-T4 | 前端 |
| P8-T6 | 输入验证加固 | 全参数校验 | 6h | P0 | - | 后端 |
| P8-T7 | SQL注入防护 | 参数化查询检查 | 4h | P0 | - | 后端 |
| P8-T8 | XSS防护 | 输出转义 | 4h | P0 | P4-T17 | 前端 |
| P8-T9 | CSRF防护 | Token验证 | 4h | P0 | P1-T9 | 后端+前端 |
| P8-T10 | 速率限制 | API限流 | 4h | P1 | - | 后端 |

**Phase 8 交付物**:
- ✅ 完整审计日志系统
- ✅ 审计日志查询页面
- ✅ 输入验证加固
- ✅ SQL注入/XSS/CSRF防护
- ✅ API速率限制

---

### 📌 Phase 9: 测试与优化（第 20 周）

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P9-T1 | 后端单元测试 | Repository/Service层 | 12h | P0 | - | 后端 |
| P9-T2 | API集成测试 | Postman/Newman | 8h | P0 | - | 后端 |
| P9-T3 | K8s集成测试 | 端到端测试 | 8h | P1 | P3-T2 | 后端 |
| P9-T4 | 前端单元测试 | React Testing Library | 10h | P0 | P4-T17 | 前端 |
| P9-T5 | 前端E2E测试 | Playwright/Cypress | 8h | P1 | P4-T17 | 前端 |
| P9-T6 | 性能测试 | k6压测 | 6h | P1 | - | DevOps |
| P9-T7 | 数据库优化 | 索引优化/慢查询 | 6h | P1 | P9-T6 | 后端 |
| P9-T8 | 缓存策略 | Redis缓存热点数据 | 8h | P2 | - | 后端 |
| P9-T9 | 前端性能优化 | 代码分割/懒加载 | 6h | P1 | P9-T5 | 前端 |

**Phase 9 交付物**:
- ✅ 后端单元测试（覆盖率>70%）
- ✅ 前端单元测试（覆盖率>60%）
- ✅ API集成测试套件
- ✅ 性能测试报告
- ✅ 优化后的数据库查询

---

### 📌 Phase 10: 部署与上线（第 21-22 周）

#### Week 21: 容器化与K8s配置

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P10-T1 | 后端Dockerfile | 多阶段构建 | 4h | P0 | - | DevOps |
| P10-T2 | 前端Dockerfile | Nginx托管 | 4h | P0 | - | DevOps |
| P10-T3 | Docker镜像优化 | 减小镜像体积 | 4h | P1 | P10-T1,P10-T2 | DevOps |
| P10-T4 | K8s Deployment | 后端/前端部署配置 | 6h | P0 | P10-T3 | DevOps |
| P10-T5 | K8s Service | 服务暴露配置 | 4h | P0 | P10-T4 | DevOps |
| P10-T6 | K8s ConfigMap | 配置管理 | 4h | P0 | P10-T4 | DevOps |
| P10-T7 | K8s Secret | 密钥管理 | 4h | P0 | P10-T4 | DevOps |
| P10-T8 | MySQL StatefulSet | 数据库部署 | 4h | P0 | - | DevOps |
| P10-T9 | Ingress配置 | 路由和SSL | 4h | P0 | P10-T5 | DevOps |

#### Week 22: 生产部署

| 任务ID | 任务名称 | 描述 | 工时 | 优先级 | 依赖 | 负责人 |
|--------|----------|------|------|--------|------|--------|
| P10-T10 | 生产环境准备 | 集群/域名/证书 | 8h | P0 | - | DevOps |
| P10-T11 | CI/CD流水线 | GitHub Actions | 8h | P0 | P10-T9 | DevOps |
| P10-T12 | 数据库初始化 | 生产数据迁移 | 4h | P0 | P10-T8 | DevOps |
| P10-T13 | 应用部署 | 部署到生产集群 | 4h | P0 | P10-T11 | DevOps |
| P10-T14 | 健康检查 | 系统验证 | 4h | P0 | P10-T13 | DevOps |
| P10-T15 | 监控配置 | Prometheus/Grafana | 6h | P1 | P10-T13 | DevOps |
| P10-T16 | 日志收集 | ELK/Loki配置 | 6h | P1 | P10-T13 | DevOps |
| P10-T17 | 备份策略 | 数据备份计划 | 4h | P1 | P10-T12 | DevOps |
| P10-T18 | 运维文档 | 部署/运维手册 | 6h | P1 | P10-T17 | DevOps |
| P10-T19 | 用户文档 | 使用手册 | 4h | P1 | - | 产品 |

**Phase 10 交付物**:
- ✅ Docker镜像（前后端）
- ✅ K8s部署配置（完整）
- ✅ CI/CD流水线
- ✅ 生产环境部署
- ✅ 监控告警系统
- ✅ 运维文档
- ✅ 用户手册

---

## 关键里程碑与交付物

| 里程碑 | 时间点 | 交付物 | 验收标准 |
|--------|--------|--------|----------|
| **M1: 认证完成** | Week 2 | 登录/注册/Token系统 | 可完成用户注册登录，Token正常刷新 |
| **M2: 用户管理完成** | Week 4 | 用户管理+配额系统 | 管理员可管理用户和配额 |
| **M3: 实例基础完成** | Week 7 | 实例生命周期+K8s集成 | 可创建/启动/停止实例，状态同步正常 |
| **M4: 前端核心完成** | Week 10 | 仪表盘+实例管理页面 | 所有核心页面功能完整，UI一致 |
| **M5: 实例访问完成** | Week 12 | iframe嵌入访问 | 可正常通过iframe访问虚拟桌面 |
| **M6: 存储备份完成** | Week 15 | 备份+定时计划 | 可手动/自动备份，能正常恢复 |
| **M7: 监控完成** | Week 18 | 仪表盘+日志 | 实时监控数据正常，日志可搜索 |
| **M8: 安全审计完成** | Week 19 | 审计日志+安全防护 | 审计完整，安全测试通过 |
| **M9: 测试优化完成** | Week 20 | 测试套件+优化 | 测试覆盖率达标，性能符合要求 |
| **M10: 上线完成** | Week 22 | 生产部署+文档 | 生产环境稳定运行，文档完整 |

---

## 风险点与应对建议

### 高风险

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|----------|
| **K8s集成复杂度** | 延期2-3周 | 中 | 提前学习client-go，Week 5前完成技术调研；准备fallback方案（mock K8s API） |
| **iframe跨域问题** | 功能不可用 | 中 | 提前测试目标虚拟桌面应用的CORS配置；准备替代方案（新窗口打开） |
| **K8s集群资源不足** | 实例创建失败 | 中 | 预留额外集群资源；实现等待队列机制；提前与基础设施团队沟通 |

### 中风险

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|----------|
| **upper/db学习成本** | 延期1周 | 低 | 已提供详细使用文档；预留缓冲时间 |
| **前端组件库兼容** | UI开发受阻 | 低 | shadcn/ui成熟稳定；预留样式调整时间 |
| **备份存储成本** | 预算超支 | 中 | 设计可配置的保留策略；监控存储使用 |
| **性能不达标** | 需优化1-2周 | 中 | Week 20专门预留优化时间；提前进行性能测试 |

### 低风险

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|----------|
| **需求变更** | 工作量增加 | 中 | 使用敏捷开发，每周评审；核心功能优先 |
| **人员变动** | 延期1周 | 低 | 代码评审确保知识共享；文档及时更新 |
| **第三方服务故障** | 依赖不可用 | 低 | 监控依赖服务状态；准备降级方案 |

### 建议措施

1. **技术预研**（Week 0）
   - K8s client-go快速原型验证
   - iframe嵌入方案POC
   - upper/db基础CRUD练习

2. **敏捷开发**
   - 每2周一个Sprint
   - 每日站会（15分钟）
   - Sprint评审和回顾

3. **代码质量**
   - 强制Code Review
   - 主干开发+功能分支
   - 自动化测试门禁

4. **风险缓冲**
   - 每个Phase预留10%缓冲时间
   - Week 20专门用于优化和调整

---

## 资源需求

### 人员配置

| 角色 | 人数 | 职责 |
|------|------|------|
| 后端开发 | 2人 | Golang API开发、K8s集成 |
| 前端开发 | 2人 | React页面开发、组件封装 |
| DevOps工程师 | 1人 | 容器化、K8s部署、CI/CD |
| 产品经理 | 1人 | 需求确认、验收测试 |
| 测试工程师 | 1人 | 测试用例、自动化测试 |

### 基础设施

| 资源 | 规格 | 用途 |
|------|------|------|
| 开发K8s集群 | 3节点（4核8GB） | 开发测试 |
| 生产K8s集群 | 5节点（8核16GB+） | 生产部署 |
| MySQL | 2核4GB | 数据库 |
| 对象存储 | 按需 | 备份存储 |
| CI/CD服务器 | 2核4GB | 构建流水线 |

---

**文档版本**: 1.0  
**最后更新**: 2026-03-15  
**维护者**: ClawReef 开发团队
