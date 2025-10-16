"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useCompany } from "@/contexts/company-context"
import { Building2, FileText, ArrowLeftRight } from "lucide-react"

export function CompanySummary() {
  const { currentCompany } = useCompany()

  if (!currentCompany) return null

  return (
    <Card className="border-border/50 shadow-sm card-luxury h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Building2 className="h-5 w-5 text-primary" />
          Resumen de Empresa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg tracking-tight">{currentCompany.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">{currentCompany.name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="space-y-2 p-4 rounded-xl bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              Cuentas
            </div>
            <p className="text-3xl font-bold tracking-tight">0</p>
          </div>
          <div className="space-y-2 p-4 rounded-xl bg-secondary/30 border border-border/30">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <ArrowLeftRight className="h-4 w-4" />
              Transacciones
            </div>
            <p className="text-3xl font-bold tracking-tight">0</p>
          </div>
        </div>

        <div className="pt-4 border-t border-border/50 space-y-2">
          <div className="flex justify-between text-sm items-center">
            <span className="text-muted-foreground font-medium">Moneda Base</span>
            <span className="font-semibold text-base">{currentCompany.currency}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
