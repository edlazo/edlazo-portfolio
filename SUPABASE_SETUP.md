# Puesta en marcha de Supabase — Portfolio

> **Nada de esto se ejecutó todavía.** Los tres 404 siguen ahí hasta que corras los pasos 2 y 3
> desde tu propio dashboard. Ningún comando de este documento se ejecutó contra tu base.

## 1. Diagnóstico confirmado

Los tres endpoints devuelven **404** porque PostgREST no encuentra las tablas en el cache de
esquema (`PGRST205: Could not find the table 'public.<tabla>' in the schema cache`). Es decir:
el proyecto de Supabase existe y las credenciales son válidas — si no lo fueran, verías **401**
en vez de 404 —, pero `supabase_schema.sql` nunca se aplicó.

| Endpoint | Tabla esperada | Consumidor |
|---|---|---|
| `/rest/v1/skill_categories?select=*&order=sort_order.asc` | `public.skill_categories` | `fetchSkillsFromSupabase()` |
| `/rest/v1/projects?select=*&order=sort_order.asc` | `public.projects` | `fetchProjectsFromSupabase()` |
| `/rest/v1/profile?select=*&limit=1` | `public.profile` | `fetchProfileFromSupabase()` |

Los nombres de tabla y de columna en `src/lib/supabaseService.ts` coinciden con el schema. El
problema es exclusivamente que la base está vacía.

## 2. Revisión del schema: qué estaba mal

`supabase_schema.sql` creaba las 4 tablas y activaba RLS correctamente, pero tenía estos defectos.
Ya están corregidos en el archivo (la versión original sigue en git: `git diff supabase_schema.sql`):

| # | Problema | Efecto | Corrección aplicada |
|---|---|---|---|
| 1 | Faltaba el seed de `skill_categories`, `skills` y `projects` | Tras aplicarlo, las 3 consultas devolverían 200 con `[]` y el sitio seguiría usando los datos hardcodeados | Seed completo en `supabase_seed.sql` |
| 2 | `CREATE POLICY` sin `DROP POLICY IF EXISTS` | Re-ejecutar el script aborta con `42710: policy already exists` | `DROP POLICY IF EXISTS` antes de cada `CREATE POLICY` |
| 3 | `ON CONFLICT DO NOTHING` sobre `profile` sin clave única | No protege de nada: cada re-ejecución insertaba un perfil duplicado (PK nueva en cada `INSERT`) | El seed inserta con `WHERE NOT EXISTS (SELECT 1 FROM profile)` |
| 4 | Políticas de escritura con `auth.role() = 'authenticated'` y sin `WITH CHECK` | `auth.role()` está deprecada en Supabase; la forma soportada es la cláusula `TO` | `FOR ALL TO authenticated USING (true) WITH CHECK (true)` |
| 5 | `projects` sin columnas para `highlights` ni `architectureOverview` | Sembrar proyectos habría vaciado esos bloques en el sitio (ver **sección 6**) | Columnas `highlights JSONB` y `architecture_overview JSONB` + mapeo en el service |
| 6 | Sin claves únicas estables | El seed no era re-ejecutable y el AdminPanel podía duplicar skills | `slug` único en `skill_categories` y `projects`; único `(category_id, name)` en `skills` |
| 7 | Sin `NOTIFY pgrst, 'reload schema'` | El 404 puede persistir unos segundos tras el DDL | `NOTIFY` al final del schema |

Lo que **ya estaba bien** y se mantuvo sin cambios: los nombres de las 4 tablas y de todas sus
columnas, los tipos (`TEXT[]` para `stack`/`platforms`, `UUID` como PK), la FK
`skills.category_id → skill_categories.id ON DELETE CASCADE`, `ENABLE ROW LEVEL SECURITY` en las
4 tablas y las políticas de lectura pública (que es justo lo que necesita el sitio con la `anon key`).

## 3. Pasos exactos para aplicarlo

### Paso 0 — Verificar que apuntás al proyecto correcto

`.env.local` define `VITE_SUPABASE_URL` con la forma `https://<project-ref>.supabase.co`.
Abrí <https://supabase.com/dashboard>, entrá al proyecto y comprobá en **Project Settings → General**
que el *Reference ID* es exactamente ese `<project-ref>`. Si no coincide, estás mirando otro proyecto
y el resto de los pasos no arreglaría nada.

Confirmá también que las mismas dos variables están cargadas en Vercel
(**Project → Settings → Environment Variables**), ya que producción también hace las llamadas.

### Paso 1 — Abrir el SQL Editor

Dashboard → menú lateral **SQL Editor** → botón **New query**.

### Paso 2 — Crear las tablas, RLS y políticas

1. Copiá el contenido completo de `supabase_schema.sql`.
2. Pegalo en el editor y pulsá **Run** (o `Ctrl+Enter`).
3. Resultado esperado: `Success. No rows returned`.

