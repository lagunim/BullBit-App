# Rules

- El lenguaje utilizado es siempre español

---

# AGENTS.md - Guía para Agentes de Código

## 1. Comandos de Build, Lint y Test

### Comandos principales
```bash
npm run dev      # Iniciar servidor de desarrollo (Astro)
npm run build    # Construir para producción
npm run preview  # Previsualizar build de producción
```

### Tests
- **No hay framework de tests configurado** actualmente
- Si necesitas agregar tests, usa Vitest + React Testing Library
- Para agregar tests:
  ```bash
  npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
  ```
- Configuración sugerida en `vite.config.js`:
  ```js
  import { defineConfig } from 'vitest/config';
  export default defineConfig({
    test: { environment: 'jsdom', globals: true },
  });
  ```
- **Correr un solo test**: `npx vitest run --reporter=verbose path/to/test.spec.js`

---

## 2. Estructura del Proyecto

```
src/
├── components/       # Componentes React (.jsx)
│   ├── habits/       # Componentes de hábitos
│   ├── inventory/   # Componentes de inventario
│   ├── progress/    # Componentes de progreso/nivel
│   ├── daily-mission/ # Retos diarios
│   ├── journey/     # Historias/viajes
│   ├── plans/       # Sistema de planes
│   ├── layout/      # Header, Navbar
│   ├── ui/          # Componentes UI genéricos
│   └── auth/        # Autenticación
├── lib/              # Lógica de negocio y BD
│   ├── db.js        # Capa de persistencia Supabase
│   ├── supabase.js  # Cliente Supabase
│   ├── storage.js   # LocalStorage
│   ├── gameEngine.js
│   ├── items.js
│   ├── achievements.js
│   └── constants.js
├── store/            # Zustand store
│   └── gameStore.js
├── utils/            # Utilidades
│   └── gameLogic.js
├── data/             # Datos estáticos (constantes)
│   ├── items.js
│   ├── achievements.js
│   ├── dailies.js
│   ├── stories.js
│   └── habitThemes.js
├── styles/           # CSS global
├── layouts/          # Layouts Astro
└── pages/            # Páginas Astro
```

---

## 3. Convenciones de Código

### Nomenclatura
- **Archivos**: camelCase para JS, PascalCase para componentes React (.jsx)
- **Variables/Funciones**: camelCase
- **Componentes React**: PascalCase
- **Constantes**: UPPER_SNAKE_CASE
- **Base de datos (Supabase)**: snake_case

### Imports
Orden recomendado:
1. React/dependencias externas (`react`, `react-dom`, `zustand`)
2. Componentes hijos
3. Utilidades y stores
4. Datos (data/)
5. Estilos

```jsx
// ✅ Correcto
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useGameStore from '../../store/gameStore.js';
import HabitCard from './HabitCard.jsx';
import { getTodayKey } from '../../utils/gameLogic.js';
import { ITEMS } from '../../data/items.js';
```

### Componentes
- Usar **functional components** con hooks
- Exports default para componentes principales
- Named exports para utilidades/hooks
- Preferir `const Component = () => {}` sobre `function Component()`

### Estado (Zustand)
- El store principal está en `src/store/gameStore.js`
- Usar `useGameStore` con selector: `const habits = useGameStore(s => s.habits)`
- Nunca acceder al store directamente en render (usar selectors)

### Tipos
- Proyecto usa **JavaScript** (no TypeScript)
- Si necesitas validación de tipos, agregar JSDoc:
  ```js
  /** @type {string} */
  const habitId = 'xxx';
  ```

### Manejo de Errores
- **Fire-and-forget** para operaciones de BD: `.catch(() => {})`
- Console.logs estructurados: `console.error('[db] saveHabit:', error.message)`
- try/catch en funciones async
- Errors silenciosos en persistencia para no bloquear UI

```js
// ✅ Correcto - Fire and forget
saveHabit(userId, habit).catch(() => {});

// ✅ Correcto - Con manejo
try {
  const { data } = await supabase.from('profiles').select('*');
} catch (err) {
  console.error('[db] loadProfile:', err.message);
}
```

### Comentarios
- **Español** en todos los comentarios y documentación
- JSDoc para funciones públicas/exportadas
- Headers de sección con separadores:
  ```js
  // ════════════════════════════════════════════════════════════════════════
  // NOMBRE DE SECCIÓN
  // ════════════════════════════════════════════════════════════════════════
  ```

### CSS/Tailwind
- Usar clases de Tailwind exclusivamente
- No crear archivos CSS nuevos salvo que sea necesario
- Colores personalizados en `tailwind.config.mjs`
- Clases: `text-quest-gold`, `bg-quest-panel`, `border-quest-border`

---

## 4. Reglas Específicas del Proyecto

### Supabase
- Client en `src/lib/supabase.js`
- Funciones de BD en `src/lib/db.js`
- Conversión: camelCase (store) ↔ snake_case (BD)
- Todas las operaciones son async/await

### Base de Datos
- Tablas: `profiles`, `habits`, `habit_history`, `user_inventory`, `active_effects`, `user_achievements`, `user_daily_progress`, `user_stories`, `user_plans`, `plan_tasks`
- IDs de Supabase (UUID)
- Foreign keys: `user_id`, `habit_id`

### Funcionalidades del Juego
- **Hábitos**: tienen multiplicador, rachas, temas
- **Inventario**: efectos activos (temporales/pasivos/instantáneos)
- **Logros**: desbloqueables por progreso
- **Retos diarios**: selección diaria con recompensas
- **Viajes**: sistema de niveles con historias

---

## 5. Cosas a Evitar

- **NO** usar `console.log` en producción (solo `console.error` para errores)
- **NO** crear nuevos stores Zustand (usar el existente)
- **NO** agregar TypeScript sin consultar (proyecto es JS)
- **NO** modificar la estructura de BD sin crear migrations
- **NO** hacer commits directamente (primero consultar al usuario)

---

## 6. Recomendaciones para AI

- Antes de modificar el store, leer `src/store/gameStore.js` completo
- Para modificar BD, ver `src/lib/db.js` para patrones existentes
- Los efectos activos son complejos: revisar `useItem` en el store
- Usar el skill de `frontend-design` para nuevos componentes UI
- Revisar `src/data/items.js` para objetos existentes antes de agregar nuevos
