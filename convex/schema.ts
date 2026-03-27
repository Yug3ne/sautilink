import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  citizens: defineTable({
    nationalId: v.string(),
    name: v.string(),
    county: v.string(),
    ward: v.string(),
    phone: v.string(),
    language: v.union(v.literal("en"), v.literal("sw")),
    verified: v.boolean(),
  })
    .index("by_nationalId", ["nationalId"])
    .index("by_county", ["county"])
    .index("by_county_ward", ["county", "ward"]),

  mcas: defineTable({
    name: v.string(),
    ward: v.string(),
    county: v.string(),
    party: v.string(),
    avatar: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("mca"), v.literal("superadmin")),
    isActive: v.boolean(),
  })
    .index("by_county", ["county"])
    .index("by_ward", ["ward"])
    .index("by_email", ["email"]),

  sessions: defineTable({
    mcaId: v.id("mcas"),
    token: v.string(),
    expiresAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_mcaId", ["mcaId"]),

  bills: defineTable({
    title: v.string(),
    titleSw: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("open"),
      v.literal("closed")
    ),
    county: v.string(),
    ward: v.optional(v.string()),
    uploadedBy: v.id("mcas"),
    uploadedAt: v.string(),
    fullTextUrl: v.string(),
    pdfFileId: v.optional(v.id("_storage")),
    summaryEn: v.array(v.string()),
    summarySw: v.array(v.string()),
    simplifiedEn: v.optional(v.string()),
    simplifiedSw: v.optional(v.string()),
    detailedSummaryEn: v.optional(v.string()),
    detailedSummarySw: v.optional(v.string()),
    category: v.union(
      v.literal("budget"),
      v.literal("health"),
      v.literal("education"),
      v.literal("infrastructure"),
      v.literal("environment")
    ),
  })
    .index("by_status", ["status"])
    .index("by_county", ["county"])
    .index("by_category", ["category"])
    .index("by_county_status", ["county", "status"])
    .index("by_ward", ["ward"]),

  budgetItems: defineTable({
    billId: v.id("bills"),
    description: v.string(),
    descriptionSw: v.string(),
    amount: v.number(),
    ward: v.string(),
    county: v.string(),
    votesFor: v.number(),
    votesAgainst: v.number(),
    status: v.union(v.literal("active"), v.literal("closed")),
    deadline: v.string(),
  })
    .index("by_billId", ["billId"])
    .index("by_status", ["status"])
    .index("by_county", ["county"])
    .index("by_county_status", ["county", "status"]),

  votes: defineTable({
    citizenId: v.id("citizens"),
    budgetItemId: v.id("budgetItems"),
    vote: v.union(v.literal("for"), v.literal("against")),
    channel: v.union(v.literal("ussd"), v.literal("web")),
    timestamp: v.string(),
  })
    .index("by_citizenId", ["citizenId"])
    .index("by_budgetItemId", ["budgetItemId"])
    .index("by_citizen_budgetItem", ["citizenId", "budgetItemId"]),

  feedback: defineTable({
    citizenId: v.id("citizens"),
    citizenName: v.string(),
    mcaId: v.id("mcas"),
    message: v.string(),
    category: v.union(
      v.literal("question"),
      v.literal("complaint"),
      v.literal("suggestion")
    ),
    status: v.union(v.literal("pending"), v.literal("responded")),
    timestamp: v.string(),
    response: v.optional(v.string()),
  })
    .index("by_mcaId", ["mcaId"])
    .index("by_status", ["status"])
    .index("by_citizenId", ["citizenId"]),

  engagementByMonth: defineTable({
    month: v.string(),
    ussd: v.number(),
    web: v.number(),
  }),

  sentimentByCounty: defineTable({
    county: v.string(),
    positive: v.number(),
    neutral: v.number(),
    negative: v.number(),
  }).index("by_county", ["county"]),

  channelDistribution: defineTable({
    name: v.string(),
    value: v.number(),
    fill: v.string(),
  }),

  topIssues: defineTable({
    issue: v.string(),
    count: v.number(),
    percentage: v.number(),
  }),
});
