ALTER TABLE pagos DROP CONSTRAINT IF EXISTS pagos_estado_check;
ALTER TABLE pagos ADD CONSTRAINT pagos_estado_check
  CHECK (estado IN ('pendiente','en_validacion','aprobado','rechazado','reembolsado'));
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS actualizado_por UUID REFERENCES usuarios(id) ON DELETE SET NULL;
ALTER TABLE pagos ADD COLUMN IF NOT EXISTS nota_validacion TEXT;

CREATE INDEX IF NOT EXISTS idx_pagos_cotizacion_estado ON pagos(cotizacion_id,estado);

UPDATE productos SET precio_desde=COALESCE(precio_desde,450000) WHERE slug='diagnostico-ciberseguridad';
UPDATE productos SET precio_desde=COALESCE(precio_desde,1800000) WHERE slug='pentesting-auditoria';
UPDATE productos SET precio_desde=COALESCE(precio_desde,900000) WHERE slug='cumplimiento-gobierno';
UPDATE productos SET precio_desde=COALESCE(precio_desde,2500000) WHERE slug='desarrollo-seguro';
UPDATE productos SET precio_desde=COALESCE(precio_desde,1200000) WHERE slug='devops-infraestructura';
UPDATE productos SET precio_desde=COALESCE(precio_desde,1500000) WHERE slug='automatizacion-ia';
UPDATE productos SET precio_desde=COALESCE(precio_desde,650000) WHERE slug='soporte-continuo';
