# RIVARA HR Academy

Sitio de la academia: catálogo de cursos, login de alumnos, recursos
gratuitos y espacio de notas. Next.js + Tailwind, pensado para vivir en
Vercel gratis, con Supabase para login y Mercado Pago para cobrar.

## Lo que YA funciona

- Home, catálogo de cursos, página de detalle de cada curso
- Página de recursos gratuitos y de notas
- Formularios de login/registro conectados a Supabase (`@supabase/supabase-js`)
- Dashboard de alumno con espacio para embeber videos de YouTube/Vimeo no listados
- Botón de inscripción: si el curso tiene `externalCheckout` (caso Hotmart)
  linkea directo; si no, llama a `/api/checkout` para generar un link de
  pago de Mercado Pago Checkout Pro

## Lo que falta para que quede 100% operativo

1. **Crear un proyecto de Supabase nuevo** (no reutilizar el de RIVARA
   Recruiter/ATS, para no mezclar datos de candidatos con datos de alumnos).
   Copiar `Project URL` y `anon public key` a las variables de entorno en
   Vercel: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
2. **Crear una app/credencial de Mercado Pago** (Checkout Pro) y cargar el
   `MP_ACCESS_TOKEN` de producción en Vercel. Ahora mismo el precio en
   `app/api/checkout/route.ts` está en `0` — hay que poner el precio real
   en pesos antes de activar el cobro.
3. **Subir los videos de las clases a YouTube o Vimeo como "no listado"** y
   pegar el ID de cada video en `lib/courses.ts` (campo `freePreviewVideoId`).
4. **Cargar los PDFs reales** (Kit de 12 prompts, eBook de automatización)
   en Supabase Storage o Google Drive, y completar `fileUrl` en
   `lib/resources.ts`.
5. **Conectar el subdominio** `hracademy.rivaraconsultora.com.ar`: en
   Vercel > Project > Settings > Domains, agregar el subdominio, y en el
   panel de DNS de Hostinger crear el registro CNAME que Vercel indique.
6. **Reemplazar los precios placeholder** (marcados con `TODO` en
   `lib/courses.ts`) por los precios finales.
7. Opcional: crear la tabla `inscripciones` en Supabase (user_id,
   course_slug, fecha_pago) para que el dashboard solo muestre los cursos
   que cada alumna/o compró en vez de mostrarlos todos.

## Estructura

```
app/
  page.tsx              → home
  cursos/                → catálogo y detalle de curso
  login/, registro/       → auth con Supabase
  dashboard/              → área de alumno
  recursos/               → recursos gratuitos
  notas/                  → notas/blog
  api/checkout/           → integración Mercado Pago
lib/
  courses.ts              → EDITAR ACÁ para cambiar cursos, precios, fechas
  resources.ts             → EDITAR ACÁ para cambiar recursos gratuitos
  supabaseClient.ts
components/
```

## Desarrollo local

```bash
npm install
cp .env.example .env.local   # completar con tus credenciales
npm run dev
```
