import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { validateSession } from "./auth";

export const cast = mutation({
  args: {
    citizenId: v.id("citizens"),
    budgetItemId: v.id("budgetItems"),
    vote: v.union(v.literal("for"), v.literal("against")),
    channel: v.union(v.literal("ussd"), v.literal("web")),
  },
  handler: async (ctx, args) => {
    // Check for duplicate vote
    const existing = await ctx.db
      .query("votes")
      .withIndex("by_citizen_budgetItem", (q) =>
        q.eq("citizenId", args.citizenId).eq("budgetItemId", args.budgetItemId)
      )
      .first();

    if (existing) {
      throw new Error("Citizen has already voted on this budget item.");
    }

    // Insert the vote
    const voteId = await ctx.db.insert("votes", {
      citizenId: args.citizenId,
      budgetItemId: args.budgetItemId,
      vote: args.vote,
      channel: args.channel,
      timestamp: new Date().toISOString(),
    });

    // Update the budget item's vote count atomically
    const budgetItem = await ctx.db.get(args.budgetItemId);
    if (!budgetItem) {
      throw new Error("Budget item not found.");
    }

    if (args.vote === "for") {
      await ctx.db.patch(args.budgetItemId, {
        votesFor: budgetItem.votesFor + 1,
      });
    } else {
      await ctx.db.patch(args.budgetItemId, {
        votesAgainst: budgetItem.votesAgainst + 1,
      });
    }

    return voteId;
  },
});

export const getByBudgetItem = query({
  args: {
    sessionToken: v.optional(v.string()),
    budgetItemId: v.id("budgetItems"),
  },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      const session = await validateSession(ctx, args.sessionToken);
      if (session.role !== "superadmin") {
        const budgetItem = await ctx.db.get(args.budgetItemId);
        if (budgetItem && budgetItem.county !== session.county) {
          throw new Error("Access denied: budget item is not in your county");
        }
      }
    }
    return await ctx.db
      .query("votes")
      .withIndex("by_budgetItemId", (q) =>
        q.eq("budgetItemId", args.budgetItemId)
      )
      .collect();
  },
});

export const getByCitizen = query({
  args: { citizenId: v.id("citizens") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("votes")
      .withIndex("by_citizenId", (q) => q.eq("citizenId", args.citizenId))
      .collect();
  },
});