Si algo falla, el error aparece abajo del editor; el script no deja nada a medias porque cada
sentencia es idempotente y se puede volver a correr entero. (Único caso en que no lo es: si la base
ya tuviera filas duplicadas, el índice único `skills_category_name_key` fallaría al crearse. No
aplica acá, porque las tablas no existen.)

### Paso 3 — Sembrar los datos iniciales

1. **New query** otra vez.
2. Copiá y pegá el contenido completo de `supabase_seed.sql` y pulsá **Run**.
3. La última sentencia imprime el conteo. Esperado:

   | tabla | filas |
   |---|---|
   | `profile` | 1 |
   | `skill_categories` | 4 |
   | `skills` | 22 |
   | `projects` | 2 |

Los datos salen de `src/data/portfolioData.ts`: `SKILL_CATEGORIES` (4 categorías / 22 skills),
`FEATURED_PROJECTS` (Semanita y Kairos, con sus `highlights` y `architectureOverview` como JSONB),
y el perfil se arma con `HERO_DATA.socials` + `PROFILE_DATA` + `ABOUT_DATA.bio` (la bio larga
concatena `bio` y `bioSecondary`, porque la tabla tiene un solo campo `bio_es`/`bio_en`).

El seed es re-ejecutable: las categorías, skills y proyectos se actualizan por `slug`
(`ON CONFLICT ... DO UPDATE`), y el perfil **solo** se inserta si la tabla está vacía, para no
pisar lo que hayas editado desde el AdminPanel.

### Paso 4 — Crear tu usuario admin

El AdminPanel escribe con una sesión de Supabase Auth (`signInWithPassword` en
`src/components/AdminLoginModal.tsx:45`), y las políticas de escritura solo aceptan el rol
`authenticated`. Sin usuario, el panel sigue sin poder persistir.

Dashboard → **Authentication → Users → Add user → Create new user**: poné tu email y una
contraseña, y marcá **Auto Confirm User**. Esa contraseña no debe pasar por este chat ni quedar
en ningún archivo del repo.

### Paso 5 — Verificar el REST

Con la `anon key` (la misma de `.env.local`, no la `service_role`):

```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://<project-ref>.supabase.co/rest/v1/projects?select=*&order=sort_order.asc" -H "apikey: <anon-key>"
```

Esperado `200`. Si sigue dando `404` unos segundos después del DDL, forzá el refresco del cache
ejecutando en el SQL Editor:

```sql
NOTIFY pgrst, 'reload schema';
```

### Paso 6 — Verificar el sitio

```bash
npm run build && npm run preview
```

En la consola del navegador ya no deben aparecer los tres 404, y las skills y proyectos deben
venir de la base (podés comprobarlo cambiando un `level_es` en Supabase y recargando). Después
redeploy en Vercel y repetí la comprobación en <https://www.eliaslazo.dev/>. Con los 404
eliminados, Best Practices de Lighthouse debería volver a 100.

## 4. Estructura final del schema

| Tabla | Columnas clave | RLS |
|---|---|---|
| `profile` | fila única; `role_*`, `email`, `*_url`, `location_*`, `education_*`, `bio_*` | SELECT: `anon` + `authenticated` · escritura: `authenticated` |
| `skill_categories` | `slug` (único), `category_*`, `description_*`, `icon`, `sort_order` | ídem |
| `skills` | `category_id` → FK CASCADE, `name`, `level_*`, `is_primary`, `sort_order`, único `(category_id, name)` | ídem |
| `projects` | `slug` (único), `title`, `tagline_*`, `summary_*`, `role_*`, `period`, `stack[]`, `platforms[]`, `image_url`, `demo_url`, `repo_url`, `is_mobile_app`, `highlights` JSONB, `architecture_overview` JSONB, `sort_order` | ídem |

Valores de `icon` admitidos por `SkillsMatrix.tsx:15`: `Server`, `Smartphone`, `Cpu`, `ShieldCheck`
(cualquier otro cae en el `default` y renderiza `Server`).

La `anon key` solo puede leer: las 4 políticas de escritura exigen el rol `authenticated`. Exponer
esa key en el bundle del front es el uso previsto.

## 5. Rollback

Si querés volver a cero (borra todos los datos del CMS, sin deshacer):

```sql
DROP TABLE IF EXISTS public.skills CASCADE;
DROP TABLE IF EXISTS public.skill_categories CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.profile CASCADE;
NOTIFY pgrst, 'reload schema';
```

El sitio vuelve a los 404 y a los datos hardcodeados, es decir, al estado actual.

## 6. Mapeo de `highlights` y `architectureOverview` (ya resuelto)

`fetchProjectsFromSupabase()` devolvía `highlights: []` fijo y no leía `architectureOverview`, así
que en cuanto `projects` tuviera filas el sitio habría perdido la lista de highlights de cada
tarjeta (`Projects.tsx:152`) y el bloque de arquitectura del modal (`ProjectModal.tsx:111`).

Corregido en `src/lib/supabaseService.ts`, en los dos sentidos:

