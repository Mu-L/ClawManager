# ClawReef 开发进展文档

**项目**: ClawReef - 基于 Kubernetes 的虚拟桌面管理平台  
**文档版本**: v1.1  
**最后更新**: 2026年3月18日  
**开发周期**: 22周（10个阶段）  
**当前阶段**: Phase 5 完成，Phase 6 准备中

---

## 一、项目概述

ClawReef 是一个企业级虚拟桌面管理平台，基于 Kubernetes 构建，支持创建和管理多种类型的虚拟桌面（OpenClaw、Ubuntu 等）。平台提供完整的用户管理、资源配额控制、实例生命周期管理、存储备份以及实时监控功能。

### 核心功能

- **多租户用户管理**：支持管理员和普通用户角色，基于 RBAC 的权限控制
- **虚拟桌面实例**：完整的实例生命周期管理（创建、启动、停止、删除）
- **资源配额管理**：管理员可为每个用户设置 CPU、内存、存储配额
- **持久化存储**：支持 PVC 动态创建和数据持久化
- **备份与恢复**：支持手动和自动备份，基于 Cron 的备份计划
- **实时监控**：平台统计和资源使用监控
- **审计日志**：完整的操作审计追踪

---

## 二、技术栈

### 后端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Golang | 1.21+ | 后端开发语言 |
| Gin | 1.9+ | Web 框架 |
| upper/db | 4.x | 数据库 ORM |
| MySQL | 8.0+ | 关系型数据库 |
| client-go | latest | Kubernetes API 客户端 |
| JWT | v5 | 身份认证 |

### 前端技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19 | UI 框架 |
| TypeScript | 5.9 | 类型安全 |
| Vite | 7 | 构建工具 |
| Tailwind CSS | 4 | 样式框架 |
| react-router-dom | v6 | 路由管理 |
| Axios | latest | HTTP 客户端 |
| Zustand | latest | 状态管理 |

### 基础设施

| 技术 | 用途 |
|------|------|
| Kubernetes | 容器编排 |
| Docker | 容器化 |
| Docker Compose | 本地开发环境 |

---

## 三、开发路线图

### 已完成阶段 ✅

#### Phase 1: 基础设施与认证（第 1-2 周）

**后端完成内容：**

- ✅ Golang 项目结构搭建
  - 采用标准 Go 项目布局（cmd/, internal/, pkg/）
  - 模块化架构设计（models, repository, services, handlers, middleware）
- ✅ 数据库连接层（upper/db）
  - MySQL 连接配置
  - 连接池管理
  - 数据库迁移支持
- ✅ 8 个核心数据模型
  - `User` - 用户管理
  - `Instance` - 虚拟桌面实例
  - `PersistentVolume` - 持久化存储
  - `Backup` - 备份记录
  - `BackupSchedule` - 备份计划
  - `UserQuota` - 用户资源配额
  - `InstanceUsage` - 实例使用统计
  - `AuditLog` - 审计日志
- ✅ JWT 认证系统
  - Access Token / Refresh Token 双令牌机制
  - Token 过期管理
- ✅ 用户认证 API
  - POST /api/v1/auth/register - 用户注册
  - POST /api/v1/auth/login - 用户登录
  - POST /api/v1/auth/refresh - 刷新 Token
- ✅ 中间件
  - CORS 跨域支持
  - 统一错误处理
  - 请求日志记录
- ✅ 开发工具
  - Docker Compose 配置（MySQL + 应用）
  - Makefile（build, test, lint, run）

**前端完成内容：**

- ✅ React + TypeScript + Vite 项目初始化
  - ESLint + Prettier 配置
  - 路径别名配置
- ✅ Tailwind CSS 配置
  - 自定义主题配置
  - 常用工具类定义
- ✅ 路由配置（react-router-dom v6）
  - 受保护路由（ProtectedRoute）
  - 管理员路由权限控制
- ✅ Axios API 客户端
  - 请求/响应拦截器
  - 自动 Token 刷新逻辑
  - 统一错误处理
