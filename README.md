# Play Chibi

Juego web **2D top-down, minimalista y surrealista** hecho con **Phaser 3**. Controlas una **pluma mística con aura** que debe recolectar todos los *roscos de aura* del mapa y escapar por un **portal de vórtice**, esquivando monstruos con movimiento de "caballo de ajedrez".

- **Demo en vivo:** https://play-chibi.vercel.app
- **Repositorio:** https://github.com/readmin803/play-chibi

---

## Stack y componentes

| Componente | Tecnología | Detalle |
|---|---|---|
| Motor | **Phaser 3.80** | cargado por CDN vía `import map`, sin bundler |
| Lenguaje | JavaScript (ES Modules) | `import` / `export` nativos |
| Físicas | **Arcade Physics** | solapamientos de aura, enemigos y portal |
| Render | Canvas / WebGL | `type: AUTO` |
| Pantalla | `Scale.RESIZE` | se adapta a vertical y horizontal |
| Controles | Joystick táctil + teclado | ver sección *Controles* |
| Deploy | **Vercel** | deploy automático en cada `push` |

---

## Controles

### Táctil (móvil / tablet) — `src/scenes/UIScene.js`
- **Joystick virtual** abajo a la izquierda, siempre visible con la etiqueta `MOVER`.
- Al tocar/arrastrar en la **mitad izquierda** de la pantalla, el joystick se coloca bajo el dedo y mueve a la pluma; al soltar, vuelve a su sitio.
- Implementación: eventos de puntero `pointerdown` / `pointermove` / `pointerup` → se calcula un vector normalizado → se guarda en `src/input.js` (`input.stick.x/y`, `input.stick.active`).
- Funciona igual con **mouse** en escritorio.

### Teclado (escritorio) — `src/scenes/GameScene.js`
- **WASD** o **flechas**.
- Se leen cada frame y se guardan en `input.keys`.
- `Player.update()` usa el joystick si está activo; si no, el teclado.

### Responsive y área segura
- `Scale.RESIZE` + `#game { width:100%; height:100% }` para llenar la pantalla.
- `src/safeArea.js` mide `env(safe-area-inset-*)` para no tapar el *notch* / Dynamic Island ni la barra de inicio del iPhone.
- `UIScene.layout()` recoloca el HUD y el joystick al girar o cambiar el tamaño (evento `resize`).

---

## Estructura del código

| Archivo | Rol |
|---|---|
| `index.html` | viewport móvil, import map de Phaser y contenedor `#game` |
| `src/main.js` | config del `Game`: escenas, `RESIZE`, físicas |
| `src/config.js` | constantes: colores, mundo, velocidades y misiones por nivel |
| `src/input.js` | estado de entrada compartido (teclado + joystick) |
| `src/events.js` | bus global de eventos entre escenas |
| `src/textures.js` | texturas procedurales (`fragment`, `portal`, `halo`) |
| `src/safeArea.js` | insets de área segura del dispositivo |
| `src/scenes/` | `BootScene` → `PreloadScene` → `GameScene` (+ `UIScene` en paralelo) |
| `src/objects/` | `Player`, `Enemy`, `Collectible`, `Portal` |

---

## Mecánicas principales

- **Aura**: `Player.setGlowLevel()` = auras recogidas / total. El anillo de la pluma **crece y brilla** con cada rosco.
- **Misión**: al recoger la última aura se abre el portal, el **mapa se ilumina** y aparece un aviso centrado temporal ("¡SALIDA ABIERTA!").
- **Enemigos**: se mueven en **"L" tipo caballo de ajedrez** (2 pasos en un eje + 1 perpendicular), con orientación aleatoria y pausas.
- **Portal**: vórtice con anillos y partículas que **atrae** al jugador; al tocarlo se completa el nivel.
- **Dificultad**: `MISSIONS` en `config.js` (más enemigos y menos tiempo por nivel); `missionFor()` escala sin límite.
- **Vida**: 3 corazones; al morir muestra **GAME OVER!**.

### Eventos (bus) — `src/events.js`
| Evento | Emisor → Receptor |
|---|---|
| `fragment-collected` | `Collectible` → `GameScene` |
| `player-died` | `Player` → `GameScene` |
| `ui-update` | `GameScene.pushUI` → `UIScene` |

---

## Cómo ejecutarlo en local

```bash
npm start           # npx http-server -p 8080
# o
python3 -m http.server 8080
```

Abrir `http://localhost:8080`. (Con `file://` no funciona por los módulos ES: hace falta un servidor).

---

## Bitácora del proceso

- Base con Phaser y escenas modulares (`Boot` → `Preload` → `Game` + `UI`).
- Controles táctiles y adaptación responsive para iPhone (`Scale.RESIZE` + área segura).
- Ajustes de personajes: velocidad de la pluma, tamaño de monstruos y su movimiento de caballo.
- Estética: aura que crece al recolectar y portal de vórtice absorbente.
- Optimización: fondo simplificado para mejorar la fluidez en móvil.
- Deploy en **Vercel** conectado al repo (auto-deploy en cada `push`).

> Documentación ampliada en [`bitacora.md`](./bitacora.md).
