'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Users, Phone, Mail, MapPin, FileText } from 'lucide-react'
import { useCompany } from '@/contexts/company-context'
import { useAuth } from '@/contexts/auth-context'
import { getSuppliers, createSupplier, updateSupplier, deleteSupplier, getSupplierStats } from '@/lib/services/suppliers'
import type { Supplier } from '@/types/index'
import { SupplierForm } from '@/components/supplier-form'

export default function SuppliersPage() {
  const { selectedCompany } = useCompany()
  const { user } = useAuth()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [stats, setStats] = useState({ totalSuppliers: 0, activeSuppliers: 0 })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null)

  useEffect(() => {
    if (selectedCompany && user) {
      loadSuppliers()
    }
  }, [selectedCompany, user])

  const loadSuppliers = async () => {
    if (!selectedCompany || !user) return

    try {
      setLoading(true)
      const [allSuppliers, supplierStats] = await Promise.all([
        getSuppliers(selectedCompany.id, { limit: 100 }),
        getSupplierStats(selectedCompany.id),
      ])
      setSuppliers(allSuppliers)
      setStats(supplierStats)
    } catch (error) {
      console.error('Error loading suppliers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateSupplier = async (data: any) => {
    if (!selectedCompany || !user) return

    try {
      const newSupplier = await createSupplier({
        ...data,
        companyId: selectedCompany.id,
        userId: user.id,
      })

      if (newSupplier) {
        setSuppliers(prev => [newSupplier, ...prev])
        setShowForm(false)
        loadSuppliers() // Recargar estadísticas
      }
    } catch (error) {
      console.error('Error creating supplier:', error)
    }
  }

  const handleUpdateSupplier = async (data: any) => {
    if (!editingSupplier) return

    try {
      const updatedSupplier = await updateSupplier(editingSupplier.id, data)
      if (updatedSupplier) {
        setSuppliers(prev => prev.map(supplier => 
          supplier.id === editingSupplier.id ? updatedSupplier : supplier
        ))
        setEditingSupplier(null)
        loadSuppliers() // Recargar estadísticas
      }
    } catch (error) {
      console.error('Error updating supplier:', error)
    }
  }

  const handleDeleteSupplier = async (supplierId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este proveedor?')) {
      return
    }

    try {
      const success = await deleteSupplier(supplierId)
      if (success) {
        setSuppliers(prev => prev.filter(supplier => supplier.id !== supplierId))
        loadSuppliers() // Recargar estadísticas
      }
    } catch (error) {
      console.error('Error deleting supplier:', error)
    }
  }

  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.email?.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  if (!selectedCompany) {
    return (
      <div className="flex min-h-screen bg-background">
        <div className="flex-1 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                Selecciona una empresa para ver los proveedores
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
            <h1 className="text-3xl font-bold tracking-tight">Proveedores</h1>
            <p className="text-muted-foreground">
              Gestiona proveedores y cuentas por pagar de {selectedCompany.name}
            </p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Proveedor
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Proveedores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSuppliers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Proveedores Activos</CardTitle>
              <FileText className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeSuppliers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cuentas por Pagar</CardTitle>
              <FileText className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">0</div>
              <p className="text-xs text-muted-foreground">Próximamente</p>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar proveedores..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Suppliers List */}
        <Card>
          <CardHeader>
            <CardTitle>Lista de Proveedores</CardTitle>
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
            ) : filteredSuppliers.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No hay proveedores</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredSuppliers.map((supplier) => (
                  <div
                    key={supplier.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="p-2 rounded-full bg-blue-100 text-blue-600">
                        <Users className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{supplier.name}</p>
                        <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                          {supplier.contactName && (
                            <span className="flex items-center">
                              <Users className="mr-1 h-3 w-3" />
                              {supplier.contactName}
                            </span>
                          )}
                          {supplier.email && (
                            <span className="flex items-center">
                              <Mail className="mr-1 h-3 w-3" />
                              {supplier.email}
                            </span>
                          )}
                          {supplier.phone && (
                            <span className="flex items-center">
                              <Phone className="mr-1 h-3 w-3" />
                              {supplier.phone}
                            </span>
                          )}
                          {supplier.address && (
                            <span className="flex items-center">
                              <MapPin className="mr-1 h-3 w-3" />
                              {supplier.address}
                            </span>
                          )}
                        </div>
                        {supplier.rut && (
                          <p className="text-sm text-muted-foreground mt-1">
                            RUT: {supplier.rut}
                          </p>
                        )}
                        {supplier.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {supplier.notes}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingSupplier(supplier)}
                      >
                        Editar
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteSupplier(supplier.id)}
                      >
                        Eliminar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Supplier Form Modal */}
        {showForm && (
          <SupplierForm
            onSubmit={handleCreateSupplier}
            onCancel={() => setShowForm(false)}
            companyId={selectedCompany.id}
            userId={user?.id || ''}
          />
        )}

        {/* Edit Supplier Form Modal */}
        {editingSupplier && (
          <SupplierForm
            supplier={editingSupplier}
            onSubmit={handleUpdateSupplier}
            onCancel={() => setEditingSupplier(null)}
            companyId={selectedCompany.id}
            userId={user?.id || ''}
          />
        )}
      </div>
    </div>
  )
}