- ✅ Zustand 状态管理
  - Auth Store（用户认证状态）
  - 持久化存储集成
- ✅ 页面开发
  - 登录页面（/login）
  - 注册页面（/register）
  - 用户仪表盘（/dashboard）- 显示配额信息

---

#### Phase 2: 用户管理系统（第 3-4 周）

**后端 API 完成：**

| 方法 | 路径 | 描述 | 权限 |
|------|------|------|------|
| GET | /api/v1/users | 用户列表（分页） | Admin |
| POST | /api/v1/users | 创建用户 | Admin |
| GET | /api/v1/users/:id | 用户详情 | Admin/Self |
| PUT | /api/v1/users/:id | 更新用户信息 | Admin/Self |
| DELETE | /api/v1/users/:id | 删除用户 | Admin |
| PUT | /api/v1/users/:id/role | 修改用户角色 | Admin |
| GET | /api/v1/users/:id/quota | 获取用户配额 | Admin/Self |
| PUT | /api/v1/users/:id/quota | 修改用户配额 | Admin |

- ✅ RBAC 权限控制中间件
  - Admin 角色验证
  - 资源所有权验证

**前端页面完成：**

- ✅ 管理员仪表盘（/admin）
  - 系统概览统计卡片
  - 快捷操作入口
- ✅ 用户管理页面（/admin/users）
  - 用户列表表格（支持分页、排序）
  - 添加用户对话框
  - 编辑配额对话框
  - 修改角色对话框
  - 删除确认对话框
  - 点击背景关闭对话框交互
- ✅ 占位页面
  - 实例管理页面（/admin/instances）
  - 系统设置页面（/admin/settings）

---

### 进行中/待开发阶段 ⏳

#### Phase 3: 虚拟桌面实例管理基础（第 5-7 周）✅

**已完成内容：**

- ✅ Kubernetes 集成（client-go）支持双模式
  - 添加 client-go v0.32.3 依赖
  - 创建 K8s 客户端初始化模块 (`internal/services/k8s/client.go`)
  - **支持三种连接模式**：
    - `auto` - 自动检测（优先 in-cluster，失败则使用 kubeconfig）
    - `incluster` - 强制使用 in-cluster 配置（Pod 内运行）
    - `outofcluster` - 强制使用 kubeconfig 文件（本地开发）
  - **配置文件控制**：通过 `configs/k8s.yaml` 配置运行方式
  - 环境变量配置支持（K8S_MODE, KUBECONFIG, K8S_NAMESPACE, K8S_STORAGE_CLASS）
- ✅ Pod 管理服务 (`internal/services/k8s/pod_service.go`)
  - Pod 创建（支持 CPU/内存/GPU 资源配置）
  - Pod 查询和状态获取
  - Pod 删除
  - 标签管理（app, instance-id, user-id, managed-by）
- ✅ PVC 管理服务 (`internal/services/k8s/pvc_service.go`)
  - PVC 动态创建（支持 StorageClass）
  - PVC 查询和删除
  - 存储容量配置
- ✅ 实例业务逻辑层 (`internal/services/instance_service.go`)
  - 实例创建（配额检查 + PVC创建 + Pod创建）
  - 实例启动/停止/重启
  - 实例删除（级联删除 Pod 和 PVC）
  - 配额检查（实例数、CPU、内存、存储、GPU）
  - 支持多种桌面类型（openclaw, ubuntu, debian, centos, custom）
- ✅ 实例 API 处理器 (`internal/handlers/instance_handler.go`)
  - GET /api/v1/instances - 实例列表
  - POST /api/v1/instances - 创建实例
  - GET /api/v1/instances/:id - 实例详情
  - PUT /api/v1/instances/:id - 更新实例
  - DELETE /api/v1/instances/:id - 删除实例
  - POST /api/v1/instances/:id/start - 启动实例
  - POST /api/v1/instances/:id/stop - 停止实例
  - POST /api/v1/instances/:id/restart - 重启实例
  - GET /api/v1/instances/:id/status - 实例状态
- ✅ 权限控制
  - 用户只能操作自己的实例
  - 管理员可操作所有实例

