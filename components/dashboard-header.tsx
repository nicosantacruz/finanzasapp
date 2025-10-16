"use client"

import { Button } from "@/components/ui/button"
import { Calendar, FileText, LogOut, User } from "lucide-react"
import { useCompany } from "@/contexts/company-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function DashboardHeader() {
  const { selectedCompany } = useCompany()
  const { user, signOut } = useAuth()
  const router = useRouter()
  const currentDate = new Date().toLocaleDateString("es-ES", { month: "long", year: "numeric" })

  const handleSignOut = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="flex items-center justify-between px-8 py-6">
        <div>
          <h1 className="text-4xl font-bold tracking-tight font-serif">Dashboard Financiero</h1>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            {selectedCompany?.name || 'Sin empresa seleccionada'} • {currentDate}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="default"
            className="shadow-sm transition-luxury hover:shadow-md bg-transparent"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Este Mes
          </Button>
          <Button
            size="default"
            className="shadow-sm transition-luxury hover:shadow-md bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white border-0"
          >
            <FileText className="mr-2 h-4 w-4" />
            Ver Reportes
          </Button>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.email} />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.user_metadata?.full_name || 'Usuario'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