```ts
// lectura (fetchProjectsFromSupabase)
highlights: Array.isArray(p.highlights) ? p.highlights : [],
architectureOverview: p.architecture_overview || undefined,

// escritura (upsertProjectToSupabase)
highlights: project.highlights || [],
architecture_overview: project.architectureOverview || null,
```

El lado de escritura importa igual que el de lectura: sin él, cualquier guardado desde el
AdminPanel dejaría el proyecto en la base con `highlights` vacío y `architecture_overview` nulo,
borrando lo que sembró `supabase_seed.sql`.

Con esto, el seed de `projects` se puede correr sin pérdida de contenido.

## 7. Fixes del AdminPanel (escritos, pendientes de verificar)

Estos cambios no se pudieron probar contra la base todavía: sólo se ejecutan con una sesión
autenticada y con las tablas creadas. `npx tsc -b` y `npm run build` pasan en verde. Qué probar en
el Paso 3, una vez logueado en el panel:

| # | Qué se arregló | Cómo verificarlo |
|---|---|---|
| 1 | **Guardar un proyecto ya no rompe con los ids locales.** `upsertProjectToSupabase` decidía por `id.includes('-')`, y `kairos-api` pasaba ese test sin ser UUID → `22P02`. Ahora: si el id es UUID se resuelve por PK, y si no, por la columna `slug` (`onConflict: 'slug'`). | Editar Kairos y guardar. Antes: error en consola y "Proyecto actualizado localmente". Ahora: "Proyecto guardado en Supabase", y **una sola** fila `kairos-api` en la tabla. |
| 2 | **El reordenamiento persiste.** El payload nunca incluía `sort_order`. Ahora `syncProjectsToSupabase()` reescribe la lista entera con su posición (1, 2, 3…), tanto al mover como al guardar (crear un proyecto lo antepone y corre a los demás). | Mover un proyecto, recargar la página: debe quedar en el lugar nuevo. En la tabla, `sort_order` correlativo. |
| 3 | **Las skills se filtran por categoría.** `.eq('name', ...)` sin `category_id` afectaba a homónimas de otra categoría. Ahora se filtra por `(category_id, name)`, y al editar se usa la categoría **original** (nueva state `editingSkillOldCatId`), así mover una skill de categoría sigue funcionando. | Crear la misma skill (p. ej. `Docker`) en dos categorías, borrar una: la otra debe seguir ahí. Después mover una skill de categoría y confirmar que no se duplica. |
| 4 | **El panel recarga desde la base tras cada escritura exitosa.** Nueva prop `onReloadFromDb`, conectada a `refreshFromSupabase()` en `App.tsx`, que además persiste el resultado en `localStorage` (antes el mount leía la base pero no lo guardaba, así que estado y caché divergían). | Guardar algo, y sin recargar la página comprobar que el panel muestra los valores tal como quedaron en la base (incluidos los ids UUID en proyectos nuevos). |

Dos arreglos extra del mismo tipo, que salieron al revisar los anteriores — ambos **destruían datos
del seed**:

| # | Qué se arregló | Cómo verificarlo |
|---|---|---|
| 5 | **Guardar un proyecto borraba sus highlights y su arquitectura.** El formulario no edita esos campos y armaba el objeto con `highlights: []` y sin `architectureOverview`; con el mapeo de escritura de la sección 6, eso se habría escrito en la base. Ahora se conservan los del proyecto existente. | Editar el título de Semanita, guardar, abrir el modal: los 3 highlights y el bloque de arquitectura deben seguir completos. |
| 6 | **Guardar el perfil pisaba la bio con un placeholder.** `handleSaveProfile` mandaba `bio_es: 'Ingeniero Backend & Fullstack'`. Ahora manda la bio real de `ABOUT_DATA` (misma que siembra `supabase_seed.sql`); no se puede omitir el campo porque es `NOT NULL` y viaja también en el `INSERT`. | Guardar el perfil y mirar `bio_es` en la tabla: debe seguir siendo el texto largo. |

Además, el selector de categorías del panel se reajusta solo si una recarga cambia los ids
(los slugs locales pasan a ser los UUID de la base), para que no quede apuntando a una categoría
inexistente.

Bonus del `slug` que agregó el schema: `saveSkillToSupabase` resolvía `category_id` con el id local
(`'backend'`), que tampoco es un UUID → `22P02`. Ahora `resolveCategoryId()` traduce esos ids por
`skill_categories.slug` antes de escribir, así el panel funciona aunque el sitio esté corriendo con
los datos hardcodeados de fallback.

### Si algo falla en la verificación

Los errores de Postgres llegan a la consola del navegador con su código. Los dos más probables:

- `42501 new row violates row-level security policy` → no hay sesión; volvé a loguearte en el panel.
- `23505 duplicate key value violates unique constraint` → el índice `skills_category_name_key`
  rechazando una skill repetida en la misma categoría. Es el comportamiento esperado; el panel lo
  reporta como "Skill guardado en local".
