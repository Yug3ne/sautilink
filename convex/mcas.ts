import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("mcas").collect();
  },
});

export const get = query({
  args: { mcaId: v.id("mcas") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.mcaId);
  },
});

export const getByWard = query({
  args: { ward: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("mcas")
      .withIndex("by_ward", (q) => q.eq("ward", args.ward))
      .first();
  },
});
