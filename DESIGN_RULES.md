# 📋 Reglas de Diseño - MiAgendaOnline

## 🎨 Paleta de Colores Estándar

### Textos
- **Texto principal**: `text-gray-900` (negro oscuro para legibilidad)
- **Texto secundario**: `text-gray-600` 
- **Texto placeholder**: `placeholder-gray-500` (gris medio, bien visible y legible)
- **Texto de ayuda**: `text-gray-500`
- **Texto deshabilitado**: `text-gray-400`

### Fondos
- **Fondo principal**: `bg-gray-50`
- **Fondo de tarjetas**: `bg-white`
- **Fondo de inputs**: `bg-white` (siempre blanco)
- **Fondo de sección**: `bg-gray-50`
- **Fondo especial (interno)**: `bg-yellow-50`

### Colores de Acción
- **Primario**: `bg-indigo-600` hover: `bg-indigo-700`
- **Éxito**: `bg-green-600` hover: `bg-green-700`
- **Peligro**: `bg-red-600` hover: `bg-red-700`
- **Secundario**: `bg-gray-600` hover: `bg-gray-700`

## 📝 Campos de Formulario

### Clase Base para Inputs Estándar
```html
<!-- ✅ CORRECTO: Input estándar -->
<input 
  className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  placeholder="Texto de ejemplo"
/>

<!-- ✅ CORRECTO: Input pequeño -->
<input 
  className="w-full text-xs text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  placeholder="Texto de ejemplo"
/>
```

### Clase Base para Select
```html
<!-- ✅ CORRECTO: Select -->
<select 
  className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
>
  <option>Opción 1</option>
</select>
```

### Clase Base para Textarea
```html
<!-- ✅ CORRECTO: Textarea -->
<textarea 
  className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  placeholder="Escribe aquí..."
  rows={3}
/>

<!-- ✅ CORRECTO: Textarea especial (comentarios internos) -->
<textarea 
  className="w-full text-sm text-gray-900 bg-yellow-50 border border-gray-300 rounded px-3 py-2 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
  placeholder="Comentario interno..."
  rows={2}
/>
```

## ❌ Errores Comunes a Evitar

### 🚫 NO usar estas clases:
- `text-gray-600` en inputs (hace que el texto sea gris)
- Omitir `bg-white` (puede heredar fondos no deseados)
- Omitir `text-gray-900` (texto queda gris por defecto)
- Usar `placeholder-gray-400` (muy claro, difícil de leer)
- Omitir `focus:border-transparent` (se ve mal el borde por defecto)

## 🔘 Botones

### Botones Primarios
```html
<!-- ✅ CORRECTO: Botón primario -->
<button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500">
  Acción Principal
</button>
```

### Botones Secundarios
```html
<!-- ✅ CORRECTO: Botón secundario -->
<button className="px-4 py-2 bg-gray-600 text-white text-sm rounded-lg hover:bg-gray-700">
  Cancelar
</button>
```

### Botones de Éxito
```html
<!-- ✅ CORRECTO: Botón de guardar -->
<button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 disabled:bg-gray-300">
  Guardar
</button>
```

## 📦 Modales y Contenedores

### Modal Base
```html
<!-- ✅ CORRECTO: Estructura de modal -->
<div className="fixed inset-0 bg-transparent flex items-center justify-center p-4 z-50">
  <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
    <div className="p-6 border-b border-gray-200">
      <!-- Header -->
    </div>
    <div className="p-6">
      <!-- Contenido -->
    </div>
  </div>
</div>
```

### Tarjetas
```html
<!-- ✅ CORRECTO: Tarjeta estándar -->
<div className="bg-white rounded-lg shadow p-6">
  <!-- Contenido -->
</div>
```

## 🏷️ Labels y Textos

### Labels de Formulario
```html
<!-- ✅ CORRECTO: Label estándar -->
<label className="block text-sm font-medium text-gray-700 mb-1">
  Nombre del Campo *
</label>

<!-- ✅ CORRECTO: Label pequeño -->
<label className="block text-xs font-medium text-gray-700 mb-1">
  Campo Pequeño
</label>
```

## 🎯 Estados Visuales

### Estados de Input
- **Normal**: `border-gray-300`
- **Focus**: `focus:ring-2 focus:ring-indigo-500 focus:border-transparent`
- **Error**: `border-red-300 focus:ring-red-500`
- **Éxito**: `border-green-300 focus:ring-green-500`
- **Deshabilitado**: `disabled:bg-gray-100 disabled:text-gray-400`

### Estados de Citas
- **Completada**: `bg-green-100 text-green-800`
- **Confirmada**: `bg-blue-100 text-blue-800`
- **Pendiente**: `bg-yellow-100 text-yellow-800`
- **Cancelada**: `bg-red-100 text-red-800`

## 📏 Espaciado y Tamaños

### Padding Estándar
- **Campos grandes**: `px-3 py-2`
- **Campos pequeños**: `px-2 py-1`
- **Botones**: `px-4 py-2`
- **Contenedores**: `p-6`

### Márgenes
- **Entre campos**: `mb-4` o `space-y-4`
- **Entre secciones**: `mb-6` o `space-y-6`
- **Labels**: `mb-1`

## ✅ Checklist Pre-Commit

Antes de crear cualquier componente, verifica:

- [ ] Los inputs tienen `text-gray-900` para el texto
- [ ] Los inputs tienen `bg-white` de fondo
- [ ] Los placeholders usan `placeholder-gray-500`
- [ ] Los focus states incluyen `focus:border-transparent`
- [ ] Los botones tienen estados hover definidos
- [ ] Los colores siguen la paleta estándar
- [ ] Los labels son consistentes con el tamaño del input
- [ ] Las validaciones visuales están implementadas

## 🔄 Mantenimiento

**Revisar este archivo antes de:**
- Crear nuevos formularios
- Agregar campos de input
- Diseñar modales o tarjetas
- Implementar botones
- Definir estados visuales

**Actualizar este archivo cuando:**
- Se definan nuevos colores estándar
- Se cambien las reglas de diseño
- Se identifiquen nuevos patrones comunes 