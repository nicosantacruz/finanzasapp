"use client"

import { Check, ChevronsUpDown, Building2, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCompany } from "@/contexts/company-context"
import { useState } from "react"

export function CompanySelector() {
  const { selectedCompany, setSelectedCompany, companies, loading, error } = useCompany()
  const [open, setOpen] = useState(false)

  if (loading) {
    return (
      <Button
        variant="outline"
        disabled
        className="w-full justify-between bg-background/50 border-border/50 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
          <span className="truncate font-medium">Cargando empresas...</span>
        </div>
      </Button>
    )
  }

  if (error) {
    return (
      <Button
        variant="outline"
        disabled
        className="w-full justify-between bg-background/50 border-border/50 shadow-sm"
      >
        <div className="flex items-center gap-2">
          <Building2 className="h-4 w-4 text-destructive" />
          <span className="truncate font-medium text-destructive">Error al cargar</span>
        </div>
      </Button>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between bg-background/50 hover:bg-background border-border/50 shadow-sm transition-luxury hover:shadow-md"
        >
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="truncate font-medium">{selectedCompany?.name || "Seleccionar empresa"}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0 shadow-lg border-border/50">
        <Command>
          <CommandInput placeholder="Buscar empresa..." className="h-10" />
          <CommandList>
            <CommandEmpty>No se encontró la empresa.</CommandEmpty>
            <CommandGroup>
              {companies.map((company) => (
                <CommandItem
                  key={company.id}
                  value={company.name}
                  onSelect={() => {
                    setSelectedCompany(company)
                    setOpen(false)
                  }}
                  className="transition-luxury"
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", selectedCompany?.id === company.id ? "opacity-100" : "opacity-0")}
                  />
                  <span className="font-medium">{company.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
