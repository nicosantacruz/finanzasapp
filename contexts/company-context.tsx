'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import type { Company } from '@/types/company'
import { getCompaniesByUserId } from '@/lib/services/companies'
import { useAuth } from './auth-context'

interface CompanyContextType {
  selectedCompany: Company | null
  setSelectedCompany: (company: Company) => void
  companies: Company[]
  loading: boolean
  error: string | null
  refreshCompanies: () => Promise<void>
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined)

export function CompanyProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [selectedCompany, setSelectedCompanyState] = useState<Company | null>(
    null
  )
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCompanies() {
      if (!user) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)

        const userCompanies = await getCompaniesByUserId(user.id)
        setCompanies(userCompanies)

        // Cargar empresa seleccionada desde localStorage o usar la primera
        const savedCompanyId = localStorage.getItem('selectedCompanyId')
        const company = savedCompanyId
          ? userCompanies.find(c => c.id === savedCompanyId) || userCompanies[0]
          : userCompanies[0]

        if (company) {
          setSelectedCompanyState(company)
        }
      } catch (err) {
        console.error('Error loading companies:', err)
        setError('Error al cargar las empresas')
      } finally {
        setLoading(false)
      }
    }

    loadCompanies()
  }, [user])

  const setSelectedCompany = (company: Company) => {
    setSelectedCompanyState(company)
    localStorage.setItem('selectedCompanyId', company.id)
  }

  const refreshCompanies = async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const userCompanies = await getCompaniesByUserId(user.id)
      setCompanies(userCompanies)

      // Si no hay empresa seleccionada, seleccionar la primera
      if (!selectedCompany && userCompanies.length > 0) {
        setSelectedCompanyState(userCompanies[0])
        localStorage.setItem('selectedCompanyId', userCompanies[0].id)
      }
    } catch (err) {
      console.error('Error refreshing companies:', err)
      setError('Error al actualizar las empresas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <CompanyContext.Provider
      value={{
        selectedCompany,
        setSelectedCompany,
        companies,
        loading,
        error,
        refreshCompanies,
      }}
    >
      {children}
    </CompanyContext.Provider>
  )
}

export function useCompany() {
  const context = useContext(CompanyContext)
  if (context === undefined) {
    throw new Error('useCompany must be used within a CompanyProvider')
  }
  return context
}
