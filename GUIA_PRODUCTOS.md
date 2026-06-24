# Guia para cargar productos en DYR Oportunidades

Esta guia explica como agregar, editar o quitar productos sin tocar el codigo de la tienda.

Los productos se administran desde este archivo:

`data/productos.json`

Las imagenes de productos deben guardarse en esta carpeta:

`assets/img/productos/`

## 1. Como agregar un producto

1. Copia la imagen del producto dentro de `assets/img/productos/`.
2. Elegi un nombre de archivo simple, sin espacios ni acentos.
   Ejemplo: `pashmina-soft-beige.jpg`
3. Abrí `data/productos.json`.
4. Copia un producto existente.
5. Pegalo al final de la lista, antes del ultimo corchete `]`.
6. Cambia los datos por los del nuevo producto.
7. Asegurate de que el `id` no se repita.

Ejemplo de producto:

```json
{
  "id": 25,
  "nombre": "Pashmina soft beige",
  "categoria": "Moda",
  "precio": 8900,
  "precioAnterior": 11900,
  "imagen": "assets/img/productos/pashmina-soft-beige.jpg",
  "destacado": true,
  "stock": 15,
  "descripcion": "Pashmina suave color beige.",
  "icono": "fa-solid fa-person-dress",
  "imagenAlt": "Pashmina femenina color beige"
}
```

Importante: si agregas un producto despues de otro, debe haber una coma `,` entre productos.

## 2. Como cambiar precios

Busca el producto en `data/productos.json` y cambia estos campos:

```json
"precio": 8900,
"precioAnterior": 11900
```

`precio` es el precio actual.

`precioAnterior` es opcional y se usa para mostrar un precio tachado. Si no queres mostrar precio anterior, podes poner:

```json
"precioAnterior": null
```

## 3. Como actualizar stock

Busca el producto y cambia el numero de `stock`.

Ejemplo:

```json
"stock": 8
```

Si no hay stock:

```json
"stock": 0
```

## 4. Como marcar un producto como destacado

Los productos destacados aparecen primero en la home.

Para destacar un producto:

```json
"destacado": true
```

Para que no sea destacado:

```json
"destacado": false
```

## 5. Donde colocar las imagenes

Todas las imagenes de productos van en:

`assets/img/productos/`

Ejemplo:

`assets/img/productos/cartera-bandolera-negra.jpg`

En el producto, el campo `imagen` debe tener esa misma ruta:

```json
"imagen": "assets/img/productos/cartera-bandolera-negra.jpg"
```

Recomendaciones:

- Usar nombres sin espacios.
- Usar minusculas.
- Separar palabras con guiones.
- Usar formatos `.jpg`, `.png` o `.webp`.

## 6. Formato correcto del JSON

Cada producto debe tener estos datos como minimo:

```json
{
  "id": 1,
  "nombre": "Nombre del producto",
  "categoria": "Moda",
  "precio": 8900,
  "precioAnterior": 11900,
  "imagen": "assets/img/productos/nombre-del-producto.jpg",
  "destacado": true,
  "stock": 15,
  "descripcion": "Descripcion corta del producto."
}
```

Categorias usadas actualmente:

- `Moda`
- `Accesorios`
- `Hogar`
- `Regalos`
- `Oportunidades`

Consejo simple: para evitar errores, copia un producto que ya existe, pegalo y cambia los datos.

## Resultado

Para agregar un producto nuevo solo necesitas:

1. Guardar la imagen en `assets/img/productos/`.
2. Agregar una nueva entrada en `data/productos.json`.

No hace falta modificar `index.html`, `script.js` ni `styles.css`.
