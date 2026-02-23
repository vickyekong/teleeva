# MedConnect – AI-Powered Healthcare Platform

A modern, secure medical web platform connecting patients, nurses, pharmacists, hospitals, and emergency response teams in real time.

## Brand: MedConnect

## Tech Stack

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS
- **Database & Auth:** Supabase (PostgreSQL, Row Level Security, Auth)
- **Backend:** Node.js (add Express/Fastify for API routes if needed)
- **AI:** OpenAI API (integrate in `/api/ai` for diagnosis)
- **Maps:** Google Maps API (for nurse tracking, emergency location)
- **Real-time:** WebSockets (Socket.io or Pusher)

## Features

### Core

1. **AI Medical Diagnosis** – Chat/voice symptoms → conditions, treatment, prescriptions (risk level, confidence, disclaimer)
2. **Remote Pharmacist Verification** – Review, modify, approve prescriptions → dispatch
3. **Live Nurse On-Demand** – Request nurse, GPS tracking, AI summary
4. **Emergency Response** – Red button on all pages → alert teams, ambulance, notify contacts
5. **HMO Integration** – Link plans, coverage, approved hospitals, insurance payments
6. **Healthcare Marketplace** – Nurses, pharmacists, doctors, hospitals, labs – profiles, ratings, earnings
7. **Patient Dashboard** – History, prescriptions, appointments, nurse status, AI chat
8. **Dispatch & Logistics** – Auto-dispatch after approval, delivery tracking, ETA

### Security

- HIPAA-style data privacy
- Secure authentication
- Encrypted medical records
- Role-based access control

### Bonus

- AI triage, health reminders, chronic disease monitoring
- Family health accounts
- Telemedicine video calls

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Supabase (database & auth)

The app includes Supabase for database and authentication. Base tables: **profiles** (users/roles), **patients**, **diagnosis_requests** (cases), **emergency_alerts**. All existing UI is unchanged.

1. Copy `env.local.example` to `.env.local` and set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. Run the SQL in `supabase/migrations/` in the Supabase SQL Editor (or use Supabase CLI).
3. See **docs/SUPABASE_SETUP.md** for details and client usage.

## Environment Variables (for production)

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_key
GOOGLE_MAPS_API_KEY=your_key
```

## Project Structure

```
src/
├── app/
│   ├── ai-diagnosis/      # AI symptom chat
│   ├── patient/           # Dashboard, nurse request, prescriptions, reminders
│   ├── pharmacist/        # Prescription verification
│   ├── nurse/             # Nurse job queue
│   ├── hmo/               # Insurance integration
│   ├── marketplace/       # Providers, register
│   ├── dispatch/          # Delivery logistics
│   ├── telemedicine/      # Video calls
│   ├── security/          # Compliance info
│   └── login/
├── components/
│   ├── layout/            # Navbar, MainLayout
│   └── ui/                # EmergencyButton
└── lib/
    └── constants.ts       # Brand, roles, risk levels
```

## Monetization

- Commission per nurse visit
- Subscription plans
- HMO billing integration
- Provider service fees
