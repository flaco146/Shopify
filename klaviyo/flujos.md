# Flujos de Klaviyo

Configúralos en Klaviyo > Flows > Create flow, usando la plantilla de cada flujo y sustituyendo los textos por estos. Klaviyo es gratis hasta 250 contactos.

Variables entre llaves dobles: Klaviyo las rellena solo. `[MARCA]`: el nombre de tu tienda.

---

## 1. Checkout abandonado (3 emails)

Disparador: *Started Checkout*. Filtro: no ha hecho un pedido desde que empezó el flujo.

### Email 1 · a la 1 hora

- **Asunto:** ¿Se te ha quedado algo por aquí?
- **Preheader:** Tu gato sigue esperando su sesión de caza.

> Hola {{ first_name|default:'' }}:
>
> Has dejado el láser automático en el carrito. Te lo guardamos un rato más.
>
> **[Botón: Terminar mi pedido]** → {{ event.extra.checkout_url }}
>
> Recuerda que incluye la pluma de regalo y tienes 14 días para devolverlo si a tu gato no le convence.

### Email 2 · a las 24 horas

- **Asunto:** Lo que hace tu gato cuando no estás
- **Preheader:** 15 minutos de caza al día, aunque no estés en casa.

> Los gatos de interior necesitan cazar. Si no lo hacen, se aburren, rompen cosas o te despiertan de madrugada.
>
> El láser automático le da su sesión de caza diaria: lo enciendes antes de salir, juega 15 minutos y se apaga solo.
>
> **[Botón: Volver a mi carrito]**
>
> *[Inserta aquí un GIF o captura de uno de los vídeos.]*

### Email 3 · a las 72 horas

- **Asunto:** Un 10 % para que tu gato pruebe
- **Preheader:** Solo hasta mañana.

> Último aviso: te dejamos un **10 % de descuento** con el código **GATO10** hasta mañana a las 23:59.
>
> **[Botón: Usar mi descuento]**

Crea el código GATO10 en Shopify (Descuentos), de un solo uso por cliente y con fecha de caducidad. Con el pack de 29,95 € el descuento son 3 €: vigila que el margen siga por encima de 12 €.

---

## 2. Carrito abandonado (1 email)

Disparador: *Added to Cart*. Filtro: no ha empezado el checkout ni ha hecho pedido. Requiere el seguimiento de "Added to Cart" de la integración de Shopify.

### Email 1 · a las 4 horas

- **Asunto:** Tu carrito te espera 🐱
- **Preheader:** Láser automático + pluma de regalo.

> Has añadido el láser automático al carrito. Si tienes cualquier duda, responde a este email y te contestamos.
>
> **[Botón: Ver mi carrito]**

---

## 3. Bienvenida (1 email)

Disparador: se suscribe a la lista (formulario de la tienda).

- **Asunto:** Bienvenido a [MARCA]
- **Preheader:** Consejos para que tu gato no se aburra.

> Gracias por apuntarte. Te escribiremos poco y solo con cosas útiles para tu gato.
>
> Un consejo para empezar: termina siempre el juego con algo que tu gato pueda atrapar, como una pluma. Así no se queda con la caza a medias.
>
> **[Botón: Ver el láser automático]**

---

## 4. Después de la compra (2 emails)

Disparador: *Placed Order*.

### Email 1 · nada más comprar

- **Asunto:** Cómo sacarle partido a tu láser
- **Preheader:** 3 consejos para la primera sesión.

> ¡Gracias por tu pedido! Mientras llega, tres consejos:
>
> 1. Ponlo en el suelo, en una zona despejada y lejos de escaleras.
> 2. No lo apuntes nunca a los ojos y supervisa las primeras sesiones.
> 3. Al terminar, sácale la pluma para que acabe cazando algo de verdad.

### Email 2 · 10 días después

- **Asunto:** ¿Qué tal se lo ha tomado tu gato?
- **Preheader:** Nos ayudaría mucho tu opinión.

> Esperamos que tu gato ya sea fan del láser. ¿Nos dejas una reseña? Y si nos mandas un vídeo de tu gato jugando, quizá lo compartamos (con tu permiso).
>
> **[Botón: Dejar mi reseña]**
