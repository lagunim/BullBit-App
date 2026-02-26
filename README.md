# HABIT QUEST - RPG de Habitos

## Setup
```bash
npm install
cp .env.example .env   # Edita .env con tus credenciales de Supabase
npm run dev
```

Variables de entorno requeridas (ver `.env.example`):
- `PUBLIC_SUPABASE_URL` - URL de tu proyecto Supabase
- `PUBLIC_SUPABASE_ANON_KEY` - Clave anónima de Supabase

## Tech Stack
- Astro 4 + React 18 + Tailwind CSS 3

## Estructura
```
src/
  pages/index.astro          - Pagina principal
  components/
    App.jsx                  - Estado global y logica principal
    HabitCard.jsx            - Tarjeta de cada habito
    AddHabitModal.jsx        - Modal para crear habitos
    LevelProgress.jsx        - Barra de progreso de nivel
    HistoryCalendar.jsx      - Historial visual 90 dias
    AchievementsPanel.jsx    - Panel de logros
    ItemsPanel.jsx           - Inventario y objetos
    Toast.jsx                - Notificaciones
  lib/
    constants.js             - Constantes del juego
    gameEngine.js            - Logica de puntos, multiplicadores, niveles
    achievements.js          - Definicion y deteccion de logros (16 logros)
    items.js                 - Definicion de objetos/power-ups (8 objetos)
    storage.js               - Persistencia localStorage
  styles/global.css          - Estilos pixel art
```

## Mecanicas
- Multiplicador individual por habito: +0.2 al completar, -0.4 al fallar
- Puntos = minutos x multiplicador
- Puntos se reinician al subir de nivel; multiplicador NO se reinicia
- Niveles: 627 / 2268 / 4872 pts...

## Logros (16)
Primer Paso, Guerrero Semanal, Racha de Fuego (10d), Maestro Constante (30d),
Momentum (x2.0), Imparable (x3.0), Trascendencia (x5.0), Primer Nivel,
Veterano (Nivel 3), Coleccionista (5 habitos), Mil Puntos, Semana Perfecta,
Resurgimiento, Constante Digital, Grindeo Epico, Afortunado

## Objetos (8)
Escudo del Compromiso, Pergamino de Doble XP, Cristal del Tiempo,
Voluntad de Hierro, Elixir de la Racha, Runa de Proteccion,
Amuleto del Poder, Moneda de la Suerte

## Consola del navegador
Si ves errores como `NotFoundError` (insertBefore) o `GET .../undefined 404` en la consola, suelen venir de **extensiones de autocompletado/gestores de contraseñas** (p. ej. Bitwarden, 1Password). No son del código del proyecto. Puedes ignorarlos o desactivar la extensión en `localhost` para ocultarlos.
