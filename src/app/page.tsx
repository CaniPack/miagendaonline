import { CalendarIcon, UserIcon, PlusIcon } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <CalendarIcon className="h-8 w-8 text-indigo-600" />
              <h1 className="text-3xl font-bold text-gray-900">Agenda Pro</h1>
            </div>
            <nav className="flex items-center space-x-6">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2">
                <PlusIcon className="h-4 w-4" />
                <span>Nuevo Evento</span>
              </button>
              <UserIcon className="h-6 w-6 text-gray-600" />
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Categorías</h2>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Trabajo</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">Personal</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-gray-700">Urgente</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Resumen</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Eventos Hoy</span>
                  <span className="font-semibold text-indigo-600">3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Esta Semana</span>
                  <span className="font-semibold text-indigo-600">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Contactos</span>
                  <span className="font-semibold text-indigo-600">25</span>
                </div>
              </div>
            </div>
          </div>

          {/* Calendar/Events Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900">Próximos Eventos</h2>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                    Día
                  </button>
                  <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    Semana
                  </button>
                  <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                    Mes
                  </button>
                </div>
              </div>

              {/* Events List */}
              <div className="space-y-4">
                {/* Event 1 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-12 bg-blue-500 rounded-full"></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Reunión con Cliente</h3>
                        <p className="text-gray-600 text-sm">10:00 AM - 11:30 AM</p>
                        <p className="text-gray-500 text-sm">Oficina Principal</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      Trabajo
                    </span>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-12 bg-green-500 rounded-full"></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Almuerzo con Familia</h3>
                        <p className="text-gray-600 text-sm">1:00 PM - 2:30 PM</p>
                        <p className="text-gray-500 text-sm">Restaurante Central</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      Personal
                    </span>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-12 bg-red-500 rounded-full"></div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Presentación Final</h3>
                        <p className="text-gray-600 text-sm">4:00 PM - 5:00 PM</p>
                        <p className="text-gray-500 text-sm">Sala de Conferencias</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium">
                      Urgente
                    </span>
                  </div>
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
              <h3 className="text-green-800 font-medium">¡Configuración Completa!</h3>
              <p className="text-green-700 text-sm mt-1">
                ✅ Next.js + TypeScript configurado<br/>
                ✅ TailwindCSS funcionando correctamente<br/>
                ✅ Prisma + SQLite configurado<br/>
                ✅ Base de datos creada con migraciones<br/>
                ✅ Prisma Studio corriendo en segundo plano
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
