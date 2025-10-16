'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Filter, Receipt, TrendingUp, TrendingDown } from 'lucide-react'
import { useCompany } from '@/contexts/company-context'
import { useAuth } from '@/contexts/auth-context'
import { getTransactions, createTransaction } from '@/lib/services/transactions'
import { formatMoney } from '@/lib/money'
import type { Transaction } from '@/types/transaction'
import { TransactionForm } from '@/components/transaction-form'

export default function TransactionsPage() {
  const { selectedCompany } = useCompany()
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (selectedCompany && user) {
      loadTransactions()
    }
  }, [selectedCompany, user])

  const loadTransactions = async () => {
    if (!selectedCompany || !user) return

    try {
      setLoading(true)
      const data = await getTransactions(selectedCompany.id, { limit: 100 })
      setTransactions(data)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTransaction = async (data: any) => {
    if (!selectedCompany || !user) return

    try {
      const newTransaction = await createTransaction({
        ...data,
        companyId: selectedCompany.id,
        userId: user.id,
      })

      if (newTransaction) {
        setTransactions(prev => [newTransaction, ...prev])
        setShowForm(false)
      }
    } catch (error) {
      console.error('Error creating transaction:', error)
    }
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = transaction.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || transaction.type === typeFilter
    return matchesSearch && matchesType
  })

  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  if (!selectedCompany) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Selecciona una empresa para ver las transacciones
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
            <h1 className="text-3xl font-bold tracking-tight">Transacciones</h1>
            <p className="text-muted-foreground">
              Gestiona ingresos y gastos de {selectedCompany.name}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Transacción
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Ingresos</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {formatMoney(totalIncome, selectedCompany.currency)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Gastos</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {formatMoney(totalExpenses, selectedCompany.currency)}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Balance Neto</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${totalIncome - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatMoney(totalIncome - totalExpenses, selectedCompany.currency)}
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
                  placeholder="Buscar transacciones..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="income">Ingresos</SelectItem>
                  <SelectItem value="expense">Gastos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Transactions List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Transacciones</CardTitle>
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
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-8">
                <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay transacciones</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        transaction.type === 'income' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'income' ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category?.name || 'Sin categoría'} • {new Date(transaction.date).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}
                        {formatMoney(transaction.amount, selectedCompany.currency)}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {transaction.type === 'income' ? 'Ingreso' : 'Gasto'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction Form Modal */}
        {showForm && (
          <TransactionForm
            onSubmit={handleCreateTransaction}
            onCancel={() => setShowForm(false)}
            companyId={selectedCompany.id}
            userId={user?.id || ''}
          />
        )}
      </div>
    </div>
  )
}
