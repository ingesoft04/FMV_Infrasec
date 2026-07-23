ALTER TABLE usuarios DROP CONSTRAINT IF EXISTS usuarios_rol_check;
ALTER TABLE usuarios
  ADD CONSTRAINT usuarios_rol_check
  CHECK (rol IN ('cliente','asesor','admin','sa'));

ALTER TABLE consultores
  ADD COLUMN IF NOT EXISTS usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_consultores_usuario
  ON consultores(usuario_id) WHERE usuario_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_asesorias_consultor_fecha
  ON asesorias(consultor_id, fecha, hora);

