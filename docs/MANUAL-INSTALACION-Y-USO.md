# Manual de instalación y uso

**Sistema:** FMV InfraSec - Portal comercial y CRM  
**Versión del manual:** 1.0  
**Fecha:** 16 de julio de 2026

## 1. Objetivo

Este manual explica cómo instalar, configurar, publicar, operar, respaldar y actualizar el sistema FMV InfraSec. Está dirigido a administradores del servidor, personal comercial y usuarios encargados de soporte.

El sistema incluye:

- Página corporativa.
- Portal de clientes.
- Registro, autenticación, verificación de correo y recuperación de contraseña.
- Agenda de asesorías comerciales.
- Catálogo de productos y servicios.
- CRM con embudo de oportunidades.
- Cotizaciones en PDF.
- Registro de pagos.
- Notificaciones por correo y WhatsApp.
- Exportación de eventos de calendario.
- PostgreSQL y API Node.js/Express.

## 2. Arquitectura general

```text
Navegador
   |
Dominio + HTTPS
   |
Proxy inverso Nginx
   |
Aplicación Node.js / Express :4100
   |
PostgreSQL
```

La arquitectura interna aplica SOLID:

```text
Rutas HTTP -> Controladores -> Servicios -> Repositorios -> PostgreSQL
                                      |
                                  Adaptadores
                       correo, WhatsApp, PDF y calendario
```

Consulte también `docs/ARQUITECTURA-SOLID.md`.

## 3. Requisitos

### 3.1 Instalación recomendada con Docker

- Windows 10/11 con Docker Desktop, o Linux de 64 bits.
- Docker Engine 24 o posterior.
- Docker Compose v2.
- 2 GB de memoria RAM disponibles como mínimo.
- 5 GB de almacenamiento libre.
- Puerto TCP `4100` disponible.
- Acceso administrativo al equipo o servidor.

### 3.2 Desarrollo sin Docker

- Node.js 22 o posterior.
- pnpm 11 o npm equivalente.
- PostgreSQL 16.
- Variables de entorno configuradas.

## 4. Archivos importantes

| Archivo o carpeta | Función |
|---|---|
| `fmv-infrasec.html` | Página corporativa |
| `portal-comercial.html` | Portal de clientes |
| `admin-comercial.html` | CRM administrativo |
| `gestion-asesorias.html` | Portal interno para asesores y SA |
| `assets/images/` | Fotografías e imágenes reemplazables |
| `assets/brand/` | Logo y recursos de marca |
| `src/` | Aplicación y arquitectura SOLID |
| `sql/` | Esquema y migraciones |
| `tests/` | Regresión funcional y arquitectónica |
| `.env` | Configuración privada local; no se sube a Git |
| `.env.example` | Plantilla de configuración |
| `docker-compose.yml` | Servicios Docker |

## 5. Instalación local con Docker

### 5.1 Preparar configuración

Abra PowerShell dentro de la carpeta del proyecto:

```powershell
Set-Location C:\Personal\FMV_Infrasec
Copy-Item .env.example .env
```

En Linux:

```bash
cd /ruta/FMV_Infrasec
cp .env.example .env
```

Abra `.env` y cambie, como mínimo:

```env
APP_PORT=4100
FRONTEND_URL=http://localhost:4100
APP_BASE_URL=http://localhost:4100
POSTGRES_PASSWORD=una-clave-segura
JWT_SECRET=una-clave-aleatoria-de-al-menos-32-caracteres
ADMIN_EMAIL=administrador@empresa.com
ADMIN_PASSWORD=una-clave-administrativa-segura
SA_EMAIL=sa@empresa.com
SA_PASSWORD=una-clave-sa-segura
```

No utilice las claves de ejemplo en un servidor público.

### 5.2 Construir e iniciar

```powershell
docker compose up -d --build
```

### 5.3 Comprobar estado

```powershell
docker compose ps
Invoke-RestMethod http://localhost:4100/health
```

La respuesta esperada contiene:

```json
{
  "status": "ok",
  "postgres": "online"
}
```

### 5.4 Direcciones locales

