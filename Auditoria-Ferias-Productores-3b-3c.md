# Auditoría — Problemas 3b y 3c

**Contexto:** durante la implementación del nuevo flujo de selección de productor en `Compare` (resolver el bug de atribución de ventas cuando dos productores empatan precio en la misma feria), se detectaron tres problemas colaterales. El **3a** (fallback hardcodeado a `feriaId: 1` en el form de "Nuevo producto") ya fue corregido. Este documento esquematiza los problemas **3b** y **3c**, sus implicaciones, y propone alternativas de solución.

---

## Problema 3b — Falta validación de autorización por feria

### Descripción

El sistema **no valida en ninguna capa** que un productor esté autorizado a vender en una feria específica antes de permitirle publicar productos en ella.

Concretamente:

- El dropdown de "Feria" en el form de nuevo producto (`FrontEnd/src/components/adminProductor/ProductorProductForm/AdminProductForm.tsx:171-176`) **filtra ferias por la provincia que el productor elige en el dropdown de provincia**, no por las ferias en las que el productor está registrado.
- El campo `usuarios.feria_id` se usa solo como **sugerencia inicial preseleccionada** (líneas 72-76 del mismo archivo), no como restricción.
- El backend (`BackEnd/src/services/productoService.js`, función `create`) **no hace ningún check de autorización**. Recibe un `feriaId` arbitrario y crea la `OfertaProducto` sin preguntar si el productor "pertenece" a esa feria.

### Evidencia en código

**Frontend — filtro permisivo:**
```ts
// AdminProductForm.tsx:171-176
const filteredFerias = ferias.filter(f => {
  const fData = f as any;
  const rawProv = fData.direccion?.provincia?.nombre || fData.provincia || 'Otras';
  return rawProv.toLowerCase().trim() === selectedProvincia.toLowerCase().trim()
})
```

El filtro toma **todas las ferias del país** que coincidan con la provincia elegida. El `user.feriaId` ni siquiera interviene en el filtrado.

**Backend — sin guard de autorización:**
```js
// productoService.js — función create (resumida)
const create = async (data) => {
  // ... validaciones de nombre y user_id
  const nuevoProducto = await sequelize.transaction(async (t) => {
    const creado = await Producto.create(payload, { transaction: t });
    if (data.precios && Array.isArray(data.precios)) {
      for (const precio of data.precios) {
        if (!precio.feriaId) throw new Error('Cada precio debe incluir feriaId');
        await OfertaProducto.create({
          producto_id: creado.id,
          feria_id: precio.feriaId,    // ← acepta cualquier feria
          precio: precio.precio,
          unidad: data.unidad || 'Unidad'
        }, { transaction: t });
      }
    }
    return creado;
  });
};
```

No hay validación contra `puestos_productor` ni contra `usuarios.feria_id`.

### Evidencia en datos (estado real, capturado de la BD)

Juan Pérez (`id=2`, `feria_id=1` = Feria del Productor Zapote) tiene productos publicados en **4 ferias distintas**:

| Producto | Feria | Precio |
|---|---|---|
| Tomate | Zapote (id=1) | ₡850 |
| Tomate | Alajuela (id=2) | ₡900 |
| Cebolla | Zapote | ₡600 |
| Cebolla | Borbón (id=3) | ₡650 |
| Banano | Alajuela | ₡1500 |
| Banano | Palmares (id=4) | ₡1400 |
| Papa | Zapote, Borbón | ... |
| Zanahoria | Alajuela, Palmares | ... |
| ... | ... | ... |

Su `feria_id` apunta solo a Zapote, pero el sistema le permitió publicar en otras 3 ferias.

### Implicaciones

1. **Información engañosa para el comprador.** Un cliente filtra por "Feria de Alajuela" y ve a Juan ofertando tomate ahí. Pero Juan no tiene puesto físico en Alajuela — solo lo registró desde el form, sin que nadie validara.

2. **Imposibilidad de auditar "dónde vende cada productor".** No hay fuente de verdad. La oferta dice "feria X" pero el productor podría no estar físicamente ahí.

3. **Conflicto con el flujo de aprobación existente.** En el codebase existen `solicitudes_cambio_rol` y `puestos_productor`, que parecen diseñados precisamente para que un admin valide qué productores operan en qué ferias. Pero el form de productos los pasa por alto.

4. **Riesgo para la confianza del comparador.** Si AgroMap se vende como "el comparador confiable de ferias", una oferta que apunta a una feria donde el productor no vende rompe la promesa.

5. **Implicación legal / fiscal (potencial).** Si en algún momento las ferias cobran membresía o regulan quién puede vender, este hueco habilita que productores no autorizados aparezcan listados.

### Soluciones propuestas

