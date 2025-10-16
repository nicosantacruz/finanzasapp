import { createClient } from '@/lib/supabase/client'

export interface Credit {
  id: string
  companyId: string
  userId: string
  name: string
  amount: number // in cents
  currency: string
  interestRate: number
  term: number // months
  monthlyPayment: number // in cents
  startDate: Date
  endDate: Date
  status: 'active' | 'paid' | 'defaulted'
  description?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateCreditData {
  companyId: string
  userId: string
  name: string
  amount: number // in cents
  currency?: string
  interestRate?: number
  term: number // months
  startDate: Date
  description?: string
}

export async function getCredits(
  companyId: string,
  options: {
    limit?: number
    offset?: number
    status?: string
  } = {}
): Promise<Credit[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('credits')
    .select('*')
    .eq('company_id', companyId)
    .order('start_date', { ascending: false })

  if (options.status) {
    query = query.eq('status', options.status)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching credits:', error)
    return []
  }

  return data?.map(credit => ({
    ...credit,
    startDate: new Date(credit.start_date),
    endDate: new Date(credit.end_date),
    createdAt: new Date(credit.created_at),
    updatedAt: new Date(credit.updated_at),
  })) || []
}

export async function createCredit(data: CreateCreditData): Promise<Credit | null> {
  const supabase = createClient()
  
  // Calcular fecha de fin y pago mensual
  const endDate = new Date(data.startDate)
  endDate.setMonth(endDate.getMonth() + data.term)
  
  // Calcular pago mensual usando fórmula de amortización
  const monthlyPayment = calculateMonthlyPayment(
    data.amount,
    data.interestRate || 0,
    data.term
  )

  const { data: credit, error } = await supabase
    .from('credits')
    .insert({
      company_id: data.companyId,
      user_id: data.userId,
      name: data.name,
      amount: data.amount,
      currency: data.currency || 'CLP',
      interest_rate: data.interestRate || 0,
      term: data.term,
      monthly_payment: monthlyPayment,
      start_date: data.startDate.toISOString(),
      end_date: endDate.toISOString(),
      description: data.description,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating credit:', error)
    return null
  }

  return {
    ...credit,
    startDate: new Date(credit.start_date),
    endDate: new Date(credit.end_date),
    createdAt: new Date(credit.created_at),
    updatedAt: new Date(credit.updated_at),
  }
}

export async function updateCreditStatus(
  id: string,
  status: 'active' | 'paid' | 'defaulted'
): Promise<Credit | null> {
  const supabase = createClient()
  
  const { data: credit, error } = await supabase
    .from('credits')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating credit status:', error)
    return null
  }

  return {
    ...credit,
    startDate: new Date(credit.start_date),
    endDate: new Date(credit.end_date),
    createdAt: new Date(credit.created_at),
    updatedAt: new Date(credit.updated_at),
  }
}

export async function getUpcomingPayments(companyId: string, days: number = 30): Promise<Credit[]> {
  const supabase = createClient()
  
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + days)

  const { data, error } = await supabase
    .from('credits')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', 'active')
    .lte('end_date', endDate.toISOString())
    .order('end_date', { ascending: true })

  if (error) {
    console.error('Error fetching upcoming payments:', error)
    return []
  }

  return data?.map(credit => ({
    ...credit,
    startDate: new Date(credit.start_date),
    endDate: new Date(credit.end_date),
    createdAt: new Date(credit.created_at),
    updatedAt: new Date(credit.updated_at),
  })) || []
}

function calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
  if (annualRate === 0) {
    return Math.round(principal / months)
  }
  
  const monthlyRate = annualRate / 100 / 12
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                 (Math.pow(1 + monthlyRate, months) - 1)
  
  return Math.round(payment)
}

export async function getCreditStats(companyId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('credits')
    .select('amount, monthly_payment, status')
    .eq('company_id', companyId)

  if (error) {
    console.error('Error fetching credit stats:', error)
    return { totalDebt: 0, monthlyPayments: 0, activeCredits: 0 }
  }

  const activeCredits = data?.filter(c => c.status === 'active') || []
  const totalDebt = activeCredits.reduce((sum, c) => sum + c.amount, 0)
  const monthlyPayments = activeCredits.reduce((sum, c) => sum + c.monthly_payment, 0)

  return {
    totalDebt,
    monthlyPayments,
    activeCredits: activeCredits.length,
  }
}
