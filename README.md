# RIVARA HR Academy

Sitio de la academia: catálogo de cursos, login de alumnos, recursos
gratuitos y pagos, y espacio de notas. Next.js + Tailwind, desplegado en
Vercel, con Supabase para login/datos y Mercado Pago para cobrar.

**Estado:** en producción en `hracademy.rivaraconsultora.com.ar`, con las
variables de entorno ya cargadas en Vercel.

## Lo que YA funciona

- Home, catálogo de cursos, página de detalle de cada curso, recursos
  gratuitos y pagos, y notas/blog.
- Login/registro de alumnas con Supabase (`@supabase/supabase-js`). El menú
  de arriba (`components/Nav.tsx`) refleja la sesión real: muestra "Mi
  cuenta" + "Cerrar sesión" si hay sesión activa, o "Ingresar" si no.
- **Compra de recursos pagos y cursos, de punta a punta:**
  1. El botón de compra (`ResourceCheckoutButton` / `CheckoutButton`) pide
     login antes de mostrar el pago — así queda guardado el mail de quien
     arranca una compra, la termine o no.
  2. `/api/checkout` crea la preferencia en Mercado Pago Checkout Pro y
     registra la compra como `pending` en la tabla `compras` de Supabase
     (columna `kind`: `resource` o `course`).
  3. `/api/mp-webhook` recibe el aviso de Mercado Pago, re-confirma el pago
     contra la API de MP (nunca confía ciegamente en la notificación),
     marca la compra `approved` y:
     - si es un **recurso**: manda el PDF por mail automáticamente (Resend).
     - si es un **curso**: manda un mail de bienvenida y queda habilitado
       en el dashboard.
  4. Si `MP_ACCESS_TOKEN` no está configurado o la API de MP falla, cae al
     link fijo de Mercado Pago (`mpPaymentLink`) o al aviso de WhatsApp —
     nunca rompe, pero esas compras quedan sin trackear.
- **Dashboard de alumna** (`/dashboard`) con tres secciones:
  - **Tus compras**: recursos pagos con compra aprobada, con botón de
    descarga (vía `/api/mis-compras`, que valida el access_token de la
    sesión contra Supabase Auth server-side y devuelve solo lo de ese mail).
  - **Tus clases**: solo los cursos con una compra aprobada asociada a su
    mail (antes mostraba todos los cursos a cualquiera).
  - **Recursos gratis**: descarga directa, sin tener que ir a `/recursos`.
- `/recursos` muestra un aviso de compra exitosa/fallida al volver de MP
  (`?compra=exitosa|fallida`).

## ⚠️ Pendiente / a tener en cuenta

1. **Confirmar en una venta real que el webhook cierra el círculo completo**
   (pago → `compras` en `approved` → mail automático). Se armó y se probó
   por partes, pero no se llegó a validar 100% limpio en esta sesión —
   varias pruebas terminaron cruzándose con el link fijo viejo de MP o con
   precios de prueba. En la primera compra real, revisar la tabla `compras`
   (columnas `status`, `mp_payment_id`, `delivered_at`) para confirmar que
   quedó todo bien.
2. **Compras manuales (transferencia bancaria / Payoneer)** no se registran
   solas — ni para recursos ni para cursos. Cuando Melisa confirme una a
   mano, hay que insertar/actualizar la fila correspondiente en `compras`
   (`status = 'approved'`, `buyer_email`, `kind`, `resource_slug`) para que
   le aparezca a esa alumna en su dashboard.
3. **Subir los videos de las clases** a YouTube/Vimeo como "no listado" y
   pegar el ID en `lib/courses.ts` (`freePreviewVideoId`) — hoy dice "Video
   no cargado todavía".
4. El curso **"Claude para Selección"** sigue marcado `comingSoon`, no se
   vende todavía.
5. Campo cosmético `mp_preference_id` en `compras` no siempre se guarda
   (no afecta el funcionamiento, el matching real usa `external_reference`
   / `mp_payment_id`).
6. Mercado Pago pareció rechazar la creación de preferencias con montos muy
   bajos (~$50 ARS) durante las pruebas — no debería afectar precios reales
   (siempre bien por encima de eso), pero tenerlo en cuenta si algún día se
   vende algo muy barato.
7. Supabase Auth "Leaked Password Protection" no se puede activar en el
   plan gratis (requiere plan Pro) — no crítico.

## Variables de entorno (ya cargadas en Vercel — ver `.env.example`)

| Variable | Para qué |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Login de alumnas (proyecto Supabase "rivara-hr-academy", separado del ATS/Recruiter) |
| `SUPABASE_SERVICE_ROLE_KEY` | Escribir/leer `compras` desde el servidor (`/api/checkout`, `/api/mp-webhook`, `/api/mis-compras`) |
| `MP_ACCESS_TOKEN` | Access Token de producción de Mercado Pago (Checkout Pro) |
| `MP_WEBHOOK_SECRET` | Opcional: valida la firma de las notificaciones de MP |
| `RESEND_API_KEY` | Mails automáticos (PDF de recursos, bienvenida a cursos, aviso de alumna nueva) |
| `SIGNUP_WEBHOOK_SECRET` | Protege `/api/notify-signup` (trigger de Supabase al registrarse una alumna) |
| `NEXT_PUBLIC_SITE_URL` | Base para `back_urls` y `notification_url` de Mercado Pago |

## Estructura

```
app/
  page.tsx                → home
  cursos/                  → catálogo y detalle de curso
  login/, registro/         → auth con Supabase
  dashboard/                → área de alumna: tus compras, tus clases, recursos gratis
  recursos/                 → recursos gratuitos y pagos
  notas/                    → notas/blog
  api/checkout/             → crea la preferencia de pago en Mercado Pago
  api/mp-webhook/           → recibe la confirmación de pago, marca `compras` y entrega el recurso/curso
  api/mis-compras/          → devuelve las compras aprobadas de la sesión actual
  api/notify-signup/        → avisa por mail cuando se registra una alumna nueva
lib/
  courses.ts                → EDITAR ACÁ para cambiar cursos, precios, fechas
  resources.ts               → EDITAR ACÁ para cambiar recursos, precios, PDFs
  supabaseClient.ts           → cliente anon (login de alumnas, uso en el browser)
  supabaseAdmin.ts            → cliente con service role (solo server-side)
components/
```

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con tus credenciales
npm run dev
```
