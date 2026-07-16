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
