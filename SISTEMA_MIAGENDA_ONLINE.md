# 🎯 **MI AGENDA ONLINE - DOCUMENTACIÓN COMPLETA DEL SISTEMA**

## 📚 **RESUMEN DEL SISTEMA**

**Mi Agenda Online** es una plataforma completa para profesionales que combina:

- ✅ **CRM** para gestión de clientes
- ✅ **Sistema de citas** con calendario inteligente
- ✅ **Página web pública** personalizable
- ✅ **Dashboard financiero** completo
- ✅ **Sistema de notificaciones**
- ✅ **Gestión de planes** de suscripción

---

## 🏗️ **ARQUITECTURA TÉCNICA**

### **Stack Tecnológico:**

- **Frontend:** Next.js 14 + React + TypeScript + Tailwind CSS
- **Backend:** Next.js API Routes
- **Base de datos:** SQLite + Prisma ORM
- **Autenticación:** Clerk (@clerk/nextjs)
- **Deployment:** Preparado para Vercel

### **Estructura de Datos Principal:**

```
User (profesional)
├── Clerk Authentication
├── LandingPage (página pública)
├── Appointments (citas)
├── Customers (clientes)
├── Payments (pagos)
├── Notifications (notificaciones)
└── Plan (suscripción)
```

---

## 👤 **SISTEMA DE USUARIOS**

### **Autenticación:**

- **Clerk** como proveedor de autenticación
- **Middleware** personalizado para proteger rutas
- **Roles:** ADMIN, EMPLOYEE, CLIENT

### **Información del Usuario:**

- **Tabla User:** Datos básicos + Clerk ID
- **Tabla LandingPage:** Información pública profesional
- **Relaciones:** Un usuario puede tener múltiples citas, clientes, pagos, etc.

---

## 🗓️ **1. MÓDULO: APPOINTMENTS (Citas)**

### **📍 Ubicación:**

- **Página:** `/appointments`
- **API:** `/api/appointments`

### **🔧 Funcionalidades Principales:**

#### **Gestión de Citas:**

- ✅ **Crear citas** con clientes existentes
- ✅ **Editar citas** existentes
- ✅ **Eliminar citas**
- ✅ **Calendario visual** mensual
- ✅ **Vista por períodos:** hoy, semana, mes, rango personalizado

#### **Estados de Citas:**

- `PENDING` - Pendiente de confirmación
- `CONFIRMED` - Confirmada
- `CANCELLED` - Cancelada
- `COMPLETED` - Completada

#### **Información por Cita:**

- **Datos básicos:** Fecha, hora, duración (en minutos)
- **Cliente:** Relación con tabla Customer
- **Notas públicas:** Visibles para el cliente
- **Comentarios internos:** Solo para el profesional
- **Precios:**
  - `internalPrice`: Costo real en CLP
  - `publicPrice`: Precio cobrado al cliente

#### **Características Avanzadas:**

- 🎯 **Detección automática de conflictos** de horarios
- 🎯 **Alertas de solapamiento** con opción de proceder
- 🎯 **Calendario interactivo** con bloques de tiempo
- 🎯 **Filtros y búsqueda** por cliente, estado, fecha

### **🔄 Flujo de Trabajo:**

1. Profesional selecciona cliente (o crea nuevo)
2. Elige fecha y hora en calendario visual
3. Sistema detecta conflictos automáticamente
4. Configurar duración, notas y precios
5. Cita se guarda y aparece en calendario

---

## 👥 **2. MÓDULO: CUSTOMERS (Clientes)**

### **📍 Ubicación:**

- **Página:** `/clientes`
- **API:** `/api/customers`

### **🔧 Funcionalidades Principales:**

#### **Gestión de Clientes:**

- ✅ **Crear clientes** nuevos
- ✅ **Editar información** de clientes
- ✅ **Ver historial completo** de citas
- ✅ **Eliminar clientes**

#### **Información por Cliente:**

