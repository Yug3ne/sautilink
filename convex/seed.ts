import { mutation } from "./_generated/server";
import { hashPassword } from "./lib/passwords";

export default mutation({
  args: {},
  handler: async (ctx) => {
    // Check if already seeded
    const existingBills = await ctx.db.query("bills").first();
    if (existingBills) {
      console.log("Database already seeded, skipping.");
      return;
    }

    // --- MCAs ---
    const mca1 = await ctx.db.insert("mcas", {
      name: "Hon. Peter Njoroge",
      ward: "Agikuyu",
      county: "Kiambu",
      party: "Jubilee",
      avatar: "PN",
      email: "peter@sauti.ke",
      passwordHash: await hashPassword("password123"),
      role: "mca",
      isActive: true,
    });
    const mca2 = await ctx.db.insert("mcas", {
      name: "Hon. Faith Wambui",
      ward: "Kolwa East",
      county: "Kisumu",
      party: "ODM",
      avatar: "FW",
      email: "faith@sauti.ke",
      passwordHash: await hashPassword("password123"),
      role: "mca",
      isActive: true,
    });
    const mca3 = await ctx.db.insert("mcas", {
      name: "Hon. Ali Hassan",
      ward: "Mvita",
      county: "Mombasa",
      party: "Wiper",
      avatar: "AH",
      email: "ali@sauti.ke",
      passwordHash: await hashPassword("password123"),
      role: "mca",
      isActive: true,
    });

    // Super admin
    await ctx.db.insert("mcas", {
      name: "Admin User",
      ward: "All",
      county: "All",
      party: "N/A",
      avatar: "AD",
      email: "admin@sauti.ke",
      passwordHash: await hashPassword("admin123"),
      role: "superadmin",
      isActive: true,
    });

    // --- Citizens ---
    const c1 = await ctx.db.insert("citizens", {
      nationalId: "29384756",
      name: "Wanjiku Muthoni",
      county: "Kiambu",
      ward: "Agikuyu",
      phone: "+254712345678",
      language: "sw",
      verified: true,
    });
    const c2 = await ctx.db.insert("citizens", {
      nationalId: "31245678",
      name: "James Kamau",
      county: "Kiambu",
      ward: "Agikuyu",
      phone: "+254723456789",
      language: "en",
      verified: true,
    });
    const c3 = await ctx.db.insert("citizens", {
      nationalId: "28765432",
      name: "Akinyi Odhiambo",
      county: "Kisumu",
      ward: "Kolwa East",
      phone: "+254734567890",
      language: "en",
      verified: true,
    });
    const c4 = await ctx.db.insert("citizens", {
      nationalId: "33456789",
      name: "Hassan Omar",
      county: "Mombasa",
      ward: "Mvita",
      phone: "+254745678901",
      language: "sw",
      verified: false,
    });
    const c5 = await ctx.db.insert("citizens", {
      nationalId: "30987654",
      name: "Grace Njeri",
      county: "Kiambu",
      ward: "Agikuyu",
      phone: "+254756789012",
      language: "sw",
      verified: true,
    });

    // --- Bills ---
    const b1 = await ctx.db.insert("bills", {
      title: "Kiambu County Annual Budget 2026/2027",
      titleSw: "Bajeti ya Kaunti ya Kiambu 2026/2027",
      status: "open",
      county: "Kiambu",
      ward: "Agikuyu",
      uploadedBy: mca1,
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
      simplifiedEn:
        "This is the annual budget for Kiambu County covering roads, health centers, student bursaries, and water projects. It also proposes a new 15% commercial property tax to fund emergency services.",
      simplifiedSw:
        "Hii ni bajeti ya mwaka ya Kaunti ya Kiambu inayoshughulikia barabara, vituo vya afya, bursary za wanafunzi, na miradi ya maji. Pia inapendekeza kodi mpya ya 15% kwa mali za kibiashara kufadhili huduma za dharura.",
      detailedSummaryEn:
        "The Kiambu County Annual Budget 2026/2027 allocates KES 2.3 billion for road infrastructure across 12 wards, aiming to improve connectivity and trade. An additional KES 450 million is earmarked for building three new health centers in underserved rural areas. The budget includes KES 180 million for a bursary fund to support secondary and tertiary students, and KES 95 million for clean water projects in Agikuyu and Limuru wards. A controversial proposal introduces a 15% tax on commercial property to create a dedicated emergency services fund for the county.",
      detailedSummarySw:
        "Bajeti ya Mwaka ya Kaunti ya Kiambu 2026/2027 inatenga KES bilioni 2.3 kwa miundombinu ya barabara katika kata 12, ikilenga kuboresha usafiri na biashara. KES milioni 450 zimetengwa kwa ujenzi wa vituo vitatu vipya vya afya vijijini. Bajeti inajumuisha KES milioni 180 kwa mfuko wa bursary kusaidia wanafunzi wa sekondari na vyuo, na KES milioni 95 kwa miradi ya maji safi katika kata za Agikuyu na Limuru. Pendekezo la utata linaanzisha kodi ya 15% kwa mali za kibiashara kuunda mfuko maalum wa huduma za dharura kwa kaunti.",
      category: "budget",
    });
    const b2 = await ctx.db.insert("bills", {
      title: "Kiambu County Health Services Bill 2026",
      titleSw: "Muswada wa Huduma za Afya wa Kaunti ya Kiambu 2026",
      status: "open",
      county: "Kiambu",
      ward: "Agikuyu",
      uploadedBy: mca1,
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
      simplifiedEn:
        "This bill aims to improve healthcare in Kiambu by providing free maternal care, hiring more health workers, and sending mobile clinics to remote areas. It also introduces digital health records and faster ambulance response times.",
      simplifiedSw:
        "Muswada huu unalenga kuboresha huduma za afya Kiambu kwa kutoa huduma za bure za uzazi, kuajiri wahudumu zaidi wa afya, na kutuma kliniki za rununu maeneo ya mbali. Pia unaanzisha rekodi za afya za kidijitali na muda wa haraka wa majibu ya ambulensi.",
      detailedSummaryEn:
        "The Kiambu County Health Services Bill 2026 mandates free maternal care at all public health facilities across the county. It plans to recruit 200 community health workers by December 2026 to strengthen primary healthcare delivery. Mobile health clinics will be deployed to visit remote wards at least twice monthly, ensuring residents in underserved areas have access to basic medical services. The bill also requires implementation of a digital health records system across all facilities to improve patient care continuity and sets an ambitious 15-minute ambulance response time target for urban areas.",
      detailedSummarySw:
        "Muswada wa Huduma za Afya wa Kaunti ya Kiambu 2026 unaamuru huduma za bure za uzazi katika vituo vyote vya afya ya umma kaunti nzima. Unapanga kuajiri wahudumu 200 wa afya ya jamii ifikapo Desemba 2026 kuimarisha utoaji wa huduma za afya ya msingi. Kliniki za afya za rununu zitatumwa kutembelea kata za mbali angalau mara mbili kwa mwezi, kuhakikisha wakazi wa maeneo yasiyohudumiwa wanapata huduma za msingi za matibabu. Muswada pia unahitaji utekelezaji wa mfumo wa rekodi za afya za kidijitali katika vituo vyote na kuweka lengo la dakika 15 la muda wa majibu ya ambulensi kwa maeneo ya mjini.",
      category: "health",
    });
    const b3 = await ctx.db.insert("bills", {
      title: "Kisumu County Education Enhancement Act 2026",
      titleSw: "Sheria ya Kuimarisha Elimu ya Kaunti ya Kisumu 2026",
      status: "open",
      county: "Kisumu",
      ward: "Kolwa East",
      uploadedBy: mca2,
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
      simplifiedEn:
        "This act invests in education across Kisumu County by building new early childhood centers, expanding free school meals, training teachers in ICT, and providing scholarships to top students.",
      simplifiedSw:
        "Sheria hii inawekeza katika elimu kaunti nzima ya Kisumu kwa kujenga vituo vipya vya utoto, kupanua chakula cha bure shuleni, kufunza walimu TEHAMA, na kutoa ufadhili kwa wanafunzi bora.",
      detailedSummaryEn:
        "The Kisumu County Education Enhancement Act 2026 allocates KES 320 million for the construction of 15 new Early Childhood Development and Education (ECDE) centers across the county to improve access to pre-primary education. The free school meals program will be extended to cover all public primary schools in the county, addressing nutrition and school attendance simultaneously. A KES 50 million teacher training fund focuses on developing ICT skills among educators. The act establishes a county scholarship program for the top 100 KCSE performers from each ward and plans to build public libraries in five sub-county headquarters to promote literacy and lifelong learning.",
      detailedSummarySw:
        "Sheria ya Kuimarisha Elimu ya Kaunti ya Kisumu 2026 inatenga KES milioni 320 kwa ujenzi wa vituo 15 vipya vya Maendeleo ya Utoto na Elimu (ECDE) kaunti nzima kuboresha upatikanaji wa elimu ya awali. Programu ya chakula cha bure shuleni itapanuliwa kufunika shule zote za msingi za umma kaunti nzima, ikishughulikia lishe na mahudhurio shuleni kwa pamoja. Mfuko wa mafunzo ya walimu wa KES milioni 50 unalenga kuendeleza ujuzi wa TEHAMA miongoni mwa waelimishaji. Sheria inaanzisha programu ya ufadhili wa kaunti kwa wanafunzi 100 bora wa KCSE kutoka kila kata na kupanga kujenga maktaba za umma katika makao makuu matano ya kaunti ndogo kukuza kusoma na kujifunza maisha yote.",
      category: "education",
    });
    const b4 = await ctx.db.insert("bills", {
      title: "Mombasa County Environmental Conservation Bill 2026",
      titleSw: "Muswada wa Uhifadhi wa Mazingira wa Kaunti ya Mombasa 2026",
      status: "draft",
      county: "Mombasa",
      ward: "Mvita",
      uploadedBy: mca3,
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
      simplifiedEn:
        "This bill protects Mombasa's coastal environment by banning single-use plastics near beaches, restoring mangroves, requiring environmental assessments, and creating youth jobs in waste collection.",
      simplifiedSw:
        "Muswada huu unalinda mazingira ya pwani ya Mombasa kwa kupiga marufuku plastiki karibu na fukwe, kurejesha mikoko, kuhitaji tathmini za mazingira, na kuunda ajira za vijana katika ukusanyaji taka.",
      detailedSummaryEn:
        "The Mombasa County Environmental Conservation Bill 2026 introduces a ban on single-use plastics within 500 meters of all beach areas to protect the coastal ecosystem and marine life. It allocates KES 200 million for mangrove restoration along Tudor Creek, recognizing the critical role mangroves play in coastal protection and biodiversity. All new developments will be required to undergo mandatory environmental impact assessments before approval. The bill establishes a community-based waste collection program with a focus on youth employment, creating green jobs while addressing solid waste challenges. Additionally, a county climate change adaptation fund will be created to finance resilience-building initiatives.",
      detailedSummarySw:
        "Muswada wa Uhifadhi wa Mazingira wa Kaunti ya Mombasa 2026 unaanzisha marufuku ya plastiki za matumizi moja ndani ya mita 500 za maeneo yote ya fukwe kulinda mfumo wa ikolojia wa pwani na viumbe vya baharini. Unatenga KES milioni 200 kwa urejeshaji wa mikoko kando ya Tudor Creek, ukitambua jukumu muhimu la mikoko katika ulinzi wa pwani na bioanuwai. Maendeleo yote mapya yatahitajika kupitia tathmini za lazima za athari za mazingira kabla ya kuidhinishwa. Muswada unaanzisha programu ya ukusanyaji taka ya jamii inayolenga ajira ya vijana, kuunda kazi za kijani wakati wa kushughulikia changamoto za taka ngumu. Zaidi ya hayo, mfuko wa kubadilika kwa mabadiliko ya hali ya hewa wa kaunti utaundwa kufadhili mipango ya kujenga ustahimilivu.",
      category: "environment",
    });

    // --- Budget Items ---
    const bi1 = await ctx.db.insert("budgetItems", {
      billId: b1,
      description: "Road construction in Agikuyu Ward - KES 180M",
      descriptionSw: "Ujenzi wa barabara katika Kata ya Agikuyu - KES 180M",
      amount: 180_000_000,
      ward: "Agikuyu",
      county: "Kiambu",
      votesFor: 342,
      votesAgainst: 58,
      status: "active",
      deadline: "2026-04-15",
    });
    const bi2 = await ctx.db.insert("budgetItems", {
      billId: b1,
      description: "New health center in Agikuyu - KES 150M",
      descriptionSw: "Kituo kipya cha afya Agikuyu - KES 150M",
      amount: 150_000_000,
      ward: "Agikuyu",
      county: "Kiambu",
      votesFor: 401,
      votesAgainst: 23,
      status: "active",
      deadline: "2026-04-15",
    });
    const bi3 = await ctx.db.insert("budgetItems", {
      billId: b1,
      description: "Bursary fund for Agikuyu students - KES 45M",
      descriptionSw: "Mfuko wa bursary kwa wanafunzi wa Agikuyu - KES 45M",
      amount: 45_000_000,
      ward: "Agikuyu",
      county: "Kiambu",
      votesFor: 389,
      votesAgainst: 12,
      status: "active",
      deadline: "2026-04-15",
    });
    const bi4 = await ctx.db.insert("budgetItems", {
      billId: b1,
      description: "Clean water project Limuru Ward - KES 50M",
      descriptionSw: "Mradi wa maji safi Kata ya Limuru - KES 50M",
      amount: 50_000_000,
      ward: "Limuru",
      county: "Kiambu",
      votesFor: 278,
      votesAgainst: 45,
      status: "active",
      deadline: "2026-04-15",
    });
    const bi5 = await ctx.db.insert("budgetItems", {
      billId: b1,
      description: "15% commercial property tax for emergency services",
      descriptionSw:
        "Kodi ya 15% ya mali za kibiashara kwa huduma za dharura",
      amount: 0,
      ward: "All",
      county: "Kiambu",
      votesFor: 134,
      votesAgainst: 289,
      status: "active",
      deadline: "2026-04-15",
    });
    const bi6 = await ctx.db.insert("budgetItems", {
      billId: b3,
      description: "15 new ECDE centers across Kisumu - KES 320M",
      descriptionSw: "Vituo 15 vipya vya ECDE Kisumu - KES 320M",
      amount: 320_000_000,
      ward: "Kolwa East",
      county: "Kisumu",
      votesFor: 567,
      votesAgainst: 34,
      status: "active",
      deadline: "2026-04-20",
    });

    // --- Votes ---
    await ctx.db.insert("votes", {
      citizenId: c1,
      budgetItemId: bi1,
      vote: "for",
      channel: "ussd",
      timestamp: "2026-03-20T10:30:00",
    });
    await ctx.db.insert("votes", {
      citizenId: c2,
      budgetItemId: bi1,
      vote: "for",
      channel: "web",
      timestamp: "2026-03-20T11:15:00",
    });
    await ctx.db.insert("votes", {
      citizenId: c5,
      budgetItemId: bi1,
      vote: "against",
      channel: "ussd",
      timestamp: "2026-03-20T12:00:00",
    });
    await ctx.db.insert("votes", {
      citizenId: c1,
      budgetItemId: bi2,
      vote: "for",
      channel: "ussd",
      timestamp: "2026-03-20T10:32:00",
    });
    await ctx.db.insert("votes", {
      citizenId: c2,
      budgetItemId: bi2,
      vote: "for",
      channel: "web",
      timestamp: "2026-03-20T11:17:00",
    });
    await ctx.db.insert("votes", {
      citizenId: c1,
      budgetItemId: bi5,
      vote: "against",
      channel: "ussd",
      timestamp: "2026-03-20T10:35:00",
    });
    await ctx.db.insert("votes", {
      citizenId: c3,
      budgetItemId: bi6,
      vote: "for",
      channel: "web",
      timestamp: "2026-03-21T09:00:00",
    });

    // --- Feedback ---
    await ctx.db.insert("feedback", {
      citizenId: c1,
      citizenName: "Wanjiku Muthoni",
      mcaId: mca1,
      message:
        "Barabara ya Agikuyu-Limuru imejaa mashimo. Tunahitaji ukarabati haraka.",
      category: "complaint",
      status: "responded",
      timestamp: "2026-03-18T14:30:00",
      response:
        "Asante Wanjiku. Tumepanga ukarabati kuanza mwezi ujao. Tutawajulisha.",
    });
    await ctx.db.insert("feedback", {
      citizenId: c2,
      citizenName: "James Kamau",
      mcaId: mca1,
      message:
        "When will the bursary applications for 2026 open? My daughter scored B+ in KCSE.",
      category: "question",
      status: "pending",
      timestamp: "2026-03-22T09:15:00",
    });
    await ctx.db.insert("feedback", {
      citizenId: c5,
      citizenName: "Grace Njeri",
      mcaId: mca1,
      message:
        "Napendekeza tuwe na soko la wakulima kila Jumamosi katika kata yetu.",
      category: "suggestion",
      status: "pending",
      timestamp: "2026-03-23T16:45:00",
    });
    await ctx.db.insert("feedback", {
      citizenId: c3,
      citizenName: "Akinyi Odhiambo",
      mcaId: mca2,
      message:
        "The ECDE center in Kolwa East has no desks. Children sit on the floor.",
      category: "complaint",
      status: "responded",
      timestamp: "2026-03-19T11:00:00",
      response:
        "Thank you for reporting this. We have allocated emergency funds for furniture. Delivery expected by April 5.",
    });

    // --- Analytics: Engagement by Month ---
    for (const row of [
      { month: "Oct", ussd: 120, web: 45 },
      { month: "Nov", ussd: 210, web: 89 },
      { month: "Dec", ussd: 185, web: 102 },
      { month: "Jan", ussd: 340, web: 156 },
      { month: "Feb", ussd: 456, web: 234 },
      { month: "Mar", ussd: 612, web: 378 },
    ]) {
      await ctx.db.insert("engagementByMonth", row);
    }

    // --- Analytics: Sentiment by County ---
    for (const row of [
      { county: "Kiambu", positive: 72, neutral: 18, negative: 10 },
      { county: "Kisumu", positive: 65, neutral: 22, negative: 13 },
      { county: "Mombasa", positive: 58, neutral: 25, negative: 17 },
      { county: "Nakuru", positive: 70, neutral: 20, negative: 10 },
      { county: "Nairobi", positive: 55, neutral: 28, negative: 17 },
    ]) {
      await ctx.db.insert("sentimentByCounty", row);
    }

    // --- Analytics: Channel Distribution ---
    for (const row of [
      { name: "USSD", value: 1923, fill: "var(--color-chart-1)" },
      { name: "Web", value: 1004, fill: "var(--color-chart-2)" },
      { name: "SMS", value: 312, fill: "var(--color-chart-3)" },
    ]) {
      await ctx.db.insert("channelDistribution", row);
    }

    // --- Analytics: Top Issues ---
    for (const row of [
      { issue: "Road Infrastructure", count: 847, percentage: 28 },
      { issue: "Healthcare Access", count: 634, percentage: 21 },
      { issue: "Education Funding", count: 512, percentage: 17 },
      { issue: "Water & Sanitation", count: 445, percentage: 15 },
      { issue: "Tax Concerns", count: 301, percentage: 10 },
      { issue: "Security", count: 270, percentage: 9 },
    ]) {
      await ctx.db.insert("topIssues", row);
    }

    console.log("Database seeded successfully!");
  },
});
