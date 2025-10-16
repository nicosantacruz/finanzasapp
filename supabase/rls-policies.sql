-- Dashboard Financiero - Row Level Security (RLS) Policies
-- Estas políticas implementan multi-tenancy seguro basado en company_id

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- POLÍTICAS PARA TABLA: users
-- ============================================================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
    ON public.users FOR SELECT
    USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
    ON public.users FOR UPDATE
    USING (auth.uid() = id);

-- Los usuarios pueden ver perfiles de otros usuarios en sus empresas
CREATE POLICY "Users can view company members"
    ON public.users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users cu1
            WHERE cu1.user_id = auth.uid()
            AND cu1.company_id IN (
                SELECT company_id FROM public.company_users cu2
                WHERE cu2.user_id = users.id
            )
        )
    );

-- ============================================================================
-- POLÍTICAS PARA TABLA: companies
-- ============================================================================

-- Los usuarios pueden ver las empresas a las que pertenecen
CREATE POLICY "Users can view their companies"
    ON public.companies FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = companies.id
            AND company_users.user_id = auth.uid()
        )
    );

-- Solo los propietarios pueden actualizar empresas
CREATE POLICY "Owners can update companies"
    ON public.companies FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = companies.id
            AND company_users.user_id = auth.uid()
            AND company_users.role = 'owner'
        )
    );

-- Los usuarios autenticados pueden crear empresas (se convertirán en propietarios)
CREATE POLICY "Authenticated users can create companies"
    ON public.companies FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- Solo los propietarios pueden eliminar empresas
CREATE POLICY "Owners can delete companies"
    ON public.companies FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = companies.id
            AND company_users.user_id = auth.uid()
            AND company_users.role = 'owner'
        )
    );

-- ============================================================================
-- POLÍTICAS PARA TABLA: company_users
-- ============================================================================

-- Los usuarios pueden ver los miembros de sus empresas
CREATE POLICY "Users can view company members"
    ON public.company_users FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users cu
            WHERE cu.company_id = company_users.company_id
            AND cu.user_id = auth.uid()
        )
    );

-- Los propietarios y administradores pueden añadir miembros
CREATE POLICY "Owners and admins can add members"
    ON public.company_users FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = company_users.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.role IN ('owner', 'admin')
        )
    );

-- Los propietarios y administradores pueden actualizar roles
CREATE POLICY "Owners and admins can update roles"
    ON public.company_users FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users cu
            WHERE cu.company_id = company_users.company_id
            AND cu.user_id = auth.uid()
            AND cu.role IN ('owner', 'admin')
        )
    );

-- Los propietarios y administradores pueden eliminar miembros
CREATE POLICY "Owners and admins can remove members"
    ON public.company_users FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users cu
            WHERE cu.company_id = company_users.company_id
            AND cu.user_id = auth.uid()
            AND cu.role IN ('owner', 'admin')
        )
    );

-- ============================================================================
-- POLÍTICAS PARA TABLA: categories
-- ============================================================================

-- Los usuarios pueden ver las categorías de sus empresas
CREATE POLICY "Users can view company categories"
    ON public.categories FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = categories.company_id
            AND company_users.user_id = auth.uid()
        )
    );

-- Los propietarios y administradores pueden crear categorías
CREATE POLICY "Owners and admins can create categories"
    ON public.categories FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = categories.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.role IN ('owner', 'admin')
        )
    );

-- Los propietarios y administradores pueden actualizar categorías
CREATE POLICY "Owners and admins can update categories"
    ON public.categories FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = categories.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.role IN ('owner', 'admin')
        )
    );

-- Los propietarios y administradores pueden eliminar categorías
CREATE POLICY "Owners and admins can delete categories"
    ON public.categories FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = categories.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.role IN ('owner', 'admin')
        )
    );

-- ============================================================================
-- POLÍTICAS PARA TABLA: transactions
-- ============================================================================

-- Los usuarios pueden ver las transacciones de sus empresas
CREATE POLICY "Users can view company transactions"
    ON public.transactions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = transactions.company_id
            AND company_users.user_id = auth.uid()
        )
    );

-- Los propietarios y administradores pueden crear transacciones
CREATE POLICY "Owners and admins can create transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = transactions.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.role IN ('owner', 'admin')
        )
    );

