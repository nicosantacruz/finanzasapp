-- Dashboard Financiero - Schema Inicial
-- Este archivo crea todas las tablas necesarias en Supabase

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios (sincronizada con auth.users de Supabase)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de empresas
CREATE TABLE IF NOT EXISTS public.companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    logo TEXT,
    currency TEXT DEFAULT 'CLP' CHECK (currency IN ('CLP', 'USD', 'AED', 'EUR')),
    timezone TEXT DEFAULT 'America/Santiago',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de relación usuarios-empresas (multi-tenancy)
CREATE TABLE IF NOT EXISTS public.company_users (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, company_id)
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT DEFAULT 'expense' CHECK (type IN ('income', 'expense')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de transacciones
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount INTEGER NOT NULL, -- almacenado en centavos
    currency TEXT DEFAULT 'CLP' CHECK (currency IN ('CLP', 'USD', 'AED', 'EUR')),
    description TEXT NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    date TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de cheques
CREATE TABLE IF NOT EXISTS public.checks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    bank_name TEXT NOT NULL,
    check_number TEXT NOT NULL,
    amount INTEGER NOT NULL, -- almacenado en centavos
    currency TEXT DEFAULT 'CLP' CHECK (currency IN ('CLP', 'USD', 'AED', 'EUR')),
    issue_date TIMESTAMPTZ NOT NULL,
    due_date TIMESTAMPTZ NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'cashed', 'rejected')),
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de créditos
CREATE TABLE IF NOT EXISTS public.credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount INTEGER NOT NULL, -- almacenado en centavos
    currency TEXT DEFAULT 'CLP' CHECK (currency IN ('CLP', 'USD', 'AED', 'EUR')),
    interest_rate DECIMAL(5, 2) NOT NULL,
    start_date TIMESTAMPTZ NOT NULL,
    end_date TIMESTAMPTZ NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de proveedores
CREATE TABLE IF NOT EXISTS public.suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_company_users_user_id ON public.company_users(user_id);
CREATE INDEX IF NOT EXISTS idx_company_users_company_id ON public.company_users(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_company_id ON public.transactions(company_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS idx_checks_company_id ON public.checks(company_id);
CREATE INDEX IF NOT EXISTS idx_checks_due_date ON public.checks(due_date);
CREATE INDEX IF NOT EXISTS idx_credits_company_id ON public.credits(company_id);
CREATE INDEX IF NOT EXISTS idx_suppliers_company_id ON public.suppliers(company_id);
CREATE INDEX IF NOT EXISTS idx_categories_company_id ON public.categories(company_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON public.companies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checks_updated_at BEFORE UPDATE ON public.checks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credits_updated_at BEFORE UPDATE ON public.credits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función trigger para crear usuario automáticamente cuando se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para sincronizar usuarios de auth.users con public.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Comentarios para documentación
COMMENT ON TABLE public.users IS 'Tabla de usuarios sincronizada con auth.users';
COMMENT ON TABLE public.companies IS 'Tabla de empresas para multi-tenancy';
COMMENT ON TABLE public.company_users IS 'Relación muchos a muchos entre usuarios y empresas con roles';
COMMENT ON TABLE public.categories IS 'Categorías de transacciones (ingresos/gastos)';
COMMENT ON TABLE public.transactions IS 'Transacciones financieras (ingresos y gastos)';
COMMENT ON TABLE public.checks IS 'Registro de cheques emitidos y recibidos';
COMMENT ON TABLE public.credits IS 'Registro de créditos y préstamos';
COMMENT ON TABLE public.suppliers IS 'Registro de proveedores';

COMMENT ON COLUMN public.transactions.amount IS 'Monto en centavos para evitar errores de punto flotante';
COMMENT ON COLUMN public.checks.amount IS 'Monto en centavos para evitar errores de punto flotante';
COMMENT ON COLUMN public.credits.amount IS 'Monto en centavos para evitar errores de punto flotante';
