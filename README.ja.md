# ClawManager

<p align="center">
  <img src="frontend/public/openclaw_github_logo.png" alt="ClawManager" width="100%" />
</p>

<p align="center">
  ClawManager は、ClawReef をベースに Kubernetes 上で OpenClaw と Linux デスクトップランタイムを運用するために拡張されたコントロールプレーンです。
</p>

<p align="center">
  <strong>Languages:</strong>
  <a href="./README.md">English</a> |
  <a href="./README.zh-CN.md">中文</a> |
  日本語 |
  <a href="./README.ko.md">한국어</a> |
  <a href="./README.de.md">Deutsch</a>
</p>

## News

- [2026-03-20] README を最新実装に合わせて更新しました。Portal アクセス、Webtop ランタイム、ランタイムイメージカード、クラスタリソース概要、パスワード変更、OpenClaw のインポート / エクスポートを反映しています。

## Overview

ClawManager は、Kubernetes 上の仮想デスクトップ管理という ClawReef の目的を引き継ぎつつ、より包括的なデスクトップ運用基盤へ拡張したプロジェクトです。

現在の実装には次が含まれます。

- マルチユーザーのデスクトップインスタンス管理
- 管理者 / 一般ユーザー向けの分離された画面
- インスタンス数、CPU、メモリ、ストレージ、GPU のクォータ管理
- バックエンドプロキシ経由の安全なデスクトップアクセス
- インスタンス詳細画面と `/portal` からの埋め込みアクセス
- OpenClaw ワークスペースのエクスポート / インポート
- ランタイムイメージ上書き設定
- 管理者向けクラスタリソース可視化
- 英語、中国語、日本語、韓国語、ドイツ語の多言語 UI

## Current Capabilities

### User Side

- 登録、ログイン、トークン更新、ログアウト、パスワード変更
- クォータ検証付きのインスタンス作成
- 対応ランタイム: `openclaw`、`webtop`、`ubuntu`、`debian`、`centos`、`custom`
- インスタンスの開始、停止、再起動、削除、参照
- 実行中デスクトップへのアクセス:
  - インスタンス詳細ページ
  - `/portal` ワークスペースポータル
- 短期有効なアクセストークン生成
- `openclaw` インスタンスのワークスペース入出力

### Admin Side

- 管理ダッシュボード
- ユーザー作成、削除、権限変更、クォータ変更
- CSV によるユーザー一括インポート
- 全ユーザー横断のインスタンス管理
- ランタイムイメージカード管理
- クラスタリソース概要
- 設定画面からのパスワード変更

### Backend / Platform

- `/api/v1` REST API
- JWT 認証
- WebSocket エンドポイント
- Kubernetes ベースのインスタンスライフサイクル管理
- HTTP / WebSocket デスクトッププロキシ
- インスタンス状態同期サービス

## Architecture

```text
Browser
  -> React frontend
  -> Go/Gin backend
  -> MySQL
  -> Kubernetes API
  -> Namespace / Pod / PVC / Service
  -> OpenClaw / Webtop / Linux desktop runtime
```

注意:

- デスクトップ通信は認証付きバックエンドプロキシ経由で公開されます。
- クラスタ情報とライフサイクル管理には Kubernetes への接続が必要です。
- パッケージ名には歴史的に `clawreef` が残っていますが、製品名は ClawManager です。

## Quick Start

### Prerequisites

- MySQL 8.0+
- 利用可能な Kubernetes クラスタ
- 利用可能な `kubectl`
- Node.js 20+
- Go 1.21+

```bash
kubectl get nodes
```

### Backend

```bash
cd backend
go mod tidy
make run
```

既定の開発アドレス:

- `http://localhost:9001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

既定のフロントエンドアドレス:

- `http://localhost:9002`

### Database Bootstrap

```bash
cd backend
go run cmd/initdb/main.go
```

既定の管理者アカウント:

- `admin / admin123`

## CSV Import

例:

```csv
Username,Email,Role,Password,Max Instances,Max CPU Cores,Max Memory (GB),Max Storage (GB),Max GPU Count
```

実装上のルール:

- `Username`、`Role`、`Max Instances`、`Max CPU Cores`、`Max Memory (GB)`、`Max Storage (GB)` は必須
- `Email`、`Password`、`Max GPU Count` は任意
- `Password` が空の場合:
  - 管理者は `admin123`
  - 一般ユーザーは `user123`

## Documentation

- [README.md](./README.md)
- [README.zh-CN.md](./README.zh-CN.md)
- [README.ko.md](./README.ko.md)
- [README.de.md](./README.de.md)
- [TASK_BREAKDOWN.md](./TASK_BREAKDOWN.md)
- [dev_progress.md](./dev_progress.md)

## License

MIT
