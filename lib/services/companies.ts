import { createClient } from '@/lib/supabase/client'
import type { Company, CompanyMetrics } from '@/types/company'
import type { Transaction } from '@/types/transaction'

export async function getCompaniesByUserId(userId: string): Promise<Company[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('company_users')
    .select(
      `
      company:companies (
        id,
        name,
        logo,
        currency,
        timezone,
        createdAt:created_at,
        updatedAt:updated_at
      )
    `
    )
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching companies:', error)
    return []
  }

  return data?.map(item => item.company).filter(Boolean) || []
}

export async function getCompanyById(id: string): Promise<Company | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching company:', error)
    return null
  }

  return data
}

export async function getCompanyMetrics(
  companyId: string
): Promise<CompanyMetrics> {
  const supabase = createClient()

  // Obtener ingresos del último mes
  const { data: incomeData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('company_id', companyId)
    .eq('type', 'income')
    .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  // Obtener gastos del último mes
  const { data: expenseData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('company_id', companyId)
    .eq('type', 'expense')
    .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  // Obtener ingresos del mes anterior para calcular cambio
  const { data: prevIncomeData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('company_id', companyId)
    .eq('type', 'income')
    .gte('date', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
    .lt('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  // Obtener gastos del mes anterior para calcular cambio
  const { data: prevExpenseData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('company_id', companyId)
    .eq('type', 'expense')
    .gte('date', new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString())
    .lt('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const totalIncome = incomeData?.reduce((sum, t) => sum + t.amount, 0) || 0
  const totalExpenses = expenseData?.reduce((sum, t) => sum + t.amount, 0) || 0
  const prevTotalIncome =
    prevIncomeData?.reduce((sum, t) => sum + t.amount, 0) || 0
  const prevTotalExpenses =
    prevExpenseData?.reduce((sum, t) => sum + t.amount, 0) || 0

  const netUtility = totalIncome - totalExpenses
  const prevNetUtility = prevTotalIncome - prevTotalExpenses

  // Calcular cambios porcentuales
  const incomeChange =
    prevTotalIncome > 0
      ? ((totalIncome - prevTotalIncome) / prevTotalIncome) * 100
      : 0
  const expensesChange =
    prevTotalExpenses > 0
      ? ((totalExpenses - prevTotalExpenses) / prevTotalExpenses) * 100
      : 0
  const utilityChange =
    prevNetUtility !== 0
      ? ((netUtility - prevNetUtility) / Math.abs(prevNetUtility)) * 100
      : 0

  return {
    totalIncome,
    totalExpenses,
    netUtility,
    totalAssets: 0, // TODO: Implementar cálculo de activos
    incomeChange,
    expensesChange,
    utilityChange,
    assetsChange: 0, // TODO: Implementar cambio de activos
  }
}

export async function getRecentTransactions(
  companyId: string,
  limit: number = 10
): Promise<Transaction[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('transactions')
    .select(
      `
      id,
      type,
      amount,
      currency,
      description,
      category:categories(name),
      date,
      createdAt:created_at
    `
    )
    .eq('company_id', companyId)
    .order('date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data || []
}

export async function getMonthlyData(companyId: string, months: number = 6) {
  const supabase = createClient()

  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  const { data, error } = await supabase
    .from('transactions')
    .select('type, amount, date')
    .eq('company_id', companyId)
    .gte('date', startDate.toISOString())

  if (error) {
    console.error('Error fetching monthly data:', error)
    return []
  }

  // Agrupar por mes
  const monthlyData: { [key: string]: { income: number; expenses: number } } =
    {}

  data?.forEach(transaction => {
    const month = new Date(transaction.date).toLocaleDateString('es-ES', {
      month: 'short',
    })
    if (!monthlyData[month]) {
      monthlyData[month] = { income: 0, expenses: 0 }
    }

    if (transaction.type === 'income') {
      monthlyData[month].income += transaction.amount
    } else {
      monthlyData[month].expenses += transaction.amount
    }
  })

  return Object.entries(monthlyData).map(([month, data]) => ({
    month,
    income: data.income / 100, // Convertir de centavos a unidades
    expenses: data.expenses / 100,
  }))
}

export async function createCompany(
  data: {
    name: string
    logo?: string
    currency?: string
    timezone?: string
  },
  userId: string
): Promise<Company | null> {
  const supabase = createClient()

  console.log('Creating company with data:', data)
  console.log('User ID:', userId)

  const { data: company, error: companyError } = await supabase
    .from('companies')
    .insert({
      name: data.name,
      logo: data.logo,
      currency: data.currency || 'CLP',
      timezone: data.timezone || 'America/Santiago',
    })
    .select()
    .single()

  if (companyError) {
    console.error('Error creating company:', companyError)
    return null
  }

  console.log('Company created successfully:', company)

  // Agregar usuario como owner de la empresa
  const { error: userError } = await supabase.from('company_users').insert({
    user_id: userId,
    company_id: company.id,
    role: 'owner',
  })

  if (userError) {
    console.error('Error adding user to company:', userError)
    return null
  }

  console.log('User added to company successfully')
  return company
}

export async function updateCompany(
  id: string,
  data: {
    name?: string
    currency?: string
    timezone?: string
    logo?: string
  },
  userId: string
): Promise<Company | null> {
  const supabase = createClient()

  // Verificar que el usuario tiene permisos
  const { data: userRole } = await supabase
    .from('company_users')
    .select('role')
    .eq('company_id', id)
    .eq('user_id', userId)
    .single()

  if (!userRole || (userRole.role !== 'owner' && userRole.role !== 'admin')) {
    throw new Error('No tienes permisos para editar esta empresa')
  }

  const { data: company, error } = await supabase
    .from('companies')
    .update({
      ...(data.name && { name: data.name }),
      ...(data.currency && { currency: data.currency }),
      ...(data.timezone && { timezone: data.timezone }),
      ...(data.logo !== undefined && { logo: data.logo }),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating company:', error)
    return null
  }

  return company
}

export async function deleteCompany(
  id: string,
  userId: string
): Promise<boolean> {
  const supabase = createClient()

  // Verificar que el usuario es owner
  const { data: userRole } = await supabase
    .from('company_users')
    .select('role')
    .eq('company_id', id)
    .eq('user_id', userId)
    .single()

  if (!userRole || userRole.role !== 'owner') {
    throw new Error('Solo el propietario puede eliminar la empresa')
  }

  // Eliminar en cascada: primero los datos relacionados, luego la empresa
  const { error: transactionsError } = await supabase
    .from('transactions')
    .delete()
    .eq('company_id', id)

  if (transactionsError) {
    console.error('Error deleting transactions:', transactionsError)
    return false
  }

  const { error: checksError } = await supabase
    .from('checks')
    .delete()
    .eq('company_id', id)

  if (checksError) {
    console.error('Error deleting checks:', checksError)
    return false
  }

  const { error: creditsError } = await supabase
    .from('credits')
    .delete()
    .eq('company_id', id)

  if (creditsError) {
    console.error('Error deleting credits:', creditsError)
    return false
  }

  const { error: suppliersError } = await supabase
    .from('suppliers')
    .delete()
    .eq('company_id', id)

  if (suppliersError) {
    console.error('Error deleting suppliers:', suppliersError)
    return false
  }

  const { error: categoriesError } = await supabase
    .from('categories')
    .delete()
    .eq('company_id', id)

  if (categoriesError) {
    console.error('Error deleting categories:', categoriesError)
    return false
  }

  const { error: companyUsersError } = await supabase
    .from('company_users')
    .delete()
    .eq('company_id', id)

  if (companyUsersError) {
    console.error('Error deleting company users:', companyUsersError)
    return false
  }

  // Finalmente eliminar la empresa
  const { error: companyError } = await supabase
    .from('companies')
    .delete()
    .eq('id', id)

  if (companyError) {
    console.error('Error deleting company:', companyError)
    return false
  }

  return true
}