---

#### Phase 4: 前端核心页面（第 8-10 周）✅

**已完成内容：**

- ✅ 实例类型定义 (`frontend/src/types/instance.ts`)
  - Instance 接口定义
  - CreateInstanceRequest / UpdateInstanceRequest
  - InstanceStatus 状态接口
  - 实例类型列表 (Ubuntu/Debian/CentOS/OpenClaw/Custom)
  - 预设配置 (Small/Medium/Large)
- ✅ 实例服务层 (`frontend/src/services/instanceService.ts`)
  - 完整的 CRUD API 调用
  - 实例生命周期管理 (start/stop/restart)
  - 状态查询
- ✅ 实例列表页面 (`/instances`)
  - 列表展示所有实例
  - 状态显示 (running/stopped/creating/error)
  - 快捷操作按钮 (start/stop/delete)
  - 空状态提示
  - 跳转详情页
- ✅ 创建实例向导 (`/instances/new`)
  - 三步创建流程 (基本信息 → 选择类型 → 配置资源)
  - 实例类型选择卡片
  - 快速预设配置 (Small/Medium/Large)
  - 自定义资源配置 (CPU/内存/磁盘/GPU)
  - 配置摘要预览
  - 表单验证
- ✅ 实例详情页面 (`/instances/:id`)
  - 基本信息展示
  - 资源配置展示
  - Kubernetes 状态 (Pod/PVC 信息)
  - 操作按钮 (start/stop/restart/delete)
  - 访问链接 (预留)
  - 时间线记录
- ✅ 更新用户仪表盘
  - 显示实例统计
  - 显示运行中实例数
  - 显示存储使用情况
  - 快捷链接到实例管理
  - 显示最近实例列表

**待完成内容：**

- ⏳ 卡片/表格视图切换
- ⏳ 状态筛选和搜索功能
- ⏳ 资源使用图表
- ⏳ 操作日志
- ⏳ WebSocket 实时状态更新

---

#### Phase 5: 实例访问与 iframe 嵌入（第 11-12 周）⏳

**计划内容：**

- ⏳ 访问 URL 生成
  - 基于实例类型的 URL 生成
  - 端口转发配置
- ⏳ iframe 嵌入实现
  - 全屏嵌入模式
  - 自适应尺寸调整
  - 加载状态处理
- ⏳ 访问 Token 管理
  - 临时访问令牌
  - Token 过期控制
  - 访问权限验证

---

#### Phase 6: 存储与备份管理（第 13-15 周）⏳

**计划内容：**

- ⏳ PVC 管理 API
  - PVC 创建/扩容/删除
  - 存储使用统计
- ⏳ 手动备份功能
  - 快照创建
  - 备份文件存储
  - 备份列表管理
- ⏳ 自动备份功能
  - 基于 Cron 的备份计划
  - 保留策略配置
- ⏳ 备份恢复功能
  - 从备份恢复实例
  - 恢复进度跟踪

---

#### Phase 7: 资源监控与仪表盘（第 16-18 周）⏳

**计划内容：**

- ⏳ 平台统计数据 API
  - 总用户数/实例数
  - 资源使用率统计
  - 活跃会话数
- ⏳ 实例资源监控
  - CPU 使用率
  - 内存使用率
  - 磁盘使用率
  - 网络 I/O
- ⏳ 管理员仪表盘数据
  - 实时数据聚合
  - 趋势分析
- ⏳ 实时资源使用图表
  - 使用 Recharts/D3 实现
  - 实时数据刷新
  - 历史数据查询

---

#### Phase 8: 审计与安全（第 19 周）⏳

**计划内容：**

- ⏳ 审计日志记录
  - 操作日志自动记录中间件
  - 日志查询 API
  - 审计日志页面
- ⏳ 安全加固
  - XSS 防护
  - CSRF 防护
  - SQL 注入防护
- ⏳ 输入验证
  - 请求参数验证
  - 响应数据脱敏

---

#### Phase 9: 测试与优化（第 20 周）⏳

**计划内容：**

