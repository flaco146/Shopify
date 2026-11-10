# Pasos que tienes que hacer tú

Claude no puede crear cuentas, aceptar condiciones ni pagar en tu nombre. Hazlos en este orden; en cada uno se indica qué archivo del repositorio usar.

## 1. Confirmar el producto (día 1)

- [ ] Crear cuenta gratuita en [CJ Dropshipping](https://cjdropshipping.com).
- [ ] Buscar "automatic cat laser toy", filtrar por almacén en Europa y apuntar: coste del producto, coste de envío a España y plazo.
- [ ] Si coste + envío supera 11 €, pasar a la impresora térmica de bolsillo (reserva del roadmap) y avisar a Claude para rehacer textos y guiones.
- [ ] Pedir 1 muestra a tu casa (20-35 €).

## 2. Tienda Shopify (días 2-4)

- [ ] Registrarte en Shopify con la oferta de prueba y elegir el nombre de la tienda.
- [ ] Sustituir `TU MARCA` en `tienda/productos.csv` por el nombre de tu tienda.
- [ ] Productos > Importar > subir `tienda/productos.csv`. El producto entra como borrador.
- [ ] Subir 4-6 fotos del producto (de la muestra o del proveedor, con permiso) y la foto de la pluma.
- [ ] Revisar que la ficha coincide con el producto real: duración del modo automático, carga USB, lo que incluye la caja. Corregir cualquier dato que no coincida.
- [ ] Tema: Tienda online > Temas > Dawn > Editar código > Secciones > Añadir sección `landing-laser` y pegar el contenido de `tienda/theme/sections/landing-laser.liquid`.
- [ ] Personalizar > Producto: añadir la sección "Landing láser" debajo de la información del producto.
- [ ] En el mismo editor, añadir un bloque "Liquid personalizado" encima de los botones de compra con el código de `tienda/theme/bloque-regalo.liquid`.
- [ ] Configuración > Políticas: pegar las 4 plantillas de `tienda/legal/` tras rellenar los corchetes. Que las revise un profesional.
- [ ] Instalar la app de CJ Dropshipping y conectar el producto a su ficha de CJ.
- [ ] Activar Shopify Payments y hacer una compra de prueba.
- [ ] Informarte sobre el alta como autónomo y el IVA antes de vender de forma habitual.

## 3. Klaviyo (día 4)

- [ ] Crear cuenta gratuita en Klaviyo e instalar su app en Shopify.
- [ ] Crear los flujos de `klaviyo/flujos.md` y el descuento GATO10 en Shopify.
- [ ] Probar el flujo de checkout abandonado con un pedido de prueba sin terminar.

## 4. Vídeos (días 3-5)

- [ ] Vincular tu cuenta de Figma a Weave (https://app.weavy.ai/settings?section=profile) para que Claude pueda generar los clips con IA; o generarlos tú en la herramienta que prefieras con los prompts de `video/prompts-ia.md`.
- [ ] Crear una clave de API en [Fish Audio](https://fish.audio) para la voz en off. En las sesiones de Claude en la nube ya está conectada.
- [ ] (Opcional) Elegir una voz en Fish Audio con licencia para uso comercial y guardar su id como `FISH_VOICE_ID`.
- [ ] (Opcional) Dejar una música sin derechos en `video/musica/`.

## 5. Redes (día 5 en adelante)

- [ ] Crear cuentas de TikTok e Instagram de la tienda, separadas de las personales, con el enlace a la tienda en la biografía.
- [ ] Publicar según `contenido/calendario.md`, activando siempre la etiqueta de contenido generado con IA.
- [ ] Cuando haya ventas que lo paguen: cuenta en Postiz, conectar TikTok e Instagram y dar a Claude la clave de API para que publique y programe.