| Componente | Dirección |
|---|---|
| Sitio corporativo | `http://localhost:4100/fmv-infrasec.html` |
| Portal de clientes | `http://localhost:4100/portal-comercial.html` |
| CRM administrativo | `http://localhost:4100/admin-comercial.html` |
| Gestión de asesorías y usuarios | `http://localhost:4100/gestion-asesorias.html` |
| Estado técnico | `http://localhost:4100/health` |

## 6. Variables de configuración

| Variable | Obligatoria en producción | Descripción |
|---|---:|---|
| `APP_PORT` | Sí | Puerto público local del contenedor |
| `APP_BASE_URL` | Sí | URL pública usada en enlaces de correo |
| `FRONTEND_URL` | Sí | Origen autorizado por CORS |
| `POSTGRES_PASSWORD` | Sí | Contraseña de PostgreSQL |
| `JWT_SECRET` | Sí | Firma de sesiones JWT |
| `JWT_EXPIRES_IN` | No | Duración de sesión, por ejemplo `7d` |
| `ADMIN_EMAIL` | Sí | Administrador inicial |
| `ADMIN_PASSWORD` | Sí | Clave del administrador inicial |
| `SA_EMAIL` | Sí | Correo del superadministrador inicial |
| `SA_PASSWORD` | Sí | Clave del superadministrador inicial |
| `SMTP_HOST` | Para correo real | Servidor SMTP |
| `SMTP_PORT` | Para correo real | Normalmente `587` o `465` |
| `SMTP_SECURE` | Para correo real | `true` para TLS directo |
| `SMTP_USER` | Para correo real | Usuario SMTP |
| `SMTP_PASSWORD` | Para correo real | Contraseña o token SMTP |
| `SMTP_FROM` | Para correo real | Remitente visible |
| `WHATSAPP_TOKEN` | Para WhatsApp real | Token de Meta |
| `WHATSAPP_PHONE_NUMBER_ID` | Para WhatsApp real | Identificador del número |
| `PAYMENT_PROVIDER` | Sí | `local` solo para pruebas |
| `PAYMENT_WEBHOOK_SECRET` | Para pagos reales | Validación de webhooks |

## 7. Configuración del correo SMTP

Sin credenciales SMTP, los mensajes se registran como `simulado`. Esto permite probar el sistema sin enviar correos.

Ejemplo:

```env
SMTP_HOST=smtp.proveedor.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=notificaciones@fmvinfrasec.com
SMTP_PASSWORD=clave-o-token-del-proveedor
SMTP_FROM=FMV InfraSec <notificaciones@fmvinfrasec.com>
```

Después de cambiar `.env`:

```powershell
docker compose up -d --build
docker compose logs api --tail 100
```

Para producción configure en el dominio:

- SPF para autorizar el servidor de correo.
- DKIM para firmar mensajes.
- DMARC para definir políticas de autenticación.

## 8. WhatsApp

Sin credenciales de Meta, las notificaciones quedan como `simulado`.

Para activar WhatsApp Cloud API:

```env
WHATSAPP_TOKEN=token-de-meta
WHATSAPP_PHONE_NUMBER_ID=identificador-del-numero
```

El número de los clientes debe incluir código de país, por ejemplo `573001234567`.

Las plantillas y reglas de Meta pueden exigir aprobación antes de enviar mensajes iniciados por la empresa.

## 9. Pagos

`PAYMENT_PROVIDER=local` es un simulador y aprueba pagos de prueba. No debe utilizarse para recaudar dinero real.

Para producción:

1. Seleccione la pasarela.
2. Cree un adaptador nuevo siguiendo la arquitectura SOLID.
3. Configure la URL de retorno.
4. Configure y valide el webhook.
5. Verifique la firma con `PAYMENT_WEBHOOK_SECRET`.
6. Nunca marque un pago como aprobado únicamente por el retorno del navegador.

## 10. Dominio y HTTPS

Cuando compre el dominio, cree registros DNS:

| Tipo | Nombre | Destino |
|---|---|---|
| `A` | `@` | IP pública del servidor |
| `CNAME` | `www` | dominio principal |

En `.env`:

```env
APP_BASE_URL=https://fmvinfrasec.com
FRONTEND_URL=https://fmvinfrasec.com
```

Ejemplo Nginx:

