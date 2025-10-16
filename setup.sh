#!/bin/bash

# Script de configuración inicial para Dashboard Financiero
# Este script ayuda a configurar el proyecto paso a paso

echo "🚀 Configurando Dashboard Financiero..."
echo ""

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org"
    exit 1
fi

# Verificar si pnpm está instalado
if ! command -v pnpm &> /dev/null; then
    echo "📦 Instalando pnpm..."
    npm install -g pnpm
fi

echo "✅ Node.js y pnpm están instalados"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
pnpm install

echo ""
echo "✅ Dependencias instaladas"
echo ""

# Crear archivo .env.local si no existe
if [ ! -f .env.local ]; then
    echo "📝 Creando archivo .env.local..."
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database URL (for Prisma)
DATABASE_URL=your_supabase_database_url

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# Integraciones futuras
SII_API_KEY=
BANK_API_KEY=
EOF
    echo "✅ Archivo .env.local creado"
else
    echo "⚠️  El archivo .env.local ya existe"
fi

echo ""
echo "🔧 Próximos pasos:"
echo ""
echo "1. 📊 Configura tu proyecto en Supabase:"
echo "   - Ve a https://supabase.com"
echo "   - Crea un nuevo proyecto"
echo "   - Habilita autenticación con Google OAuth"
echo "   - Copia las credenciales al archivo .env.local"
echo ""
echo "2. 🔐 Configura Google OAuth:"
echo "   - Ve a https://console.developers.google.com"
echo "   - Crea un proyecto OAuth"
echo "   - Agrega http://localhost:3000/auth/callback como redirect URI"
echo "   - Copia las credenciales al archivo .env.local"
echo ""
echo "3. 🗄️  Configura la base de datos:"
echo "   - Ejecuta: npx prisma generate"
echo "   - Ejecuta: npx prisma db push"
echo ""
echo "4. 🚀 Ejecuta el proyecto:"
echo "   - Ejecuta: pnpm dev"
echo "   - Abre http://localhost:3000"
echo ""
echo "📚 Para más información, consulta el README.md"
echo ""
echo "✨ ¡Configuración completada!"
