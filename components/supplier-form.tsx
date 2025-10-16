'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Loader2 } from 'lucide-react'
import type { Supplier } from '@/types/index'

interface SupplierFormProps {
  supplier?: Supplier
  onSubmit: (data: any) => void
  onCancel: () => void
  companyId: string
  userId: string
}

export function SupplierForm({ supplier, onSubmit, onCancel, companyId, userId }: SupplierFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    rut: '',
    contactName: '',
    notes: '',
  })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name,
        email: supplier.email || '',
        phone: supplier.phone || '',
        address: supplier.address || '',
        rut: supplier.rut || '',
        contactName: supplier.contactName || '',
        notes: supplier.notes || '',
      })
    }
  }, [supplier])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name) {
      return
    }

    setLoading(true)
    
    try {
      await onSubmit({
        name: formData.name,
        email: formData.email || undefined,
        phone: formData.phone || undefined,
        address: formData.address || undefined,
        rut: formData.rut || undefined,
        contactName: formData.contactName || undefined,
        notes: formData.notes || undefined,
      })
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Proveedor *</Label>
            <Input
              id="name"
              placeholder="Nombre de la empresa o persona"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="rut">RUT</Label>
              <Input
                id="rut"
                placeholder="12.345.678-9"
                value={formData.rut}
                onChange={(e) => setFormData(prev => ({ ...prev, rut: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">Persona de Contacto</Label>
              <Input
                id="contactName"
                placeholder="Nombre del contacto"
                value={formData.contactName}
                onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="proveedor@email.com"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono</Label>
              <Input
                id="phone"
                placeholder="+56 9 1234 5678"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Dirección</Label>
            <Input
              id="address"
              placeholder="Dirección completa"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas</Label>
            <Textarea
              id="notes"
              placeholder="Información adicional sobre el proveedor..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {supplier ? 'Actualizar' : 'Crear'} Proveedor
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
