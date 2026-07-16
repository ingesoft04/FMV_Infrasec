ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS email_verificado BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW();

ALTER TABLE asesorias ADD COLUMN IF NOT EXISTS etapa VARCHAR(30) NOT NULL DEFAULT 'nuevo';
ALTER TABLE asesorias ADD COLUMN IF NOT EXISTS valor_estimado NUMERIC(14,2);
ALTER TABLE asesorias ADD COLUMN IF NOT EXISTS probabilidad INT NOT NULL DEFAULT 10;
ALTER TABLE asesorias ADD COLUMN IF NOT EXISTS proxima_accion TEXT;
ALTER TABLE asesorias ADD COLUMN IF NOT EXISTS fecha_proxima_accion DATE;

CREATE TABLE IF NOT EXISTS tokens_usuario (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('verificacion','recuperacion')),
  token_hash TEXT NOT NULL UNIQUE,
  expira_en TIMESTAMPTZ NOT NULL,
  usado_en TIMESTAMPTZ,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cotizaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero VARCHAR(30) NOT NULL UNIQUE,
  asesoria_id UUID NOT NULL REFERENCES asesorias(id) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  subtotal NUMERIC(14,2) NOT NULL CHECK (subtotal >= 0),
  impuestos NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (impuestos >= 0),
  total NUMERIC(14,2) NOT NULL CHECK (total >= 0),
  moneda VARCHAR(3) NOT NULL DEFAULT 'COP',
  vigencia_hasta DATE NOT NULL,
  alcance TEXT NOT NULL,
  condiciones TEXT,
  estado VARCHAR(25) NOT NULL DEFAULT 'borrador'
    CHECK (estado IN ('borrador','enviada','aceptada','rechazada','vencida')),
  creado_por UUID REFERENCES usuarios(id),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cotizacion_id UUID REFERENCES cotizaciones(id),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  referencia VARCHAR(80) NOT NULL UNIQUE,
  monto NUMERIC(14,2) NOT NULL CHECK (monto > 0),
  moneda VARCHAR(3) NOT NULL DEFAULT 'COP',
  metodo VARCHAR(30) NOT NULL DEFAULT 'transferencia',
  proveedor VARCHAR(40) NOT NULL DEFAULT 'manual',
  estado VARCHAR(25) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','aprobado','rechazado','reembolsado')),
  comprobante_url TEXT,
  datos JSONB NOT NULL DEFAULT '{}',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comunicaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  asesoria_id UUID REFERENCES asesorias(id) ON DELETE SET NULL,
  canal VARCHAR(20) NOT NULL CHECK (canal IN ('email','whatsapp','sistema')),
  destino TEXT,
  asunto TEXT,
  mensaje TEXT NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente'
    CHECK (estado IN ('pendiente','enviado','fallido','simulado')),
  proveedor_id TEXT,
  error TEXT,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  enviado_en TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS actividades_crm (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asesoria_id UUID NOT NULL REFERENCES asesorias(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
  tipo VARCHAR(40) NOT NULL,
  descripcion TEXT NOT NULL,
  datos JSONB NOT NULL DEFAULT '{}',
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tokens_usuario ON tokens_usuario(usuario_id,tipo);
CREATE INDEX IF NOT EXISTS idx_cotizaciones_usuario ON cotizaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pagos_usuario ON pagos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_comunicaciones_usuario ON comunicaciones(usuario_id);
CREATE INDEX IF NOT EXISTS idx_asesorias_etapa ON asesorias(etapa);

UPDATE usuarios SET email_verificado=TRUE WHERE rol='admin';
