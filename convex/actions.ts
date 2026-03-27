import { action } from "./_generated/server";
import { v } from "convex/values";

export const simulateIPRSVerification = action({
  args: { nationalId: v.string() },
  handler: async (_ctx, args) => {
    // Simulate external API call with 1-second delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (args.nationalId.length === 8) {
      return {
        verified: true,
        name: "Verified Citizen",
        county: "Kiambu",
        ward: "Agikuyu",
      };
    }

    return {
      verified: false,
      name: null,
      county: null,
      ward: null,
    };
  },
});
