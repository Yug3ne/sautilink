import { query } from "./_generated/server";
import { v } from "convex/values";
import { validateSession } from "./auth";

export const getStats = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let scopeCounty: string | undefined;
    let scopeMcaId: any;

    if (args.sessionToken) {
      const session = await validateSession(ctx, args.sessionToken);
      if (session.role !== "superadmin") {
        scopeCounty = session.county;
        scopeMcaId = session.mcaId;
      }
    }

    const allCitizens = await ctx.db.query("citizens").collect();
    const filteredCitizens = scopeCounty
      ? allCitizens.filter((c) => c.county === scopeCounty)
      : allCitizens;
    const totalCitizens = filteredCitizens.length;
    const verifiedCitizens = filteredCitizens.filter((c) => c.verified).length;

    const allVotes = await ctx.db.query("votes").collect();
    // For scoped view, filter votes by budget items in the MCA's county
    let filteredVotes = allVotes;
    if (scopeCounty) {
      const budgetItems = await ctx.db.query("budgetItems").collect();
      const countyBudgetItemIds = new Set(
        budgetItems
          .filter((bi) => bi.county === scopeCounty)
          .map((bi) => bi._id)
      );
      filteredVotes = allVotes.filter((v) =>
        countyBudgetItemIds.has(v.budgetItemId)
      );
    }
    const totalVotes = filteredVotes.length;
    const ussdVotes = filteredVotes.filter((v) => v.channel === "ussd").length;
    const webVotes = filteredVotes.filter((v) => v.channel === "web").length;

    let activeBillsQuery;
    if (scopeCounty) {
      const allBillsInCounty = await ctx.db
        .query("bills")
        .withIndex("by_county_status", (q) =>
          q.eq("county", scopeCounty!).eq("status", "open")
        )
        .collect();
      activeBillsQuery = allBillsInCounty;
    } else {
      activeBillsQuery = await ctx.db
        .query("bills")
        .withIndex("by_status", (q) => q.eq("status", "open"))
        .collect();
    }
    const activeBills = activeBillsQuery.length;

    let pendingFeedbackList;
    if (scopeMcaId) {
      const allFeedback = await ctx.db
        .query("feedback")
        .withIndex("by_mcaId", (q) => q.eq("mcaId", scopeMcaId))
        .collect();
      pendingFeedbackList = allFeedback.filter((f) => f.status === "pending");
    } else {
      pendingFeedbackList = await ctx.db
        .query("feedback")
        .withIndex("by_status", (q) => q.eq("status", "pending"))
        .collect();
    }
    const pendingFeedback = pendingFeedbackList.length;

    const allBills = scopeCounty
      ? await ctx.db
          .query("bills")
          .withIndex("by_county", (q) => q.eq("county", scopeCounty!))
          .collect()
      : await ctx.db.query("bills").collect();
    const counties = [...new Set(allBills.map((b) => b.county))];

    return {
      totalCitizens,
      verifiedCitizens,
      totalVotes,
      ussdVotes,
      webVotes,
      activeBills,
      pendingFeedback,
      counties,
    };
  },
});

export const getEngagementByMonth = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      await validateSession(ctx, args.sessionToken);
    }
    return await ctx.db.query("engagementByMonth").collect();
  },
});

export const getSentimentByCounty = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let scopeCounty: string | undefined;
    if (args.sessionToken) {
      const session = await validateSession(ctx, args.sessionToken);
      if (session.role !== "superadmin") {
        scopeCounty = session.county;
      }
    }
    const all = await ctx.db.query("sentimentByCounty").collect();
    if (scopeCounty) {
      return all.filter((s) => s.county === scopeCounty);
    }
    return all;
  },
});

export const getChannelDistribution = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      await validateSession(ctx, args.sessionToken);
    }
    return await ctx.db.query("channelDistribution").collect();
  },
});

export const getTopIssues = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      await validateSession(ctx, args.sessionToken);
    }
    return await ctx.db.query("topIssues").collect();
  },
});

export const getRecentActivity = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let scopeCounty: string | undefined;
    let scopeMcaId: any;

    if (args.sessionToken) {
      const session = await validateSession(ctx, args.sessionToken);
      if (session.role !== "superadmin") {
        scopeCounty = session.county;
        scopeMcaId = session.mcaId;
      }
    }

    const recentVotes = await ctx.db.query("votes").order("desc").take(50);
    const recentFeedback = await ctx.db
      .query("feedback")
      .order("desc")
      .take(50);

    let filteredVotes = recentVotes;
    if (scopeCounty) {
      const budgetItems = await ctx.db.query("budgetItems").collect();
      const countyBudgetItemIds = new Set(
        budgetItems
          .filter((bi) => bi.county === scopeCounty)
          .map((bi) => bi._id)
      );
      filteredVotes = recentVotes.filter((v) =>
        countyBudgetItemIds.has(v.budgetItemId)
      );
    }

    let filteredFeedback = recentFeedback;
    if (scopeMcaId) {
      filteredFeedback = recentFeedback.filter(
        (f) => f.mcaId === scopeMcaId
      );
    }

    const activity = [
      ...filteredVotes.slice(0, 10).map((v) => ({
        type: "vote" as const,
        timestamp: v.timestamp,
        data: v,
      })),
      ...filteredFeedback.slice(0, 10).map((f) => ({
        type: "feedback" as const,
        timestamp: f.timestamp,
        data: f,
      })),
    ];

    activity.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return activity.slice(0, 10);
  },
});
