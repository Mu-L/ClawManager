# ClawManager

<p align="center">
  <img src="frontend/public/openclaw_github_logo.png" alt="ClawManager" width="100%" />
</p>

<p align="center">
  ClawManager 是在 ClawReef 基础上升级而来的控制平面，用于在 Kubernetes 上统一管理 OpenClaw 与各类 Linux 桌面运行时。
</p>

<p align="center">
  <strong>语言：</strong>
  <a href="./README.md">English</a> |
  中文 |
  <a href="./README.ja.md">日本語</a> |
  <a href="./README.ko.md">한국어</a> |
  <a href="./README.de.md">Deutsch</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Go-1.21%2B-00ADD8?style=for-the-badge&logo=go&logoColor=white" alt="Go 1.21+" />
  <img src="https://img.shields.io/badge/React-19-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React 19" />
  <img src="https://img.shields.io/badge/Kubernetes-Native-326CE5?style=for-the-badge&logo=kubernetes&logoColor=white" alt="Kubernetes Native" />
  <img src="https://img.shields.io/badge/MySQL-8.0%2B-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL 8.0+" />
</p>

## 更新说明

- [2026-03-20] README 已按当前代码实现刷新，补充了 Portal 桌面访问、Webtop 运行时、运行时镜像卡片、集群资源概览、修改密码流程，以及 OpenClaw 导入导出等最新功能。

## 项目概览

ClawManager 延续了 ClawReef 在 Kubernetes 上管理虚拟桌面的核心目标，并进一步扩展为一个更完整的桌面运行时运维平台，覆盖用户治理、实例生命周期管理、安全访问和集群资源可视化。

当前代码已经实现的能力包括：

- 多用户桌面实例管理
- 管理员 / 普通用户双视图控制台
- 实例数、CPU、内存、存储、GPU 配额控制
- 基于后端代理的桌面安全访问
- 在实例详情页与 Portal 页面内嵌桌面访问
- OpenClaw 工作区导出与导入
- 支持运行时镜像覆盖配置
- 管理员集群资源总览
- 英文、中文、日文、韩文、德文多语言界面

## 当前已实现功能

### 用户侧

- 注册、登录、刷新令牌、退出登录、修改密码
- 创建桌面实例，并在创建前做配额占用校验
- 支持实例类型：`openclaw`、`webtop`、`ubuntu`、`debian`、`centos`、`custom`
- 启动、停止、重启、删除、查看实例
- 从以下入口访问正在运行的桌面：
  - 实例详情页
  - `/portal` 统一门户页
- 为实例生成短时效访问令牌
- 对 `openclaw` 实例执行工作区导出 / 导入

### 管理员侧

- 管理员仪表盘：
  - 用户总数、实例总数、运行中实例数、已分配存储
  - 集群节点就绪情况
  - CPU / 内存 / 磁盘的 requested 与 allocatable 总览
  - 按节点展示资源明细
- 用户管理：
  - 创建用户
  - 删除用户
  - 修改角色
  - 修改配额
  - CSV 批量导入并生成默认密码
- 跨用户实例管理
- 支持各运行时类型的镜像卡片配置
- 集群资源概览接口与前端页面
- 管理设置页中的修改密码入口

### 平台能力

- `/api/v1` REST API
- JWT 鉴权
- WebSocket 实时连接入口
- 基于 Kubernetes 的实例生命周期管理
- 桌面 HTTP / WebSocket 代理转发
- 定时实例状态同步服务

## 架构

```text
浏览器
  -> React 前端
  -> Go/Gin 后端
  -> MySQL
  -> Kubernetes API
  -> Namespace / Pod / PVC / Service
  -> OpenClaw / Webtop / Linux 桌面运行时
```

说明：

- 桌面访问统一通过后端代理路由暴露。
- 集群可视化与实例生命周期能力依赖后端可访问 Kubernetes。
- 代码里仍保留部分历史命名 `clawreef`，但产品名称已经统一为 ClawManager。

## 目录结构

```text
ClawManager/
├── backend/        # Go 后端 API、服务、数据库迁移
├── frontend/       # React 前端
├── deployments/    # 根目录 Kubernetes 部署清单
├── dev_docs/       # 设计与实现文档
├── scripts/        # 辅助脚本
├── README.md
├── README.zh-CN.md
├── TASK_BREAKDOWN.md
└── dev_progress.md
```

