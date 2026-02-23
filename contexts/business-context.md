# Business Context

## Project Overview
We are building a Real-Time Transaction Monitoring Dashboard
for a FinTech payment platform.

The system processes:
- ACH
- Card
- Wire transactions

The dashboard provides operational visibility,
real-time monitoring, and audit investigation capabilities.

---

## Core Business Capabilities

### 1. Summary Panel
Real-time breakdown of:
- ACH vs Card vs Wire
- Volume & count
- Percentage distribution
- Failure rate

Goal:
Enable leadership and risk teams to detect abnormal spikes instantly.

---

### 2. Transaction Table
High-density transaction grid with:

- Pagination
- Sorting
- Filtering
- Status badges (Success, Pending, Failed)
- Real-time row updates

Goal:
Allow operations teams to monitor and act efficiently under high load.

---

### 3. Detail Drawer
Side drawer displaying:

- Audit trail visualization
- Status transition timeline
- Transaction metadata
- Idempotency key
- Raw JSON payload

Goal:
Enable deep investigation without leaving the dashboard.

---

## KPIs

- Handle 50+ TPS
- UI remains responsive at 60fps
- Detect anomalies within 5 seconds
- Reduce investigation time by 30%
- Prevent duplicate transaction processing
