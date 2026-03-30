import { query } from "./_generated/server";
import { v } from "convex/values";
import { validateSession } from "./auth";

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

export const listByCounty = query({
  args: { county: v.string() },
  handler: async (ctx, args) => {
    const mcas = await ctx.db
      .query("mcas")
      .withIndex("by_county", (q) => q.eq("county", args.county))
      .collect();
    // Only return active, non-superadmin MCAs and strip sensitive fields
    return mcas
      .filter((m) => m.isActive && m.role === "mca")
      .map((m) => ({
        _id: m._id,
        name: m.name,
        ward: m.ward,
        county: m.county,
        party: m.party,
        avatar: m.avatar,
      }));
  },
});

export const listAll = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const { role } = await validateSession(ctx, args.sessionToken);
    if (role !== "superadmin") throw new Error("Unauthorized");
    const mcas = await ctx.db.query("mcas").collect();
    return mcas.map((m) => ({ ...m, passwordHash: undefined }));
  },
});