#### Solución 1 — Restricción estricta: una sola feria por productor

Usar `usuarios.feria_id` como restricción dura. El productor solo puede crear ofertas en la feria que tiene asignada.

- **Pros:** la más simple. La data actual ya soporta esto (cada usuario tiene una sola `feria_id`). Cambios mínimos: el dropdown de feria desaparece (o queda en read-only) y backend valida que `feriaId === user.feriaId`.
- **Contras:** contradice tu intuición de "un productor puede vender en varias ferias". Para productores reales que rotan entre ferias, es demasiado restrictivo.

#### Solución 2 — Many-to-many vía `puestos_productor` (recomendada)

Usar la tabla `puestos_productor` (que ya existe en el modelo) como la fuente de verdad de "qué productores venden en qué ferias". Un productor puede tener N puestos, uno por cada feria.

Reglas:
- Crear oferta en una feria solo si existe `puestos_productor(usuario_id=X, feria_id=Y)`.
- En el frontend, el dropdown de "Feria" se llena solo con las ferias donde el productor tiene puesto.
- En el backend (`productoService.create`), validar el puesto antes de aceptar la oferta.

- **Pros:**
  - Tabla ya existente, no requiere modelo nuevo.
  - Aprovecha el flujo de `solicitudes_cambio_rol` + aprobación admin, que ya está diseñado para crear puestos.
  - Cada puesto tiene info granular (número, descripción) — más realista que "el productor está en la feria".
  - Forzar al admin a aprobar explícitamente cada combinación productor-feria.
- **Contras:**
  - Requiere migrar productores existentes que no tienen puestos (caso Juan Pérez).
  - Si un productor quiere sumar una feria nueva, depende del admin para aprobar — fricción operativa.

#### Solución 3 — Tabla pivot `productor_feria` independiente

Crear una tabla nueva, más liviana que `puestos_productor`, con solo `(productor_id, feria_id, estado, fecha_alta)`. Sin datos de puesto físico, sin descripciones — pura relación de autorización.

- **Pros:** separación de responsabilidades clara. `puestos_productor` queda para info física del puesto; `productor_feria` para autorización.
- **Contras:** redundancia conceptual con `puestos_productor`. Yet-another-table. Dos cosas que pueden desincronizarse.

#### Solución 4 — Abierto por default, bloqueable por admin

El productor puede listar en cualquier feria por default. El admin tiene un panel para deshabilitar combinaciones específicas (por reportes, denuncias, baja del padrón, etc.). Tabla nueva `productor_feria_bloqueada`.

- **Pros:** baja fricción para productores nuevos. Control reactivo desde admin.
- **Contras:** menos predecible. El comprador no tiene garantía. La validación opera solo después de que el daño ya ocurrió.

#### Solución 5 — Auto-declarado con verificación comunitaria

El productor se lista a sí mismo en las ferias donde dice vender. La comunidad (otros productores, compradores frecuentes) puede reportar inconsistencias.

- **Pros:** escalable, no necesita admin centralizado.
- **Contras:** requiere sistema de reportes + moderación + reputación. Mucho desarrollo. No alineado con el alcance actual de AgroMap.

#### Solución 6 — Híbrido: ferias "verificadas" vs "auto-declaradas"

Mostrar en la UI dos categorías: "Productor verificado por la feria" (vía `puestos_productor`) vs "Productor auto-declarado" (sin puesto). Ambos pueden listar, pero el comprador ve el badge.

- **Pros:** transparencia. Productores nuevos pueden empezar a operar mientras tramitan su puesto.
- **Contras:** la UI se complica. Hay que diseñar el ciclo de "verificación pendiente → verificado".

### Recomendación

**Solución 2 (puestos_productor como fuente de verdad).** Razones:

- Reaprovecha una tabla y un flujo ya existentes en el codebase.
- Alinea el modelo de datos con la realidad del negocio: un puesto físico en una feria, registrado y aprobado.
- Hace explícita una invariante crítica: solo se puede vender donde se tiene puesto.
- Compatible con la intuición de "un productor en N ferias" — basta con tener N puestos.

Si en el futuro se quiere bajar la fricción de aprobación, se puede agregar un flag `auto_aprobacion` en `puestos_productor` o introducir Solución 6 como capa visual encima.

### Tareas concretas si se elige Solución 2

1. **Backend (servicio):** en `productoService.create` y `productoService.update`, validar que exista `puestos_productor(usuario_id, feria_id)` antes de crear/actualizar la oferta. Rechazar con 403 si no.
2. **Frontend (form):** cambiar `getFerias()` por un endpoint nuevo `getMisFerias()` que devuelve solo las ferias donde el productor tiene puesto. El dropdown se llena con eso.
3. **Migración de data:** crear puestos para productores sembrados (ver Problema 3c).
4. **UI admin:** asegurar que el admin tiene una manera clara de aprobar nuevos puestos cuando un productor solicita sumar una feria.
5. **Tests:** cubrir el caso "productor intenta crear oferta sin puesto → 403".

