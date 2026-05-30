/**
 * SolutionDetailContext.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Provides the WordPress page ID to all solution-detail section components.
 * Each dedicated solution page wraps its sections in this context with its
 * own post ID so every section fetches from the correct WP page.
 */

import { createContext, useContext } from "react";
import { DEFAULT_PAGE_ID } from "./solutionsDetailApi";

export const SolutionDetailContext = createContext(DEFAULT_PAGE_ID);

/**
 * useSolutionPageId()
 * Returns the pageId from the nearest SolutionDetailContext provider.
 * Falls back to DEFAULT_PAGE_ID (919) when used outside a provider.
 */
export function useSolutionPageId() {
  return useContext(SolutionDetailContext);
}
