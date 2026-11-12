# Guía de uso — cómo correr la metodología

Esta guía es para ti, la persona que usa la metodología. Explica cómo arrancarla, qué hace el agente, dónde quedan los resultados y qué tienes que decidir tú en cada etapa.

> Para entender el porqué del diseño, lee `02_contexto/proceso-build-package.md`. El agente lee `AGENTS.md`.

---

## 1. Qué hace la metodología

Convierte un documento de entrada (idea, propuesta, objetivos, borrador de requisitos) en un **Build Package**: una especificación completa que un desarrollador puede implementar sin decidir nada de diseño.

Lo hace en cuatro etapas, siempre en este orden:

| Etapa | Qué produce | Tú decides |
|---|---|---|
| **ctx00** Definir el problema | Problema acordado y congelado | Que el problema y el alcance son correctos |
| **ctx01** Especificar requisitos | Requisitos, límites y criterios de aceptación | Que los requisitos están completos y son comprobables |
| **ctx02** Resolver la arquitectura | Arquitectura, hardware de referencia y plan | El hardware (V1) y el diseño final (V2) |
| **ctx03** Compilar el Build Package | Especificación modular y pruebas | Las referencias de hardware (V1) y la especificación final (V2) |

**El agente propone y tú decides.** Nada avanza sin tu aprobación explícita.

---

## 2. Antes de empezar

1. **Pon tu documento de entrada en `inputs/`.** Usa Markdown o texto: los agentes no leen bien los PDF. Si solo tienes PDF, conviértelo a `.md`.
2. **Abre el agente en esta carpeta** (`methodology_22/`). El agente lee `AGENTS.md` solo.
3. **Decide el modo de corrida** (ver §3).
4. **Reserva tiempo para responder.** En cada validación el agente se detiene y espera tu decisión.

---

## 3. Cómo correrla

### Modo A · etapa por etapa (recomendado la primera vez)

Escribe al agente, en una sesión nueva:

```
Run ctx00 with @inputs/mi_documento.md
```

Cuando ctx00 termine y lo apruebes, abre **una sesión nueva** (o limpia el contexto) y escribe:

```
Run ctx01
Run ctx02
Run ctx03
```

una por sesión, en ese orden. Cada etapa verifica por sí misma que la anterior terminó bien (hash correcto) y se niega a empezar si no.

### Modo B · toda la metodología

```
Run Full methodology with @inputs/mi_documento.md
```

El agente encadena las cuatro etapas, **cada una con contexto aislado**. Lo hace pidiéndote que abras una sesión nueva (o limpiando el contexto) al terminar cada etapa y retomando con `Continue`. **No elimina tus validaciones:** se detiene en cada una y también si una etapa queda bloqueada, no aprobada, detenida o devuelta.

### Reanudar

Si cierras la sesión a mitad de camino, abre una nueva y escribe:

```
Continue
```

El agente mira `results/`, detecta en qué etapa y en qué punto estás, y sigue desde ahí.

### Frases equivalentes

Funcionan variantes como «Corre ctx00 con @inputs/…», «Corre toda la metodología con @inputs/…» o «Continúa».

---

## 4. Dónde quedan los resultados

Todo se guarda en `results/`, dentro de la carpeta de cada etapa. Nunca se mezclan etapas.

```
results/
├── ctx00/   intake.md · sources/ · problem-definition.md ·
│            problem-baseline.json · problem-baseline.sha256 · CONTEXT-ctx00.md
├── ctx01/   record.json · state.json · events.jsonl · rounds/O1…O6/ ·
│            requirements-baseline.json/.sha256/.md · CONTEXT-ctx01.md
├── ctx02/   state.json · events.jsonl · questions.json · items.json · substages/ ·
│            validations/V1|V2/R<n>/ · architecture-baseline.json/.sha256/.md ·
│            final-design.md · CONTEXT-ctx02.md
└── ctx03/   state.json · STATUS.md · events.jsonl · questions.json · items.json ·
             spec-register.json · specs/ · validations/V1|V2/R<n>/ ·
             build-package-baseline.json/.sha256/.md · final-spec.md · CONTEXT-ctx03.md
```

**Qué mirar:**