---

## Problema 3c — Inconsistencia entre seeders y flujo real de registro

### Descripción

El flujo de UI para que un usuario se convierta en productor (diseñado para producción) pasa por:

1. Usuario llena el form `RegistroProductor`.
2. Se crea una fila en `solicitudes_cambio_rol` con `estado='Pendiente'`.
3. Admin revisa en `AdminSolicitudes` y aprueba.
4. Al aprobar: se cambia `usuarios.role_id` a 2 (Productor), se crea una fila en `puestos_productor` con info del puesto físico, se asocia a la feria.

Pero los **seeders saltean todo ese flujo**. El seeder `006-seed-usuarios.js` inserta directamente en `usuarios` con `role_id=2` y `feria_id=1`, sin tocar `solicitudes_cambio_rol` ni `puestos_productor`.

### Evidencia en datos

Estado real de Juan Pérez en la BD ahora mismo:

| Tabla | Filas para Juan (`usuario_id=2`) |
|---|---|
| `usuarios` | 1 (`role_id=2`, `feria_id=1`, `puesto_info=NULL`) |
| `solicitudes_cambio_rol` | 0 |
| `puestos_productor` | 0 |
| `productos` (creados por él) | 9 |
| `oferta_productos` (suyas) | 17, repartidas en 4 ferias |

Es decir: Juan es funcionalmente un productor (tiene rol, tiene productos, tiene ventas potenciales) pero **no existe** desde la perspectiva del flujo de aprobación.

### Implicaciones

1. **Vistas admin pueden no verlo.** Cualquier panel que liste productores haciendo JOIN contra `puestos_productor` o `solicitudes_cambio_rol` mostrará la lista vacía para los productores seedeados. Habría que confirmar caso por caso, pero el riesgo está.

2. **Inconsistencia entre desarrollo y producción.** Un dev levanta el proyecto con seeders, ve que todo funciona, mergea. En producción, los productores reales sí pasaron por el flujo, así que tienen puestos. Cualquier feature que dependa de puestos funcionará en producción pero no en desarrollo — o viceversa, según en cuál ambiente se haya probado.

3. **Tests poco realistas.** Los tests del backend que arman datos con seeders están testeando un escenario que nunca ocurriría en producción.

4. **Bloqueo para implementar Solución 2 de 3b.** Si decidimos restringir ofertas a productores con puesto, todos los productores seedeados quedan inhabilitados de golpe.

5. **Confusión a nivel de modelo mental.** Es difícil razonar sobre "qué es un productor" si la data dice "productor sin puesto" pero el flujo dice "productor implica puesto".

### Soluciones propuestas

#### Solución 1 — Mejorar seeders para incluir puestos

Modificar `006-seed-usuarios.js` (o crear un seeder nuevo `006a-seed-puestos-productor.js`) para que, junto con cada Productor sembrado, se cree al menos una fila en `puestos_productor` apuntando a la feria asignada.

- **Pros:** trivial. Solo agrega data. No requiere cambios de código de negocio.
- **Contras:** no resuelve la causa raíz (que el seeder no usa el flujo real). Si en el futuro cambia la lógica de creación de productor, el seeder vuelve a quedar desalineado.

#### Solución 2 — Migración para data existente

Script idempotente que, al ejecutarse, verifica todos los productores en `usuarios` con `role_id=2` y crea `puestos_productor` para los que no tengan ninguno (usando `usuarios.feria_id` como destino).

- **Pros:** sirve para limpiar tanto desarrollo como producción (si en producción hay productores antiguos sin puestos).
- **Contras:** debe correrse explícitamente. Si nadie lo corre, el problema persiste.

#### Solución 3 — Defensividad en código

Cada lugar que asume "productor tiene puesto" maneja el caso de "productor sin puesto" con un fallback o un warning logueado.

- **Pros:** no rompe nada.
- **Contras:** perpetúa la inconsistencia. Esparce el problema por el codebase. Aumenta complejidad sin resolver nada.

#### Solución 4 — Invariante a nivel de servicio: productor implica puesto

En el servicio que crea/aprueba productores (`usuarioService` o `solicitudCambioRolService`), enforcear que al setear `role_id=2`, debe crearse al menos un `puestos_productor` en la misma transacción.

- **Pros:** garantiza el invariante "todo productor tiene al menos un puesto".
- **Contras:** los seeders deben respetar ese invariante también — si no, falla la creación. Hay que actualizar seeders.

#### Solución 5 — Constraint a nivel de BD

