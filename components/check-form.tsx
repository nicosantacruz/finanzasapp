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

interface CheckFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  companyId: string
  userId: string
}

export function CheckForm({ onSubmit, onCancel, companyId, userId }: CheckFormProps) {
  const [formData, setFormData] = useState({
    number: '',
    amount: '',
    bank: '',
    issueDate: new Date(),
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días desde hoy
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [issueDatePickerOpen, setIssueDatePickerOpen] = useState(false)
  const [dueDatePickerOpen, setDueDatePickerOpen] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.number || !formData.amount || !formData.bank) {
      return
    }

    setLoading(true)
    
    try {
      await onSubmit({
        number: formData.number,
        amount: Math.round(parseFloat(formData.amount) * 100), // Convertir a centavos
        bank: formData.bank,
        issueDate: formData.issueDate,
        dueDate: formData.dueDate,
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
          <DialogTitle>Nuevo Cheque</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="number">Número de Cheque</Label>
              <Input
                id="number"
                placeholder="123456"
                value={formData.number}
                onChange={(e) => setFormData(prev => ({ ...prev, number: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Monto</Label>
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
          </div>

          <div className="space-y-2">
            <Label htmlFor="bank">Banco</Label>
            <Input
              id="bank"
              placeholder="Banco de Chile"
              value={formData.bank}
              onChange={(e) => setFormData(prev => ({ ...prev, bank: e.target.value }))}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Fecha de Emisión</Label>
              <Popover open={issueDatePickerOpen} onOpenChange={setIssueDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.issueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.issueDate ? format(formData.issueDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.issueDate}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, issueDate: date }))
                        setIssueDatePickerOpen(false)
                      }
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Fecha de Vencimiento</Label>
              <Popover open={dueDatePickerOpen} onOpenChange={setDueDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dueDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dueDate ? format(formData.dueDate, "PPP", { locale: es }) : "Seleccionar fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dueDate}
                    onSelect={(date) => {
                      if (date) {
                        setFormData(prev => ({ ...prev, dueDate: date }))
                        setDueDatePickerOpen(false)
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
              placeholder="Descripción del cheque..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Crear Cheque
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