- **Datos básicos:** Nombre, email, teléfono
- **Fechas:** Creación, última actualización
- **Relaciones:** Lista de todas sus citas

#### **📊 Métricas Automáticas:**

- **Total de ingresos** generados
- **Número total** de citas
- **Última cita** realizada
- **Promedio de citas** por mes
- **Estado de actividad** (activo/inactivo)
- **Tendencia de crecimiento** (up/down/stable)

#### **Características Avanzadas:**

- 🔍 **Búsqueda avanzada** por nombre, email, teléfono
- 📈 **Dashboard de estadísticas** por cliente
- 📋 **Vista modal detallada** con historial completo
- 🎯 **Filtros por estado** (activos, inactivos, todos)
- 📊 **Ordenamiento** por nombre, citas, ingresos, última visita

### **🔄 Flujo de Trabajo:**

1. Cliente se crea manualmente o desde landing page pública
2. Se relaciona automáticamente con citas
3. Sistema calcula métricas en tiempo real
4. Profesional puede ver estadísticas y tendencias

---

## 🌐 **3. MÓDULO: LANDING PAGE (Página Web Pública)**

### **📍 Ubicación:**

- **Configuración:** `/mi-pagina-web`
- **Página pública:** `/p/[slug]`
- **API:** `/api/landing-page`, `/api/public/landing/[slug]`

### **🔧 Funcionalidades Principales:**

#### **Configuración del Profesional:**

- ✅ **Información básica:** Nombre, título profesional, tagline
- ✅ **Descripción** de servicios
- ✅ **Imágenes:** Foto de perfil, imagen de portada, logo
- ✅ **URL personalizada:** `miagenda.com/p/tu-nombre`

#### **📋 Gestión de Servicios:**

- **Catálogo de servicios** con:
  - Nombre del servicio
  - Descripción detallada
  - Precio
  - Duración específica (opcional)
  - Tiempo intermedio (buffer) opcional

#### **📅 Configuración de Calendario:**

- ✅ **Mostrar/ocultar** calendario público
- ✅ **Descripción** del calendario
- ✅ **Duración predeterminada** de citas (minutos)
- ✅ **Tiempo intermedio** entre citas
- ✅ **Texto del botón** de agendar
- ✅ **Requerir pago** (opcional)

#### **📝 Formulario Personalizable:**

**Campos predeterminados:**

- Nombre (requerido)
- Apellido (requerido)
- Email (requerido)
- Comentario (opcional)

**Campos adicionales disponibles:**

- Teléfono
- Edad
- Motivo de consulta
- Experiencia previa
- ¿Cómo nos conociste?

#### **🎨 Personalización Visual:**

**Temas de color disponibles:**

