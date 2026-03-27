import { query } from "./_generated/server";

export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const allCitizens = await ctx.db.query("citizens").collect();
    const totalCitizens = allCitizens.length;
    const verifiedCitizens = allCitizens.filter((c) => c.verified).length;

    const allVotes = await ctx.db.query("votes").collect();
    const totalVotes = allVotes.length;
    const ussdVotes = allVotes.filter((v) => v.channel === "ussd").length;
    const webVotes = allVotes.filter((v) => v.channel === "web").length;

    const activeBills = (
      await ctx.db
        .query("bills")
        .withIndex("by_status", (q) => q.eq("status", "open"))
        .collect()
    ).length;

    const pendingFeedback = (
      await ctx.db
        .query("feedback")
        .withIndex("by_status", (q) => q.eq("status", "pending"))
        .collect()
    ).length;

    const allBills = await ctx.db.query("bills").collect();
    const counties = [...new Set(allBills.map((b) => b.county))];

    return {
      totalCitizens,
      verifiedCitizens,
      totalVotes,
      ussdVotes,
      webVotes,
      activeBills,
      pendingFeedback,
      counties,
    };
  },
});

export const getEngagementByMonth = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("engagementByMonth").collect();
  },
});

export const getSentimentByCounty = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("sentimentByCounty").collect();
  },
});

export const getChannelDistribution = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("channelDistribution").collect();
  },
});

export const getTopIssues = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("topIssues").collect();
  },
});

export const getRecentActivity = query({
  args: {},
  handler: async (ctx) => {
    const recentVotes = await ctx.db.query("votes").order("desc").take(10);
    const recentFeedback = await ctx.db
      .query("feedback")
      .order("desc")
      .take(10);

    const activity = [
      ...recentVotes.map((v) => ({
        type: "vote" as const,
        timestamp: v.timestamp,
        data: v,
      })),
      ...recentFeedback.map((f) => ({
        type: "feedback" as const,
        timestamp: f.timestamp,
        data: f,
      })),
    ];

    activity.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return activity.slice(0, 10);
  },
});
