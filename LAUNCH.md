# Where Files Are Used & How to Launch MedConnect

## 1. Files we created and where they’re used

### **Layout & shell (used on every page)**

| File | Used for |
|------|----------|
| `src/app/layout.tsx` | Root HTML, fonts, wraps the whole app |
| `src/components/layout/MainLayout.tsx` | Wraps every page with Navbar + Emergency button |
| `src/components/layout/Navbar.tsx` | Top navigation (Home, Patients, Eva, Nurses, Doctors, Pharmacy, etc.) |
| `src/components/ui/EmergencyButton.tsx` | Red emergency button on bottom-right of every page |
| `src/app/globals.css` | Global styles and healthcare color palette |

### **Shared logic**

| File | Used for |
|------|----------|
| `src/lib/constants.ts` | Brand name "MedConnect", AI name "Eva", risk levels (Mild/Moderate/Emergency) |
| `src/lib/subscription.ts` | Check/set if a patient is “subscribed” (used by dashboard gate) |
| `src/components/patient/SubscriptionGate.tsx` | Wraps patient dashboard: shows “Subscribe” if not subscribed, otherwise shows dashboard |

### **Pages (what each URL shows)**

| URL | File | Purpose |
|-----|------|--------|
| `/` | `src/app/page.tsx` | Home: platforms, “Subscribe”, “Talk to Eva” |
| `/subscribe` | `src/app/subscribe/page.tsx` | Subscription plans; “Subscribe” marks user subscribed and sends to dashboard |
| `/patient/dashboard` | `src/app/patient/dashboard/page.tsx` | Patient dashboard (only if subscribed; otherwise SubscriptionGate shows subscribe CTA) |
| `/patient/nurse-request` | `src/app/patient/nurse-request/page.tsx` | Request a nurse visit |
| `/patient/prescriptions` | `src/app/patient/prescriptions/page.tsx` | My prescriptions |
| `/patient/reminders` | `src/app/patient/reminders/page.tsx` | Health reminders |
| `/ai-diagnosis` | `src/app/ai-diagnosis/page.tsx` | Eva: “Hi Eva”, chat, symptom analysis (mock) |
| `/nurse` | `src/app/nurse/page.tsx` | Nurses platform: job queue, accept, status |
| `/doctor` | `src/app/doctor/page.tsx` | Doctors platform: consultations |
| `/pharmacy` | `src/app/pharmacy/page.tsx` | Pharmacy hub → links to Pharmacist & Dispatch |
| `/pharmacist` | `src/app/pharmacist/page.tsx` | Pharmacist: review/approve prescriptions |
| `/dispatch` | `src/app/dispatch/page.tsx` | Dispatch & delivery tracking |
| `/hmo` | `src/app/hmo/page.tsx` | HMO: link plan, coverage, hospitals |
| `/marketplace` | `src/app/marketplace/page.tsx` | Healthcare providers list |
| `marketplace/register` | `src/app/marketplace/register/page.tsx` | Provider registration |
| `/login` | `src/app/login/page.tsx` | Sign in (role select) |
| `/telemedicine` | `src/app/telemedicine/page.tsx` | Telemedicine (demo) |
| `/security` | `src/app/security/page.tsx` | Security & compliance info |

### **Config & deploy**

| File | Used for |
|------|----------|
| `next.config.ts` | Static export (`out`), no source maps, Turbopack cache |
| `netlify.toml` | Netlify: build command and publish directory `out` |
| `DEPLOY.md` | Instructions to build once and deploy to Netlify + your server |

---

## 2. How to launch it as a working project

### **Option A: Run locally (development)**

Best for day-to-day work and testing.

1. **Terminal**
   ```bash
   cd "/Users/mac/Documents/My Webprojects/medconnect"
   ```

2. **Install dependencies (first time only)**
   ```bash
   npm install
   ```

3. **Start the dev server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Go to **http://localhost:3000**
   - You’ll see the home page, nav, and emergency button.

5. **Try the flow**
   - **Patients:** Click “Patients” → you’ll see “Subscribe” (not subscribed). Click “View plans & subscribe” → pick a plan → you’re redirected to the patient dashboard.
   - **Eva:** Click “Eva” → type “Hi Eva” or describe symptoms → see mock responses.
   - **Nurses / Doctors / Pharmacy:** Use the nav to open each platform.

To stop: in the terminal press **Ctrl+C**.

---

### **Option B: Build and run production locally**

Use this to test the same thing you’ll deploy.

1. **Build**
   ```bash
   cd "/Users/mac/Documents/My Webprojects/medconnect"
   npm run build
   ```
   Wait until it finishes. The app is exported into the **`out`** folder.

2. **Serve the `out` folder (optional)**
   You need a simple static server. Examples:

   **With `npx serve`:**
   ```bash
   npx serve out
   ```
   Then open **http://localhost:3000** (or the port it prints).

   **With Python:**
   ```bash
   cd out && python3 -m http.server 8080
   ```
   Then open **http://localhost:8080**.

---

### **Option C: Deploy to Netlify**

1. **Build on your machine**
   ```bash
   cd "/Users/mac/Documents/My Webprojects/medconnect"
   npm run build
   ```
   This creates/updates the **`out`** folder.

2. **Deploy that folder**
   - Go to [app.netlify.com](https://app.netlify.com) → **Sites** → **Add new site** → **Deploy manually** (or “Drag and drop”).
   - Drag the **`out`** folder into the deploy zone.
   - Netlify will give you a live URL. That’s your working project on the web.

   **Or with Netlify CLI:**
   ```bash
   npm install -g netlify-cli
   netlify login
   netlify deploy --prod --dir=out
   ```

---

### **Option D: Deploy to your own server**

1. **Build**
   ```bash
   cd "/Users/mac/Documents/My Webprojects/medconnect"
   npm run build
   ```

2. **Upload the contents of `out`**
   - Copy **everything inside** the **`out`** folder (not the folder itself) to your server’s web root, e.g.:
     - **cPanel:** `public_html`
     - **VPS (Nginx/Apache):** e.g. `/var/www/medconnect`
   - No Node.js needed on the server; any static hosting works.

3. **Visit your domain**  
   Your site is live at your domain.

---

## 3. Quick reference

| Goal | Command or action |
|------|-------------------|
| Develop locally | `npm run dev` → open http://localhost:3000 |
| Build for deploy | `npm run build` → use **`out`** |
| Test build locally | `npx serve out` or `python3 -m http.server` in `out` |
| Deploy to Netlify | Drag **`out`** to Netlify or `netlify deploy --prod --dir=out` |
| Deploy to your server | Upload contents of **`out`** to web root |

The files listed above are what make the app work; the **`out`** folder after `npm run build` is what you deploy to have a working project live.
