CREATE TABLE IF NOT EXISTS solicitudes_contacto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  numero_seguimiento VARCHAR(32) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL,
  telefono VARCHAR(30) NOT NULL,
  comentario TEXT NOT NULL,
  estado VARCHAR(30) NOT NULL DEFAULT 'recibida'
    CHECK (estado IN ('recibida', 'en_revision', 'contactado', 'cerrado')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS solicitudes_contacto_email_idx
  ON solicitudes_contacto (LOWER(email));
CREATE INDEX IF NOT EXISTS solicitudes_contacto_creado_idx
  ON solicitudes_contacto (creado_en DESC);
