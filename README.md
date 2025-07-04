# TaskPilot Chrome Extension

TaskPilot es una extensión de Chrome para gestión avanzada de tareas y reuniones, con temporizador suave, UI moderna y persistencia robusta.

## Estructura del Proyecto
- `manifest.json`: Manifest V3, permisos y configuración principal
- `popup.html`: UI principal
- `popup.js`: Lógica de UI y gestión de datos
- `background.js`: Alarmas y auto-apertura de reuniones
- `styles.css`: Estilos personalizados (sin Tailwind)
- `icons/`: Iconos de la extensión

## Características
- Gestión de tareas con timer avanzado (actualización cada 100ms, reset diario, backup cada 5s)
- Solo una tarea activa a la vez
- Gestión de reuniones con apertura automática y botón Join
- UI con gradientes suaves, cards translúcidas y responsive
- Persistencia en `chrome.storage.local`
- Sin CDNs ni handlers inline (CSP compatible)

## Instalación
1. Clona este repositorio
2. Carga la carpeta `TaskPilot` como extensión descomprimida en Chrome
3. ¡Listo para usar!
