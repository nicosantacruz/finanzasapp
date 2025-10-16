'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'
import { createCompany, updateCompany } from '@/lib/services/companies'
import { useAuth } from '@/contexts/auth-context'
import type { Company } from '@/types/company'

interface CompanyFormProps {
  company?: Company // Si se pasa, es modo edición
  onSuccess: (company: Company) => void
  onCancel: () => void
}

const CURRENCIES = [
  { value: 'CLP', label: 'Peso Chileno (CLP)' },
  { value: 'USD', label: 'Dólar Americano (USD)' },
  { value: 'EUR', label: 'Euro (EUR)' },
  { value: 'ARS', label: 'Peso Argentino (ARS)' },
  { value: 'BRL', label: 'Real Brasileño (BRL)' },
]

const TIMEZONES = [
  { value: 'America/Santiago', label: 'Santiago, Chile' },
  { value: 'America/New_York', label: 'Nueva York, USA' },
  { value: 'America/Los_Angeles', label: 'Los Ángeles, USA' },
  { value: 'Europe/Madrid', label: 'Madrid, España' },
  { value: 'America/Buenos_Aires', label: 'Buenos Aires, Argentina' },
  { value: 'America/Sao_Paulo', label: 'São Paulo, Brasil' },
]

export function CompanyForm({
  company,
  onSuccess,
  onCancel,
}: CompanyFormProps) {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: company?.name || '',
    currency: company?.currency || 'CLP',
    timezone: company?.timezone || 'America/Santiago',
    logo: company?.logo || '',
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre de la empresa es requerido')
      return false
    }
    if (formData.name.trim().length < 2) {
      setError('El nombre debe tener al menos 2 caracteres')
      return false
    }
    if (formData.name.trim().length > 100) {
      setError('El nombre no puede exceder 100 caracteres')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return
    if (!user) {
      setError('No estás autenticado')
      return
    }

    console.log('Form submitted with data:', formData)
    console.log('User:', user)

    setIsLoading(true)
    setError('')

    try {
      let result: Company | null = null

      if (company) {
        // Modo edición
        console.log('Updating company:', company.id)
        result = await updateCompany(company.id, formData, user.id)
      } else {
        // Modo creación
        console.log('Creating new company')
        result = await createCompany(formData, user.id)
      }

      console.log('Result:', result)

      if (result) {
        onSuccess(result)
      } else {
        setError(
          company
            ? 'Error al actualizar la empresa'
            : 'Error al crear la empresa'
        )
      }
    } catch (err) {
      console.error('Error in handleSubmit:', err)
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('') // Limpiar error al cambiar campos
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Nombre de la empresa *</Label>
        <Input
          id="name"
          type="text"
          placeholder="Mi Empresa S.A."
          value={formData.name}
          onChange={e => handleInputChange('name', e.target.value)}
          required
          disabled={isLoading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="currency">Moneda</Label>
        <Select
          value={formData.currency}
          onValueChange={value => handleInputChange('currency', value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una moneda" />
          </SelectTrigger>
          <SelectContent>
            {CURRENCIES.map(currency => (
              <SelectItem key={currency.value} value={currency.value}>
                {currency.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="timezone">Zona horaria</Label>
        <Select
          value={formData.timezone}
          onValueChange={value => handleInputChange('timezone', value)}
          disabled={isLoading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecciona una zona horaria" />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONES.map(timezone => (
              <SelectItem key={timezone.value} value={timezone.value}>
                {timezone.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logo">Logo (URL opcional)</Label>
        <Input
          id="logo"
          type="url"
          placeholder="https://ejemplo.com/logo.png"
          value={formData.logo}
          onChange={e => handleInputChange('logo', e.target.value)}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          URL de la imagen del logo de la empresa
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {company ? 'Actualizando...' : 'Creando...'}
            </>
          ) : company ? (
            'Actualizar Empresa'
          ) : (
            'Crear Empresa'
          )}
        </Button>
      </div>
    </form>
  )
}
