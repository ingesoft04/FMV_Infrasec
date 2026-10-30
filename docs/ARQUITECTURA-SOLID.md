# Arquitectura SOLID

La aplicación utiliza composición manual de dependencias en `src/container.js`. Las capas se relacionan en una sola dirección:

```text
HTTP routes → Controllers → Services → Repositories → PostgreSQL
                                ↓
                            Adapters
                    (correo, WhatsApp, PDF, calendario)
```

## Principios

### Responsabilidad única

- `index.js` únicamente arranca la aplicación.
- `app.js` configura Express.
- Los controladores traducen HTTP.
- Los servicios contienen casos de uso.
- Los repositorios contienen SQL.
- Los adaptadores encapsulan servicios externos.

### Abierto/cerrado

Los servicios consumen objetos inyectados. Un proveedor nuevo de correo, WhatsApp, documentos o pagos puede añadirse mediante otro adaptador sin modificar los controladores ni las rutas.

### Sustitución de Liskov

Los servicios utilizan el comportamiento público de repositorios y gateways. Una implementación alternativa debe respetar esos métodos y valores de retorno; puede reemplazarse por memoria, otra base de datos o un proveedor externo.

### Segregación de interfaces

Los servicios reciben solo las dependencias que usan. Por ejemplo, `AuthService` recibe usuarios, tokens y notificaciones; no conoce pagos, cotizaciones ni Express.

### Inversión de dependencias

Las reglas de negocio no crean conexiones PostgreSQL, transportes SMTP ni generadores PDF. Esas implementaciones se construyen en `container.js` y se inyectan.

## Regla de cambios

Después de cada modificación se ejecuta:

```bash
pnpm test
```

La suite verifica tanto regresión funcional como límites arquitectónicos: SQL encapsulado, rutas sin reglas de negocio, punto de entrada pequeño y recursos web disponibles.

## Arquitectura de publicación

La publicación actual se ejecuta en una VM Ubuntu. Caddy termina HTTPS y dirige
cada dominio al puerto local de su entorno:

```text
Internet
   |
   +-- test-infrasec.dev-fmv.duckdns.org -- Caddy -- 127.0.0.1:4101
   |                                                |
   |                                   proyecto Docker de pruebas
   |                                   API + PostgreSQL + volumen propio
   |
   +-- infrasec.dev-fmv.duckdns.org ------ Caddy -- 127.0.0.1:4100
                                                    |
                                         proyecto Docker de producción
                                         API + PostgreSQL + volumen propio
```

Los entornos no comparten base de datos, volumen, red Docker, secretos ni puerto.
El archivo `docker-compose.test.yml` cambia únicamente la imagen PostgreSQL usada
para crear el entorno de pruebas; se aplica junto con `docker-compose.yml`.

## Frontera visual de los entornos

Todas las páginas públicas cargan `assets/test-environment.js`. El script sólo se
activa cuando el nombre del host empieza por `test-`; por ello, el mismo artefacto
puede promoverse a producción sin mostrar el aviso de pruebas. El favicon común se
encuentra en `assets/brand/favicon.svg`.

## Regla de promoción

Una rama se publica primero en pruebas. Después de las pruebas automatizadas y la
revisión humana se vuelve a ejecutar `git fetch` y se comprueba que no existan
cambios remotos pendientes. Sólo con aprobación explícita se fusiona a `main` y se
despliega a producción. La base productiva nunca se restaura, reemplaza ni comparte
con pruebas durante este proceso.
