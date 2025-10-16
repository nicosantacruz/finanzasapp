import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de datos...')

  // Crear usuario de prueba
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Usuario Demo',
      image: 'https://via.placeholder.com/150',
    },
  })

  console.log('✅ Usuario creado:', user.email)

  // Crear empresa de prueba
  const company = await prisma.company.upsert({
    where: { id: 'demo-company-1' },
    update: {},
    create: {
      id: 'demo-company-1',
      name: 'Empresa Demo',
      currency: 'CLP',
      timezone: 'America/Santiago',
    },
  })

  console.log('✅ Empresa creada:', company.name)

  // Asociar usuario con empresa como owner
  await prisma.companyUser.upsert({
    where: {
      userId_companyId: {
        userId: user.id,
        companyId: company.id,
      },
    },
    update: {},
    create: {
      userId: user.id,
      companyId: company.id,
      role: 'owner',
    },
  })

  console.log('✅ Usuario asociado con empresa')

  // Crear categorías
  const categories = [
    { name: 'Ventas', type: 'income', color: '#10B981' },
    { name: 'Servicios', type: 'income', color: '#3B82F6' },
    { name: 'Suministros', type: 'expense', color: '#F59E0B' },
    { name: 'Salarios', type: 'expense', color: '#EF4444' },
    { name: 'Alquiler', type: 'expense', color: '#8B5CF6' },
    { name: 'Otros', type: 'expense', color: '#6B7280' },
  ]

  const createdCategories = []
  for (const category of categories) {
    const created = await prisma.category.upsert({
      where: {
        companyId_name_type: {
          companyId: company.id,
          name: category.name,
          type: category.type,
        },
      },
      update: {},
      create: {
        companyId: company.id,
        name: category.name,
        type: category.type,
        color: category.color,
      },
    })
    createdCategories.push(created)
  }

  console.log('✅ Categorías creadas:', createdCategories.length)

  // Crear transacciones de ejemplo
  const transactions = [
    {
      type: 'income',
      amount: 1500000, // $15,000 CLP
      description: 'Venta de productos',
      categoryId: createdCategories.find(c => c.name === 'Ventas')?.id,
      date: new Date('2024-01-15'),
    },
    {
      type: 'income',
      amount: 800000, // $8,000 CLP
      description: 'Servicio de consultoría',
      categoryId: createdCategories.find(c => c.name === 'Servicios')?.id,
      date: new Date('2024-01-20'),
    },
    {
      type: 'expense',
      amount: 300000, // $3,000 CLP
      description: 'Compra de materiales',
      categoryId: createdCategories.find(c => c.name === 'Suministros')?.id,
      date: new Date('2024-01-10'),
    },
    {
      type: 'expense',
      amount: 1200000, // $12,000 CLP
      description: 'Pago de salarios',
      categoryId: createdCategories.find(c => c.name === 'Salarios')?.id,
      date: new Date('2024-01-05'),
    },
    {
      type: 'expense',
      amount: 500000, // $5,000 CLP
      description: 'Alquiler de oficina',
      categoryId: createdCategories.find(c => c.name === 'Alquiler')?.id,
      date: new Date('2024-01-01'),
    },
  ]

  for (const transaction of transactions) {
    await prisma.transaction.create({
      data: {
        companyId: company.id,
        userId: user.id,
        ...transaction,
      },
    })
  }

  console.log('✅ Transacciones creadas:', transactions.length)

  // Crear cheques de ejemplo
  const checks = [
    {
      number: '001234',
      amount: 200000, // $2,000 CLP
      bank: 'Banco de Chile',
      issueDate: new Date('2024-01-01'),
      dueDate: new Date('2024-01-31'),
      status: 'pending',
      description: 'Pago a proveedor',
    },
    {
      number: '001235',
      amount: 150000, // $1,500 CLP
      bank: 'Banco Santander',
      issueDate: new Date('2024-01-15'),
      dueDate: new Date('2024-02-15'),
      status: 'paid',
      description: 'Pago de servicios',
    },
  ]

  for (const check of checks) {
    await prisma.check.create({
      data: {
        companyId: company.id,
        userId: user.id,
        ...check,
      },
    })
  }

  console.log('✅ Cheques creados:', checks.length)

  // Crear créditos de ejemplo
  const credits = [
    {
      name: 'Préstamo Bancario',
      amount: 5000000, // $50,000 CLP
      interestRate: 12.5,
      term: 24,
      monthlyPayment: 250000, // $2,500 CLP
      startDate: new Date('2024-01-01'),
      endDate: new Date('2025-12-31'),
      status: 'active',
      description: 'Préstamo para capital de trabajo',
    },
  ]

  for (const credit of credits) {
    await prisma.credit.create({
      data: {
        companyId: company.id,
        userId: user.id,
        ...credit,
      },
    })
  }

  console.log('✅ Créditos creados:', credits.length)

  // Crear proveedores de ejemplo
  const suppliers = [
    {
      name: 'Proveedor ABC',
      email: 'contacto@proveedorabc.cl',
      phone: '+56 9 1234 5678',
      address: 'Av. Principal 123, Santiago',
      rut: '12.345.678-9',
      contactName: 'Juan Pérez',
      notes: 'Proveedor principal de materiales',
    },
    {
      name: 'Servicios XYZ',
      email: 'info@serviciosxyz.cl',
      phone: '+56 9 8765 4321',
      address: 'Calle Secundaria 456, Valparaíso',
      rut: '98.765.432-1',
      contactName: 'María González',
      notes: 'Servicios de mantenimiento',
    },
  ]

  for (const supplier of suppliers) {
    await prisma.supplier.create({
      data: {
        companyId: company.id,
        userId: user.id,
        ...supplier,
      },
    })
  }

  console.log('✅ Proveedores creados:', suppliers.length)

  console.log('🎉 Seed completado exitosamente!')
}

main()
  .catch(e => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