## 技术栈

### 前端

- React 19
- TypeScript 5.9
- Vite 8
- React Router 7
- Axios
- Zustand

### 后端

- Go 1.21+
- Gin
- upper/db
- MySQL 8.0+
- JWT 鉴权

### 基础设施

- Kubernetes
- Docker
- WebSocket 代理

## 主要接口

当前已经实现的关键接口：

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `POST /api/v1/auth/change-password`
- `GET /api/v1/auth/me`
- `GET /api/v1/users`
- `POST /api/v1/users/import`
- `PUT /api/v1/users/:id/quota`
- `GET /api/v1/instances`
- `POST /api/v1/instances`
- `POST /api/v1/instances/:id/start`
- `POST /api/v1/instances/:id/stop`
- `POST /api/v1/instances/:id/restart`
- `POST /api/v1/instances/:id/access`
- `POST /api/v1/instances/:id/sync`
- `GET /api/v1/instances/:id/openclaw/export`
- `POST /api/v1/instances/:id/openclaw/import`
- `GET /api/v1/system-settings/images`
- `PUT /api/v1/system-settings/images`
- `GET /api/v1/system-settings/cluster-resources`
- `GET /api/v1/ws`

## 快速开始

### 前置要求

- MySQL 8.0+
- 可访问的 Kubernetes 集群
- 已配置可用的 `kubectl`
- Node.js 20+
- Go 1.21+

先确认 Kubernetes 连通性：

```bash
kubectl get nodes
```

### 后端启动

本地开发默认配置位于 `backend/configs/dev.yaml`，其中默认值为：

- 服务地址：`http://localhost:9001`
- 数据库主机：`localhost`
- 数据库端口：`13306`
- 数据库名：`clawreef`

启动后端：

```bash
cd backend
go mod tidy
make run
```

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

默认前端地址：

- `http://localhost:9002`

### 数据库初始化

如果使用仓库内的初始化工具：

```bash
cd backend
go run cmd/initdb/main.go
```

初始化工具会创建默认管理员账号：

- `admin / admin123`

### Docker Compose

仓库中也提供了 Docker Compose 配置，位于 `backend/deployments/docker/`：

```bash
cd backend
make docker-up
```

## 首次使用建议流程

1. 使用 `admin` 账号登录。
2. 手动创建用户，或通过 CSV 批量导入用户。
3. 为用户分配实例数、CPU、内存、存储、GPU 配额。
4. 视需要在管理设置中配置运行时镜像卡片。
5. 使用普通用户登录并创建实例。
6. 通过实例详情页或 `/portal` 进入桌面。

## CSV 导入说明

用户导入支持类似下面的表头：

```csv
Username,Email,Role,Password,Max Instances,Max CPU Cores,Max Memory (GB),Max Storage (GB),Max GPU Count
```

当前代码中的规则：

- `Username`、`Role`、`Max Instances`、`Max CPU Cores`、`Max Memory (GB)`、`Max Storage (GB)` 为必填
- `Email`、`Password`、`Max GPU Count` 为选填
- 当 `Password` 为空时，后端会按角色生成默认密码：
  - 导入管理员：`admin123`
  - 导入普通用户：`user123`

## 配置说明

后端常用环境变量：

- `SERVER_ADDRESS`
- `SERVER_MODE`
- `DB_HOST`
- `DB_PORT`
- `DB_USER`
- `DB_PASSWORD`
- `DB_NAME`
- `JWT_SECRET`

补充说明：

- 前端开发环境默认访问 `9001` 端口后端
- 桌面访问通过 `/api/v1/instances/:id/proxy` 代理
- OpenClaw 导入导出仅适用于运行中的 `openclaw` 实例
- 集群资源总览仅管理员可访问

## 相关文档

- [TASK_BREAKDOWN.md](./TASK_BREAKDOWN.md)
- [dev_progress.md](./dev_progress.md)
- [backend/README.md](./backend/README.md)
- [dev_docs/ARCHITECTURE_SIMPLE.md](./dev_docs/ARCHITECTURE_SIMPLE.md)
- [dev_docs/MONITORING_DASHBOARD.md](./dev_docs/MONITORING_DASHBOARD.md)

## License

MIT
