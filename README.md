# Michicaza: tienda de dropshipping del láser automático para gatos

**Michicaza** despierta al cazador que tu gato lleva dentro. Este repositorio tiene todo lo necesario para lanzar la tienda Shopify en España con 100 € de presupuesto, vendiendo con vídeos en TikTok e Instagram sin anuncios de pago al principio. El plan completo y el porqué de cada decisión están en el roadmap (documento de Claude).

**Empieza por [`docs/pasos-manuales.md`](docs/pasos-manuales.md):** es la lista ordenada de lo que tienes que hacer tú (cuentas, muestra, pagos).

## Qué hay

| Ruta | Qué es |
| --- | --- |
| `docs/pasos-manuales.md` | Pasos que solo puedes hacer tú, en orden |
| `tienda/productos.csv` | Producto con 2 packs (29,95 € y 49,95 €) para importar en Shopify |
| `tienda/theme/sections/landing-laser.liquid` | Sección de página de producto para el tema Dawn: beneficios, pasos, regalo, preguntas frecuentes y garantía |
| `tienda/theme/bloque-regalo.liquid` | Aviso de "pluma de regalo" para poner encima del botón de compra |
| `tienda/legal/` | Plantillas de aviso legal, privacidad, envíos y devoluciones (revisar con un profesional) |
| `klaviyo/flujos.md` | Textos de los flujos: checkout abandonado, carrito abandonado, bienvenida y post-compra |
| `contenido/guiones.json` | 15 guiones de vídeo (5 ángulos × 3) con voz en off, texto en pantalla, prompt de clip IA, texto y hashtags |
| `contenido/calendario.md` | Qué publicar cada día durante 3 semanas y qué medir |
| `video/render.mjs` | Monta los vídeos verticales con voz en off y subtítulos |
| `video/prompts-ia.md` | Prompts de cada clip para generarlos con IA y dónde guardarlos |

## Montar los vídeos

Requisitos: Node 18 o superior, ffmpeg y una clave de [Fish Audio](https://fish.audio).

```bash
export FISH_API_KEY=tu_clave
# opcional: una voz concreta con licencia comercial
export FISH_VOICE_ID=id_de_la_voz

npm run video -- demo-01        # un guion
npm run video:todos             # los 15
npm run video:prompts           # regenera video/prompts-ia.md
```

1. Genera cada clip con IA usando `video/prompts-ia.md` y guárdalo en `video/clips/<id>/<n>.mp4` (también vale `.mov`, `.jpg` o `.png`).
2. Opcional: deja una música sin derechos en `video/musica/`; se mezcla bajita.
3. Ejecuta el render. Cada vídeo sale en `video/salida/<id>.mp4` con su texto y hashtags en `video/salida/<id>.txt`.

Si falta el clip de una escena, el vídeo se monta igual con un fondo provisional que muestra el prompt pendiente, para revisar el ritmo antes de generar los clips.

Al publicar, activa siempre la etiqueta de contenido generado con IA en TikTok e Instagram.

### Estado de los vídeos

`video/clips/` tiene imágenes generadas con IA (Figma, modelo Gemini) para cada escena, y `video/salida/` los vídeos ya montados con su texto. El láser que aparece en las imágenes lo ha imaginado la IA: cuando tengas el producto real de CJ, sustituye las escenas donde el láser sale en primer plano (por ejemplo `demo-03/1`, `demo-03/2`, `dolor-03/2`) por fotos del proveedor o de la muestra y vuelve a ejecutar el render.

## Antes de vender

- Comprueba que la ficha, la sección y los guiones coinciden con el producto real: duración del modo automático, carga, lo que incluye la caja.
- Los plazos de envío de las plantillas están entre corchetes: rellénalos con los que te dé el almacén de CJ para España.
- No prometas beneficios de salud ni de peso en vídeos ni en la ficha.
