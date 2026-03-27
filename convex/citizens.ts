import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getByNationalId = query({
  args: { nationalId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("citizens")
      .withIndex("by_nationalId", (q) => q.eq("nationalId", args.nationalId))
      .first();
  },
});

export const verify = mutation({
  args: { citizenId: v.id("citizens") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.citizenId, { verified: true });
  },
});

export const register = mutation({
  args: {
    nationalId: v.string(),
    name: v.string(),
    county: v.string(),
    ward: v.string(),
    phone: v.string(),
    language: v.union(v.literal("en"), v.literal("sw")),
    verified: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check if nationalId already exists
    const existing = await ctx.db
      .query("citizens")
      .withIndex("by_nationalId", (q) => q.eq("nationalId", args.nationalId))
      .first();

    if (existing) {
      throw new Error("A citizen with this national ID already exists.");
    }

    const citizenId = await ctx.db.insert("citizens", args);
    return citizenId;
  },
});
