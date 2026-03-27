// ============================================================
// Sauti-Link Dummy Data
// This file simulates what would come from a Convex backend
// ============================================================

export interface Citizen {
  id: string;
  nationalId: string;
  name: string;
  county: string;
  ward: string;
  phone: string;
  language: "en" | "sw";
  verified: boolean;
}

export interface Bill {
  id: string;
  title: string;
  titleSw: string;
  status: "draft" | "open" | "closed";
  county: string;
  uploadedBy: string;
  uploadedAt: string;
  fullTextUrl: string;
  summaryEn: string[];
  summarySw: string[];
  category: "budget" | "health" | "education" | "infrastructure" | "environment";
}

export interface BudgetItem {
  id: string;
  billId: string;
  description: string;
  descriptionSw: string;
  amount: number;
  ward: string;
  county: string;
  votesFor: number;
  votesAgainst: number;
  status: "active" | "closed";
  deadline: string;
}

export interface Vote {
  id: string;
  citizenId: string;
  budgetItemId: string;
  vote: "for" | "against";
  channel: "ussd" | "web";
  timestamp: string;
}

export interface Feedback {
  id: string;
  citizenId: string;
  citizenName: string;
  mcaId: string;
  message: string;
  category: "question" | "complaint" | "suggestion";
  status: "pending" | "responded";
  timestamp: string;
  response?: string;
}

export interface MCA {
  id: string;
  name: string;
  ward: string;
  county: string;
  party: string;
  avatar: string;
}

// --- Citizens ---
export const citizens: Citizen[] = [
  {
    id: "c1",
    nationalId: "29384756",
    name: "Wanjiku Muthoni",
    county: "Kiambu",
    ward: "Agikuyu",
    phone: "+254712345678",
    language: "sw",
    verified: true,
  },
  {
    id: "c2",
    nationalId: "31245678",
    name: "James Kamau",
    county: "Kiambu",
    ward: "Agikuyu",
    phone: "+254723456789",
    language: "en",
    verified: true,
  },
  {
    id: "c3",
    nationalId: "28765432",
    name: "Akinyi Odhiambo",
    county: "Kisumu",
    ward: "Kolwa East",
    phone: "+254734567890",
    language: "en",
    verified: true,
  },
  {
    id: "c4",
    nationalId: "33456789",
    name: "Hassan Omar",
    county: "Mombasa",
    ward: "Mvita",
    phone: "+254745678901",
    language: "sw",
    verified: false,
  },
  {
    id: "c5",
    nationalId: "30987654",
    name: "Grace Njeri",
    county: "Kiambu",
    ward: "Agikuyu",
    phone: "+254756789012",
    language: "sw",
    verified: true,
  },
];

// --- MCAs ---
export const mcas: MCA[] = [
  {
    id: "mca1",
    name: "Hon. Peter Njoroge",
    ward: "Agikuyu",
    county: "Kiambu",
    party: "Jubilee",
    avatar: "PN",
  },
  {
    id: "mca2",
    name: "Hon. Faith Wambui",
    ward: "Kolwa East",
    county: "Kisumu",
    party: "ODM",
    avatar: "FW",
  },
  {
    id: "mca3",
    name: "Hon. Ali Hassan",
    ward: "Mvita",
    county: "Mombasa",
    party: "Wiper",
    avatar: "AH",
  },
];