| Quieres… | Abre |
|---|---|
| Leer el problema aprobado | `results/ctx00/problem-definition.md` |
| Leer los requisitos aprobados | `results/ctx01/requirements-baseline.md` |
| Leer el diseño aprobado | `results/ctx02/final-design.md` |
| **Leer el producto final** | `results/ctx03/final-spec.md` y `results/ctx03/build-package-baseline.md` |
| Saber en qué punto va una etapa | `state.json` de esa etapa (en ctx03, también `STATUS.md`) |
| Entender qué entrega una etapa a la siguiente | `CONTEXT-ctxNN.md` |

Los archivos `*-baseline.json` con su `.sha256` son la versión **congelada** de cada etapa. No los edites: si cambian, la siguiente etapa se negará a arrancar.

---

## 5. Cómo funciona tu validación en cada etapa

Regla común: **el agente nunca aprueba**. Te presenta un documento, se detiene y espera. Solo cuenta tu decisión explícita.

Las decisiones posibles:

| Decisión | Significa |
|---|---|
| `APROBAR` | La etapa (o la validación) está bien. Se congela y se habilita lo siguiente. |
| `AJUSTAR` | Quieres cambios. El agente los aplica y vuelve con un documento nuevo. |
| `DETENER` | Paras la etapa. No se congela nada. |
| `CERRAR_FORZADO: <Q-id>` | Cierras una pregunta sin darle contenido (la consideras infundada). El agente decide por el criterio de producto mínimo viable y lo marca como *propuesto* y *forzado*. |

`APROBAR` **no se acepta** mientras haya una pregunta abierta que bloquee esa validación o un gate en `FAIL`. En ese caso el agente te lo dice y la etapa queda `blocked`.

### ctx00 — una revisión al final

1. El agente trabaja las siete subetapas **sin interrumpirte** y junta todas las dudas.
2. Te presenta `results/ctx00/problem-definition.md` con las preguntas abiertas (`OQ-nn`).
3. **Respondes en el chat:**
   - cada pregunta con una **respuesta de contenido** o como **cierre forzado**;
   - cualquier modificación que quieras;
   - o, si no hay preguntas ni cambios, escribes **`APROBAR` con tu nombre**.
4. Hay **hasta 3 rondas**. Tras la ronda 3, si el documento no está limpio, la etapa queda *no aprobada* y se reinicia con una entrada corregida.

Solo con tu `APROBAR` el agente congela el JSON y escribe el hash.

### ctx01 — un documento por ronda (DEE)

1. El agente te entrega, en `results/ctx01/rounds/O<n>/`:
   - `dee.md`: el documento que lees. Sus seis secciones son: resumen y estado de los 7 gates, contenido completo, lo que decidió el agente, lo que queda abierto, resultado de los gates con evidencia y la decisión pendiente.
   - `response-form.md`: el formulario vacío.
2. **Rellenas `response-form.md`:**

   ```markdown
   # Feedback response — round 1 (output O1)
   Decision: AJUSTAR            <- APROBAR | AJUSTAR | DETENER

   ## Answers to open questions
   - Q-01: <tu respuesta, o "forced closure">

   ## Improvement themes
   - T-01: <un tema de mejora, con tus palabras>
   ```

   Un tema no necesita fundamento técnico: si algo no te convence, eso ya es un hallazgo.
3. Le dices al agente que lo has respondido; él lo lee, planifica los cambios y vuelve con la salida siguiente.

**Límites:** hasta **6 salidas** (O1–O6).

| Salida | Preguntas nuevas | Qué puedes enviar |
|---|---|---|
| O1, O2 | Sí | Respuestas, temas y decisión |
| O3 | No: las abiertas se **cierran a la fuerza** como supuestos visibles | Mejoras o aprobación |
| O4–O6 | No | Solo temas de mejora |
| Tras O6 | — | Solo `APROBAR` (con los supuestos forzados visibles) o `DETENER` |

Si queda algún aplazamiento (`DFR`) abierto, la única aprobación posible es `APROBAR_CON_APLAZAMIENTO`, que lleva adjunta la lista de aplazamientos.

### ctx02 — dos validaciones: V1 (hardware) y V2 (diseño final)

