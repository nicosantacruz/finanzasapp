'use client'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { CompanyForm } from '@/components/company-form'
import type { Company } from '@/types/company'

interface CompanyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  company?: Company // Si se pasa, es modo edición
  onSuccess: (company: Company) => void
}

export function CompanyDialog({
  open,
  onOpenChange,
  company,
  onSuccess,
}: CompanyDialogProps) {
  const handleSuccess = (company: Company) => {
    onSuccess(company)
    onOpenChange(false)
  }

  const handleCancel = () => {
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {company ? 'Editar Empresa' : 'Nueva Empresa'}
          </DialogTitle>
          <DialogDescription>
            {company
              ? 'Modifica los datos de tu empresa'
              : 'Crea una nueva empresa para gestionar tus finanzas'}
          </DialogDescription>
        </DialogHeader>
        <CompanyForm
          company={company}
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </DialogContent>
    </Dialog>
  )
}
