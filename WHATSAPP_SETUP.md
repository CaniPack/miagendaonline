# 📱 Configuración de WhatsApp Business API

## 🎯 **Introducción**

Este documento te guía paso a paso para configurar WhatsApp Business API en tu sistema Mi Agenda Online, permitiendo que los profesionales envíen notificaciones directas a sus clientes.

---

## 📋 **Requisitos Previos**

1. ✅ **Cuenta de Facebook Business**
2. ✅ **Número de teléfono dedicado** (no puede ser el mismo que usas personalmente)
3. ✅ **Verificación de identidad** de Facebook
4. ✅ **Tarjeta de crédito** para facturación (Meta cobra por mensajes)

---

## 🚀 **Paso 1: Crear WhatsApp Business Account**

### **1.1 Accede a Meta Business**
- Ve a [business.facebook.com](https://business.facebook.com)
- Inicia sesión con tu cuenta de Facebook Business

### **1.2 Crear WhatsApp Business Account (WABA)**
1. Ve a **"Herramientas de negocio" > "WhatsApp Manager"**
2. Haz clic en **"Crear cuenta de WhatsApp Business"**
3. Completa la información de tu negocio:
   - Nombre de la empresa
   - Dirección comercial
   - Información de contacto
4. **Acepta los términos y condiciones**

### **1.3 Verificación de Negocio**
- Sube documentos que verifiquen tu negocio
- Puede tomar **2-7 días hábiles** la aprobación

---

## 📞 **Paso 2: Configurar Número de Teléfono**

### **2.1 Agregar Número**
1. En WhatsApp Manager, ve a **"Números de teléfono"**
2. Haz clic en **"Agregar número de teléfono"**
3. Ingresa tu número dedicado (ej: +56912345678)

### **2.2 Verificación del Número**
- Meta te enviará un **código por SMS o llamada**
- Ingresa el código para verificar
- ⚠️ **El número quedará asociado a WhatsApp Business y no podrás usarlo en WhatsApp personal**

---

## 🔑 **Paso 3: Configurar API Access**

### **3.1 Crear App de Facebook**
1. Ve a [developers.facebook.com](https://developers.facebook.com)
2. Haz clic en **"Mis Apps" > "Crear App"**
3. Selecciona **"Negocio"** como tipo de app
4. Completa la información:
   - Nombre de la app
   - Email de contacto
   - Propósito del negocio

### **3.2 Agregar WhatsApp Product**
1. En el panel de tu app, haz clic en **"+ Agregar producto"**
2. Busca y selecciona **"WhatsApp"**
3. Haz clic en **"Configurar"**

### **3.3 Configurar WhatsApp Business API**
1. En la sección WhatsApp, ve a **"Configuración"**
2. Encuentra tu **WABA ID** y **Número de teléfono ID**
3. Genera un **Access Token** temporal para pruebas

---

## 🔐 **Paso 4: Obtener Credenciales**

### **4.1 Access Token Permanente**
```bash
# 1. Obtén un User Access Token de larga duración
curl -i -X GET "https://graph.facebook.com/v17.0/oauth/access_token?grant_type=fb_exchange_token&client_id={app-id}&client_secret={app-secret}&fb_exchange_token={short-lived-user-access-token}"

# 2. Genera un System User Access Token
# Ve a Business Settings > System Users > Crear nuevo system user
# Asigna permisos de WhatsApp Business Management
```

### **4.2 Obtener IDs Necesarios**
```bash
# Phone Number ID
curl -i -X GET \
 "https://graph.facebook.com/v17.0/{whatsapp-business-account-id}/phone_numbers" \
 -H "Authorization: Bearer {access-token}"

# Business Account ID  
# Lo encuentras en WhatsApp Manager > Configuración > Información de la cuenta
```

---

## ⚙️ **Paso 5: Configurar Variables de Entorno**

Crea o actualiza tu archivo `.env.local`:

```env
# WhatsApp Business API
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id_aqui
WHATSAPP_ACCESS_TOKEN=tu_access_token_permanente_aqui
```

### **Ejemplo de valores:**
```env
WHATSAPP_API_URL=https://graph.facebook.com/v17.0
WHATSAPP_PHONE_NUMBER_ID=123456789012345
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

## 📝 **Paso 6: Crear Message Templates**

Los templates son mensajes predefinidos que debes aprobar con Meta antes de usar.

### **6.1 Crear Templates en Meta**
1. Ve a **WhatsApp Manager > Plantillas de mensajes**
2. Haz clic en **"Crear plantilla"**

### **6.2 Templates Recomendados para Profesionales**

#### **Template: Recordatorio de Cita**
```
Nombre: cita_recordatorio
Categoría: UTILITY
Idioma: Español

Mensaje:
Hola {{1}}, te recordamos tu cita el {{2}} a las {{3}}. ¡Te esperamos!

Parámetros:
{{1}} = Nombre del cliente
{{2}} = Fecha de la cita  
{{3}} = Hora de la cita
```

#### **Template: Confirmación de Cita**
```
Nombre: cita_confirmacion  
Categoría: UTILITY
Idioma: Español

Mensaje:
Hola {{1}}, tu cita ha sido confirmada para el {{2}} a las {{3}}. ¡Gracias por elegirnos!

Parámetros:
{{1}} = Nombre del cliente
{{2}} = Fecha de la cita
{{3}} = Hora de la cita
```

#### **Template: Cancelación de Cita**
```
Nombre: cita_cancelacion
Categoría: UTILITY  
Idioma: Español

Mensaje:
Hola {{1}}, lamentamos informarte que tu cita del {{2}} ha sido cancelada. Te contactaremos para reagendar.

Parámetros:
{{1}} = Nombre del cliente
{{2}} = Fecha de la cita cancelada
```

### **6.3 Proceso de Aprobación**
- Los templates toman **24-48 horas** en ser aprobados
- Meta revisa que cumplan con sus políticas
- Una vez aprobados, puedes usarlos en la aplicación

---

## 💰 **Paso 7: Configurar Facturación**

### **7.1 Agregar Método de Pago**
1. Ve a **Business Settings > Pagos**
2. Agrega una tarjeta de crédito válida
3. Configura límites de gasto (recomendado: empezar con $50-100 USD/mes)

### **7.2 Costos Aproximados (2025)**
- **Mensajes de Utilidad** (recordatorios, confirmaciones): ~$0.004-0.014 USD por mensaje
- **Mensajes de Marketing** (promociones): ~$0.011-0.107 USD por mensaje
- **Mensajes de Autenticación** (OTPs): ~$0.014-0.014 USD por mensaje

**Ejemplo de costo mensual:**
- 100 recordatorios de citas: ~$1.40 USD
- 50 confirmaciones: ~$0.70 USD  
- 20 mensajes promocionales: ~$2.14 USD
- **Total mensual**: ~$4.24 USD (muy económico!)

---

## 🧪 **Paso 8: Probar la Integración**

### **8.1 Test desde la Aplicación**
1. Reinicia tu servidor Next.js: `npm run dev`
2. Ve a la página de **Clientes**
3. Haz clic en **"Enviar WhatsApp"** en cualquier cliente
4. Prueba enviar un mensaje de prueba

### **8.2 Test Manual con cURL**
```bash
curl -X POST \
  http://localhost:3002/api/whatsapp/send \
  -H 'Content-Type: application/json' \
  -d '{
    "customerPhone": "+56912345678",
    "templateName": "cita_recordatorio", 
    "templateParams": ["Juan", "15 de Enero", "10:00 AM"]
  }'
```

---

## 🔧 **Solución de Problemas**

### **Error: "WhatsApp API no configurada"**
- ✅ Verifica que las variables de entorno estén en `.env.local`
- ✅ Reinicia el servidor después de agregar las variables

### **Error: "Invalid access token"**
- ✅ Verifica que el access token sea permanente (no temporal)
- ✅ Asegúrate de que el token tenga permisos de WhatsApp Business

### **Error: "Template not found"**
- ✅ Verifica que el template esté aprobado por Meta
- ✅ Usa el nombre exacto del template (case-sensitive)

### **Error: "Phone number not verified"**
- ✅ Completa la verificación del número en WhatsApp Manager
- ✅ Asegúrate de usar el Phone Number ID correcto

### **Mensaje no llega al cliente**
- ✅ Verifica que el número del cliente tenga WhatsApp
- ✅ Asegúrate de incluir el código de país (+56 para Chile)
- ✅ Revisa los logs de Meta en WhatsApp Manager

---

## 📊 **Monitoreo y Analytics**

### **8.1 Meta Analytics**
- Ve a **WhatsApp Manager > Analytics**
- Revisa métricas de:
  - Mensajes enviados
  - Mensajes entregados  
  - Mensajes leídos
  - Costos por mensaje

### **8.2 Logs de la Aplicación**
- Los mensajes se registran en la tabla `Notification`
- Revisa la consola del servidor para errores
- Usa `npx prisma studio` para ver el historial

---

## 🚀 **Funcionalidades Implementadas**

### **✅ En la Aplicación**
- 📱 Envío de notificaciones por WhatsApp
- 📋 Templates predefinidos para citas
- 📝 Mensajes personalizados
- 📞 Validación de números de teléfono
- 📊 Registro de notificaciones enviadas
- 🔔 Integración con sistema de notificaciones

### **✅ Templates Disponibles**
- 🗓️ Recordatorio de cita
- ✅ Confirmación de cita  
- ❌ Cancelación de cita
- 💬 Seguimiento general

---

## 📞 **Soporte**

### **Recursos Oficiales**
- [WhatsApp Business API Docs](https://developers.facebook.com/docs/whatsapp)
- [Meta Business Help Center](https://www.facebook.com/business/help)

### **Comunidades**
- [WhatsApp Business API Facebook Group](https://www.facebook.com/groups/whatsappbusinessapi)
- [Stack Overflow - whatsapp-business-api](https://stackoverflow.com/questions/tagged/whatsapp-business-api)

---

## 🎯 **Próximos Pasos**

Una vez configurado WhatsApp, puedes:

1. **📅 Automatizar recordatorios** - Integrar con el sistema de citas
2. **🤖 Crear chatbots** - Respuestas automáticas a clientes
3. **📊 Analytics avanzados** - Métricas de engagement
4. **🔄 Sincronización bidireccional** - Recibir respuestas de clientes
5. **📢 Campañas de marketing** - Promociones y ofertas

---

**¡Felicidades! 🎉 Tu sistema ahora puede enviar notificaciones profesionales por WhatsApp.** 