import { authorize } from "./auth";

export const isCustomer = authorize("customer");
export const isRider = authorize("rider");
export const isSeller = authorize("seller");
export const isAdmin = authorize("admin");

// combos for routes multiple roles can access
export const isSellerOrAdmin = authorize("seller", "admin");
export const isRiderOrAdmin = authorize("rider", "admin");


export const ROLES = ["customer", "rider", "seller", "admin"] as const;
export type Role = (typeof ROLES)[number];