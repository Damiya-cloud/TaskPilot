# TaskPilot Chrome Extension

TaskPilot es una extensión de Chrome para gestión avanzada de tareas y reuniones

## Estructura del Proyecto
- `manifest.json`: Manifest V3, permisos y configuración principal
- `popup.html`: UI principal
- `popup.js`: Lógica de UI y gestión de datos
- `background.js`: Alarmas y auto-apertura de reuniones
- `styles.css`: Estilos personalizados (sin Tailwind)
- `icons/`: Iconos de la extensión

## Características
- Solo una tarea activa a la vez
- Gestión de reuniones con apertura automática y botón Join
- se guarda en `chrome.storage.local`
- Sin CDNs

