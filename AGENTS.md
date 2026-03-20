# ClawReef - AI Agent Guidelines

## Project Overview

ClawReef is a virtual desktop management platform on Kubernetes. Users create and manage virtual desktops (OpenClaw, Ubuntu, etc.) with admin-controlled quotas.

**Tech Stack:**
- Frontend: React 19, Tailwind CSS 4, TypeScript 5.9, Vite 7
- Backend: Golang 1.21+, Gin 1.9+, upper/db 4.x, MySQL 8.0+
- Infrastructure: Kubernetes, Docker

---

## Build/Lint/Test Commands

### Frontend (Vite + React)
```bash
# Development
npm install
npm run dev

# Production build
npm run build

# Type checking
npx tsc --noEmit

# Linting
npm run lint

# Run tests
npm run test

# Run single test
npm run test -- src/components/Button.test.tsx
npm run test -- --testNamePattern="should render"
```

### Backend (Golang)
```bash
# Build
make build
# OR
go build -o bin/clawreef cmd/main.go

# Run tests
make test
# OR
go test ./...

# Run single test
go test -run TestCreateInstance ./internal/services

# Linting
make lint
# OR
golangci-lint run

# Format
go fmt ./...

# Tidy dependencies
go mod tidy
```

---

## Code Style Guidelines

### Go Backend

#### Imports
```go
import (
    // stdlib
    "context"
    "fmt"
    "time"
    
    // third-party
    "github.com/gin-gonic/gin"
    "github.com/upper/db/v4"
    
    // internal
    "clawreef/internal/models"
    "clawreef/internal/repository"
)
```

#### Naming
- Types: `PascalCase` (UserService, InstanceConfig)
- Functions: `PascalCase` exported, `camelCase` private
- Variables: `camelCase` (userID, instanceCount)
- Constants: `PascalCase` or `camelCase`

#### Error Handling
```go
if err != nil {
    return fmt.Errorf("failed to create instance: %w", err)
}

if errors.Is(err, db.ErrNoMoreRows) {
    return nil, nil
}
```

#### Database (upper/db)
```go
type User struct {
    ID        int        `db:"id,primarykey,autoincrement"`
    Username  string     `db:"username"`
    CreatedAt time.Time  `db:"created_at"`
    DeletedAt *time.Time `db:"deleted_at"`
}
```

### React/TypeScript Frontend

#### File Organization
```
src/
├── components/    # Reusable UI
├── pages/        # Route components
├── hooks/        # Custom hooks
├── lib/          # Utilities
├── services/     # API clients
└── types/        # TypeScript types
```

#### Naming
- Components: `PascalCase` (InstanceCard.tsx)
- Hooks: `camelCase` with `use` (useInstance.ts)
- Utils: `camelCase` (formatDate.ts)

#### Component Pattern
```tsx
export function InstanceCard({ instance }: InstanceCardProps) {
  return <Card>{instance.name}</Card>;
}

interface InstanceCardProps {
  instance: Instance;
  onDelete?: (id: number) => void;
}
```

---

## Project Conventions

### API Design
- RESTful: `/api/v1/`
- JSON request/response
- HTTP codes: 200, 201, 400, 401, 404, 500

### K8s Naming
```
Namespace: clawreef-{userId}-{instanceId}
PVC: clawreef-{instanceId}-pvc
Pod: clawreef-{instanceId}-pod
```

### Git Workflow
- Main: `main`
- Feature: `feature/description`
- Fix: `fix/description`
- Commits: English, present tense

---

## Testing

### Go
- Table-driven tests
- Mock external deps
- Files: `*_test.go`

### React
- React Testing Library
- Test user interactions
- Mock API with MSW

---

**Docs in Chinese, code comments in English**
