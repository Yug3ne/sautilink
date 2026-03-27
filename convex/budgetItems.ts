import { query } from "./_generated/server";
import { v } from "convex/values";
import { validateSession } from "./auth";

export const list = query({
  args: {
    sessionToken: v.optional(v.string()),
    county: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("closed"))),
    billId: v.optional(v.id("bills")),
  },
  handler: async (ctx, args) => {
    let scopeCounty: string | undefined;

    if (args.sessionToken) {
      const session = await validateSession(ctx, args.sessionToken);
      if (session.role !== "superadmin") {
        scopeCounty = session.county;
      }
    }

    const effectiveCounty = scopeCounty ?? args.county;

    if (args.billId) {
      const results = await ctx.db
        .query("budgetItems")
        .withIndex("by_billId", (q) => q.eq("billId", args.billId!))
        .collect();

      let filtered = results;
      if (effectiveCounty) {
        filtered = filtered.filter((item) => item.county === effectiveCounty);
      }
      if (args.status) {
        filtered = filtered.filter((item) => item.status === args.status);
      }
      return filtered;
    }

    if (effectiveCounty && args.status) {
      return await ctx.db
        .query("budgetItems")
        .withIndex("by_county_status", (q) =>
          q.eq("county", effectiveCounty).eq("status", args.status!)
        )
        .collect();
    }

    if (effectiveCounty) {
      return await ctx.db
        .query("budgetItems")
        .withIndex("by_county", (q) => q.eq("county", effectiveCounty))
        .collect();
    }

    if (args.status) {
      return await ctx.db
        .query("budgetItems")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    }

    return await ctx.db.query("budgetItems").collect();
  },
});

export const getByBill = query({
  args: { billId: v.id("bills") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("budgetItems")
      .withIndex("by_billId", (q) => q.eq("billId", args.billId))
      .collect();
  },
});

export const getEngagementForBill = query({
  args: { billId: v.id("bills") },
  handler: async (ctx, args) => {
    const items = await ctx.db
      .query("budgetItems")
      .withIndex("by_billId", (q) => q.eq("billId", args.billId))
      .collect();

    let totalVotesFor = 0;
    let totalVotesAgainst = 0;

    for (const item of items) {
      totalVotesFor += item.votesFor;
      totalVotesAgainst += item.votesAgainst;
    }

    return {
      totalVotesFor,
      totalVotesAgainst,
      totalVotes: totalVotesFor + totalVotesAgainst,
      itemCount: items.length,
    };
  },
});
