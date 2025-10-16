'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, FileText, TrendingUp, Calendar, DollarSign } from 'lucide-react'
import { useCompany } from '@/contexts/company-context'
import { useAuth } from '@/contexts/auth-context'
import { getCredits, createCredit, updateCreditStatus, getUpcomingPayments, getCreditStats } from '@/lib/services/credits'
import { formatMoney } from '@/lib/money'
import type { Credit } from '@/types/index'
import { CreditForm } from '@/components/credit-form'

export default function CreditsPage() {
  const { selectedCompany } = useCompany()
  const { user } = useAuth()
  const [credits, setCredits] = useState<Credit[]>([])
  const [upcomingPayments, setUpcomingPayments] = useState<Credit[]>([])
  const [stats, setStats] = useState({ totalDebt: 0, monthlyPayments: 0, activeCredits: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (selectedCompany && user) {
      loadCredits()
    }
  }, [selectedCompany, user])

  const loadCredits = async () => {
    if (!selectedCompany || !user) return

    try {
      setLoading(true)
      const [allCredits, upcoming, creditStats] = await Promise.all([
        getCredits(selectedCompany.id, { limit: 100 }),
        getUpcomingPayments(selectedCompany.id, 30),
        getCreditStats(selectedCompany.id),
      ])
      setCredits(allCredits)
      setUpcomingPayments(upcoming)
      setStats(creditStats)
    } catch (error) {
      console.error('Error loading credits:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCredit = async (data: any) => {
    if (!selectedCompany || !user) return

    try {
      const newCredit = await createCredit({
        ...data,
        companyId: selectedCompany.id,
        userId: user.id,
      })

      if (newCredit) {
        setCredits(prev => [newCredit, ...prev])
        setShowForm(false)
        loadCredits() // Recargar estadísticas
      }
    } catch (error) {
      console.error('Error creating credit:', error)
    }
  }

  const handleUpdateStatus = async (creditId: string, status: string) => {
    try {
      const updatedCredit = await updateCreditStatus(creditId, status as any)
      if (updatedCredit) {
        setCredits(prev => prev.map(credit => 
          credit.id === creditId ? updatedCredit : credit
        ))
        loadCredits() // Recargar estadísticas
      }
    } catch (error) {
      console.error('Error updating credit status:', error)
    }
  }

  const filteredCredits = credits.filter(credit => {
    const matchesSearch = credit.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || credit.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'paid':
        return 'bg-blue-100 text-blue-800'
      case 'defaulted':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'paid':
        return 'Pagado'
      case 'defaulted':
        return 'En Mora'
      default:
        return status
    }
  }

  const calculateRemainingPayments = (credit: Credit) => {
    const now = new Date()
    const endDate = new Date(credit.endDate)
    const monthsRemaining = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30)))
    return monthsRemaining
  }

  if (!selectedCompany) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Selecciona una empresa para ver los créditos
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-background">
      <div className="flex-1 space-y-8 p-8 bg-gradient-to-br from-background via-background to-secondary/20">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Créditos</h1>
            <p className="text-muted-foreground">
              Gestiona créditos y préstamos de {selectedCompany.name}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Crédito
          </Button>
        </div>

        {/* Alerts */}
        {upcomingPayments.length > 0 && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="flex items-center text-yellow-800">
                <Calendar className="mr-2 h-5 w-5" />
                Pagos Próximos ({upcomingPayments.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {upcomingPayments.slice(0, 3).map((credit) => (
                  <div key={credit.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{credit.name}</p>
                      <p className="text-sm text-yellow-600">
                        Vence el {new Date(credit.endDate).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-yellow-800">
                        {formatMoney(credit.monthlyPayment, selectedCompany.currency)}
                      </p>
                    </div>
                  </div>
                ))}
                {upcomingPayments.length > 3 && (
                  <p className="text-sm text-yellow-600">
                    Y {upcomingPayments.length - 3} más...
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Deuda</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatMoney(stats.totalDebt, selectedCompany.currency)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagos Mensuales</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {formatMoney(stats.monthlyPayments, selectedCompany.currency)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Créditos Activos</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeCredits}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Próximos Pagos</CardTitle>
              <Calendar className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {upcomingPayments.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar créditos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="paid">Pagados</SelectItem>
                  <SelectItem value="defaulted">En Mora</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Credits List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Créditos</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded animate-pulse" />
                      <div className="h-3 bg-muted rounded animate-pulse w-1/2" />
                    </div>
                    <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                  </div>
                ))}
              </div>
            ) : filteredCredits.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay créditos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredCredits.map((credit) => (
                  <div
                    key={credit.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-purple-100 text-purple-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">{credit.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {credit.term} meses • {credit.interestRate}% anual • 
                          Inicio: {new Date(credit.startDate).toLocaleDateString('es-ES')} • 
                          Fin: {new Date(credit.endDate).toLocaleDateString('es-ES')}
                        </p>
                        {credit.description && (
                          <p className="text-sm text-muted-foreground">{credit.description}</p>
                        )}
                        {credit.status === 'active' && (
                          <p className="text-sm text-blue-600">
                            {calculateRemainingPayments(credit)} pagos restantes
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold">
                          {formatMoney(credit.amount, selectedCompany.currency)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatMoney(credit.monthlyPayment, selectedCompany.currency)}/mes
                        </p>
                        <Badge className={getStatusColor(credit.status)}>
                          {getStatusLabel(credit.status)}
                        </Badge>
                      </div>
                      {credit.status === 'active' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(credit.id, 'paid')}
                          >
                            Marcar Pagado
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(credit.id, 'defaulted')}
                          >
                            Marcar en Mora
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Credit Form Modal */}
        {showForm && (
          <CreditForm
            onSubmit={handleCreateCredit}
            onCancel={() => setShowForm(false)}
            companyId={selectedCompany.id}
            userId={user?.id || ''}
          />
        )}
      </div>
    </div>
  )
}
