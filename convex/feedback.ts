import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { validateSession } from "./auth";

export const list = query({
  args: {
    sessionToken: v.optional(v.string()),
    mcaId: v.optional(v.id("mcas")),
    status: v.optional(v.union(v.literal("pending"), v.literal("responded"))),
  },
  handler: async (ctx, args) => {
    let scopeMcaId: any;

    if (args.sessionToken) {
      const session = await validateSession(ctx, args.sessionToken);
      if (session.role !== "superadmin") {
        scopeMcaId = session.mcaId;
      }
    }

    // MCA session overrides the mcaId filter
    const effectiveMcaId = scopeMcaId ?? args.mcaId;

    let results;

    if (effectiveMcaId) {
      results = await ctx.db
        .query("feedback")
        .withIndex("by_mcaId", (q) => q.eq("mcaId", effectiveMcaId))
        .collect();
    } else if (args.status) {
      results = await ctx.db
        .query("feedback")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .collect();
    } else {
      results = await ctx.db.query("feedback").collect();
    }

    if (effectiveMcaId && args.status) {
      results = results.filter((f) => f.status === args.status);
    }

    return results;
  },
});

export const getByCitizen = query({
  args: { citizenId: v.id("citizens") },
  handler: async (ctx, args) => {
    const feedbacks = await ctx.db
      .query("feedback")
      .withIndex("by_citizenId", (q) => q.eq("citizenId", args.citizenId))
      .collect();

    // Enrich with MCA name
    const enriched = await Promise.all(
      feedbacks.map(async (fb) => {
        const mca = await ctx.db.get(fb.mcaId);
        return { ...fb, mcaName: mca?.name ?? "Unknown MCA", mcaWard: mca?.ward ?? "" };
      })
    );

    return enriched;
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
    sessionToken: v.optional(v.string()),
    feedbackId: v.id("feedback"),
    response: v.string(),
  },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      const session = await validateSession(ctx, args.sessionToken);
      if (session.role !== "superadmin") {
        const fb = await ctx.db.get(args.feedbackId);
        if (!fb || fb.mcaId !== session.mcaId) {
          throw new Error("You can only respond to feedback addressed to you");
        }
      }
    }
    await ctx.db.patch(args.feedbackId, {
      status: "responded",
      response: args.response,
    });
  },
});