// --- Bills ---
export const bills: Bill[] = [
  {
    id: "b1",
    title: "Kiambu County Annual Budget 2026/2027",
    titleSw: "Bajeti ya Kaunti ya Kiambu 2026/2027",
    status: "open",
    county: "Kiambu",
    uploadedBy: "mca1",
    uploadedAt: "2026-03-15",
    fullTextUrl: "#",
    summaryEn: [
      "KES 2.3 billion allocated for road infrastructure across 12 wards.",
      "KES 450 million for construction of 3 new health centers in rural areas.",
      "KES 180 million for bursary fund targeting secondary and tertiary students.",
      "KES 95 million for clean water projects in Agikuyu and Limuru wards.",
      "New 15% tax on commercial property to fund county emergency services.",
    ],
    summarySw: [
      "KES bilioni 2.3 zimetengwa kwa miundombinu ya barabara katika kata 12.",
      "KES milioni 450 kwa ujenzi wa vituo 3 vipya vya afya vijijini.",
      "KES milioni 180 kwa mfuko wa bursary kwa wanafunzi wa sekondari na vyuo.",
      "KES milioni 95 kwa miradi ya maji safi katika kata za Agikuyu na Limuru.",
      "Kodi mpya ya 15% kwa mali za kibiashara kufadhili huduma za dharura.",
    ],
    category: "budget",
  },
  {
    id: "b2",
    title: "Kiambu County Health Services Bill 2026",
    titleSw: "Muswada wa Huduma za Afya wa Kaunti ya Kiambu 2026",
    status: "open",
    county: "Kiambu",
    uploadedBy: "mca1",
    uploadedAt: "2026-03-10",
    fullTextUrl: "#",
    summaryEn: [
      "All public health facilities to provide free maternal care services.",
      "County to hire 200 additional community health workers by December 2026.",
      "Mobile health clinics to visit remote wards at least twice per month.",
      "Digital health records system to be implemented across all facilities.",
      "Emergency ambulance response time target set at 15 minutes for urban areas.",
    ],
    summarySw: [
      "Vituo vyote vya afya ya umma kutoa huduma za bure za uzazi.",
      "Kaunti kuajiri wahudumu 200 wa afya ya jamii ifikapo Desemba 2026.",
      "Kliniki za afya za rununu kutembelea kata za mbali mara mbili kwa mwezi.",
      "Mfumo wa kumbukumbu za afya za kidijitali kutekelezwa katika vituo vyote.",
      "Lengo la muda wa majibu ya ambulensi kuwekwa dakika 15 kwa maeneo ya mjini.",
    ],
    category: "health",
  },
  {
    id: "b3",
    title: "Kisumu County Education Enhancement Act 2026",
    titleSw: "Sheria ya Kuimarisha Elimu ya Kaunti ya Kisumu 2026",
    status: "open",
    county: "Kisumu",
    uploadedBy: "mca2",
    uploadedAt: "2026-03-08",
    fullTextUrl: "#",
    summaryEn: [
      "KES 320 million for construction of 15 new ECDE centers across the county.",
      "Free school meals program to be extended to all public primary schools.",
      "Teacher training fund of KES 50 million for ICT skills development.",
      "County scholarship program for top 100 KCSE performers from each ward.",
      "Public libraries to be established in 5 sub-county headquarters.",
    ],
    summarySw: [
      "KES milioni 320 kwa ujenzi wa vituo 15 vipya vya ECDE kaunti nzima.",
      "Programu ya chakula cha bure shuleni kupanuliwa kwa shule zote za msingi.",
      "Mfuko wa mafunzo ya walimu wa KES milioni 50 kwa ujuzi wa TEHAMA.",
      "Programu ya ufadhili wa kaunti kwa wanafunzi 100 bora wa KCSE kila kata.",
      "Maktaba za umma kuanzishwa katika makao makuu 5 ya kaunti ndogo.",
    ],
    category: "education",
  },
  {
    id: "b4",
    title: "Mombasa County Environmental Conservation Bill 2026",
    titleSw: "Muswada wa Uhifadhi wa Mazingira wa Kaunti ya Mombasa 2026",
    status: "draft",
    county: "Mombasa",
    uploadedBy: "mca3",
    uploadedAt: "2026-03-20",
    fullTextUrl: "#",
    summaryEn: [
      "Ban on single-use plastics within 500 meters of all beach areas.",
      "KES 200 million for mangrove restoration along Tudor Creek.",
      "Mandatory environmental impact assessments for all new developments.",
      "Community-based waste collection program with youth employment focus.",
      "Creation of a county climate change adaptation fund.",
    ],
    summarySw: [
      "Kupiga marufuku plastiki za matumizi moja ndani ya mita 500 za fukwe.",
      "KES milioni 200 kwa urejeshaji wa mikoko kando ya Tudor Creek.",
      "Tathmini za lazima za athari za mazingira kwa maendeleo yote mapya.",
      "Programu ya ukusanyaji wa taka ya jamii inayolenga ajira ya vijana.",
      "Kuundwa kwa mfuko wa kubadilika kwa mabadiliko ya hali ya hewa wa kaunti.",
    ],
    category: "environment",
  },
];

// --- Budget Items ---
export const budgetItems: BudgetItem[] = [
  {
    id: "bi1",
    billId: "b1",
    description: "Road construction in Agikuyu Ward - KES 180M",
    descriptionSw: "Ujenzi wa barabara katika Kata ya Agikuyu - KES 180M",
    amount: 180_000_000,
    ward: "Agikuyu",
    county: "Kiambu",
    votesFor: 342,
    votesAgainst: 58,
    status: "active",
    deadline: "2026-04-15",
  },
  {
    id: "bi2",
    billId: "b1",
    description: "New health center in Agikuyu - KES 150M",
    descriptionSw: "Kituo kipya cha afya Agikuyu - KES 150M",
    amount: 150_000_000,
    ward: "Agikuyu",
    county: "Kiambu",
    votesFor: 401,
    votesAgainst: 23,
    status: "active",
    deadline: "2026-04-15",
  },
  {
    id: "bi3",
    billId: "b1",
    description: "Bursary fund for Agikuyu students - KES 45M",
    descriptionSw: "Mfuko wa bursary kwa wanafunzi wa Agikuyu - KES 45M",
    amount: 45_000_000,
    ward: "Agikuyu",
    county: "Kiambu",
    votesFor: 389,
    votesAgainst: 12,
    status: "active",
    deadline: "2026-04-15",
  },
  {
    id: "bi4",
    billId: "b1",
    description: "Clean water project Limuru Ward - KES 50M",
    descriptionSw: "Mradi wa maji safi Kata ya Limuru - KES 50M",
    amount: 50_000_000,
    ward: "Limuru",
    county: "Kiambu",
    votesFor: 278,
    votesAgainst: 45,
    status: "active",
    deadline: "2026-04-15",
  },
  {
    id: "bi5",
    billId: "b1",
    description: "15% commercial property tax for emergency services",
    descriptionSw: "Kodi ya 15% ya mali za kibiashara kwa huduma za dharura",
    amount: 0,
    ward: "All",
    county: "Kiambu",
    votesFor: 134,
    votesAgainst: 289,
    status: "active",
    deadline: "2026-04-15",
  },
  {
    id: "bi6",
    billId: "b3",
    description: "15 new ECDE centers across Kisumu - KES 320M",
    descriptionSw: "Vituo 15 vipya vya ECDE Kisumu - KES 320M",
    amount: 320_000_000,
    ward: "Kolwa East",
    county: "Kisumu",
    votesFor: 567,
    votesAgainst: 34,
    status: "active",
    deadline: "2026-04-20",
  },
];

