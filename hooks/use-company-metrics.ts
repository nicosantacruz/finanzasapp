"use client"

import { useCompany } from "@/contexts/company-context"
import { getCompanyMetrics, getMonthlyData, getRecentTransactions } from "@/lib/company-data"

export function useCompanyMetrics() {
  const { currentCompany } = useCompany()

  if (!currentCompany) {
    return {
      metrics: null,
      monthlyData: [],
      recentTransactions: [],
    }
  }

  return {
    metrics: getCompanyMetrics(currentCompany.id),
    monthlyData: getMonthlyData(currentCompany.id),
    recentTransactions: getRecentTransactions(currentCompany.id),
  }
}
