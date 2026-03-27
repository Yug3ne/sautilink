import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {
    county: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("draft"), v.literal("open"), v.literal("closed"))
    ),
    category: v.optional(
      v.union(
        v.literal("budget"),
        v.literal("health"),
        v.literal("education"),
        v.literal("infrastructure"),
        v.literal("environment")
      )
    ),
  },
  handler: async (ctx, args) => {
    let results;

    if (args.county && args.status) {
      results = await ctx.db
        .query("bills")
        .withIndex("by_county_status", (q) =>
          q.eq("county", args.county!).eq("status", args.status!)
        )
        .collect();
    } else if (args.county) {
      results = await ctx.db
        .query("bills")
        .withIndex("by_county", (q) => q.eq("county", args.county!))
        .collect();
    } else if (args.status) {
      results = await ctx.db
        .query("bills")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      results = await ctx.db.query("bills").collect();
    }

    if (args.category) {
      results = results.filter((bill) => bill.category === args.category);
    }

    return results;
  },
});

export const get = query({
  args: { billId: v.id("bills") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.billId);
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    titleSw: v.string(),
    status: v.union(v.literal("draft"), v.literal("open"), v.literal("closed")),
    county: v.string(),
    uploadedBy: v.id("mcas"),
    fullTextUrl: v.string(),
    summaryEn: v.array(v.string()),
    summarySw: v.array(v.string()),
    category: v.union(
      v.literal("budget"),
      v.literal("health"),
      v.literal("education"),
      v.literal("infrastructure"),
      v.literal("environment")
    ),
  },
  handler: async (ctx, args) => {
    const billId = await ctx.db.insert("bills", {
      ...args,
      uploadedAt: new Date().toISOString(),
    });
    return billId;
  },
});

export const updateStatus = mutation({
  args: {
    billId: v.id("bills"),
    status: v.union(v.literal("draft"), v.literal("open"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.billId, { status: args.status });
  },
});

export const getWithMca = query({
  args: { billId: v.id("bills") },
  handler: async (ctx, args) => {
    const bill = await ctx.db.get(args.billId);
    if (!bill) return null;

    const mca = await ctx.db.get(bill.uploadedBy);
    return { ...bill, mca };
  },
});
