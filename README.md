# SENTINEL-FIN — AI-Powered Financial Threat Intelligence & Secure Budget Monitoring Platform

[![System Architecture](https://img.shields.io/badge/Architecture-Full--Stack%20%7C%20Express%20%7C%20React-blue.svg)](#architecture)
[![Security Standard](https://img.shields.io/badge/Security-SHA256%20Hash%20Chain%20%7C%20Strict%20RBAC-emerald.svg)](#security--governance)
[![Status](https://img.shields.io/badge/Status-Fully%20Integrated%20%7C%20Demo--Ready-brightgreen.svg)](#status)

**SENTINEL-FIN** is a secure financial monitoring platform that tracks budget allocation and expenditure, detects unusual spending patterns using a hybrid 3-layer analytical detection engine, correlates financial anomalies with security events, calculates explainable additive risk scores, and maintains secure role-based governance with a tamper-evident audit log.

---

## 🏛️ System Architecture

```text
                  SENTINEL-FIN ARCHITECTURE
┌───────────────────────────────────────────────────────────┐
│                     React 18 Frontend                     │
│        Vibrant Light & Dark Mode Executive Themes         │
└─────────────────────────────┬─────────────────────────────┘
                              │ REST APIs (JSON & Bearer JWT)
┌─────────────────────────────▼─────────────────────────────┐
│                    Express 4.x Backend                    │
│      Strict Middleware RBAC (ADMIN / ANALYST / AUDITOR)   │
├───────────────────────────────────────────────────────────┤
│    3-Layer Hybrid Anomaly Engine & Risk Point Calculator │
│  • Layer 1: Rule-Based (Overspending, Bursts, Outliers)   │
│  • Layer 2: Statistical & Benford's Law Analytical Signal  │
│  • Layer 3: Pattern (Threshold Avoidance Structuring)     │
│  • Explainable Risk Breakdown (+20 Outlier, +25 Avoidance)│
│  • Security + Financial Multi-Vector Event Correlation    │
├───────────────────────────────────────────────────────────┤
│    Tamper-Evident SHA-256 Audit Log Hash Chain Service    │
│  • `GET /api/audit-logs/verify` (Chain Integrity Check)  │
└─────────────────────────────┬─────────────────────────────┘
                              │ MongoDB Persistence
┌─────────────────────────────▼─────────────────────────────┐
│                    MongoDB Database                       │
│    10 Collections (Users, Budgets, Expenditures, Alerts,  │
│    Vendors, SecurityEvents, AIRules, AuditLogs, etc.)     │
└───────────────────────────────────────────────────────────┘
```

---

## 🔥 Key System Capabilities

1. **Dynamic Budget Intelligence**: Continuous real-time calculations of expenditure velocity and capital at risk.
2. **3-Layer Hybrid Anomaly Engine**: Combines rule-based boundaries, statistical outlier scoring (Z-score & Benford's Law), and structural pattern detection.
3. **Potential Threshold Avoidance Detection**: Automatically flags split transactions structured just below approval ceilings (e.g. multiple transfers in ₹4.25L–₹4.99L range within 24h).
4. **Explainable Risk Analysis**: Replaces black-box scores with transparent additive point breakdowns (+20 High-Value Outlier, +25 Threshold Avoidance).
5. **Multi-Vector Event Correlation**: Correlates security events (e.g. failed login bursts) with financial ledger spikes into unified incidents.
6. **Tamper-Evident Audit Hash Chain**: Implements SHA-256 cryptographic block chaining for audit records with an active verification routine (`verifyAuditChain`).
7. **Strict Backend-Enforced RBAC**: Enforces granular permissions for **ADMIN**, **ANALYST**, and **AUDITOR** roles at the API middleware layer.

---

## 🔐 Security & Governance Model

| Role | Operational Access | Spend/Budget Modifies | System Rules & Users | Audit Chain Verification |
| :--- | :--- | :---: | :---: | :---: |
| **ADMIN** (CISO / Director) | Full Control | ✅ Allowed | ✅ Allowed | ✅ Full Access |
| **ANALYST** (Risk Specialist) | Triage & Escalate | ✅ Allowed | ❌ Forbidden (403) | ✅ Read-Only |
| **AUDITOR** (External Auditor) | Read-Only Audit | ❌ Forbidden (403) | ❌ Forbidden (403) | ✅ Read-Only (Verify Chain) |

---

## 🚀 Quick Start Guide

### Prerequisites
* **Node.js**: v18.x or higher
* **MongoDB**: Running instance locally (`mongodb://localhost:27017/sentinel-fin`) or MongoDB Atlas.

### 1. Launch Backend Server & Initialize Database
```bash
# Navigate to backend directory
cd server

# Install dependencies
npm install

# Initialize clean scenario database & seed data
npm run seed

# Start Express server on http://localhost:5000
npm start
```

### 2. Launch Frontend Web Application
```bash
# Navigate to project root
npm install

# Start Vite dev server on http://localhost:5173
npm run dev
```

---

## 🧪 Verification & Testing Endpoints

* **Health Check**: `GET http://localhost:5000/health`
* **Audit Chain Integrity Routine**: `GET http://localhost:5000/api/audit-logs/verify`
* **Financial Risk Investigation Reports**: `POST http://localhost:5000/api/reports/financial-risk-investigation`

---

## 📜 License
This project is licensed under the MIT License — built for academic defense, governance research, and enterprise threat intelligence demonstrations.