- ⏳ 单元测试
  - 后端服务层测试
  - 前端组件测试
- ⏳ 集成测试
  - API 集成测试
  - K8s 操作集成测试
- ⏳ 性能优化
  - 数据库查询优化
  - 前端资源优化
  - 缓存策略实现

---

#### Phase 10: 部署与上线（第 21-22 周）⏳

**计划内容：**

- ⏳ Docker 镜像构建
  - 多阶段构建优化
  - 镜像安全扫描
- ⏳ K8s 部署配置
  - Deployment/Service/Ingress 配置
  - ConfigMap/Secret 管理
  - HPA 自动扩缩容
- ⏳ 生产环境部署
  - 环境配置分离
  - 监控告警配置
  - 备份恢复演练

---

## 四、当前状态总结

### 总体进度

```
Phase 1: 基础设施与认证    ████████████████████ 100% ✅
Phase 2: 用户管理系统      ████████████████████ 100% ✅
Phase 3: 实例管理基础      ████████████████████ 100% ✅
Phase 4: 前端核心页面      ████████████████████ 100% ✅
Phase 5: 实例访问与嵌入    ████████████████████ 100% ✅
Phase 6: 存储与备份管理    ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 7: 资源监控与仪表盘  ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 8: 审计与安全        ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 9: 测试与优化        ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 10: 部署与上线       ░░░░░░░░░░░░░░░░░░░░   0% ⏳

整体进度: 50% (5/10 阶段完成)
```

### 已实现功能清单

**后端功能：**

- [x] 项目基础架构搭建
- [x] 数据库模型设计（8个核心表）
- [x] JWT 认证系统（注册/登录/刷新）
- [x] 用户管理 CRUD API
- [x] RBAC 权限控制
- [x] 配额管理 API
- [x] 基础中间件（CORS/错误处理）
- [x] Docker Compose 开发环境
- [x] Kubernetes 客户端集成 (client-go)
- [x] Pod 生命周期管理（创建/删除/状态获取）
- [x] PVC 动态创建和管理
- [x] 实例管理 Service（创建/启动/停止/重启/删除）
- [x] 实例配额检查（CPU/内存/存储/GPU）
- [x] 实例管理 REST API（11个端点）
- [x] **WebSocket 实时状态更新**
  - WebSocket Hub 管理
  - 客户端连接管理
  - 实例状态广播
  - 自动重连机制
- [x] **实例访问管理**
  - 临时访问令牌生成
  - Token 过期管理
  - 访问 URL 生成

**前端功能：**

- [x] 项目初始化与配置
- [x] 路由系统与权限控制
- [x] API 客户端与状态管理
- [x] 登录/注册页面
- [x] 用户仪表盘
- [x] 管理员仪表盘
- [x] 用户管理页面（完整功能）
- [x] 对话框交互组件
- [x] **前端实例管理**
  - 实例列表页面（卡片/列表视图切换、搜索筛选）
  - 创建实例向导（三步流程、类型选择、资源配置）
  - 实例详情页面（标签页、基本信息、K8s 状态）
  - 实例服务层（完整 API 封装）
  - 类型定义（Instance/Request/Status）
  - 更新用户仪表盘（实例统计、快捷入口）
- [x] **WebSocket 实时状态更新**
  - useWebSocket hook
  - 自动重连机制
  - 实时状态同步
  - 连接状态指示器
- [x] **实例访问功能**
  - InstanceAccess 组件
  - iframe 桌面嵌入
  - 全屏模式支持
  - 访问令牌刷新
- [x] **用户页面导航**
  - UserLayout 组件统一用户页面导航
  - Logo 点击返回主页
  - Dashboard 和 Instances 导航链接
  - Admin Panel 快捷入口（管理员）
  - 用户信息和退出按钮
  - 响应式移动端导航

### 代码统计（实际）

| 类型 | 文件数 | 代码行数 |
|------|--------|----------|
| Go 后端 | 107 | ~19,800 |
| TypeScript/React 前端 | ~55 | ~8,500 |
| SQL/配置 | ~20 | ~1,800 |
| **总计** | **~182** | **~30,000** |

