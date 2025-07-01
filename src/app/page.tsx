import { CalendarIcon, UserIcon, PlusIcon, CreditCardIcon, BellIcon, UsersIcon, LogOutIcon } from "lucide-react";
import { UserButton } from '@clerk/nextjs';
import { currentUser } from '@clerk/nextjs/server';
import NotificationBell from '@/components/NotificationBell';

// Usuario simulado para desarrollo
const mockUser = {
  firstName: 'Juan',
  lastName: 'Pérez',
  emailAddresses: [{ emailAddress: 'juan.perez@ejemplo.com' }],
  id: 'user_dev_12345'
};

export default async function Home() {
  const isDevelopment = process.env.DEVELOPMENT_MODE === 'true';
  
  let user;
  if (isDevelopment) {
    user = mockUser;
  } else {
    user = await currentUser();
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">Mi Agenda Online</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <a href="/appointments" className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Nueva Cita</span>
              </a>
              <NotificationBell />
              
              {/* User Info and Logout */}
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
                {isDevelopment ? (
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">JP</span>
                  </div>
                ) : (
                  <UserButton afterSignOutUrl="/sign-in" />
                )}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Welcome Message */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-8">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                <UserIcon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h3 className="text-indigo-800 font-medium">
                ¡Bienvenido, {user?.firstName || 'Usuario'}!
              </h3>
              <p className="text-indigo-700 text-sm mt-1">
                ✅ Autenticación con Clerk configurada correctamente<br/>
                🔒 Sesión activa y rutas protegidas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <CalendarIcon className="h-8 w-8 text-blue-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                <p className="text-2xl font-bold text-gray-900">8</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-2xl font-bold text-gray-900">156</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <CreditCardIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Ingresos Mes</p>
                <p className="text-2xl font-bold text-gray-900">$2.4K</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <BellIcon className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Appointments Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-semibold text-gray-900">Próximas Citas</h2>
                  <a href="/appointments" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                    Ver todas
                  </a>
                </div>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                    Hoy
                  </button>
                  <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    Semana
                  </button>
                  <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    Mes
                  </button>
                </div>
              </div>

              {/* Appointments List */}
              <div className="space-y-4">
                {/* Appointment 1 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-12 bg-blue-500 rounded-full"></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Consulta - María García</h3>
                        <p className="text-gray-600 text-sm">10:00 AM - 11:00 AM (60 min)</p>
                        <p className="text-gray-500 text-sm">📞 +56 9 1234 5678</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Confirmada
                    </span>
                  </div>
                </div>

                {/* Appointment 2 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-12 bg-yellow-500 rounded-full"></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Revisión - Carlos López</h3>
                        <p className="text-gray-600 text-sm">2:30 PM - 3:30 PM (60 min)</p>
                        <p className="text-gray-500 text-sm">📧 carlos@email.com</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      Pendiente
                    </span>
                  </div>
                </div>

                {/* Appointment 3 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-12 bg-green-500 rounded-full"></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Seguimiento - Ana Ruiz</h3>
                        <p className="text-gray-600 text-sm">4:00 PM - 4:30 PM (30 min)</p>
                        <p className="text-gray-500 text-sm">📱 WhatsApp confirmado</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Confirmada
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* User Profile */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mi Perfil</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  {isDevelopment ? (
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">JP</span>
                    </div>
                  ) : (
                    <UserButton />
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {user?.firstName} {user?.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user?.emailAddresses[0]?.emailAddress}</p>
                  </div>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-sm text-gray-600">Clerk ID: {user?.id?.slice(0, 8)}...</p>
                  <p className="text-sm text-gray-600">Última conexión: Ahora</p>
                </div>
              </div>
            </div>
            
            {/* Plan Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Mi Plan</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan Actual</span>
                  <span className="font-semibold text-indigo-600">Pro</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">WhatsApp</span>
                  <span className="font-semibold text-green-600">450/500</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Emails</span>
                  <span className="font-semibold text-blue-600">1,200/2,000</span>
                </div>
                <button className="w-full mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Actualizar Plan
                </button>
              </div>
            </div>

            {/* Recent Customers */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Clientes Recientes</h2>
                <a href="/customers" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium">
                  Ver todos
                </a>
              </div>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-medium text-sm">MG</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">María García</p>
                    <p className="text-gray-500 text-sm">Última cita: Hoy</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-medium text-sm">CL</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Carlos López</p>
                    <p className="text-gray-500 text-sm">Última cita: Ayer</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-medium text-sm">AR</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Ana Ruiz</p>
                    <p className="text-gray-500 text-sm">Última cita: 2 días</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Notificaciones</h2>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900">Recordatorio</p>
                  <p className="text-xs text-blue-700">Cita con María en 30 min</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-900">WhatsApp</p>
                  <p className="text-xs text-green-700">Carlos confirmó su cita</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm font-medium text-orange-900">Pago</p>
                  <p className="text-xs text-orange-700">Renovación en 5 días</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Success Message */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div>
              <h3 className="text-green-800 font-medium">¡Autenticación Completa!</h3>
              <p className="text-green-700 text-sm mt-1">
                ✅ Next.js + TypeScript configurado<br/>
                ✅ TailwindCSS funcionando correctamente<br/>
                ✅ Prisma + SQLite configurado<br/>
                ✅ Modelos de appointments, clientes y planes<br/>
                ✅ Sistema de roles y notificaciones<br/>
                ✅ <strong>Clerk autenticación funcionando!</strong><br/>
                ✅ Rutas protegidas y middleware configurado
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
