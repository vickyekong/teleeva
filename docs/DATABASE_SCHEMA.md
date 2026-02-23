# MedConnect — Database Schema Additions

**Rule:** Additive only. Do not drop or rename existing tables if any exist. These are additions for the healthcare ecosystem.

---

## 1. Assumptions

- Existing app currently has **no database** (client-only state). When you introduce a DB, these tables can be created as initial or additive migrations.
- Use **PostgreSQL** (or compatible) for relational data; optional encrypted fields as noted.
- All tables should have `id` (UUID or bigint), `created_at`, and optionally `updated_at`.

---

## 2. Core Tables (Additions)

### Users & auth (extend if you already have users)

```sql
-- Only if no users table exists; otherwise add columns to existing.
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255),           -- or use auth provider
  role VARCHAR(50) NOT NULL,            -- patient | nurse | pharmacist | doctor | hospital | lab | admin
  full_name VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  phone VARCHAR(50),
  avatar_url VARCHAR(500),
  metadata JSONB,
  UNIQUE(user_id)
);
```

### Patient module

```sql
CREATE TABLE patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  date_of_birth DATE,
  blood_type VARCHAR(10),
  allergies TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE medical_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  record_type VARCHAR(50),              -- diagnosis | procedure | allergy | chronic
  summary TEXT,
  recorded_at TIMESTAMPTZ,
  encrypted_payload BYTEA,              -- optional: encrypted details
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  name VARCHAR(255),
  phone VARCHAR(50),
  relationship VARCHAR(50),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE hmo_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  provider_name VARCHAR(255),
  member_id VARCHAR(100),
  group_number VARCHAR(100),
  coverage_details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### AI diagnosis & pharmacist workflow

```sql
CREATE TABLE diagnosis_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  session_id VARCHAR(100),
  symptoms_text TEXT NOT NULL,
  ai_risk_level VARCHAR(20),            -- mild | moderate | emergency
  ai_confidence INTEGER,
  ai_conditions JSONB,
  ai_medications JSONB,
  status VARCHAR(50) DEFAULT 'pending',  -- pending | pharmacist_review | approved | modified | escalated
  pharmacist_id UUID REFERENCES users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  diagnosis_request_id UUID REFERENCES diagnosis_requests(id),
  patient_id UUID NOT NULL REFERENCES patients(id),
  pharmacist_id UUID REFERENCES users(id),
  medications JSONB NOT NULL,            -- [{ name, dosage, notes }]
  status VARCHAR(50) DEFAULT 'draft',   -- draft | approved | dispatched | delivered
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Nurse & treatment requests

```sql
CREATE TABLE treatment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES patients(id),
  reason TEXT,
  address_or_lat_lng VARCHAR(500),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  diagnosis_summary_id UUID REFERENCES diagnosis_requests(id),
  status VARCHAR(50) DEFAULT 'pending', -- pending | assigned | en_route | in_progress | completed
  assigned_nurse_id UUID REFERENCES users(id),
  assigned_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE nurse_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id),
  treatment_request_id UUID REFERENCES treatment_requests(id),
  amount DECIMAL(10, 2),
  period_start DATE,
  period_end DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Pharmacy & dispatch

```sql
CREATE TABLE pharmacies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  address TEXT,
  contact_phone VARCHAR(50),
  verification_status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE drug_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pharmacy_id UUID NOT NULL REFERENCES pharmacies(id),
  drug_name VARCHAR(255),
  quantity INTEGER DEFAULT 0,
  unit VARCHAR(50),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE delivery_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_id UUID NOT NULL REFERENCES prescriptions(id),
  pharmacy_id UUID REFERENCES pharmacies(id),
  status VARCHAR(50) DEFAULT 'pending',  -- pending | dispatched | in_transit | delivered
  estimated_arrival TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Emergency

```sql
CREATE TABLE emergency_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES patients(id),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  address_snapshot VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active',   -- active | acknowledged | resolved
  admin_acknowledged_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE emergency_contact_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  emergency_alert_id UUID NOT NULL REFERENCES emergency_alerts(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES emergency_contacts(id),
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  channel VARCHAR(20)                  -- sms | email | push
);
```

### Provider management

```sql
CREATE TABLE providers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  provider_type VARCHAR(50),           -- hospital | pharmacy | nurse | pharmacist | doctor | lab
  business_name VARCHAR(255),
  license_number VARCHAR(100),
  verification_status VARCHAR(50) DEFAULT 'pending',
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Audit (compliance)

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id VARCHAR(100),
  details JSONB,
  ip_address VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 3. Indexes (suggested)

```sql
CREATE INDEX idx_diagnosis_requests_status ON diagnosis_requests(status);
CREATE INDEX idx_diagnosis_requests_patient ON diagnosis_requests(patient_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);
CREATE INDEX idx_treatment_requests_status ON treatment_requests(status);
CREATE INDEX idx_treatment_requests_nurse ON treatment_requests(assigned_nurse_id);
CREATE INDEX idx_emergency_alerts_status ON emergency_alerts(status);
CREATE INDEX idx_audit_logs_user_created ON audit_logs(user_id, created_at);
```

---

## 4. Migration strategy

1. Create DB and run migrations in order: users → patients → diagnosis/prescriptions → treatment/delivery → emergency → providers → audit.
2. Do not alter existing tables if you later add an existing system; only add new tables or new columns with defaults.
3. Use encrypted columns (e.g. `encrypted_payload`) for highly sensitive fields where required by policy; handle encryption in application layer.
