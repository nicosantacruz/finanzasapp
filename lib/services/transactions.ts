import { createClient } from '@/lib/supabase/client'
import type { Transaction } from '@/types/transaction'

export interface CreateTransactionData {
  companyId: string
  userId: string
  type: 'income' | 'expense'
  amount: number // in cents
  currency?: string
  description: string
  categoryId?: string
  date: Date
}

export async function getTransactions(
  companyId: string,
  options: {
    limit?: number
    offset?: number
    type?: 'income' | 'expense'
    categoryId?: string
    startDate?: Date
    endDate?: Date
  } = {}
): Promise<Transaction[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('transactions')
    .select(`
      id,
      type,
      amount,
      currency,
      description,
      category:categories(name),
      date,
      createdAt:created_at
    `)
    .eq('company_id', companyId)
    .order('date', { ascending: false })

  if (options.type) {
    query = query.eq('type', options.type)
  }

  if (options.categoryId) {
    query = query.eq('category_id', options.categoryId)
  }

  if (options.startDate) {
    query = query.gte('date', options.startDate.toISOString())
  }

  if (options.endDate) {
    query = query.lte('date', options.endDate.toISOString())
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data || []
}

export async function createTransaction(data: CreateTransactionData): Promise<Transaction | null> {
  const supabase = createClient()
  
  const { data: transaction, error } = await supabase
    .from('transactions')
    .insert({
      company_id: data.companyId,
      user_id: data.userId,
      type: data.type,
      amount: data.amount,
      currency: data.currency || 'CLP',
      description: data.description,
      category_id: data.categoryId,
      date: data.date.toISOString(),
    })
    .select(`
      id,
      type,
      amount,
      currency,
      description,
      category:categories(name),
      date,
      createdAt:created_at
    `)
    .single()

  if (error) {
    console.error('Error creating transaction:', error)
    return null
  }

  return transaction
}

export async function updateTransaction(
  id: string,
  data: Partial<CreateTransactionData>
): Promise<Transaction | null> {
  const supabase = createClient()
  
  const updateData: any = {}
  if (data.type) updateData.type = data.type
  if (data.amount !== undefined) updateData.amount = data.amount
  if (data.currency) updateData.currency = data.currency
  if (data.description) updateData.description = data.description
  if (data.categoryId) updateData.category_id = data.categoryId
  if (data.date) updateData.date = data.date.toISOString()

  const { data: transaction, error } = await supabase
    .from('transactions')
    .update(updateData)
    .eq('id', id)
    .select(`
      id,
      type,
      amount,
      currency,
      description,
      category:categories(name),
      date,
      createdAt:created_at
    `)
    .single()

  if (error) {
    console.error('Error updating transaction:', error)
    return null
  }

  return transaction
}

export async function deleteTransaction(id: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('transactions')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting transaction:', error)
    return false
  }

  return true
}

export async function getTransactionStats(companyId: string, period: 'month' | 'year' = 'month') {
  const supabase = createClient()
  
  const startDate = new Date()
  if (period === 'month') {
    startDate.setMonth(startDate.getMonth() - 1)
  } else {
    startDate.setFullYear(startDate.getFullYear() - 1)
  }

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount')
    .eq('company_id', companyId)
    .gte('date', startDate.toISOString())

  if (error) {
    console.error('Error fetching transaction stats:', error)
    return { totalIncome: 0, totalExpenses: 0, netProfit: 0 }
  }

  const totalIncome = data
    ?.filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0) || 0

  const totalExpenses = data
    ?.filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0) || 0

  return {
    totalIncome,
    totalExpenses,
    netProfit: totalIncome - totalExpenses,
  }
}
