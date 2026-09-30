-- Migration script para banco de dados Supabase PostgreSQL (Strawberry)

CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tenants (Governança Comercial Multi-tenant)
CREATE TABLE IF NOT EXISTS tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan TEXT DEFAULT 'pro',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Perfis de Usuários (Google OAuth)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id),
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Credenciais e Tokens Encriptados (Profit Pro DLL Bridge)
CREATE TABLE IF NOT EXISTS user_credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  provider TEXT NOT NULL, -- 'profit_pro', 'binance', 'deribit'
  encrypted_token TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Audit Log de Boletas e Ações nos Robôs
CREATE TABLE IF NOT EXISTS order_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  symbol TEXT NOT NULL,
  option_type TEXT CHECK (option_type IN ('CALL', 'PUT', 'SPOT', 'FUTURE', 'ROBOT')),
  action TEXT NOT NULL,
  quantity INT NOT NULL,
  strike NUMERIC(10, 2),
  status TEXT DEFAULT 'EXECUTED',
  profit_order_id TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Row-Level Security Policies (Isolamento Estrito)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acesso perfil proprietario" ON profiles
  FOR ALL USING (auth.uid() = id);

CREATE POLICY "Acesso credenciais proprietario" ON user_credentials
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Acesso audit logs proprietario" ON order_audit_logs
  FOR ALL USING (auth.uid() = user_id);