### Git 提交记录

- **Initial commit**: 6d0dad9 - ClawReef v1.0 - Virtual Desktop Management Platform
- **提交时间**: 2026-03-18
- **文件数**: 107 files
- **代码行数**: 19,876 insertions

---

## 五、下一步计划

### 即时任务（本周 - 2026-03-18 更新）

1. ✅ **前端功能增强**
   - ✅ WebSocket 实时状态更新
   - ✅ 实例访问 iframe 嵌入
   - ✅ 卡片/列表视图切换
   - ✅ 搜索和筛选功能
   - ⏳ 资源使用图表（Phase 7）

2. ✅ **后端功能完善**
   - ✅ 实例访问 URL 生成
   - ✅ 端口转发配置
   - ✅ 临时访问令牌管理
   - ✅ 自动 PV 创建（解决 provisioner 限制）
   - ✅ 孤儿资源自动清理

3. ✅ **Bug 修复（今日完成）**
   - ✅ 修复实例 ID 分配问题
   - ✅ 修复 PV/PVC 绑定失败
   - ✅ 修复实例状态不同步
   - ✅ 修复删除时资源残留
   - ✅ Git 仓库初始化

### 近期目标（Phase 6-7）

- 完成存储备份管理（手动/自动备份）
- 实现资源监控仪表盘
- 添加审计日志功能

### 短期目标（Phase 5-6）

- 实现实例访问功能（VNC/Web 桌面嵌入）
- 完成存储备份管理
- 实现资源监控仪表盘

### 关键里程碑更新

Phase 3、4、5 已顺利完成！现在支持完整的实例管理和远程桌面访问功能。

| 里程碑 | 预计时间 | 验收标准 | 状态 |
|--------|----------|----------|------|
| Phase 3 完成 | 第 7 周 | 后端可创建/管理 K8s 实例 | ✅ 已完成 |
| Phase 4 完成 | 第 10 周 | 前端实例管理功能完整 | ✅ 已完成 |
| Phase 5 完成 | 第 12 周 | iframe 桌面访问功能 | ✅ 已完成 |
| MVP 可用 | 第 10 周 | 可创建/管理虚拟桌面 | ✅ 已完成 |
| Beta 版本 | 第 15 周 | 完整备份恢复功能 | ⏳ 待开始 |
| RC 版本 | 第 20 周 | 通过完整测试 | ⏳ 待开始 |
| 正式上线 | 第 22 周 | 生产环境部署完成 | ⏳ 待开始 |

---

## 六、技术债务与注意事项

### 当前技术债务

1. **前端类型定义**：部分 API 响应类型使用 `any`，需要逐步替换为严格类型
2. **错误处理**：需要统一前后端错误码和错误消息格式
3. **API 文档**：需要补充 Swagger/OpenAPI 文档
4. **测试覆盖**：当前测试覆盖率较低，需要补充
5. **K8s 错误回滚**：实例创建失败时的回滚机制需要完善
6. ✅ **实例状态同步**：已实现定时同步 K8s Pod 状态和数据库

### 2026-03-18 修复的关键问题

1. ✅ **数据库 ID 分配问题**：修复了创建实例后 ID 未正确获取的问题（instance.ID 一直是 0）
2. ✅ **PV 路径问题**：将 hostPath 从 `/opt/k8s-hostpath/` 改为 `/tmp/clawreef/` 以兼容 provisioner
3. ✅ **PV 绑定问题**：修复了 PV claimRef 缺少 PVC UID 导致无法绑定的问题
4. ✅ **孤儿资源清理**：新增 CleanupService 自动清理孤儿 Pod/PVC/PV
5. ✅ **状态同步增强**：修复 SyncService 跳过 creating 状态实例的问题
6. ✅ **删除逻辑增强**：确保删除实例时完全清理所有 K8s 资源

### 开发注意事项

