'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface CreditFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  companyId: string
  userId: string
}

export function CreditForm({ onSubmit, onCancel, companyId, userId }: CreditFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    interestRate: '0',
    term: '12',
    startDate: new Date(),
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [startDatePickerOpen, setStartDatePickerOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.amount || !formData.term) {
      return
    }

    setLoading(true)
    
    try {
      await onSubmit({
        name: formData.name,
        amount: Math.round(parseFloat(formData.amount) * 100), // Convertir a centavos
        interestRate: parseFloat(formData.interestRate),
        term: parseInt(formData.term),
        startDate: formData.startDate,
        description: formData.description || undefined,
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
          <DialogTitle>Nuevo Crédito</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nombre del Crédito</Label>
            <Input
              id="name"
              placeholder="Préstamo bancario, crédito comercial, etc."
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Monto Total</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestRate">Tasa de Interés Anual (%)</Label>
              <Input
                id="interestRate"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={formData.interestRate}
                onChange={(e) => setFormData(prev => ({ ...prev, interestRate: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="term">Plazo (meses)</Label>
              <Input
                id="term"
                type="number"
                placeholder="12"
                value={formData.term}
                onChange={(e) => setFormData(prev => ({ ...prev, term: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Fecha de Inicio</Label>
              <Popover open={startDatePickerOpen} onOpenChange={setStartDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.startDate ? format(formData.startDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.startDate}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, startDate: date }))
                        setStartDatePickerOpen(false)
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descripción (Opcional)</Label>
            <Textarea
              id="description"
              placeholder="Descripción del crédito..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          {/* Preview */}
          {formData.amount && formData.term && (
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Resumen del Crédito</h4>
              <div className="space-y-1 text-sm">
                <p>Monto: ${parseFloat(formData.amount).toLocaleString()}</p>
                <p>Plazo: {formData.term} meses</p>
                <p>Tasa: {formData.interestRate}% anual</p>
                {parseFloat(formData.interestRate) > 0 && (
                  <p className="font-medium">
                    Pago mensual estimado: ${Math.round(
                      (parseFloat(formData.amount) * (parseFloat(formData.interestRate) / 100 / 12) * Math.pow(1 + parseFloat(formData.interestRate) / 100 / 12, parseInt(formData.term))) /
                      (Math.pow(1 + parseFloat(formData.interestRate) / 100 / 12, parseInt(formData.term)) - 1)
                    ).toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Crédito
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
