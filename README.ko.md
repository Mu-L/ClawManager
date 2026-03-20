# ClawManager

<p align="center">
  <img src="frontend/public/openclaw_github_logo.png" alt="ClawManager" width="100%" />
</p>

<p align="center">
  ClawManager는 ClawReef를 기반으로 Kubernetes에서 OpenClaw 및 Linux 데스크톱 런타임을 운영하기 위해 확장된 컨트롤 플레인입니다.
</p>

<p align="center">
  <strong>Languages:</strong>
  <a href="./README.md">English</a> |
  <a href="./README.zh-CN.md">中文</a> |
  <a href="./README.ja.md">日本語</a> |
  한국어 |
  <a href="./README.de.md">Deutsch</a>
</p>

## News

- [2026-03-20] README를 최신 구현 상태에 맞게 갱신했습니다. Portal 접근, Webtop 런타임, 런타임 이미지 카드, 클러스터 리소스 개요, 비밀번호 변경, OpenClaw 가져오기 / 내보내기가 반영되었습니다.

## Overview

ClawManager는 Kubernetes 기반 가상 데스크톱 관리라는 ClawReef의 목표를 유지하면서, 더 완전한 데스크톱 운영 제어면으로 확장한 프로젝트입니다.

현재 구현된 주요 기능:

- 멀티 사용자 데스크톱 인스턴스 관리
- 관리자 / 일반 사용자 분리 화면
- 인스턴스 수, CPU, 메모리, 스토리지, GPU 할당량 관리
- 백엔드 프록시 기반 안전한 데스크톱 접근
- 인스턴스 상세 페이지와 `/portal` 에서의 임베드 접근
- OpenClaw 워크스페이스 내보내기 / 가져오기
- 런타임 이미지 오버라이드 설정
- 관리자용 클러스터 리소스 개요
- 영어, 중국어, 일본어, 한국어, 독일어 다국어 UI

## Current Capabilities

### User Side

- 회원가입, 로그인, 토큰 갱신, 로그아웃, 비밀번호 변경
- 할당량 검증이 포함된 인스턴스 생성
- 지원 런타임: `openclaw`, `webtop`, `ubuntu`, `debian`, `centos`, `custom`
- 인스턴스 시작, 중지, 재시작, 삭제, 조회
- 실행 중 데스크톱 접근:
  - 인스턴스 상세 페이지
  - `/portal` 워크스페이스 포털
- 단기 액세스 토큰 생성
- `openclaw` 인스턴스 워크스페이스 가져오기 / 내보내기

### Admin Side

- 관리자 대시보드
- 사용자 생성, 삭제, 역할 변경, 할당량 변경
- CSV 기반 사용자 일괄 가져오기
- 전체 사용자 대상 인스턴스 관리
- 런타임 이미지 카드 관리
- 클러스터 리소스 개요
- 설정 페이지의 비밀번호 변경

### Backend / Platform

- `/api/v1` REST API
- JWT 인증
- WebSocket 엔드포인트
- Kubernetes 기반 인스턴스 라이프사이클 관리
- HTTP / WebSocket 데스크톱 프록시
- 인스턴스 상태 동기화 서비스

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

참고:

- 데스크톱 트래픽은 인증된 백엔드 프록시 경로로 제공됩니다.
- 클러스터 가시성과 라이프사이클 기능에는 Kubernetes 연결이 필요합니다.
- 일부 패키지명에는 과거 이름인 `clawreef` 가 남아 있지만 제품명은 ClawManager입니다.

## Quick Start

### Prerequisites

- MySQL 8.0+
- 접근 가능한 Kubernetes 클러스터
- 사용 가능한 `kubectl`
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

기본 개발 주소:

- `http://localhost:9001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

기본 프런트엔드 주소:

- `http://localhost:9002`

### Database Bootstrap

```bash
cd backend
go run cmd/initdb/main.go
```

기본 관리자 계정:

- `admin / admin123`

## CSV Import

예시:

```csv
Username,Email,Role,Password,Max Instances,Max CPU Cores,Max Memory (GB),Max Storage (GB),Max GPU Count
```

구현 기준 규칙:

- `Username`, `Role`, `Max Instances`, `Max CPU Cores`, `Max Memory (GB)`, `Max Storage (GB)` 는 필수
- `Email`, `Password`, `Max GPU Count` 는 선택
- `Password` 가 비어 있으면:
  - 관리자 기본값은 `admin123`
  - 일반 사용자 기본값은 `user123`

## Documentation

- [README.md](./README.md)
- [README.zh-CN.md](./README.zh-CN.md)
- [README.ja.md](./README.ja.md)
- [README.de.md](./README.de.md)
- [TASK_BREAKDOWN.md](./TASK_BREAKDOWN.md)
- [dev_progress.md](./dev_progress.md)

## License

MIT
