'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, CreditCard, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { useCompany } from '@/contexts/company-context'
import { useAuth } from '@/contexts/auth-context'
import { getChecks, createCheck, updateCheckStatus, getUpcomingChecks, getOverdueChecks } from '@/lib/services/checks'
import { formatMoney } from '@/lib/money'
import type { Check } from '@/types/index'
import { CheckForm } from '@/components/check-form'

export default function ChecksPage() {
  const { selectedCompany } = useCompany()
  const { user } = useAuth()
  const [checks, setChecks] = useState<Check[]>([])
  const [upcomingChecks, setUpcomingChecks] = useState<Check[]>([])
  const [overdueChecks, setOverdueChecks] = useState<Check[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (selectedCompany && user) {
      loadChecks()
    }
  }, [selectedCompany, user])

  const loadChecks = async () => {
    if (!selectedCompany || !user) return

    try {
      setLoading(true)
      const [allChecks, upcoming, overdue] = await Promise.all([
        getChecks(selectedCompany.id, { limit: 100 }),
        getUpcomingChecks(selectedCompany.id, 7),
        getOverdueChecks(selectedCompany.id),
      ])
      setChecks(allChecks)
      setUpcomingChecks(upcoming)
      setOverdueChecks(overdue)
    } catch (error) {
      console.error('Error loading checks:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCheck = async (data: any) => {
    if (!selectedCompany || !user) return

    try {
      const newCheck = await createCheck({
        ...data,
        companyId: selectedCompany.id,
        userId: user.id,
      })

      if (newCheck) {
        setChecks(prev => [newCheck, ...prev])
        setShowForm(false)
        loadChecks() // Recargar para actualizar alertas
      }
    } catch (error) {
      console.error('Error creating check:', error)
    }
  }

  const handleUpdateStatus = async (checkId: string, status: string) => {
    try {
      const updatedCheck = await updateCheckStatus(checkId, status as any)
      if (updatedCheck) {
        setChecks(prev => prev.map(check => 
          check.id === checkId ? updatedCheck : check
        ))
        loadChecks() // Recargar alertas
      }
    } catch (error) {
      console.error('Error updating check status:', error)
    }
  }

  const filteredChecks = checks.filter(check => {
    const matchesSearch = check.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         check.bank.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || check.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />
      case 'paid':
        return <CheckCircle className="h-4 w-4" />
      case 'rejected':
        return <XCircle className="h-4 w-4" />
      case 'cancelled':
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'paid':
        return 'Pagado'
      case 'rejected':
        return 'Rechazado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return status
    }
  }

  if (!selectedCompany) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Selecciona una empresa para ver los cheques
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
            <h1 className="text-3xl font-bold tracking-tight">Cheques</h1>
            <p className="text-muted-foreground">
              Gestiona cheques y fechas de pago de {selectedCompany.name}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Cheque
          </Button>
        </div>

        {/* Alerts */}
        {(upcomingChecks.length > 0 || overdueChecks.length > 0) && (
          <div className="space-y-4">
            {overdueChecks.length > 0 && (
              <Card className="border-red-200 bg-red-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-red-800">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Cheques Vencidos ({overdueChecks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {overdueChecks.slice(0, 3).map((check) => (
                      <div key={check.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Cheque #{check.number}</p>
                          <p className="text-sm text-red-600">
                            {check.bank} • Vencido el {new Date(check.dueDate).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-800">
                            {formatMoney(check.amount, selectedCompany.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {overdueChecks.length > 3 && (
                      <p className="text-sm text-red-600">
                        Y {overdueChecks.length - 3} más...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {upcomingChecks.length > 0 && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center text-yellow-800">
                    <Clock className="mr-2 h-5 w-5" />
                    Cheques Próximos a Vencer ({upcomingChecks.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {upcomingChecks.slice(0, 3).map((check) => (
                      <div key={check.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Cheque #{check.number}</p>
                          <p className="text-sm text-yellow-600">
                            {check.bank} • Vence el {new Date(check.dueDate).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-yellow-800">
                            {formatMoney(check.amount, selectedCompany.currency)}
                          </p>
                        </div>
                      </div>
                    ))}
                    {upcomingChecks.length > 3 && (
                      <p className="text-sm text-yellow-600">
                        Y {upcomingChecks.length - 3} más...
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cheques</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{checks.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {checks.filter(c => c.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pagados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {checks.filter(c => c.status === 'paid').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidos</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {overdueChecks.length}
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
                  placeholder="Buscar por número o banco..."
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
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="paid">Pagados</SelectItem>
                  <SelectItem value="rejected">Rechazados</SelectItem>
                  <SelectItem value="cancelled">Cancelados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Checks List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Cheques</CardTitle>
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
            ) : filteredChecks.length === 0 ? (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay cheques</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredChecks.map((check) => (
                  <div
                    key={check.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-medium">Cheque #{check.number}</p>
                        <p className="text-sm text-muted-foreground">
                          {check.bank} • Emitido: {new Date(check.issueDate).toLocaleDateString('es-ES')} • 
                          Vence: {new Date(check.dueDate).toLocaleDateString('es-ES')}
                        </p>
                        {check.description && (
                          <p className="text-sm text-muted-foreground">{check.description}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="font-bold">
                          {formatMoney(check.amount, selectedCompany.currency)}
                        </p>
                        <Badge className={getStatusColor(check.status)}>
                          {getStatusIcon(check.status)}
                          <span className="ml-1">{getStatusLabel(check.status)}</span>
                        </Badge>
                      </div>
                      {check.status === 'pending' && (
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(check.id, 'paid')}
                          >
                            Marcar Pagado
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleUpdateStatus(check.id, 'rejected')}
                          >
                            Rechazar
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

        {/* Check Form Modal */}
        {showForm && (
          <CheckForm
            onSubmit={handleCreateCheck}
            onCancel={() => setShowForm(false)}
            companyId={selectedCompany.id}
            userId={user?.id || ''}
          />
        )}
      </div>
    </div>
  )
}