1. **K8s 权限**：开发环境需要配置适当的 RBAC 权限
2. **资源限制**：实例创建时需要严格检查用户配额
3. **并发控制**：实例操作需要考虑并发安全性
4. **错误恢复**：K8s 操作失败时需要有回滚机制
5. **镜像配置**：需要根据实际桌面环境配置正确的容器镜像

---

## 附录

### 目录结构

```
ClawReef/
├── backend/                    # Go 后端
│   ├── cmd/
│   │   └── main.go            # 入口文件
│   ├── internal/
│   │   ├── handlers/          # HTTP 处理器
│   │   ├── middleware/        # 中间件
│   │   ├── models/            # 数据模型
│   │   ├── repository/        # 数据访问层
│   │   └── services/          # 业务逻辑层
│   │       └── k8s/           # K8s 客户端和服务
│   │           ├── client.go      # K8s 客户端初始化（支持 incluster/outofcluster 双模式）
│   │           ├── pod_service.go # Pod 管理
│   │           └── pvc_service.go # PVC 管理
│   ├── pkg/
│   │   ├── database/          # 数据库连接
│   │   ├── k8s/               # K8s 客户端（待开发）
│   │   └── auth/              # 认证工具
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── Makefile
├── frontend/                   # React 前端
│   ├── src/
│   │   ├── components/        # 组件
│   │   ├── pages/             # 页面
│   │   ├── hooks/             # 自定义 Hooks
│   │   ├── lib/               # 工具函数
│   │   ├── services/          # API 服务
│   │   ├── store/             # 状态管理
│   │   └── types/             # TypeScript 类型
│   ├── Dockerfile
│   └── package.json
└── k8s/                        # K8s 部署配置（待开发）
    ├── base/
    └── overlays/
```

### Kubernetes 配置说明

ClawReef 使用 `configs/k8s.yaml` 配置文件控制 Kubernetes 连接方式和运行时参数。

#### 配置文件结构

```yaml
kubernetes:
  # 连接模式: auto | incluster | outofcluster
  mode: "auto"
  
  # Out-of-cluster 配置（本地开发使用）
  outOfCluster:
    kubeconfig: ""              # kubeconfig 文件路径（空则自动查找）
    context: ""                 # 指定上下文（空则使用 current-context）
    apiServer: ""               # 覆盖 API Server 地址
    tls:
      insecureSkipVerify: false # 跳过 TLS 验证（仅开发）
      caFile: ""                # CA 证书路径
      certFile: ""              # 客户端证书路径
      keyFile: ""               # 客户端私钥路径
  
  # In-cluster 配置（Pod 内运行使用，通常无需修改）
  inCluster:
    tokenPath: "/var/run/secrets/kubernetes.io/serviceaccount/token"
    caPath: "/var/run/secrets/kubernetes.io/serviceaccount/ca.crt"
    namespacePath: "/var/run/secrets/kubernetes.io/serviceaccount/namespace"
  
  # 通用配置
  common:
    namespace: "clawreef"       # 命名空间前缀
    storageClass: "standard"    # 默认 StorageClass
    timeout: 30                 # 请求超时（秒）
    retryCount: 3               # 连接重试次数
    autoCreateNamespace: true   # 自动创建命名空间
  
  # 运行时配置
  runtime:
    pod:
      imageRegistry: "docker.io/clawreef"  # 默认镜像仓库
      containerPort: 8080                  # 默认容器端口
      mountPath: "/home/user/data"         # 默认挂载路径
      privileged: false                    # 特权模式
      extraLabels: {}                      # 额外标签
      nodeSelector: {}                     # 节点选择器
      tolerations: []                      # 容忍配置
    
    pvc:
      accessMode: "ReadWriteOnce"  # 访问模式
      volumeMode: "Filesystem"     # 卷模式
      allowVolumeExpansion: true   # 允许扩容
      reclaimPolicy: "Delete"      # 回收策略
  
  # 日志配置
  logging:
    level: "info"          # 日志级别
    logApiCalls: false     # 记录 API 调用
```

#### 连接模式