```nginx
server {
    listen 80;
    server_name fmvinfrasec.com www.fmvinfrasec.com;

    location / {
        proxy_pass http://127.0.0.1:4100;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Instale HTTPS con Certbot:

```bash
sudo certbot --nginx -d fmvinfrasec.com -d www.fmvinfrasec.com
```

No publique directamente PostgreSQL ni el puerto interno de la API en Internet.

## 11. Uso del portal de clientes

### 11.1 Crear una cuenta

1. Abra el portal comercial.
2. Seleccione **Crear cuenta**.
3. Registre nombre, empresa, correo, teléfono y contraseña.
4. Confirme el correo desde el enlace recibido.
5. Inicie sesión.

### 11.2 Solicitar una asesoría

1. Seleccione el producto o servicio.
2. Seleccione consultor, fecha y hora.
3. Indique canal, presupuesto y necesidad.
4. Pulse **Solicitar asesoría**.
5. Consulte el estado en **Mis asesorías**.
6. Descargue el evento de calendario si lo necesita.

### 11.3 Cotizaciones y pagos

1. Revise la cotización asignada.
2. Descargue el PDF.
3. Acepte o rechace la propuesta.
4. Si la acepta, utilice el pago habilitado.
5. Conserve la referencia generada.

### 11.4 Recuperar contraseña

1. Pulse **Olvidé mi contraseña**.
2. Indique el correo registrado.
3. Abra el enlace recibido.
4. Defina una contraseña nueva de mínimo ocho caracteres.

## 12. Uso del CRM administrativo

### 12.1 Acceso

Abra `admin-comercial.html` e ingrese con `ADMIN_EMAIL` y `ADMIN_PASSWORD`.

### 12.2 Embudo

Las etapas son:

1. `nuevo`
2. `calificado`
3. `propuesta`
4. `negociacion`
5. `ganado`
6. `perdido`

El administrador puede cambiar la etapa y el valor estimado de cada oportunidad.

### 12.3 Crear cotización

1. Localice la oportunidad.
2. Pulse **Cotizar**.
3. Indique subtotal, impuestos, vigencia, alcance y condiciones.
4. Seleccione borrador o envío inmediato.
5. Verifique el PDF en la sección de cotizaciones.

### 12.4 Notificar cliente

1. Pulse **Notificar** en la oportunidad.
2. Seleccione correo, WhatsApp o ambos.
3. Escriba asunto y mensaje.
4. Revise el resultado en **Comunicaciones**.

### 12.5 Pagos

Revise referencia, cliente, monto, método y estado. Los estados disponibles son:

- `pendiente`
- `aprobado`
- `rechazado`
- `reembolsado`

## 13. Gestión de imágenes y logo

## Portal interno de asesores y SA

Acceda a `http://localhost:4100/gestion-asesorias.html`.

- El rol `asesor` consulta únicamente las citas asociadas a su ficha y puede actualizar su estado.
- El rol `sa` consulta todas las asesorías y administra usuarios: crear, editar, habilitar y deshabilitar.
- El SA no puede deshabilitar su propia cuenta durante la sesión.
- Al crear un usuario con rol `asesor`, el sistema crea y vincula automáticamente su ficha de consultor.
- Las credenciales iniciales provienen de `SA_EMAIL` y `SA_PASSWORD`; cámbielas antes de producción.

Las imágenes están en:

```text
assets/images/
```

El logo está en:

```text
assets/brand/
```

Puede reemplazar una imagen conservando el mismo nombre para evitar cambios en HTML. Mantenga:

- Formato web compatible: PNG, JPG, WebP o SVG.
- Resolución suficiente.
- Tamaño optimizado.
- Copia del original.
- Texto alternativo actualizado cuando cambie el contenido visual.

## 14. Operación y mantenimiento

### 14.1 Comandos frecuentes

```powershell
docker compose ps
docker compose logs -f api
docker compose restart api
docker compose stop
docker compose up -d
```

### 14.2 Aplicar cambios

```powershell
docker compose up -d --build
```

### 14.3 Ejecutar pruebas

```powershell
pnpm test
```

Si `node` no está disponible en la terminal, ejecute las pruebas dentro del contenedor:

```powershell
docker compose exec api npm test
```

Todas las modificaciones deben terminar con:

- Pruebas funcionales aprobadas.
- Pruebas arquitectónicas SOLID aprobadas.
- Página principal visible hasta el final.
- Cursor normal visible.
- API y PostgreSQL saludables.

## 15. Respaldo y restauración

