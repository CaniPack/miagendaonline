# 📅 Mi Agenda Online - Sistema de Citas Profesional

Un sistema completo de gestión de citas desarrollado con **Next.js 15**, **TypeScript**, **Prisma**, **PostgreSQL** y **Tailwind CSS**.

## 🚀 Características

### 👥 Gestión de Usuarios
- **Roles**: Admin, Employee, Client
- **Autenticación**: Integración con Clerk
- **Perfiles**: Información personal y contacto

### 📅 Sistema de Citas
- **Reservas**: Gestión completa de appointments
- **Estados**: Pending, Confirmed, Cancelled, Completed
- **Duración flexible**: Configuración en minutos
- **Notas**: Información adicional por cita

### 🏢 Gestión de Clientes
- **Información completa**: Nombre, email, teléfono
- **Historial**: Seguimiento de citas anteriores
- **Comunicación**: Integración con WhatsApp y email

### 💳 Planes y Pagos
- **Suscripciones**: Planes con diferentes características
- **Cuotas**: WhatsApp y email limits
- **Pagos**: Seguimiento de estado y fechas

### 🔔 Sistema de Notificaciones
- **Tipos**: Email, WhatsApp, System
- **Estados**: Leído/No leído
- **Recordatorios**: Alertas automáticas

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: Clerk
- **UI**: Lucide React Icons
- **Estilo**: Tailwind CSS v4

## 📊 Modelos de Base de Datos

### User
```typescript
model User {
  id             String        @id @default(cuid())
  email          String        @unique
  name           String?
  phone          String?
  role           Role          @default(CLIENT)
  clerkId        String?       @unique
  appointments   Appointment[]
  payments       Payment[]
  notifications  Notification[]
  plan           Plan?
}
```

### Appointment
```typescript
model Appointment {
  id             String            @id @default(cuid())
  user           User
  customer       Customer
  date           DateTime
  duration       Int               // en minutos
  status         AppointmentStatus @default(PENDING)
  notes          String?
}
```

### Customer
```typescript
model Customer {
  id             String        @id @default(cuid())
  name           String
  email          String?
  phone          String?
  appointments   Appointment[]
}
```

### Plan
```typescript
model Plan {
  id             String   @id @default(cuid())
  name           String
  price          Int      // en CLP o USD
  whatsappQuota  Int      // confirmaciones WhatsApp
  emailQuota     Int      // correos mensuales
  features       String[] // características
  users          User[]
}
```

## 🚀 Instalación

1. **Clonar el repositorio**
```bash
git clone https://github.com/CaniPack/miagendaonline.git
cd miagendaonline
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar las variables necesarias
DATABASE_URL="postgresql://usuario:password@localhost:5432/miagenda_db"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="tu_clerk_key"
CLERK_SECRET_KEY="tu_clerk_secret"
```

4. **Configurar la base de datos**
```bash
# Ejecutar migraciones
npx prisma migrate dev --name init

# Generar cliente
npx prisma generate
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

## 📁 Estructura del Proyecto

```
mi-agenda-online/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Dashboard principal
│   │   ├── layout.tsx        # Layout base
│   │   └── globals.css       # Estilos globales
│   └── lib/
│       └── prisma.ts         # Cliente de Prisma
├── prisma/
│   └── schema.prisma         # Esquema de base de datos
├── public/                   # Archivos estáticos
└── package.json             # Dependencias
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo
npm run build        # Build para producción
npm run start        # Servidor de producción

# Base de datos
npx prisma studio    # Interfaz visual de BD
npx prisma migrate   # Ejecutar migraciones
npx prisma generate  # Generar cliente
```

## 🌟 Características de la UI

### Dashboard Principal
- **Stats Cards**: Resumen de citas, clientes, ingresos
- **Lista de Citas**: Próximas appointments con estados
- **Información del Plan**: Cuotas y límites actuales
- **Clientes Recientes**: Últimas interacciones
- **Notificaciones**: Alertas y recordatorios

### Responsive Design
- **Mobile First**: Diseño adaptativo
- **Tailwind CSS**: Clases utilitarias
- **Componentes**: Modularidad y reutilización

## 🔐 Seguridad

- **Autenticación**: Clerk integration
- **Roles**: Sistema de permisos
- **Validación**: Prisma schema validation
- **Variables de entorno**: Configuración segura

## 📈 Próximas Características

- [ ] Dashboard de analytics
- [ ] Calendario interactivo
- [ ] Integración WhatsApp API
- [ ] Sistema de recordatorios automáticos
- [ ] Reportes y estadísticas
- [ ] App móvil

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Repositorio**: [https://github.com/CaniPack/miagendaonline](https://github.com/CaniPack/miagendaonline)
- **Issues**: [https://github.com/CaniPack/miagendaonline/issues](https://github.com/CaniPack/miagendaonline/issues)

---

⭐ **¡Dale una estrella al proyecto si te ha sido útil!**
