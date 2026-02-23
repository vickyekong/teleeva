/**
 * Content for medical blog, news (Africa & Nigeria), and achievements.
 * Replace with CMS or API later.
 */

export const BLOG_POSTS = [
  {
    slug: "understanding-hypertension-in-africa",
    title: "Understanding hypertension in Africa: prevalence and care",
    excerpt: "Hypertension is a leading risk factor across the continent. We look at prevalence, barriers to care, and how digital tools can support control.",
    date: "2025-02-15",
    category: "Chronic care",
    image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80",
  },
  {
    slug: "evas-role-in-symptom-guidance",
    title: "How Eva supports safe symptom guidance",
    excerpt: "Our AI assistant Eva is designed to complement, not replace, clinical judgment. Here’s how we keep guidance medically sound and when to see a provider.",
    date: "2025-02-10",
    category: "Platform",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=600&q=80",
  },
  {
    slug: "malaria-prevention-update",
    title: "Malaria prevention and treatment: latest guidance",
    excerpt: "Updated WHO and national guidelines on prevention, diagnosis, and treatment — and how MedConnect aligns with local protocols.",
    date: "2025-02-05",
    category: "Public health",
    image: "https://images.unsplash.com/photo-1584515933487-779824d29309?w=600&q=80",
  },
];

export const MEDICAL_NEWS = [
  {
    id: "1",
    title: "Nigeria expands primary healthcare under NHIS",
    excerpt: "Federal government announces new primary care packages and provider networks to improve access in underserved areas.",
    date: "2025-02-14",
    region: "Nigeria",
    source: "Federal Ministry of Health",
  },
  {
    id: "2",
    title: "Africa CDC and AU launch continent-wide vaccine initiative",
    excerpt: "New initiative aims to strengthen routine immunization and outbreak response across member states.",
    date: "2025-02-12",
    region: "Africa",
    source: "Africa CDC",
  },
  {
    id: "3",
    title: "Lagos rolls out digital health records for public facilities",
    excerpt: "State government partners with tech providers to digitize patient records and improve referral pathways.",
    date: "2025-02-08",
    region: "Nigeria",
    source: "Lagos State Ministry of Health",
  },
  {
    id: "4",
    title: "WHO updates essential medicines list; key antibiotics and NCD drugs included",
    excerpt: "Revisions reflect latest evidence for infections and non-communicable diseases relevant to African settings.",
    date: "2025-02-01",
    region: "Africa",
    source: "WHO",
  },
];

export const MEDICAL_ACHIEVEMENTS = [
  {
    id: "1",
    name: "Dr. Ameyo Adadevoh",
    role: "Physician",
    country: "Nigeria",
    achievement: "Led the containment of Nigeria’s first Ebola case in 2014, preventing a wider outbreak and saving countless lives through strict infection control and advocacy.",
    image: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&q=80",
  },
  {
    id: "2",
    name: "Prof. Christian Happi",
    role: "Molecular biologist & professor",
    country: "Nigeria",
    achievement: "Pioneered genomic surveillance and diagnostics in Africa; director of ACEGID, leading work on Ebola, Lassa, and COVID-19 testing and sequencing on the continent.",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&q=80",
  },
  {
    id: "3",
    name: "Dr. John Nkengasong",
    role: "Virologist, Africa CDC Director",
    country: "Cameroon / Africa",
    achievement: "First director of Africa CDC; built continental capacity for disease surveillance, laboratory networks, and pandemic response across the African Union.",
    image: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400&q=80",
  },
  {
    id: "4",
    name: "Prof. Oyewale Tomori",
    role: "Virologist",
    country: "Nigeria",
    achievement: "Leading virologist and past WHO regional advisor; instrumental in polio eradication and epidemic response in West Africa.",
    image: "https://images.unsplash.com/photo-1551076805-e1869033e561?w=400&q=80",
  },
  {
    id: "5",
    name: "Dr. Stella Ameyo Adadevoh Research Fellowship",
    role: "Legacy programme",
    country: "Nigeria",
    achievement: "Fellowship and research initiatives in her name continue to support Nigerian physicians in infectious disease and public health leadership.",
    image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=400&q=80",
  },
];

/** Latest updates: medical, programs/interventions, health benefits (for home page) */
export const LATEST_UPDATES = {
  medical: [
    { title: "WHO 2025 essential medicines list update", summary: "New additions for NCDs and infections; implications for formularies in Nigeria and Africa.", date: "2025-02" },
    { title: "Hypertension guidelines (ISH) and implementation in primary care", summary: "Practical steps for screening and treatment in resource-constrained settings.", date: "2025-02" },
    { title: "Malaria RTS,S vaccine rollout in endemic countries", summary: "Progress and eligibility for children in eligible African countries.", date: "2025-01" },
  ],
  programs: [
    { title: "MedConnect Eva 2.0", summary: "Improved symptom flow and clearer when to seek in-person care; aligned with local protocols.", date: "2025-02" },
    { title: "Nurse visit scheduling", summary: "Faster booking and status updates for at-home nurse visits.", date: "2025-01" },
    { title: "HMO integration expansion", summary: "More plans supported for verification and claims-related information.", date: "2025-01" },
  ],
  healthBenefits: [
    { title: "Subscription plans and what’s covered", summary: "Basic, Care, and Family plans: Eva, prescriptions, nurse visits, and HMO benefits.", date: "2025-02" },
    { title: "Preventive care reminders", summary: "Eva and dashboard can support vaccination and check-up reminders.", date: "2025-01" },
    { title: "Emergency response and contacts", summary: "One-tap alert and optional sharing with emergency contacts.", date: "2025-01" },
  ],
};