Trigger o constraint en MySQL que rechace insertar/actualizar `usuarios.role_id=2` si no existe un `puestos_productor` correspondiente. (Limitado en MySQL — los `CHECK` con subconsultas son complicados; probablemente se necesita un `TRIGGER`.)

- **Pros:** invariante imposible de violar, incluso por scripts manuales.
- **Contras:** más rígido. Los triggers en MySQL son frágiles, difíciles de testear, y se olvidan rápido. Personalmente no lo recomiendo salvo casos extremos.

#### Solución 6 — Refactorizar seeders para usar el servicio real

En lugar de insertar directo a la BD, los seeders llaman a `usuarioService.create()` y `solicitudCambioRolService.aprobar()` (o similar). Así, cualquier invariante del servicio se respeta automáticamente.

- **Pros:** garantiza que dev y producción usan el mismo camino. Los seeders se vuelven tests de integración implícitos.
- **Contras:** más lento (el seed pasa por validación + emails + lo que sea). Más acoplado al código de negocio — si refactorizás el servicio, el seeder se rompe.

### Recomendación

**Combinación de Solución 1 + Solución 4:**

- **Inmediato (Solución 1):** actualizar el seeder para que cada productor tenga al menos un puesto. Fix rápido, descongela el desarrollo.
- **Sostenido (Solución 4):** agregar la invariante a nivel de servicio. Garantiza que de acá en adelante no se cree un productor sin puesto, sea por seeder, por admin desde UI, o por el flujo de aprobación.

La Solución 6 (refactorizar seeders para usar el servicio) es atractiva pero probablemente sobre-ingeniería para el momento del proyecto. Vale la pena evaluarla si en algún momento se quiere asegurar que dev y prod son indistinguibles a nivel de creación de entidades.

### Tareas concretas si se eligen Soluciones 1 + 4

1. **Nuevo seeder `006a-seed-puestos-productor.js`** con un puesto por cada productor seedeado, apuntando a su `feria_id`.
2. **En `usuarioService.create` (o el servicio que maneja cambios de rol):** validar que si el rol final es Productor, se reciba info de puesto y se cree atómicamente en la misma transacción. Si no se recibe info de puesto, rechazar con error claro.
3. **Tests:**
   - "Crear productor sin info de puesto → error".
   - "Crear productor con info de puesto → ambos registros creados".
4. **Migración para BD existente:** correr una sola vez para crear puestos de Juan Pérez y cualquier otro productor huérfano en producción.

---

## Relación entre 3b y 3c

Los dos problemas están entrelazados:

- **3c es el bloqueo técnico de 3b.** Si elegimos resolver 3b con la Solución 2 (puestos como autorización), no podemos hacerlo mientras existan productores sin puestos (3c). Primero hay que resolver 3c.
- **3b da sentido a 3c.** Si no vamos a usar puestos para validar autorización (3b), entonces 3c es menos urgente — pasaría a ser solo un problema de consistencia de modelo mental, no funcional.

Por eso la recomendación es resolverlos **juntos y en orden**:

1. Primero **3c (seeders + invariante de servicio)** — limpia la data y garantiza el invariante.
2. Después **3b (validación de autorización en `productoService`)** — ya sobre data sana.

---

## Decisiones requeridas

Antes de implementar nada, hay que decidir:

| Decisión | Opciones | Impacto |
|---|---|---|
| Modelo de autorización | Estricto (una feria) / Many-to-many (puestos) / Abierto con bloqueo / Híbrido visual | Define la solución de 3b |
| Quién aprueba puestos | Solo admin / Auto-aprobación / Mixto | Define la fricción operativa |
| Migración de productores actuales | Crear puestos para todos / Marcarlos como "legacy" / Pedirles re-registro | Define la transición |
| Estrategia de seeders | Inserción directa con puestos / Llamada al servicio real | Define la consistencia dev↔prod |

Una vez tomadas estas decisiones, las tareas concretas listadas arriba se pueden ejecutar de forma incremental sin sobresaltos.

---

## Resumen ejecutivo

- **3b** = el sistema deja vender en cualquier feria sin validar. Se arregla restringiendo por `puestos_productor`.
- **3c** = los productores seedeados nunca tienen puestos, lo que rompe la invariante necesaria para 3b. Se arregla mejorando los seeders y endurecemos el servicio que crea productores.
- **No son urgentes** en el sentido de que el sistema funciona hoy. Pero **son deuda técnica que va a explotar** cuando se quiera escalar la moderación, agregar features de reputación de productor, o tener data confiable para reportes.
- **El costo de arreglarlos ahora es bajo** porque la data de producción es chica y los flujos están relativamente acotados. Posponerlos los hace más caros con el tiempo.
