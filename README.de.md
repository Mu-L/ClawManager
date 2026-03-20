# ClawManager

<p align="center">
  <img src="frontend/public/openclaw_github_logo.png" alt="ClawManager" width="100%" />
</p>

<p align="center">
  ClawManager ist die auf ClawReef aufbauende Control Plane zum Betrieb von OpenClaw- und Linux-Desktop-Runtimes auf Kubernetes.
</p>

<p align="center">
  <strong>Languages:</strong>
  <a href="./README.md">English</a> |
  <a href="./README.zh-CN.md">中文</a> |
  <a href="./README.ja.md">日本語</a> |
  <a href="./README.ko.md">한국어</a> |
  Deutsch
</p>

## News

- [2026-03-20] README an den aktuellen Implementierungsstand angepasst, einschließlich Portal-Zugriff, Webtop-Runtime, Runtime-Image-Karten, Cluster-Ressourcenübersicht, Passwortänderung sowie OpenClaw Import / Export.

## Überblick

ClawManager übernimmt das ursprüngliche Ziel von ClawReef, virtuelle Desktops auf Kubernetes zu verwalten, und erweitert es zu einer umfassenderen Betriebsoberfläche für Desktop-Runtimes.

Aktuell umgesetzt sind unter anderem:

- Multi-User-Verwaltung von Desktop-Instanzen
- getrennte Oberflächen für Admins und Benutzer
- Quoten für Instanzanzahl, CPU, Speicher, Storage und GPU
- sicherer Desktop-Zugriff über Backend-Proxy
- eingebetteter Zugriff in der Instanzdetailseite und über `/portal`
- OpenClaw-Workspace Export / Import
- zentrale Runtime-Image-Overrides
- Cluster-Ressourcenübersicht für Administratoren
- mehrsprachige UI in Englisch, Chinesisch, Japanisch, Koreanisch und Deutsch

## Current Capabilities

### User Side

- Registrierung, Login, Token-Refresh, Logout und Passwortänderung
- Instanzerstellung mit Quotenprüfung
- Unterstützte Runtimes: `openclaw`, `webtop`, `ubuntu`, `debian`, `centos`, `custom`
- Starten, Stoppen, Neustarten, Löschen und Anzeigen von Instanzen
- Zugriff auf laufende Desktops über:
  - die Instanzdetailseite
  - das `/portal`
- Erzeugung kurzlebiger Zugriffstoken
- Export / Import von Workspaces für `openclaw`-Instanzen

### Admin Side

- Admin-Dashboard
- Benutzer anlegen, löschen, Rollen ändern, Quoten ändern
- CSV-Benutzerimport
- globale Instanzverwaltung über alle Benutzer hinweg
- Verwaltung von Runtime-Image-Karten
- Cluster-Ressourcenübersicht
- Passwortänderung im Einstellungsbereich

### Backend / Platform

- `/api/v1` REST API
- JWT-Authentifizierung
- WebSocket-Endpunkt
- Kubernetes-basierte Instanz-Lifecycle-Verwaltung
- HTTP / WebSocket Proxy für Desktop-Traffic
- Status-Synchronisationsdienst für Instanzen

## Architektur

```text
Browser
  -> React frontend
  -> Go/Gin backend
  -> MySQL
  -> Kubernetes API
  -> Namespace / Pod / PVC / Service
  -> OpenClaw / Webtop / Linux desktop runtime
```

Hinweise:

- Desktop-Traffic wird über authentifizierte Backend-Proxy-Routen bereitgestellt.
- Cluster-Sichtbarkeit und Lifecycle-Funktionen benötigen Kubernetes-Zugriff vom Backend.
- Einige Paketnamen enthalten historisch noch `clawreef`, der Produktname ist jedoch ClawManager.

## Quick Start

### Voraussetzungen

- MySQL 8.0+
- erreichbarer Kubernetes-Cluster
- nutzbares `kubectl`
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

Standardadresse in der Entwicklung:

- `http://localhost:9001`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Standardadresse des Frontends:

- `http://localhost:9002`

### Datenbankinitialisierung

```bash
cd backend
go run cmd/initdb/main.go
```

Standard-Admin-Konto:

- `admin / admin123`

## CSV Import

Beispiel:

```csv
Username,Email,Role,Password,Max Instances,Max CPU Cores,Max Memory (GB),Max Storage (GB),Max GPU Count
```

Aktuelle Regeln in der Implementierung:

- `Username`, `Role`, `Max Instances`, `Max CPU Cores`, `Max Memory (GB)` und `Max Storage (GB)` sind Pflichtfelder
- `Email`, `Password` und `Max GPU Count` sind optional
- falls `Password` leer ist:
  - Admin erhält `admin123`
  - Benutzer erhält `user123`

## Dokumentation

- [README.md](./README.md)
- [README.zh-CN.md](./README.zh-CN.md)
- [README.ja.md](./README.ja.md)
- [README.ko.md](./README.ko.md)
- [TASK_BREAKDOWN.md](./TASK_BREAKDOWN.md)
- [dev_progress.md](./dev_progress.md)

## License

MIT
