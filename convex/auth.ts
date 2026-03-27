import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { hashPassword, verifyPassword } from "./lib/passwords";

// Reusable session validation helper (not a Convex function)
export async function validateSession(
  ctx: { db: any },
  sessionToken: string
) {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q: any) => q.eq("token", sessionToken))
    .first();
  if (!session || session.expiresAt < Date.now()) {
    throw new Error("Invalid or expired session");
  }
  const mca = await ctx.db.get(session.mcaId);
  if (!mca || !mca.isActive) throw new Error("Account disabled");
  return {
    mca,
    mcaId: session.mcaId,
    county: mca.county as string,
    ward: mca.ward as string,
    role: mca.role as string,
  };
}

export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const mca = await ctx.db
      .query("mcas")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (!mca) throw new Error("Invalid email or password");
    if (!mca.isActive) throw new Error("Account disabled");

    const valid = await verifyPassword(args.password, mca.passwordHash);
    if (!valid) throw new Error("Invalid email or password");

    const token = crypto.randomUUID();
    const now = Date.now();
    await ctx.db.insert("sessions", {
      mcaId: mca._id,
      token,
      expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
      createdAt: now,
    });

    return {
      token,
      mca: {
        _id: mca._id,
        name: mca.name,
        ward: mca.ward,
        county: mca.county,
        role: mca.role,
        avatar: mca.avatar,
      },
    };
  },
});

export const logout = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (session) {
      await ctx.db.delete(session._id);
    }
  },
});

export const getSession = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.sessionToken))
      .first();
    if (!session || session.expiresAt < Date.now()) {
      return null;
    }
    const mca = await ctx.db.get(session.mcaId);
    if (!mca || !mca.isActive) return null;
    return {
      _id: mca._id,
      name: mca.name,
      ward: mca.ward,
      county: mca.county,
      role: mca.role,
      avatar: mca.avatar,
      email: mca.email,
    };
  },
});

export const createMca = mutation({
  args: {
    sessionToken: v.string(),
    name: v.string(),
    email: v.string(),
    password: v.string(),
    ward: v.string(),
    county: v.string(),
    party: v.string(),
    role: v.union(v.literal("mca"), v.literal("superadmin")),
  },
  handler: async (ctx, args) => {
    const { role } = await validateSession(ctx, args.sessionToken);
    if (role !== "superadmin") throw new Error("Unauthorized");

    // Check email uniqueness
    const existing = await ctx.db
      .query("mcas")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();
    if (existing) throw new Error("Email already in use");

    const passwordHash = await hashPassword(args.password);
    const nameParts = args.name.split(" ");
    const avatar =
      nameParts.length >= 2
        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
        : args.name.substring(0, 2).toUpperCase();

    const mcaId = await ctx.db.insert("mcas", {
      name: args.name,
      email: args.email,
      passwordHash,
      ward: args.ward,
      county: args.county,
      party: args.party,
      role: args.role,
      avatar,
      isActive: true,
    });

    return mcaId;
  },
});

export const updateMca = mutation({
  args: {
    sessionToken: v.string(),
    mcaId: v.id("mcas"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    ward: v.optional(v.string()),
    county: v.optional(v.string()),
    party: v.optional(v.string()),
    role: v.optional(v.union(v.literal("mca"), v.literal("superadmin"))),
  },
  handler: async (ctx, args) => {
    const { role } = await validateSession(ctx, args.sessionToken);
    if (role !== "superadmin") throw new Error("Unauthorized");

    const mca = await ctx.db.get(args.mcaId);
    if (!mca) throw new Error("MCA not found");

    // Check email uniqueness if changing email
    if (args.email && args.email !== mca.email) {
      const existing = await ctx.db
        .query("mcas")
        .withIndex("by_email", (q) => q.eq("email", args.email!))
        .first();
      if (existing) throw new Error("Email already in use");
    }

    const updates: Record<string, any> = {};
    if (args.name !== undefined) updates.name = args.name;
    if (args.email !== undefined) updates.email = args.email;
    if (args.ward !== undefined) updates.ward = args.ward;
    if (args.county !== undefined) updates.county = args.county;
    if (args.party !== undefined) updates.party = args.party;
    if (args.role !== undefined) updates.role = args.role;

    // Update avatar if name changed
    if (args.name) {
      const nameParts = args.name.split(" ");
      updates.avatar =
        nameParts.length >= 2
          ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
          : args.name.substring(0, 2).toUpperCase();
    }

    await ctx.db.patch(args.mcaId, updates);
  },
});

export const toggleMcaActive = mutation({
  args: {
    sessionToken: v.string(),
    mcaId: v.id("mcas"),
  },
  handler: async (ctx, args) => {
    const { role } = await validateSession(ctx, args.sessionToken);
    if (role !== "superadmin") throw new Error("Unauthorized");

    const mca = await ctx.db.get(args.mcaId);
    if (!mca) throw new Error("MCA not found");

    await ctx.db.patch(args.mcaId, { isActive: !mca.isActive });
  },
});

export const changePassword = mutation({
  args: {
    sessionToken: v.string(),
    oldPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    const { mca, mcaId } = await validateSession(ctx, args.sessionToken);

    const valid = await verifyPassword(args.oldPassword, mca.passwordHash);
    if (!valid) throw new Error("Current password is incorrect");

    const newHash = await hashPassword(args.newPassword);
    await ctx.db.patch(mcaId, { passwordHash: newHash });
  },
});
