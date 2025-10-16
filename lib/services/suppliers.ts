import { createClient } from '@/lib/supabase/client'

export interface Supplier {
  id: string
  companyId: string
  userId: string
  name: string
  email?: string
  phone?: string
  address?: string
  rut?: string // Chilean tax ID
  contactName?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateSupplierData {
  companyId: string
  userId: string
  name: string
  email?: string
  phone?: string
  address?: string
  rut?: string
  contactName?: string
  notes?: string
}

export async function getSuppliers(
  companyId: string,
  options: {
    limit?: number
    offset?: number
    search?: string
  } = {}
): Promise<Supplier[]> {
  const supabase = createClient()
  
  let query = supabase
    .from('suppliers')
    .select('*')
    .eq('company_id', companyId)
    .order('name', { ascending: true })

  if (options.search) {
    query = query.or(`name.ilike.%${options.search}%,contact_name.ilike.%${options.search}%`)
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching suppliers:', error)
    return []
  }

  return data?.map(supplier => ({
    ...supplier,
    createdAt: new Date(supplier.created_at),
    updatedAt: new Date(supplier.updated_at),
  })) || []
}

export async function getSupplierById(id: string): Promise<Supplier | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching supplier:', error)
    return null
  }

  return {
    ...data,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  }
}

export async function createSupplier(data: CreateSupplierData): Promise<Supplier | null> {
  const supabase = createClient()
  
  const { data: supplier, error } = await supabase
    .from('suppliers')
    .insert({
      company_id: data.companyId,
      user_id: data.userId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      rut: data.rut,
      contact_name: data.contactName,
      notes: data.notes,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating supplier:', error)
    return null
  }

  return {
    ...supplier,
    createdAt: new Date(supplier.created_at),
    updatedAt: new Date(supplier.updated_at),
  }
}

export async function updateSupplier(
  id: string,
  data: Partial<CreateSupplierData>
): Promise<Supplier | null> {
  const supabase = createClient()
  
  const updateData: any = {}
  if (data.name) updateData.name = data.name
  if (data.email !== undefined) updateData.email = data.email
  if (data.phone !== undefined) updateData.phone = data.phone
  if (data.address !== undefined) updateData.address = data.address
  if (data.rut !== undefined) updateData.rut = data.rut
  if (data.contactName !== undefined) updateData.contact_name = data.contactName
  if (data.notes !== undefined) updateData.notes = data.notes

  const { data: supplier, error } = await supabase
    .from('suppliers')
    .update(updateData)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating supplier:', error)
    return null
  }

  return {
    ...supplier,
    createdAt: new Date(supplier.created_at),
    updatedAt: new Date(supplier.updated_at),
  }
}

export async function deleteSupplier(id: string): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('suppliers')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting supplier:', error)
    return false
  }

  return true
}

export async function getSupplierTransactions(supplierId: string, companyId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id,
      type,
      amount,
      currency,
      description,
      date,
      createdAt:created_at
    `)
    .eq('company_id', companyId)
    .ilike('description', `%${supplierId}%`) // Buscar por ID en descripción
    .order('date', { ascending: false })
    .limit(50)

  if (error) {
    console.error('Error fetching supplier transactions:', error)
    return []
  }

  return data || []
}

export async function getSupplierStats(companyId: string) {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('suppliers')
    .select('id')
    .eq('company_id', companyId)

  if (error) {
    console.error('Error fetching supplier stats:', error)
    return { totalSuppliers: 0, activeSuppliers: 0 }
  }

  const totalSuppliers = data?.length || 0
  
  // Contar proveedores con transacciones recientes (últimos 30 días)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: recentTransactions } = await supabase
    .from('transactions')
    .select('description')
    .eq('company_id', companyId)
    .gte('date', thirtyDaysAgo.toISOString())

  const activeSupplierIds = new Set()
  recentTransactions?.forEach(transaction => {
    // Buscar IDs de proveedores en las descripciones
    data?.forEach(supplier => {
      if (transaction.description.includes(supplier.id)) {
        activeSupplierIds.add(supplier.id)
      }
    })
  })

  return {
    totalSuppliers,
    activeSuppliers: activeSupplierIds.size,
  }
}
