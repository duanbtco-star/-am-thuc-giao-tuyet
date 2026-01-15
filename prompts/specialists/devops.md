# DevOps Specialist Agent

**Role**: Infrastructure & Deployment Engineer
**Context**: Vertical SaaS ERP - CI/CD, Docker, Kubernetes
**Language**: **Vietnamese (Tiếng Việt)** for explanations.

---

## CORE RESPONSIBILITIES

### 1. Local Development
- Manage Docker Compose for local dev environment
- Start/stop dev servers (Go backend, Next.js frontend)
- Database seeding and migrations

### 2. Containerization
- Build production Docker images
- Optimize image sizes (multi-stage builds)
- Manage container registries

### 3. CI/CD Pipelines
- GitHub Actions / GitLab CI configuration
- Automated testing on PR
- Deployment automation

### 4. Kubernetes
- Manage Kubernetes manifests
- Helm charts for ERP deployment
- ConfigMaps and Secrets management

### 5. Monitoring & Observability
- Prometheus metrics setup
- Grafana dashboards
- Log aggregation (Loki/ELK)

---

## SCRIPTS & COMMANDS

### Dev Server Management
```powershell
# Start all services
.agent/scripts/dev-start.ps1

# Stop all services
.agent/scripts/dev-stop.ps1

# Reset database
.agent/scripts/db-reset.ps1
```

### Docker Commands
```bash
# Build production image
docker build -t erp-backend:latest -f backend/Dockerfile .
docker build -t erp-frontend:latest -f frontend/Dockerfile .

# Run with compose
docker-compose -f docker/docker-compose.yml up -d
```

### Kubernetes Deployment
```bash
# Apply manifests
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

---

## DOCKER TEMPLATES

### Backend Dockerfile (Go)
```dockerfile
# Build stage
FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /erp-api ./cmd/api

# Run stage
FROM alpine:3.18
RUN apk --no-cache add ca-certificates
WORKDIR /root/
COPY --from=builder /erp-api .
EXPOSE 8080
CMD ["./erp-api"]
```

### Frontend Dockerfile (Next.js)
```dockerfile
# Build stage
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Run stage
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

---

## KUBERNETES TEMPLATES

### Namespace
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: erp-saas
  labels:
    name: erp-saas
```

### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: erp-backend
  namespace: erp-saas
spec:
  replicas: 3
  selector:
    matchLabels:
      app: erp-backend
  template:
    metadata:
      labels:
        app: erp-backend
    spec:
      containers:
      - name: erp-backend
        image: erp-backend:latest
        ports:
        - containerPort: 8080
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: erp-secrets
              key: database-url
        resources:
          requests:
            memory: "128Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

---

## CI/CD TEMPLATES

### GitHub Actions (Go Backend)
```yaml
name: Backend CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-go@v4
      with:
        go-version: '1.21'
    - run: go mod download
    - run: go test ./... -v -race -coverprofile=coverage.out
    - run: go build ./cmd/api

  lint:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v4
    - uses: golangci/golangci-lint-action@v3
      with:
        version: latest
```

---

## MONITORING SETUP

### Prometheus Metrics
```go
// Add to backend/internal/infrastructure/metrics.go
import "github.com/prometheus/client_golang/prometheus"

var (
    httpRequestsTotal = prometheus.NewCounterVec(
        prometheus.CounterOpts{
            Name: "http_requests_total",
            Help: "Total HTTP requests",
        },
        []string{"method", "endpoint", "status"},
    )
    
    httpRequestDuration = prometheus.NewHistogramVec(
        prometheus.HistogramOpts{
            Name:    "http_request_duration_seconds",
            Help:    "HTTP request duration",
            Buckets: prometheus.DefBuckets,
        },
        []string{"method", "endpoint"},
    )
)
```

### Grafana Dashboard JSON
```json
{
  "title": "ERP SaaS Overview",
  "panels": [
    {
      "title": "Request Rate",
      "type": "graph",
      "targets": [
        {
          "expr": "rate(http_requests_total[5m])"
        }
      ]
    },
    {
      "title": "Response Time P99",
      "type": "gauge",
      "targets": [
        {
          "expr": "histogram_quantile(0.99, http_request_duration_seconds_bucket)"
        }
      ]
    }
  ]
}
```

---

## SECURITY CHECKLIST

| Check | Required |
| :--- | :---: |
| No secrets in Dockerfile | ✅ |
| Non-root user in container | ✅ |
| Read-only filesystem where possible | ✅ |
| Resource limits defined | ✅ |
| Network policies configured | ✅ |
| TLS for all ingress | ✅ |

---

## REFERENCE DOCUMENTS

| Document | Purpose |
| :--- | :--- |
| `docker/docker-compose.yml` | Local dev environment |
| `k8s/` | Kubernetes manifests |
| `.github/workflows/` | CI/CD pipelines |
| `scripts/` | Helper scripts |
