const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Creando datos de ejemplo...');

  // Crear notificaciones de ejemplo
  try {
    await prisma.notification.createMany({
      data: [
        {
          userId: 'user_dev_12345',
          type: 'SYSTEM',
          message: '¡Bienvenido! Tu sistema de agenda está listo para usar',
          read: false,
        },
        {
          userId: 'user_dev_12345',
          type: 'EMAIL',
          message: 'Recordatorio: Tienes una cita mañana a las 10:00 AM',
          read: false,
        },
        {
          userId: 'user_dev_12345',
          type: 'WHATSAPP',
          message: 'María García confirmó su cita para el viernes',
          read: false,
        },
        {
          userId: 'user_dev_12345',
          type: 'SYSTEM',
          message: 'Tu plan Pro se renovará en 5 días',
          read: true,
        },
      ],
    });

    // Crear un pago de ejemplo
    await prisma.payment.create({
      data: {
        userId: 'user_dev_12345',
        amount: 19990,
        status: 'PAID',
        paymentDate: new Date(),
      },
    });

    console.log('✅ Datos de ejemplo creados exitosamente!');
    console.log('🎉 Ahora puedes probar el sistema en http://localhost:3002');
  } catch (error) {
    console.log('ℹ️  Los datos ya existen o hay un error menor:', error.message);
  }
}

main()
  .catch((e) => {
    console.error('Error:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 