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

export const listAll = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const { role } = await validateSession(ctx, args.sessionToken);
    if (role !== "superadmin") throw new Error("Unauthorized");
    const mcas = await ctx.db.query("mcas").collect();
    return mcas.map((m) => ({ ...m, passwordHash: undefined }));
  },
});
