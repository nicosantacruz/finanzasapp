"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
export function UserNav() {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src="/placeholder.svg?height=40&width=40" alt="Nicolas santa cruz" />
        <AvatarFallback className="bg-primary text-primary-foreground">N</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <span className="text-sm font-medium">Nicolas santa cruz</span>
        <span className="text-xs text-muted-foreground">nico.stac@gmail.com</span>
      </div>
    </div>
  )
}
