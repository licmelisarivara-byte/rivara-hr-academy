# RIVARA HR Academy

Sitio de la academia: catálogo de cursos, login de alumnos, recursos
gratuitos y espacio de notas. Next.js + Tailwind, pensado para vivir en
Vercel gratis, con Supabase para login y Mercado Pago para cobrar.

## Lo que YA funciona

- Home, catálogo de cursos, página de detalle de cada curso
- Página de recursos gratuitos y de notas
- Formularios de login/registro conectados a Supabase (`@supabase/supabase-js`)
- Dashboard de alumno con espacio para embeber videos de YouTube/Vimeo no listados
- Botón de compra de recursos pagos: llama a `/api/checkout`, que crea una
  preferencia de Mercado Pago Checkout Pro y registra la compra (estado
  `pending`) en la tabla `compras` de Supabase. Si `MP_ACCESS_TOKEN` no está
  configurado, cae al link fijo de MP (`mpPaymentLink`) o al mensaje de
  WhatsApp, igual que antes.
- **Webhook de Mercado Pago** (`/api/mp-webhook`): cuando MP confirma un
  pago, este endpoint re-consulta el pago contra la API de MP (nunca confía
  ciegamente en la notificación), actualiza la fila en `compras` a
  `approved` y **manda el PDF por mail automáticamente** al comprador (vía
  Resend), sin que nadie tenga que confirmar nada a mano.
- Botón de inscripción a cursos: si el curso tiene `externalCheckout` (caso
  Hotmart) linkea directo; si no, llama a `/api/checkout` igual que los
  recursos.

## Lo que falta para que quede 100% operativo

1. **Cargar las variables de entorno en Vercel** (ver `.env.example` para
   la lista completa y comentarios de cada una):
   - `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY`: ya existe
     el proyecto de Supabase "rivara-hr-academy" (separado del ATS/Recruiter,
     como corresponde) — solo falta copiar `Project URL` y `anon public key`
     desde Project Settings > API.
   - `SUPABASE_SERVICE_ROLE_KEY`: también en Project Settings > API (es
     secreta, no la publiques). La usan `/api/checkout` y `/api/mp-webhook`
     para escribir en la tabla `compras` (ya está creada, con RLS activado
     y sin policies — solo accesible con esta key).
   - `MP_ACCESS_TOKEN`: Access Token de **producción** de tu cuenta de
     Mercado Pago (Tu negocio > Configuración > Credenciales). Sin esto, el
     cobro automático no arranca y el sitio sigue funcionando en modo
     manual (link fijo + WhatsApp).
   - `RESEND_API_KEY`: para que salga el mail automático con el PDF (y el
     aviso de alumnas nuevas).
   - Opcional: `MP_WEBHOOK_SECRET` (clave secreta del webhook, se configura
     también en el panel de MP en Tu negocio > Webhooks) para validar la
     firma de cada notificación.
2. **Confirmar los precios reales** en `app/api/checkout/route.ts` /
   `lib/resources.ts` / `lib/courses.ts` antes de activar el cobro (los de
   recursos ya están cargados; revisar los de cursos, marcados `TODO`).
3. **Subir los videos de las clases a YouTube o Vimeo como "no listado"** y
   pegar el ID de cada video en `lib/courses.ts` (campo `freePreviewVideoId`).
4. **Crear el proyecto en Vercel y conectar el subdominio**
   `hracademy.rivaraconsultora.com.ar`: Vercel > Project > Settings >
   Domains, agregar el subdominio, y en el panel de DNS de Hostinger crear
   el registro CNAME que Vercel indique.
5. Opcional: crear una tabla `inscripciones` en Supabase (user_id,
   course_slug, fecha_pago) para que el dashboard solo muestre los cursos
   que cada alumna/o compró en vez de mostrarlos todos. (Mismo patrón que
   ya usa `compras` para los recursos.)

### Cómo probar el cobro automático de recursos

1. Cargá las 4 variables de Mercado Pago/Supabase/Resend en Vercel (o en
   `.env.local` para probar en tu máquina) y redeployá.
2. Comprá un recurso de prueba. Vas a terminar en Mercado Pago; si pagás,
   MP redirige a `/recursos?compra=exitosa` y, unos segundos después,
   llega el mail con el PDF sin que hagas nada manual.
3. Podés revisar el estado de cualquier compra en la tabla `compras` del
   proyecto de Supabase "rivara-hr-academy" (columnas `status`,
   `buyer_email`, `delivered_at`, etc.).

## Estructura

```
app/
  page.tsx              → home
  cursos/                → catálogo y detalle de curso
  login/, registro/       → auth con Supabase
  dashboard/              → área de alumno
  recursos/               → recursos gratuitos y pagos
  notas/                  → notas/blog
  api/checkout/           → crea la preferencia de pago en Mercado Pago
  api/mp-webhook/         → recibe la confirmación de pago y entrega el PDF
lib/
  courses.ts              → EDITAR ACÁ para cambiar cursos, precios, fechas
  resources.ts             → EDITAR ACÁ para cambiar recursos, precios, PDFs
  supabaseClient.ts        → cliente anon (login de alumnos, uso en el browser)
  supabaseAdmin.ts         → cliente con service role (solo server-side)
components/
```

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con tus credenciales
npm run dev
```