| 模式 | 说明 | 使用场景 |
|------|------|----------|
| `auto` | 自动检测，优先 in-cluster，失败则使用 kubeconfig | 通用（推荐） |
| `incluster` | 强制使用 in-cluster 配置 | Pod 内运行 |
| `outofcluster` | 强制使用 kubeconfig 文件 | 本地开发 |

#### 配置优先级

配置加载优先级（从高到低）：
1. 环境变量（覆盖所有配置）
2. `configs/k8s.yaml`（主配置文件）
3. 默认值

#### 环境变量

```bash
# 连接模式控制
export K8S_MODE=outofcluster        # auto | incluster | outofcluster

# Out-of-cluster 配置
export KUBECONFIG=/path/to/kubeconfig
export K8S_KUBECONFIG=/path/to/kubeconfig

# 通用配置
export K8S_NAMESPACE=clawreef
export K8S_STORAGE_CLASS=standard
```

#### 使用示例

**1. 本地开发（使用默认 kubeconfig）**

创建 `configs/k8s.yaml`:
```yaml
kubernetes:
  mode: outofcluster
  common:
    namespace: clawreef-dev
```

运行：
```bash
go run cmd/server/main.go
```

**2. 本地开发（使用指定 kubeconfig）**

```yaml
kubernetes:
  mode: outofcluster
  outOfCluster:
    kubeconfig: "/path/to/custom/kubeconfig"
    context: "minikube"
```

**3. 生产环境（Pod 内运行）**

```yaml
kubernetes:
  mode: incluster
  common:
    namespace: clawreef
    storageClass: fast-ssd
  runtime:
    pod:
      imageRegistry: "registry.company.com/clawreef"
```

**4. 多环境配置**

开发环境 `configs/k8s-dev.yaml`:
```yaml
kubernetes:
  mode: outofcluster
  outOfCluster:
    kubeconfig: "${HOME}/.kube/config-minikube"
  common:
    namespace: clawreef-dev
```

生产环境 `configs/k8s-prod.yaml`:
```yaml
kubernetes:
  mode: incluster
  common:
    namespace: clawreef
    storageClass: premium-rwo
  runtime:
    pod:
      nodeSelector:
        node-type: desktop
      tolerations:
        - key: "dedicated"
          operator: "Equal"
          value: "desktop"
          effect: "NoSchedule"
```

通过环境变量切换配置：
```bash
# 开发环境
cp configs/k8s-dev.yaml configs/k8s.yaml
go run cmd/server/main.go

# 生产环境
cp configs/k8s-prod.yaml configs/k8s.yaml
```

### 相关文档

- [API 设计规范](./docs/api-design.md)
- [数据库设计文档](./docs/database-schema.md)
- [K8s 资源命名规范](./docs/k8s-naming.md)
- [开发环境搭建指南](./docs/dev-setup.md)

## 七、最新进展（2026-03-18）

### 今日完成工作

**后端：**
- ✅ 修复数据库 repository 插入后 ID 获取问题
- ✅ 实现 CleanupService 自动清理孤儿资源
- ✅ 增强 PVCService 自动创建 PV（支持 /tmp 路径）
- ✅ 增强 SyncService 状态同步逻辑
- ✅ 添加 ForceSyncInstance 手动同步接口
- ✅ Git 仓库初始化和首次提交

**前端：**
- ✅ 实例列表视图切换（卡片/列表）
- ✅ 搜索和筛选功能
- ✅ 实时状态同步显示

**运维：**
- ✅ 清理所有孤儿 Pod/PVC/PV
- ✅ 修复 K8s 资源配置问题
- ✅ 验证实例创建和删除流程

### 系统状态

- **实例创建**: ✅ 正常工作（ID 正确分配，PV 自动创建）
- **实例删除**: ✅ 完全清理所有资源
- **状态同步**: ✅ 实时同步 K8s 和数据库状态
- **桌面访问**: ✅ iframe 嵌入正常工作

### 待开始（Phase 6-7）

- ⏳ 存储备份管理（快照、备份计划）
- ⏳ 资源监控仪表盘（CPU/内存/磁盘图表）
- ⏳ 审计日志功能

---

*本文档将每周更新，跟踪项目最新进展。*
