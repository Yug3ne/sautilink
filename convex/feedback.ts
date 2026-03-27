import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    mcaId: v.optional(v.id("mcas")),
    status: v.optional(v.union(v.literal("pending"), v.literal("responded"))),
  },
  handler: async (ctx, args) => {
    let results;

    if (args.mcaId) {
      results = await ctx.db
        .query("feedback")
        .withIndex("by_mcaId", (q) => q.eq("mcaId", args.mcaId!))
        .collect();
    } else if (args.status) {
      results = await ctx.db
        .query("feedback")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      results = await ctx.db.query("feedback").collect();
    }

    if (args.mcaId && args.status) {
      results = results.filter((f) => f.status === args.status);
    }

    return results;
  },
});

export const submit = mutation({
  args: {
    citizenId: v.id("citizens"),
    citizenName: v.string(),
    mcaId: v.id("mcas"),
    message: v.string(),
    category: v.union(
      v.literal("question"),
      v.literal("complaint"),
      v.literal("suggestion")
    ),
  },
  handler: async (ctx, args) => {
    const feedbackId = await ctx.db.insert("feedback", {
      citizenId: args.citizenId,
      citizenName: args.citizenName,
      mcaId: args.mcaId,
      message: args.message,
      category: args.category,
      status: "pending",
      timestamp: new Date().toISOString(),
    });
    return feedbackId;
  },
});

export const respond = mutation({
  args: {
    feedbackId: v.id("feedback"),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.feedbackId, {
      status: "responded",
      response: args.response,
    });
  },
});
