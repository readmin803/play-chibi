# Bitácora — Play Chibi

Juego web 2D top-down, minimalista/surrealista. Protagonista: una pluma mística con un aura.
Misión del nivel: recolectar todos los "roscos de aura" y escapar por el portal esquivando monstruos.

## Stack
- **Phaser 3.80** (vía import map / CDN, sin bundler).
- JavaScript módulos ES + físicas **Arcade**.
- Responsive (`Scale.RESIZE`); joystick táctil + teclado (WASD/flechas).

## Correr en local
```
npm start            # npx http-server -p 8080
# o
python3 -m http.server 8080
```
Abrir `http://localhost:8080`.

## Estructura
| Archivo | Función |
|---|---|
| `index.html` | Viewport móvil, import map de Phaser, contenedor `#game`. |
| `src/main.js` | Config del juego: escenas, `RESIZE`, físicas Arcade. |
| `src/config.js` | Constantes: colores, tamaño de mundo, velocidad/escala, misiones por nivel. |
| `src/input.js` | Estado de entrada compartido (teclado + joystick). |
| `src/events.js` | Bus global de eventos entre escenas (`bus.on/emit`). |
| `src/textures.js` | Texturas procedurales: `fragment`, `portal`, `halo`. |
| `src/safeArea.js` | Insets de área segura (notch/barra iPhone). |
| `src/scenes/` | `BootScene` → `PreloadScene` → `GameScene` (+`UIScene` en paralelo). |
| `src/objects/` | `Player`, `Enemy`, `Collectible`, `Portal`. |

## Flujo de escenas
`BootScene` → `PreloadScene` (carga `pluma.png`/`moster.png`) → `GameScene` lanza `UIScene` en paralelo.
Al terminar, `GameScene` reinicia con `{ level: n+1 }` o repite el nivel.

## Mecánicas clave
- **Player** (`objects/Player.js`): se mueve con joystick o teclado. El **aura** (anillo `halo`) rodea la pluma y **crece** según `glowLevel` (= auras recogidas / total).
- **Collectible** (`objects/Collectible.js`): rosco de aura; al recoger emite `fragment-collected`.
- **Enemy** (`objects/Enemy.js`): se mueve en "L" tipo **caballo de ajedrez** (segmentos rectos perpendiculares) con pausas.
- **Portal** (`objects/Portal.js`): vórtice con anillos y partículas. Se **activa** al completar la misión, atrae al jugador y al tocarlo se gana.
- **Dificultad**: `MISSIONS` en `config.js` (fragments, enemies, timeLimit). `missionFor()` en `GameScene` escala infinitamente.

## Eventos (bus)
| Evento | Emisor → Receptor |
|---|---|
| `fragment-collected` | Collectible → `GameScene.onFragmentCollected` |
| `player-died` | Player → `GameScene.endGame(false)` |
| `ui-update` | `GameScene.pushUI` → `UIScene.onUIUpdate` |

## Notas de diseño
- Mundo `1200x1200`; la cámara sigue al jugador.
- Fondo: pocos círculos **magenta** (no confundir con las auras **teal/cian**).
- Al abrirse el portal, el mapa se ilumina y aparece un aviso centrado temporal.
- Vida en corazones; al morir muestra **GAME OVER!**.

## Versiones
- **v1** — Versión jugable: movimiento (joystick/teclado), recogida de auras, portal de escape, enemigos con movimiento de caballo, dificultad por niveles, UI responsive para móvil/tablet/escritorio.

## Pendiente / siguiente
- Conectar el repositorio con **Vercel** para deploy continuo.
