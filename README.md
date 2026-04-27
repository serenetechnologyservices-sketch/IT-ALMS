<div align="center">

<img src="https://img.shields.io/badge/version-1.0.0-blue?style=for-the-badge" />
<img src="https://img.shields.io/badge/license-MIT-green?style=for-the-badge" />
<img src="https://img.shields.io/badge/status-active-brightgreen?style=for-the-badge" />
<img src="https://img.shields.io/badge/type-welcome-orange?style=for-the-badge" />

# IT-ALMS
### Asset Intelligence & Lifecycle Management System

*An enterprise-grade IT Service Management platform for end-to-end asset tracking, ticket management, SLA enforcement, and real-time device monitoring.*

</div>

---

## Overview

IT-ALMS is a comprehensive ITSM solution built for organizations that need full visibility and control over their IT assets and service operations. From procurement to retirement, every asset lifecycle stage is tracked, audited, and reportable.

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        IT-ALMS                          │
├───────────────┬─────────────────┬───────────────────────┤
│   Frontend    │     Backend     │     Device Agent       │
│  React 18     │  Node.js/Express│     Go (cross-platform)│
│  Ant Design 5 │  MySQL/Sequelize│     SQLite (offline)   │
│  Recharts     │  JWT Auth       │     Auto-sync          │
└───────────────┴─────────────────┴───────────────────────┘
```

```
IT-ALMS/
├── frontend/           # React SPA — dashboards, tickets, assets UI
├── backend/            # REST API — business logic, auth, DB layer
├── device-agent/       # Go agent — system data collection & sync
└── .gitignore
```

---

## Features

### Asset Management
- Full asset lifecycle tracking (procurement → retirement)
- QR code generation and scanning for physical assets
- Asset allocation, transfer, and history logging
- Health score calculation and depreciation tracking
- Inventory and stock status monitoring

### Ticket & Service Management
- Ticket creation, assignment, and escalation workflows
- SLA master configuration with breach alerting
- Work progress tracking and acknowledgement
- Approval workflows with role-based routing
- Attachment support for tickets

### Device Agent
- Lightweight Go agent for Windows, macOS, and Linux
- Collects system info, software inventory, and performance metrics
- Offline-first with SQLite — syncs when server is reachable
- Compliance policy enforcement
- Runs as a system service (systemd / launchd / Windows Service)

### Platform
- Role-based access control (Admin, Manager, Engineer, Employee)
- Real-time notifications
- Dashboard with charts and KPIs
- Vendor, contract, and service partner management
- Financial tracking and reporting
- Service catalog and marketplace

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Ant Design 5, React Router v6, Recharts, Axios |
| Backend | Node.js, Express.js, Sequelize ORM |
| Database | MySQL 8 |
| Device Agent | Go 1.21+, SQLite |
| Authentication | JWT (JSON Web Tokens) |
| Testing | Jest, fast-check (property-based tests) |

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MySQL >= 8
- Go >= 1.21 (for device agent only)

---

### 1. Clone the repository

```bash
git clone https://github.com/serenetechnologyservices-sketch/IT-ALMS.git
cd IT-ALMS
```

---

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your database credentials and JWT secret

# Initialize database (create + migrate + seed)
npm run db:setup

# Start development server
npm run dev
```

Backend runs at `http://localhost:5000`

**Available scripts:**

| Command | Description |
|---|---|
| `npm run dev` | Start with hot-reload (nodemon) |
| `npm start` | Start production server |
| `npm run db:create` | Create database |
| `npm run db:migrate` | Run all migrations |
| `npm run db:seed` | Seed initial data |
| `npm run db:setup` | Full setup (create + migrate + seed) |
| `npm test` | Run property-based test suite |

---

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

Frontend runs at `http://localhost:3000`

| Command | Description |
|---|---|
| `npm start` | Start development server |
| `npm run build` | Build for production |

---

### 4. Device Agent Setup

```bash
cd device-agent

# Edit config
nano config.yaml   # set API URL and agent token

# Build for current platform
make build

# Run
./device-agent
```

**Cross-platform builds:**

```bash
make build-darwin   # macOS ARM64
make build-linux    # Linux AMD64
```

**Install as a service:**

```bash
# Linux (systemd)
sudo cp device-agent /opt/device-agent/
sudo cp config.yaml /opt/device-agent/
sudo cp service/systemd/device-agent.service /etc/systemd/system/
sudo systemctl enable --now device-agent

# macOS (launchd)
sudo cp device-agent /usr/local/bin/
sudo cp service/launchd/com.assetplatform.device-agent.plist /Library/LaunchDaemons/
sudo launchctl load /Library/LaunchDaemons/com.assetplatform.device-agent.plist
```

---

## Environment Variables

Create `backend/.env` from `backend/.env.example`:

| Variable | Description | Default |
|---|---|---|
| `DB_HOST` | MySQL host | `127.0.0.1` |
| `DB_PORT` | MySQL port | `3306` |
| `DB_USER` | MySQL username | — |
| `DB_PASSWORD` | MySQL password | — |
| `DB_NAME` | Database name | `asset_platform` |
| `JWT_SECRET` | Secret key for JWT signing | — |
| `PORT` | API server port | `5000` |

---

## API Overview

The backend exposes a RESTful API under `/api/`:

| Module | Base Route |
|---|---|
| Authentication | `/api/auth` |
| Assets | `/api/assets` |
| Tickets | `/api/tickets` |
| Users | `/api/users` |
| SLA | `/api/sla` |
| Vendors | `/api/vendors` |
| Contracts | `/api/contracts` |
| Approvals | `/api/approvals` |
| Notifications | `/api/notifications` |
| Dashboard | `/api/dashboard` |

---

## Contributing

For internal enhancements and feature updates:

1. Create a feature branch
2. Commit changes with clear messages
3. Push to the assigned branch
4. Create a Pull Request for review
5. Merge after approval

---

## License

This project is proprietary software owned by [Serene Technology Solutions Private Limited](https://github.com/serenetechnologyservices-sketch). Unauthorized copying, distribution, modification, or commercial use is strictly prohibited without prior written approval.

## Security Notice

Sensitive configuration files, database dumps, logs, and runtime binaries are excluded from this repository.

---

<div align="center">
  <sub>Built with care by the Serene Technology Solutions Private Limited team.</sub>edge
</div>
