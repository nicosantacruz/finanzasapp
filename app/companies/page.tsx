'use client'

import { useState } from 'react'
import { DashboardNav } from '@/components/dashboard-nav'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Plus,
  Building2,
  MapPin,
  ExternalLink,
  Edit,
  Trash2,
} from 'lucide-react'
import { useCompany } from '@/contexts/company-context'
import { CompanyDialog } from '@/components/company-dialog'
import { deleteCompany } from '@/lib/services/companies'
import { useAuth } from '@/contexts/auth-context'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import type { Company } from '@/types/company'

export default function CompaniesPage() {
  const { companies, selectedCompany, setSelectedCompany, refreshCompanies } =
    useCompany()
  const { user } = useAuth()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null)

  const handleCreateCompany = () => {
    setEditingCompany(null)
    setIsModalOpen(true)
  }

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company)
    setIsModalOpen(true)
  }

  const handleDeleteCompany = (company: Company) => {
    setDeletingCompany(company)
  }

  const confirmDelete = async () => {
    if (!deletingCompany || !user) return

    try {
      const success = await deleteCompany(deletingCompany.id, user.id)
      if (success) {
        toast.success('Empresa eliminada correctamente')
        await refreshCompanies()

        // Si la empresa eliminada era la seleccionada, seleccionar otra
        if (selectedCompany?.id === deletingCompany.id) {
          const remainingCompanies = companies.filter(
            c => c.id !== deletingCompany.id
          )
          if (remainingCompanies.length > 0) {
            setSelectedCompany(remainingCompanies[0])
          }
        }
      } else {
        toast.error('Error al eliminar la empresa')
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al eliminar la empresa'
      )
    } finally {
      setDeletingCompany(null)
    }
  }

  const handleModalSuccess = async (company: Company) => {
    await refreshCompanies()

    // Si es la primera empresa o no hay empresa seleccionada, seleccionarla
    if (!selectedCompany || companies.length === 0) {
      setSelectedCompany(company)
    }

    toast.success(
      editingCompany
        ? 'Empresa actualizada correctamente'
        : 'Empresa creada correctamente'
    )
  }

  return (
    <div className="flex min-h-screen">
      <DashboardNav />
      <div className="flex-1 flex flex-col">
        <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm p-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight font-serif">
                Company Management
              </h1>
              <p className="text-sm text-muted-foreground mt-2 font-medium">
                Manage your business entities and accounting books
              </p>
            </div>
            <Button
              onClick={handleCreateCompany}
              className="shadow-sm transition-luxury hover:shadow-md bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0"
            >
              <Plus className="mr-2 h-4 w-4" />
              New Company
            </Button>
          </div>
        </div>

        <div className="flex-1 p-8 bg-gradient-to-b from-blue-50/30 to-transparent dark:from-blue-950/10">
          <div className="grid gap-6 md:grid-cols-2">
            {companies.map(company => (
              <Card
                key={company.id}
                className={`border-border/50 shadow-sm card-luxury overflow-hidden relative ${
                  selectedCompany?.id === company.id
                    ? 'ring-2 ring-blue-500'
                    : ''
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-blue-100/30 dark:from-blue-950/20 dark:to-blue-900/10 pointer-events-none" />
                <CardHeader className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-500 shadow-md">
                        <Building2 className="h-7 w-7 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-xl">
                          {company.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1.5 mt-1.5 text-xs">
                          {company.name}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold">
                      {company.currency}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>Santiago, Chile</span>
                    </div>

                    <div className="flex gap-2">
                      {selectedCompany?.id === company.id ? (
                        <Button variant="secondary" className="flex-1" disabled>
                          Current Company
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="flex-1 bg-transparent hover:bg-accent transition-luxury group"
                          onClick={() => setSelectedCompany(company)}
                        >
                          <ExternalLink className="mr-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                          Manage Company
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditCompany(company)}
                        className="hover:bg-blue-50 hover:text-blue-600"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>

                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeleteCompany(company)}
                        className="hover:bg-red-50 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Modal para crear/editar empresa */}
      <CompanyDialog
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        company={editingCompany}
        onSuccess={handleModalSuccess}
      />

      {/* Dialog de confirmación para eliminar */}
      <AlertDialog
        open={!!deletingCompany}
        onOpenChange={() => setDeletingCompany(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar empresa?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminarán todos los datos
              asociados: transacciones, cheques, créditos y proveedores.
              <br />
              <strong>Empresa: {deletingCompany?.name}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
