import { createClient } from '@/lib/supabase/client'

export interface Check {
  id: string
  companyId: string
  userId: string
  number: string
  amount: number // in cents
  currency: string
  bank: string
  issueDate: Date
  dueDate: Date
  status: 'pending' | 'paid' | 'rejected' | 'cancelled'
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateCheckData {
  companyId: string
  userId: string
  number: string
  amount: number // in cents
  currency?: string
  bank: string
  issueDate: Date
  dueDate: Date
  description?: string
}

export async function getChecks(
  companyId: string,
  options: {
    limit?: number
    offset?: number
    status?: string
    startDate?: Date
    endDate?: Date
  } = {}
): Promise<Check[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('checks')
    .select('*')
    .eq('company_id', companyId)
    .order('due_date', { ascending: true })

  if (options.status) {
    query = query.eq('status', options.status)
  }

  if (options.startDate) {
    query = query.gte('due_date', options.startDate.toISOString())
  }

  if (options.endDate) {
    query = query.lte('due_date', options.endDate.toISOString())
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching checks:', error)
    return []
  }

  return data?.map(check => ({
    ...check,
    issueDate: new Date(check.issue_date),
    dueDate: new Date(check.due_date),
    createdAt: new Date(check.created_at),
    updatedAt: new Date(check.updated_at),
  })) || []
}

export async function createCheck(data: CreateCheckData): Promise<Check | null> {
  const supabase = createClient()
  
  const { data: check, error } = await supabase
    .from('checks')
    .insert({
      company_id: data.companyId,
      user_id: data.userId,
      number: data.number,
      amount: data.amount,
      currency: data.currency || 'CLP',
      bank: data.bank,
      issue_date: data.issueDate.toISOString(),
      due_date: data.dueDate.toISOString(),
      description: data.description,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating check:', error)
    return null
  }

  return {
    ...check,
    issueDate: new Date(check.issue_date),
    dueDate: new Date(check.due_date),
    createdAt: new Date(check.created_at),
    updatedAt: new Date(check.updated_at),
  }
}

export async function updateCheckStatus(
  id: string,
  status: 'pending' | 'paid' | 'rejected' | 'cancelled'
): Promise<Check | null> {
  const supabase = createClient()
  
  const { data: check, error } = await supabase
    .from('checks')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating check status:', error)
    return null
  }

  return {
    ...check,
    issueDate: new Date(check.issue_date),
    dueDate: new Date(check.due_date),
    createdAt: new Date(check.created_at),
    updatedAt: new Date(check.updated_at),
  }
}

export async function getUpcomingChecks(companyId: string, days: number = 7): Promise<Check[]> {
  const supabase = createClient()
  
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + days)

  const { data, error } = await supabase
    .from('checks')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'pending')
    .gte('due_date', new Date().toISOString())
    .lte('due_date', endDate.toISOString())
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching upcoming checks:', error)
    return []
  }

  return data?.map(check => ({
    ...check,
    issueDate: new Date(check.issue_date),
    dueDate: new Date(check.due_date),
    createdAt: new Date(check.created_at),
    updatedAt: new Date(check.updated_at),
  })) || []
}

export async function getOverdueChecks(companyId: string): Promise<Check[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('checks')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'pending')
    .lt('due_date', new Date().toISOString())
    .order('due_date', { ascending: true })

  if (error) {
    console.error('Error fetching overdue checks:', error)
    return []
  }

  return data?.map(check => ({
    ...check,
    issueDate: new Date(check.issue_date),
    dueDate: new Date(check.due_date),
    createdAt: new Date(check.created_at),
    updatedAt: new Date(check.updated_at),
  })) || []
}
