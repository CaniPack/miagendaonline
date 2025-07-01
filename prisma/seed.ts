import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...');

  // Crear planes predefinidos
  const plans = await Promise.all([
    prisma.plan.upsert({
      where: { name: 'Básico' },
      update: {},
      create: {
        name: 'Básico',
        price: 9990, // $9.990 CLP
        whatsappQuota: 100,
        emailQuota: 500,
        features: JSON.stringify([
          'Hasta 50 citas por mes',
          'Gestión básica de clientes',
          '100 confirmaciones WhatsApp',
          '500 emails de marketing',
          'Soporte por email',
        ]),
      },
    }),

    prisma.plan.upsert({
      where: { name: 'Pro' },
      update: {},
      create: {
        name: 'Pro',
        price: 19990, // $19.990 CLP
        whatsappQuota: 500,
        emailQuota: 2000,
        features: JSON.stringify([
          'Citas ilimitadas',
          'Gestión avanzada de clientes',
          '500 confirmaciones WhatsApp',
          '2,000 emails de marketing',
          'Recordatorios automáticos',
          'Reportes y estadísticas',
          'Soporte prioritario',
        ]),
      },
    }),

    prisma.plan.upsert({
      where: { name: 'Empresarial' },
      update: {},
      create: {
        name: 'Empresarial',
        price: 39990, // $39.990 CLP
        whatsappQuota: 2000,
        emailQuota: 10000,
        features: JSON.stringify([
          'Todo del plan Pro',
          'Múltiples usuarios',
          '2,000 confirmaciones WhatsApp',
          '10,000 emails de marketing',
          'Integración con calendarios',
          'API personalizada',
          'Soporte 24/7',
          'Capacitación personalizada',
        ]),
      },
    }),
  ]);

  console.log('✅ Planes creados:', plans.length);

  // Crear algunos clientes de ejemplo
  const customers = await Promise.all([
    prisma.customer.upsert({
      where: { email: 'maria.garcia@email.com' },
      update: {},
      create: {
        name: 'María García',
        email: 'maria.garcia@email.com',
        phone: '+56 9 1234 5678',
      },
    }),

    prisma.customer.upsert({
      where: { email: 'carlos.lopez@email.com' },
      update: {},
      create: {
        name: 'Carlos López',
        email: 'carlos.lopez@email.com',
        phone: '+56 9 8765 4321',
      },
    }),

    prisma.customer.upsert({
      where: { email: 'ana.ruiz@email.com' },
      update: {},
      create: {
        name: 'Ana Ruiz',
        email: 'ana.ruiz@email.com',
        phone: '+56 9 5555 5555',
      },
    }),
  ]);

  console.log('✅ Clientes de ejemplo creados:', customers.length);

  console.log('🎉 Seed completado exitosamente!');
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 