1. **V1.** Tras comparar hardware, el agente se detiene y deja en `results/ctx02/validations/V1/R<n>/`:
   - `hardware-proposal.md`: lo que lees. **Las preguntas abiertas van siempre primero**, y las que bloquean están marcadas.
   - `feedback.md`: el formulario vacío, con cada pregunta como `Q-02-nn`.
2. **Rellenas `feedback.md`** con la decisión, tus respuestas (o `CERRAR_FORZADO: Q-02-nn`) y tus temas `T-nn`.
3. El agente escribe `integration.md` con una fila por cada respuesta y tema, que dice qué hará con él: `apply`, `no-op-confirmed`, `reject`, `defer:Ctx03`, `escalate:…` o `not-locatable`. Nada se pierde.
4. Con `APROBAR` en V1, **el hardware aprobado queda bloqueado** y arranca la segunda fase.
5. **V2** funciona igual con `final-design.md` (decisiones, componentes, dependencias y plan).

**Rondas por validación:**

| Presentación | Preguntas nuevas | Qué puedes enviar |
|---|---|---|
| R1, R2 | Sí | Respuestas, temas y decisión |
| R3 | No | Respuestas, temas y decisión |
| R4 | No | **Solo `APROBAR` o `DETENER`** |

Hasta **3 ajustes por validación** (V1 y V2 por separado). Un cambio en V2 que toque hardware ya aprobado se escala a V1 y consume una de sus rondas.

### ctx03 — dos validaciones: V1 (referencias de hardware) y V2 (especificación final)

Igual que ctx02, con:

- **V1:** referencias de hardware para todo lo que no es el SDR ni la placa (hojas de datos, máximo dos opciones por componente). Documento: `results/ctx03/validations/V1/R<n>/hardware-proposal.md`.
- **Fase intermedia sin interrupción:** el agente escribe los módulos de especificación uno por uno. Puedes seguir el avance en `results/ctx03/STATUS.md`.
- **V2:** especificación final en `results/ctx03/validations/V2/R<n>/final-spec.md`. Los valores que el agente no pudo cerrar sin ti aparecen como preguntas.
- `APROBAR` en V2 genera el Build Package.

### Si no estás de acuerdo con una escalación

Si el agente detecta que un cambio afecta algo ya congelado (alcance, requisitos o diseño), **no lo aplica**: lo registra como `escalate:…` y la etapa pasa a `returned_upstream`. Es decisión tuya reabrir la etapa anterior; esa reapertura invalida los resultados de las etapas posteriores.

---

## 6. Qué hacer cuando algo no sale como esperabas

| Situación | Qué significa y qué hacer |
|---|---|
| El agente dice que no puede arrancar una etapa | El hash de la etapa anterior no verifica o falta `CONTEXT-ctxNN.md`. Revisa que no hayas editado `results/` y que la etapa anterior esté aprobada. |
| Estado `blocked` | Hay una pregunta abierta o un gate en `FAIL`. Respóndela o ciérrala con `CERRAR_FORZADO`, o ajusta lo que falla. |
| Estado `not_approved` (ctx00) | Tras 3 rondas no quedó limpio. Corrige el documento de entrada y relanza ctx00. |
| Estado `returned_upstream` | Un cambio afecta una etapa congelada. Decide si reabrir esa etapa; el agente no lo hará por su cuenta. |
| Cerraste la sesión | Abre una nueva y escribe `Continue`. |
| Quieres rehacer una etapa | Díselo al agente. **Antes** te avisará de que sus resultados se descartan y de que las etapas posteriores quedan invalidadas; nunca sobrescribe sin tu confirmación. |

---

## 7. Buenas prácticas

- **Una etapa por sesión.** Es la regla de aislamiento y la que más protege la calidad.
- **No edites a mano** nada en `results/`, sobre todo los `*-baseline.json`, los `.sha256` ni `intake.md`.
- **Lee el documento completo antes de decidir.** Los gates en verde son condición necesaria, no suficiente: puedes responder `AJUSTAR` con todo en verde.
- **Prefiere responder con contenido** a forzar el cierre. Un cierre forzado deja un supuesto que viaja hacia las etapas siguientes.
- **Revisa especialmente** las marcas `propuesto` y `forced`: son lo que decidió el agente y no lo que dijo la fuente o tú.
- **Responde por identificador** (`Q-…`, `T-…`) y en el formulario, no en prosa suelta.
