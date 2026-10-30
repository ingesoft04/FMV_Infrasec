# FMV InfraSec — Portal comercial

Adaptación de los componentes reutilizables de `Maquillaje_Web` al negocio de FMV InfraSec. Las antiguas citas se modelan como **asesorías comerciales** asociadas a un producto o servicio real del portafolio.

La organización interna aplica principios SOLID. Consulte [docs/ARQUITECTURA-SOLID.md](docs/ARQUITECTURA-SOLID.md).

La instalación, configuración, publicación y operación están documentadas en [docs/MANUAL-INSTALACION-Y-USO.md](docs/MANUAL-INSTALACION-Y-USO.md).

## Entornos publicados

| Entorno | URL | Uso |
|---|---|---|
| Pruebas | <https://test-infrasec.dev-fmv.duckdns.org> | Validación de cada cambio antes de aprobarlo |
| Producción | <https://infrasec.dev-fmv.duckdns.org> | Servicio público estable |

Ambos entornos se alojan en una VM Ubuntu y se publican mediante Caddy. Pruebas usa
contenedores, red, volumen PostgreSQL, secretos y puerto independientes (`4101`);
producción usa el puerto `4100`. El entorno de pruebas muestra permanentemente el
aviso **“Entorno de prueba · Los cambios aquí aún no están en producción”** y envía
cabeceras `noindex` y `no-store`.

El flujo obligatorio de publicación es:

```text
rama de cambio → pruebas locales y Security CI → entorno de pruebas
→ revisión y aprobación explícita → nueva sincronización con GitHub
→ fusión a main → despliegue y validación de producción
```

No se debe fusionar ni desplegar a producción mientras la revisión del entorno de
pruebas esté pendiente.

## Incluye

- Catálogo de productos y servicios FMV.
- Registro e inicio de sesión de clientes empresariales.
- Disponibilidad, solicitud, reprogramación y cancelación de asesorías.
- Objetivo, canal y presupuesto estimado por oportunidad.
- Endpoints administrativos para revisar oportunidades y actualizar su estado.
- PostgreSQL, autenticación JWT, rate limiting, Docker y página web integrada.
- Favicon corporativo y marcador visual exclusivo del entorno de pruebas.

Se descartaron deliberadamente los módulos exclusivos del negocio de maquillaje: tonos de piel, galería antes/después y perfil cosmético.

## Inicio rápido

```bash
copy .env.example .env
docker compose up --build
```

Abra `http://localhost:4100/portal-comercial.html`. La página corporativa está disponible en `http://localhost:4100/fmv-infrasec.html`. Puede cambiar el puerto público mediante `APP_PORT`.

El CRM administrativo está en `http://localhost:4100/admin-comercial.html`.

El primer arranque requiere definir secretos reales en `.env`. Para crear las cuentas
iniciales use `BOOTSTRAP_USERS=true`, configure `ADMIN_*` y `SA_*`, arranque una vez
y luego cambie `BOOTSTRAP_USERS=false` y retire esas contraseñas del archivo.

## Integraciones

- Sin SMTP, los correos se guardan como simulados y el portal permite probar verificación y recuperación.
- Sin credenciales de Meta, WhatsApp se registra como simulado y genera enlaces `wa.me`.
- `PAYMENT_PROVIDER=local` registra pagos para validación manual; nunca los aprueba automáticamente. Para producción debe conectarse el adaptador del proveedor elegido y validar sus webhooks.

El portal admite PSE, tarjeta, transferencia bancaria, Nequi, Daviplata y efectivo. No almacena número de tarjeta, fecha de vencimiento ni CVV. Los administradores pueden publicar valores “desde” y validar los pagos desde el CRM.
- Las cotizaciones se generan en PDF y las asesorías se exportan como archivos `.ics`.

La aplicación rechaza el arranque en producción cuando detecta secretos ausentes,
débiles o iguales a los ejemplos. Configure HTTPS y restrinja `FRONTEND_URL` al
dominio definitivo.