-- Los propietarios y administradores pueden actualizar transacciones
CREATE POLICY "Owners and admins can update transactions"
    ON public.transactions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = transactions.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.role IN ('owner', 'admin')
        )
    );

-- Solo los propietarios pueden eliminar transacciones
CREATE POLICY "Owners can delete transactions"
    ON public.transactions FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = transactions.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.role = 'owner'
        )
    );

-- ============================================================================
-- POLÍTICAS PARA TABLA: checks
-- ============================================================================

-- Los usuarios pueden ver los cheques de sus empresas
CREATE POLICY "Users can view company checks"
    ON public.checks FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = checks.company_id
            AND company_users.user_id = auth.uid()
        )
    );

-- Los propietarios y administradores pueden crear cheques
CREATE POLICY "Owners and admins can create checks"
    ON public.checks FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = checks.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.role IN ('owner', 'admin')
        )
    );

-- Los propietarios y administradores pueden actualizar cheques
CREATE POLICY "Owners and admins can update checks"
    ON public.checks FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = checks.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.role IN ('owner', 'admin')
        )
    );

-- Solo los propietarios pueden eliminar cheques
CREATE POLICY "Owners can delete checks"
    ON public.checks FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = checks.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.role = 'owner'
        )
    );

-- ============================================================================
-- POLÍTICAS PARA TABLA: credits
-- ============================================================================

-- Los usuarios pueden ver los créditos de sus empresas
CREATE POLICY "Users can view company credits"
    ON public.credits FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = credits.company_id
            AND company_users.user_id = auth.uid()
        )
    );

-- Los propietarios y administradores pueden crear créditos
CREATE POLICY "Owners and admins can create credits"
    ON public.credits FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = credits.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.role IN ('owner', 'admin')
        )
    );

-- Los propietarios y administradores pueden actualizar créditos
CREATE POLICY "Owners and admins can update credits"
    ON public.credits FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = credits.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.role IN ('owner', 'admin')
        )
    );

-- Solo los propietarios pueden eliminar créditos
CREATE POLICY "Owners can delete credits"
    ON public.credits FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = credits.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.role = 'owner'
        )
    );

-- ============================================================================
-- POLÍTICAS PARA TABLA: suppliers
-- ============================================================================

-- Los usuarios pueden ver los proveedores de sus empresas
CREATE POLICY "Users can view company suppliers"
    ON public.suppliers FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = suppliers.company_id
            AND company_users.user_id = auth.uid()
        )
    );

-- Los propietarios y administradores pueden crear proveedores
CREATE POLICY "Owners and admins can create suppliers"
    ON public.suppliers FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = suppliers.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.role IN ('owner', 'admin')
        )
    );

-- Los propietarios y administradores pueden actualizar proveedores
CREATE POLICY "Owners and admins can update suppliers"
    ON public.suppliers FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = suppliers.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.role IN ('owner', 'admin')
        )
    );

-- Solo los propietarios pueden eliminar proveedores
CREATE POLICY "Owners can delete suppliers"
    ON public.suppliers FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.company_users
            WHERE company_users.company_id = suppliers.company_id
            AND company_users.user_id = auth.uid()
            AND company_users.role = 'owner'
        )
    );

-- ============================================================================
-- FUNCIONES AUXILIARES PARA RLS
-- ============================================================================

-- Función para verificar si un usuario tiene un rol específico en una empresa
CREATE OR REPLACE FUNCTION public.user_has_role(
    p_user_id UUID,
    p_company_id UUID,
    p_role TEXT
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.company_users
        WHERE user_id = p_user_id
        AND company_id = p_company_id
        AND role = p_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener empresas de un usuario
CREATE OR REPLACE FUNCTION public.get_user_companies(p_user_id UUID)
RETURNS SETOF public.companies AS $$
BEGIN
    RETURN QUERY
    SELECT c.* FROM public.companies c
    INNER JOIN public.company_users cu ON cu.company_id = c.id
    WHERE cu.user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si un usuario pertenece a una empresa
CREATE OR REPLACE FUNCTION public.user_belongs_to_company(
    p_user_id UUID,
    p_company_id UUID
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.company_users
        WHERE user_id = p_user_id
        AND company_id = p_company_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