- 🔵 **Azul Profesional** (#2563eb)
- 🟢 **Verde Natural** (#16a34a)
- 🟣 **Morado Elegante** (#9333ea)
- 🟠 **Naranja Energético** (#ea580c)
- 🩷 **Rosa Sofisticado** (#ec4899)

#### **📱 Información de Contacto:**

- WhatsApp
- Instagram
- Email de contacto

#### **🔍 SEO:**

- Meta título personalizable
- Meta descripción
- URL slug única

### **🔄 Flujo Público (Cliente):**

1. Cliente visita `/p/tu-nombre`
2. Ve información profesional y servicios
3. Selecciona servicio (opcional)
4. Ve calendario con horarios disponibles
5. Selecciona fecha y hora
6. Llena formulario personalizado
7. Automáticamente se crea como Customer + Appointment

---

## 💰 **4. MÓDULO: PAYMENTS (Pagos)**

### **📍 Ubicación:**

- **API:** `/api/payments`

### **🔧 Funcionalidades:**

- ✅ **Registro de pagos** por usuario
- ✅ **Estados:** PENDING, PAID, FAILED
- ✅ **Montos** en CLP
- ✅ **Fechas** de pago
- ✅ **Historial completo**

### **💡 Estado Actual:**

- Backend completamente funcional
- Frontend pendiente de implementación

---

## 💳 **5. MÓDULO: PLANS (Planes de Suscripción)**

### **📍 Ubicación:**

- **API:** `/api/plans`

### **🔧 Funcionalidades:**

- ✅ **Planes multi-tier** de suscripción
- ✅ **Precios** en CLP
- ✅ **Quotas de WhatsApp** (confirmaciones automáticas)
- ✅ **Quotas de email** (marketing mensual)
- ✅ **Features configurables** por plan (JSON)
- ✅ **Conteo de suscriptores** por plan

### **💡 Propósito:**

Sistema preparado para monetización futura del servicio

---

## 🔔 **6. MÓDULO: NOTIFICATIONS (Notificaciones)**

### **📍 Ubicación:**

- **API:** `/api/notifications`
- **Componente:** `NotificationBell`

### **🔧 Funcionalidades:**

- ✅ **Tipos de notificación:** EMAIL, WHATSAPP, SYSTEM
- ✅ **Estados:** Leída/No leída
- ✅ **Mensajes personalizados**
- ✅ **Límite de 50** notificaciones recientes
- ✅ **Marcar como leídas** (individual o masivo)
- ✅ **Filtro por no leídas**

### **🔄 Integraciones Preparadas:**

- **WhatsApp:** Para confirmaciones automáticas
- **Email:** Para marketing y recordatorios
- **Sistema:** Para alertas internas

---

## 📈 **7. MÓDULO: INGRESOS (Dashboard Financiero)**

### **📍 Ubicación:**

- **Página:** `/ingresos`

### **📊 Métricas Principales:**

#### **Resumen Financiero:**

- 💰 **Total este mes**
- 💰 **Total mes anterior**
- 💰 **Total este año**
- 📈 **Crecimiento porcentual** mes a mes
- 📊 **Promedio mensual**

#### **Estadísticas de Citas:**

- ✅ **Citas completadas** este mes
- ⏳ **Citas pendientes**
- 📅 **Citas futuras** (próximos 30 días)

#### **Análisis por Cliente:**

- 🏆 **Top clientes** por ingresos
- 📊 **Ingresos por cliente**
- 📅 **Promedio de citas** por cliente
- 📈 **Tendencias de crecimiento** por cliente

#### **Vistas Disponibles:**

- **Overview:** Resumen general
- **History:** Historial de citas e ingresos
- **Clients:** Métricas detalladas por cliente
- **Projections:** Proyecciones futuras

#### **Filtros:**

- 📅 **Períodos:** Mes, trimestre, año
- 🔍 **Ordenamiento:** Por fecha, ingresos, cliente
- 🎯 **Búsqueda** por cliente específico

---

## 🔗 **FLUJOS DE TRABAJO COMPLETOS**

### **🎯 Flujo del Cliente (Público):**

```
1. Cliente encuentra página → /p/profesional-nombre
2. Ve servicios y precios
3. Selecciona servicio (opcional)
4. Ve calendario disponible en tiempo real
5. Selecciona fecha y hora
6. Llena formulario personalizado
7. ✨ AUTOMÁTICAMENTE se crea:
   - Customer en base de datos
   - Appointment con estado PENDING
   - Notification para el profesional
```

### **🎯 Flujo del Profesional:**

```
1. Configura landing page → /mi-pagina-web
   - Información personal
   - Servicios y precios
   - Configuración de calendario
   - Personalización visual

2. Gestiona clientes → /clientes
   - Ve lista completa con métricas
   - Analiza historiales y tendencias
   - Crea/edita información

3. Administra citas → /appointments
   - Calendario visual mensual
   - Crea/edita/elimina citas
   - Gestiona conflictos de horarios
   - Actualiza estados y precios

4. Analiza finanzas → /ingresos
   - Dashboard completo de ingresos
   - Métricas por cliente
   - Proyecciones y tendencias
   - Reportes detallados

5. Recibe notificaciones → 🔔
   - Nuevas citas automáticas
   - Recordatorios importantes
   - Alertas del sistema
```

---

## 🎯 **CARACTERÍSTICAS ÚNICAS Y DIFERENCIADORAS**

### **💎 Lo que hace especial a Mi Agenda Online:**

1. **🎨 Landing Pages Completamente Personalizables**

   - No solo un calendario, sino una página web completa
   - Temas visuales profesionales
   - URL personalizada para cada profesional

2. **🧠 Inteligencia en Horarios**

   - Detección automática de conflictos
   - Cálculo de horarios disponibles en tiempo real
   - Consideración de duración y tiempo intermedio

3. **💰 Sistema de Precios Dual**

   - Precio interno (costo real)
   - Precio público (lo que se cobra)
   - Útil para descuentos, promociones, etc.

4. **📊 Analytics Avanzados**

   - Métricas automáticas por cliente
   - Tendencias de crecimiento
   - Proyecciones financieras

5. **🔄 Automatización Completa**

   - Cliente agenda → automáticamente aparece en sistema
   - Cálculos de ingresos automáticos
   - Estadísticas en tiempo real

6. **🎯 Preparado para Escalar**
   - Sistema de planes de suscripción
   - Integraciones con WhatsApp y Email
   - Arquitectura preparada para múltiples profesionales

---

## 🛠️ **CONFIGURACIÓN Y DEPLOYMENT**

### **Variables de Entorno Requeridas:**

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database
DATABASE_URL="file:./dev.db"
```

### **Comandos Importantes:**

```bash
# Desarrollo
npm run dev

# Generar Prisma Client
npx prisma generate

# Migrar base de datos
npx prisma migrate dev

# Ver base de datos
npx prisma studio
```

### **Estructura de Archivos Clave:**

```
src/
├── app/
│   ├── appointments/          # Gestión de citas
│   ├── clientes/             # Gestión de clientes
│   ├── mi-pagina-web/        # Configuración landing page
│   ├── ingresos/             # Dashboard financiero
│   ├── p/[slug]/             # Landing pages públicas
│   └── api/                  # APIs backend
├── components/               # Componentes reutilizables
├── hooks/                    # Custom hooks
└── lib/                      # Utilidades y configuración

prisma/
├── schema.prisma            # Esquema de base de datos
└── migrations/              # Migraciones de DB
```

---

## 🚀 **ROADMAP Y PRÓXIMAS FUNCIONALIDADES**

### **✅ Implementado:**

- Sistema completo de citas
- Gestión de clientes con métricas
- Landing pages personalizables
- Dashboard financiero
- Autenticación con Clerk
- APIs REST completas

### **🔄 En Desarrollo:**

- Integración con WhatsApp automático
- Sistema de emails automáticos
- Interfaz para gestión de pagos
- Interfaz para gestión de planes

### **📋 Futuras Mejoras:**

- Sistema de recordatorios automáticos
- Integración con calendarios externos (Google Calendar)
- Sistema de reviews y calificaciones
- Multi-idioma
- Reportes PDF exportables
- Integración con pasarelas de pago

---

## 📞 **SOPORTE Y DOCUMENTACIÓN TÉCNICA**

### **Debugging:**

- Página de debug disponible en `/debug`
- Logs detallados en consola del servidor
- Manejo de errores centralizado

### **APIs Disponibles:**

- `GET /api/appointments` - Lista de citas
- `POST /api/appointments` - Crear cita
- `GET /api/customers` - Lista de clientes
- `GET /api/landing-page` - Configuración landing page
- `GET /api/public/landing/[slug]` - Landing page pública
- Y muchas más...

---

**💡 Este sistema es una plataforma completa que combina CRM, página web, calendario y finanzas en una sola solución integrada para profesionales independientes.**
