'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Receipt } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { formatMoney } from '@/lib/money'
import { useCompany } from '@/contexts/company-context'
import type { Transaction } from '@/types/transaction'

interface RecentTransactionsProps {
  transactions: Transaction[]
}

export function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const { selectedCompany } = useCompany()

  return (
    <Card className="border-border/50 shadow-sm card-luxury">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Receipt className="h-5 w-5 text-primary" />
          Transacciones Recientes
        </CardTitle>
        <Link href="/transactions">
          <Button variant="link" size="sm" className="text-primary font-medium">
            Ver todas →
          </Button>
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-2xl bg-secondary/50 p-4 mb-4 border border-border/30">
              <Receipt className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground font-medium">
              No hay transacciones aún
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map(transaction => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-luxury border border-transparent hover:border-border/30"
              >
                <div>
                  <p className="text-sm font-semibold">
                    {transaction.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {transaction.category?.name || 'Sin categoría'}
                  </p>
                </div>
                <div className="text-right">
                  <p
                    className={`text-sm font-bold ${
                      transaction.type === 'income'
                        ? 'text-emerald-600'
                        : 'text-rose-600'
                    }`}
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatMoney(
                      transaction.amount,
                      selectedCompany?.currency || 'CLP'
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(transaction.date).toLocaleDateString('es-ES')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
