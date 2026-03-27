import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    county: v.optional(v.string()),
    status: v.optional(v.union(v.literal("active"), v.literal("closed"))),
    billId: v.optional(v.id("bills")),
  },
  handler: async (ctx, args) => {
    if (args.billId) {
      const results = await ctx.db
        .query("budgetItems")
        .withIndex("by_billId", (q) => q.eq("billId", args.billId!))
        .collect();

      if (args.status) {
        return results.filter((item) => item.status === args.status);
      }
      return results;
    }

    if (args.county && args.status) {
      return await ctx.db
        .query("budgetItems")
        .withIndex("by_county_status", (q) =>
          q.eq("county", args.county!).eq("status", args.status!)
        )
        .collect();
    }

    if (args.county) {
      return await ctx.db
        .query("budgetItems")
        .withIndex("by_county", (q) => q.eq("county", args.county!))
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
