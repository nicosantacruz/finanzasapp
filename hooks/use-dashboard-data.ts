'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/auth-context'
import { useCompany } from '@/contexts/company-context'
import {
  getCompanyMetrics,
  getRecentTransactions,
  getMonthlyData,
} from '@/lib/services/companies'
import type { CompanyMetrics } from '@/types/company'
import type { Transaction } from '@/types/transaction'

interface DashboardData {
  metrics: CompanyMetrics | null
  recentTransactions: Transaction[]
  monthlyData: any[]
  loading: boolean
  error: string | null
}

export function useDashboardData(): DashboardData {
  const { user } = useAuth()
  const { selectedCompany } = useCompany()
  const [data, setData] = useState<DashboardData>({
    metrics: null,
    recentTransactions: [],
    monthlyData: [],
    loading: true,
    error: null,
  })

  useEffect(() => {
    async function loadData() {
      if (!user || !selectedCompany) {
        setData(prev => ({ ...prev, loading: false }))
        return
      }

      try {
        setData(prev => ({ ...prev, loading: true, error: null }))

        const [metrics, transactions, monthly] = await Promise.all([
          getCompanyMetrics(selectedCompany.id),
          getRecentTransactions(selectedCompany.id, 10),
          getMonthlyData(selectedCompany.id, 6),
        ])

        setData({
          metrics,
          recentTransactions: transactions,
          monthlyData: monthly,
          loading: false,
          error: null,
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
        setData(prev => ({
          ...prev,
          loading: false,
          error: 'Error al cargar los datos del dashboard',
        }))
      }
    }

    loadData()
  }, [user, selectedCompany])

  return data
}