// --- Votes ---
export const votes: Vote[] = [
  { id: "v1", citizenId: "c1", budgetItemId: "bi1", vote: "for", channel: "ussd", timestamp: "2026-03-20T10:30:00" },
  { id: "v2", citizenId: "c2", budgetItemId: "bi1", vote: "for", channel: "web", timestamp: "2026-03-20T11:15:00" },
  { id: "v3", citizenId: "c5", budgetItemId: "bi1", vote: "against", channel: "ussd", timestamp: "2026-03-20T12:00:00" },
  { id: "v4", citizenId: "c1", budgetItemId: "bi2", vote: "for", channel: "ussd", timestamp: "2026-03-20T10:32:00" },
  { id: "v5", citizenId: "c2", budgetItemId: "bi2", vote: "for", channel: "web", timestamp: "2026-03-20T11:17:00" },
  { id: "v6", citizenId: "c1", budgetItemId: "bi5", vote: "against", channel: "ussd", timestamp: "2026-03-20T10:35:00" },
  { id: "v7", citizenId: "c3", budgetItemId: "bi6", vote: "for", channel: "web", timestamp: "2026-03-21T09:00:00" },
];

// --- Feedback ---
export const feedbacks: Feedback[] = [
  {
    id: "f1",
    citizenId: "c1",
    citizenName: "Wanjiku Muthoni",
    mcaId: "mca1",
    message: "Barabara ya Agikuyu-Limuru imejaa mashimo. Tunahitaji ukarabati haraka.",
    category: "complaint",
    status: "responded",
    timestamp: "2026-03-18T14:30:00",
    response: "Asante Wanjiku. Tumepanga ukarabati kuanza mwezi ujao. Tutawajulisha.",
  },
  {
    id: "f2",
    citizenId: "c2",
    citizenName: "James Kamau",
    mcaId: "mca1",
    message: "When will the bursary applications for 2026 open? My daughter scored B+ in KCSE.",
    category: "question",
    status: "pending",
    timestamp: "2026-03-22T09:15:00",
  },
  {
    id: "f3",
    citizenId: "c5",
    citizenName: "Grace Njeri",
    mcaId: "mca1",
    message: "Napendekeza tuwe na soko la wakulima kila Jumamosi katika kata yetu.",
    category: "suggestion",
    status: "pending",
    timestamp: "2026-03-23T16:45:00",
  },
  {
    id: "f4",
    citizenId: "c3",
    citizenName: "Akinyi Odhiambo",
    mcaId: "mca2",
    message: "The ECDE center in Kolwa East has no desks. Children sit on the floor.",
    category: "complaint",
    status: "responded",
    timestamp: "2026-03-19T11:00:00",
    response: "Thank you for reporting this. We have allocated emergency funds for furniture. Delivery expected by April 5.",
  },
];

// --- Analytics (pre-computed for dashboard) ---
export const engagementByMonth = [
  { month: "Oct", ussd: 120, web: 45 },
  { month: "Nov", ussd: 210, web: 89 },
  { month: "Dec", ussd: 185, web: 102 },
  { month: "Jan", ussd: 340, web: 156 },
  { month: "Feb", ussd: 456, web: 234 },
  { month: "Mar", ussd: 612, web: 378 },
];

export const sentimentByCounty = [
  { county: "Kiambu", positive: 72, neutral: 18, negative: 10 },
  { county: "Kisumu", positive: 65, neutral: 22, negative: 13 },
  { county: "Mombasa", positive: 58, neutral: 25, negative: 17 },
  { county: "Nakuru", positive: 70, neutral: 20, negative: 10 },
  { county: "Nairobi", positive: 55, neutral: 28, negative: 17 },
];

export const channelDistribution = [
  { name: "USSD", value: 1923, fill: "var(--color-chart-1)" },
  { name: "Web", value: 1004, fill: "var(--color-chart-2)" },
  { name: "SMS", value: 312, fill: "var(--color-chart-3)" },
];

export const topIssues = [
  { issue: "Road Infrastructure", count: 847, percentage: 28 },
  { issue: "Healthcare Access", count: 634, percentage: 21 },
  { issue: "Education Funding", count: 512, percentage: 17 },
  { issue: "Water & Sanitation", count: 445, percentage: 15 },
  { issue: "Tax Concerns", count: 301, percentage: 10 },
  { issue: "Security", count: 270, percentage: 9 },
];
