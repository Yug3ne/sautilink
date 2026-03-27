import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { validateSession } from "./auth";

export const list = query({
  args: {
    sessionToken: v.optional(v.string()),
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
    let scopeCounty: string | undefined;

    if (args.sessionToken) {
      const session = await validateSession(ctx, args.sessionToken);
      if (session.role !== "superadmin") {
        scopeCounty = session.county;
      }
    }

    // MCA session overrides the county filter
    const effectiveCounty = scopeCounty ?? args.county;

    let results;

    if (effectiveCounty && args.status) {
      results = await ctx.db
        .query("bills")
        .withIndex("by_county_status", (q) =>
          q.eq("county", effectiveCounty).eq("status", args.status!)
        )
        .collect();
    } else if (effectiveCounty) {
      results = await ctx.db
        .query("bills")
        .withIndex("by_county", (q) => q.eq("county", effectiveCounty))
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
    sessionToken: v.optional(v.string()),
    title: v.string(),
    titleSw: v.string(),
    status: v.union(v.literal("draft"), v.literal("open"), v.literal("closed")),
    county: v.string(),
    ward: v.optional(v.string()),
    uploadedBy: v.optional(v.id("mcas")),
    fullTextUrl: v.string(),
    summaryEn: v.array(v.string()),
    summarySw: v.array(v.string()),
    simplifiedEn: v.optional(v.string()),
    simplifiedSw: v.optional(v.string()),
    detailedSummaryEn: v.optional(v.string()),
    detailedSummarySw: v.optional(v.string()),
    pdfFileId: v.optional(v.id("_storage")),
    category: v.union(
      v.literal("budget"),
      v.literal("health"),
      v.literal("education"),
      v.literal("infrastructure"),
      v.literal("environment")
    ),
  },
  handler: async (ctx, args) => {
    let uploader = args.uploadedBy;

    if (args.sessionToken) {
      const session = await validateSession(ctx, args.sessionToken);
      // Auto-set uploadedBy from session if not provided
      if (!uploader) {
        uploader = session.mcaId;
      }
      // MCAs can only create bills for their own county
      if (session.role !== "superadmin" && args.county !== session.county) {
        throw new Error("You can only create bills for your own county");
      }
    }

    if (!uploader) {
      throw new Error("uploadedBy is required");
    }

    const billId = await ctx.db.insert("bills", {
      title: args.title,
      titleSw: args.titleSw,
      status: args.status,
      county: args.county,
      ...(args.ward ? { ward: args.ward } : {}),
      uploadedBy: uploader,
      fullTextUrl: args.fullTextUrl,
      summaryEn: args.summaryEn,
      summarySw: args.summarySw,
      ...(args.simplifiedEn ? { simplifiedEn: args.simplifiedEn } : {}),
      ...(args.simplifiedSw ? { simplifiedSw: args.simplifiedSw } : {}),
      ...(args.detailedSummaryEn ? { detailedSummaryEn: args.detailedSummaryEn } : {}),
      ...(args.detailedSummarySw ? { detailedSummarySw: args.detailedSummarySw } : {}),
      ...(args.pdfFileId ? { pdfFileId: args.pdfFileId } : {}),
      category: args.category,
      uploadedAt: new Date().toISOString(),
    });
    return billId;
  },
});

export const updateStatus = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    billId: v.id("bills"),
    status: v.union(v.literal("draft"), v.literal("open"), v.literal("closed")),
  },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      const session = await validateSession(ctx, args.sessionToken);
      if (session.role !== "superadmin") {
        const bill = await ctx.db.get(args.billId);
        if (!bill || bill.county !== session.county) {
          throw new Error("You can only update bills in your county");
        }
      }
    }
    await ctx.db.patch(args.billId, { status: args.status });
  },
});

export const update = mutation({
  args: {
    sessionToken: v.optional(v.string()),
    billId: v.id("bills"),
    simplifiedEn: v.optional(v.string()),
    simplifiedSw: v.optional(v.string()),
    detailedSummaryEn: v.optional(v.string()),
    detailedSummarySw: v.optional(v.string()),
    pdfFileId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      const session = await validateSession(ctx, args.sessionToken);
      if (session.role !== "superadmin") {
        const bill = await ctx.db.get(args.billId);
        if (!bill || bill.county !== session.county) {
          throw new Error("You can only update bills in your county");
        }
      }
    }

    const patch: Record<string, unknown> = {};
    if (args.simplifiedEn !== undefined) patch.simplifiedEn = args.simplifiedEn;
    if (args.simplifiedSw !== undefined) patch.simplifiedSw = args.simplifiedSw;
    if (args.detailedSummaryEn !== undefined) patch.detailedSummaryEn = args.detailedSummaryEn;
    if (args.detailedSummarySw !== undefined) patch.detailedSummarySw = args.detailedSummarySw;
    if (args.pdfFileId !== undefined) patch.pdfFileId = args.pdfFileId;

    if (Object.keys(patch).length > 0) {
      await ctx.db.patch(args.billId, patch);
    }
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

export const generateUploadUrl = mutation({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.sessionToken) {
      await validateSession(ctx, args.sessionToken);
    }
    return await ctx.storage.generateUploadUrl();
  },
});

export const getPdfUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, args) => {
    return await ctx.storage.getUrl(args.storageId);
  },
});
