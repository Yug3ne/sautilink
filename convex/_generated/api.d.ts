/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as actions from "../actions.js";
import type * as auth from "../auth.js";
import type * as bills from "../bills.js";
import type * as budgetItems from "../budgetItems.js";
import type * as citizens from "../citizens.js";
import type * as dashboard from "../dashboard.js";
import type * as feedback from "../feedback.js";
import type * as lib_passwords from "../lib/passwords.js";
import type * as mcas from "../mcas.js";
import type * as seed from "../seed.js";
import type * as votes from "../votes.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  actions: typeof actions;
  auth: typeof auth;
  bills: typeof bills;
  budgetItems: typeof budgetItems;
  citizens: typeof citizens;
  dashboard: typeof dashboard;
  feedback: typeof feedback;
  "lib/passwords": typeof lib_passwords;
  mcas: typeof mcas;
  seed: typeof seed;
  votes: typeof votes;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