### 15.1 Crear respaldo

En PowerShell:

```powershell
docker compose exec -T postgres pg_dump -U fmv -d fmv_comercial -Fc > respaldo-fmv.dump
```

Guarde también:

- `.env` en un almacén seguro.
- `assets/`.
- Certificados o configuración de Nginx.
- Código fuente y migraciones.

### 15.2 Restaurar

Detenga temporalmente el acceso de usuarios y ejecute:

```powershell
docker compose cp respaldo-fmv.dump postgres:/tmp/respaldo-fmv.dump
docker compose exec postgres pg_restore -U fmv -d fmv_comercial --clean --if-exists /tmp/respaldo-fmv.dump
```

Pruebe periódicamente la restauración en un ambiente diferente. Un respaldo no probado no debe considerarse confiable.

## 16. Actualización segura

1. Cree respaldo de PostgreSQL.
2. Guarde `.env` y los recursos gráficos.
3. Obtenga la nueva versión.
4. Revise cambios de `.env.example`.
5. Ejecute pruebas.
6. Reconstruya:

```powershell
docker compose up -d --build
```

7. Compruebe:

```powershell
docker compose ps
Invoke-RestMethod https://su-dominio.com/health
```

8. Verifique manualmente página, portal, CRM, autenticación y cotizaciones.

## 17. Seguridad antes de producción

- Cambiar todas las claves predeterminadas.
- Usar contraseñas únicas y largas.
- Generar `JWT_SECRET` aleatorio.
- Habilitar HTTPS.
- Restringir `FRONTEND_URL` al dominio real.
- Utilizar un usuario PostgreSQL con privilegios mínimos.
- No publicar el puerto de PostgreSQL.
- Configurar firewall.
- Mantener Docker y dependencias actualizados.
- Ejecutar `pnpm audit --prod`.
- Configurar respaldos automáticos.
- Implementar monitoreo y alertas.
- Rotar tokens SMTP, WhatsApp y pagos.
- Revisar logs sin exponer información sensible.

## 18. Solución de problemas

### Puerto 4100 ocupado

Cambie:

```env
APP_PORT=4200
APP_BASE_URL=http://localhost:4200
FRONTEND_URL=http://localhost:4200
```

Luego reconstruya.

### API no saludable

```powershell
docker compose ps
docker compose logs api --tail 200
docker compose logs postgres --tail 200
```

### Correos no llegan

- Confirme SMTP.
- Revise puerto y TLS.
- Revise SPF, DKIM y DMARC.
- Consulte la tabla de comunicaciones desde el CRM.
- Compruebe spam y reputación del remitente.

### El contenido inferior no aparece

- Recargue sin caché.
- Compruebe que `fmv-infrasec.html` responde HTTP 200.
- Ejecute `pnpm test`.
- Revise errores del navegador.

### No se ve el cursor

La página está configurada para usar el cursor normal. Si desaparece:

- Recargue sin caché.
- Compruebe que no exista `cursor: none`.
- Ejecute las pruebas de regresión.

### La base no inicia

- Compruebe espacio en disco.
- Verifique `POSTGRES_PASSWORD`.
- Revise permisos del volumen Docker.
- No elimine el volumen sin respaldo.

## 19. Lista de verificación de publicación

- [ ] Dominio resuelve a la IP correcta.
- [ ] HTTPS válido y renovación automática.
- [ ] `.env` de producción configurado.
- [ ] Claves predeterminadas eliminadas.
- [ ] SMTP verificado.
- [ ] SPF, DKIM y DMARC configurados.
- [ ] WhatsApp aprobado o deshabilitado conscientemente.
- [ ] Pasarela real conectada y webhook validado.
- [ ] PostgreSQL no está publicado.
- [ ] Respaldo automático probado.
- [ ] `pnpm test` aprobado.
- [ ] Salud responde `ok`.
- [ ] Página, portal y CRM revisados.
- [ ] Logo definitivo e imágenes optimizadas.
- [ ] Política de privacidad y datos de contacto reales.

## 20. Soporte

Al reportar un problema incluya:

- Fecha y hora.
- URL afectada.
- Acción realizada.
- Mensaje visible.
- Salida de `docker compose ps`.
- Logs relevantes sin contraseñas ni tokens.
- Navegador y sistema operativo.
