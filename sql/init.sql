CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS usuarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre VARCHAR(120) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  telefono VARCHAR(30),
  empresa VARCHAR(160) NOT NULL,
  password_hash TEXT NOT NULL,
  rol VARCHAR(20) NOT NULL DEFAULT 'cliente' CHECK (rol IN ('cliente','admin')),
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS productos (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(140) NOT NULL,
  slug VARCHAR(140) NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  categoria VARCHAR(60) NOT NULL,
  modalidad VARCHAR(40) NOT NULL DEFAULT 'servicio',
  precio_desde NUMERIC(14,2) CHECK (precio_desde IS NULL OR precio_desde >= 0),
  duracion_minutos INT NOT NULL DEFAULT 45,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  orden INT NOT NULL DEFAULT 0
);

INSERT INTO productos (nombre,slug,descripcion,categoria,modalidad,precio_desde,duracion_minutos,orden) VALUES
  ('Diagnóstico de ciberseguridad','diagnostico-ciberseguridad','Evaluación inicial de activos, exposición, riesgos y prioridades de remediación.','seguridad','servicio',NULL,45,1),
  ('Pentesting y auditoría técnica','pentesting-auditoria','Pruebas controladas para aplicaciones web, móviles, redes e infraestructura.','seguridad','servicio',NULL,60,2),
  ('Cumplimiento y gobierno','cumplimiento-gobierno','Acompañamiento para ISO 27001, SOC 2, Ley 1581 y programas internos de seguridad.','seguridad','servicio',NULL,60,3),
  ('Desarrollo de software seguro','desarrollo-seguro','Diseño y construcción de soluciones web y empresariales con seguridad integrada.','desarrollo','solucion',NULL,60,4),
  ('DevOps e infraestructura','devops-infraestructura','Contenedores, CI/CD, nube, observabilidad y operación confiable.','infraestructura','servicio',NULL,45,5),
  ('Automatización con IA','automatizacion-ia','Automatización de procesos, asistentes y flujos con modelos de IA y N8N.','automatizacion','solucion',NULL,45,6),
  ('Soporte y acompañamiento continuo','soporte-continuo','Bolsa de horas, monitoreo y mejora técnica continua para equipos.','soporte','plan',NULL,30,7)
ON CONFLICT (slug) DO UPDATE SET descripcion=EXCLUDED.descripcion,categoria=EXCLUDED.categoria,modalidad=EXCLUDED.modalidad,orden=EXCLUDED.orden;

CREATE TABLE IF NOT EXISTS consultores (
  id SERIAL PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  cargo VARCHAR(120) NOT NULL,
  bio TEXT,
  activo BOOLEAN NOT NULL DEFAULT TRUE
);

INSERT INTO consultores (nombre,cargo,bio)
SELECT 'Equipo comercial FMV','Consultoría de soluciones','Asesoría inicial para identificar la solución adecuada y preparar una propuesta.'
WHERE NOT EXISTS (SELECT 1 FROM consultores);

CREATE TABLE IF NOT EXISTS asesorias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL REFERENCES usuarios(id),
  producto_id INT NOT NULL REFERENCES productos(id),
  consultor_id INT NOT NULL REFERENCES consultores(id),
  fecha DATE NOT NULL,
  hora TIME NOT NULL,
  objetivo TEXT NOT NULL,
  presupuesto NUMERIC(14,2) CHECK (presupuesto IS NULL OR presupuesto >= 0),
  canal VARCHAR(30) NOT NULL DEFAULT 'videollamada' CHECK (canal IN ('videollamada','telefonica','presencial')),
  estado VARCHAR(30) NOT NULL DEFAULT 'solicitada' CHECK (estado IN ('solicitada','confirmada','completada','cancelada','reprogramada')),
  creado_en TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  actualizado_en TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_consultor_horario_activo ON asesorias(consultor_id,fecha,hora) WHERE estado!='cancelada';
CREATE INDEX IF NOT EXISTS idx_asesorias_usuario ON asesorias(usuario_id);
CREATE INDEX IF NOT EXISTS idx_asesorias_fecha ON asesorias(fecha);

CREATE OR REPLACE FUNCTION actualizar_fecha() RETURNS TRIGGER AS $$
BEGIN NEW.actualizado_en=NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS asesorias_actualizadas ON asesorias;
CREATE TRIGGER asesorias_actualizadas BEFORE UPDATE ON asesorias FOR EACH ROW EXECUTE FUNCTION actualizar_fecha();

\i /docker-entrypoint-initdb.d/migrations/002_crm_comercial.sql
