import type { UserRole } from "@/types/company"

export function canEditCompany(role: UserRole): boolean {
  return role === "owner" || role === "admin"
}

export function canViewCompany(role: UserRole): boolean {
  return role === "owner" || role === "admin" || role === "viewer"
}

export function canDeleteCompany(role: UserRole): boolean {
  return role === "owner"
}

export function canManageUsers(role: UserRole): boolean {
  return role === "owner" || role === "admin"
}

export function canCreateTransactions(role: UserRole): boolean {
  return role === "owner" || role === "admin"
}
