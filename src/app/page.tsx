"use client";

import Link from "next/link";
import {
  CalendarIcon,
  UserIcon,
  PlusIcon,
  CreditCardIcon,
  BellIcon,
  UsersIcon,
  Clock,
  Phone as PhoneIcon,
  Mail as MailIcon,
  ChevronDown,
  Briefcase as BriefcaseIcon,
  Lock as LockIcon,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useToast } from "@/components/ToastProvider";
import Navigation from "@/components/Navigation";
import { useState, useEffect } from "react";

interface Stats {
  appointmentsToday: number;
  totalClients: number;
  monthlyIncome: number;
  pendingAppointments: number;
}

interface Appointment {
  id: string;
  date: string;
  customer: {
    name: string;
    phone?: string;
    email?: string;
  };
  duration: number;
  status: string;
  notes?: string;
  internalComment?: string;
  internalPrice?: number;
  publicPrice?: number;
}

interface LandingPageInfo {
  slug?: string;
  isPublished?: boolean;
}

interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  _count?: {
    appointments: number;
  };
  appointments?: Array<{
    id: string;
    date: string;
    duration: number;
    status: string;
    notes?: string;
    internalComment?: string;
    internalPrice?: number;
    publicPrice?: number;
  }>;
  totalIncome?: number;
  averageAppointmentsPerMonth?: number;
  lastAppointment?: string;
}

// Componente para mostrar cuando no hay autenticación
function UnauthenticatedHome() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex items-center justify-center mb-8">
            <CalendarIcon className="h-16 w-16 text-indigo-600 mr-4" />
            <h1 className="text-5xl font-bold text-gray-900">
              Mi Agenda Online
            </h1>
          </div>

          <p className="text-xl text-gray-600 mb-12 leading-relaxed">
            La plataforma profesional para gestionar tus citas, clientes y crear
            tu página web personalizada. Simplifica tu trabajo y haz crecer tu
            negocio.
          </p>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <CalendarIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Gestión de Citas</h3>
              <p className="text-gray-600">
                Organiza tu calendario, confirma citas y evita conflictos de
                horarios
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <UsersIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Base de Clientes</h3>
              <p className="text-gray-600">
                Mantén un registro completo de tus clientes y su historial
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg">
              <BriefcaseIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                Página Web Personal
              </h3>
              <p className="text-gray-600">
                Crea tu página web profesional para recibir citas online
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <SignInButton mode="modal">
              <button className="bg-indigo-600 text-white px-8 py-4 rounded-lg hover:bg-indigo-700 transition-colors text-lg font-semibold">
                Iniciar Sesión
              </button>
            </SignInButton>

            <p className="text-gray-500">
              ¿Nuevo en Mi Agenda Online?{" "}
              <Link
                href="/sign-up"
                className="text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Crea tu cuenta gratis
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente principal del dashboard
function AuthenticatedDashboard() {
  const { user, isLoaded } = useAuthUser();
  const { showWarning } = useToast();
  const [stats, setStats] = useState<Stats>({
    appointmentsToday: 0,
    totalClients: 0,
    monthlyIncome: 0,
    pendingAppointments: 0,
  });
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [weekAppointments, setWeekAppointments] = useState<Appointment[]>([]);
  const [monthAppointments, setMonthAppointments] = useState<Appointment[]>([]);
  const [currentView, setCurrentView] = useState<
    "today" | "week" | "month" | "custom"
  >("today");
  const [loading, setLoading] = useState(true);
  const [landingPageInfo, setLandingPageInfo] =
    useState<LandingPageInfo | null>(null);
  const [customAppointments, setCustomAppointments] = useState<Appointment[]>(
    []
  );
  const [selectedFilter, setSelectedFilter] = useState<string>("today");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Customer modal states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );

  useEffect(() => {
    if (isLoaded) {
      if (user?.id) {
        // Only fetch data if user is definitely authenticated
        fetchDashboardData();
        fetchLandingPageInfo();
      } else {
        // User is not authenticated, stop loading
        setLoading(false);
        console.log("👤 User not authenticated - skipping data fetch");
      }
    }
  }, [isLoaded, user]);

  // Sync selectedFilter with currentView for backward compatibility
  useEffect(() => {
    if (currentView === "today" && selectedFilter !== "today") {
      setSelectedFilter("today");
    } else if (currentView === "week" && selectedFilter !== "week") {
      setSelectedFilter("week");
    } else if (currentView === "month" && selectedFilter !== "month") {
      setSelectedFilter("month");
    }
  }, [currentView, selectedFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch appointments for different time periods
      const [todayRes, weekRes, monthRes, clientsRes] = await Promise.all([
        fetch("/api/appointments?period=today"),
        fetch("/api/appointments?period=week"),
        fetch("/api/appointments?period=month"),
        fetch("/api/customers"),
      ]);

      // Check if all responses are OK before parsing JSON
      const responses = [todayRes, weekRes, monthRes, clientsRes];
      const responseNames = [
        "today appointments",
        "week appointments",
        "month appointments",
        "customers",
      ];

      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          console.error(
            `Error fetching ${responseNames[i]}:`,
            responses[i].status,
            responses[i].statusText
          );
          // If it's an auth error, the user needs to log in
          if (responses[i].status === 401) {
            console.log("Authentication required - user may need to log in");
            return; // Exit early on auth error
          }
        }
      }

      // Parse JSON responses safely
      const parseJsonSafely = async (response: Response, name: string) => {
        try {
          const text = await response.text();
          if (!text) return null;

          // Check if response is HTML (error page)
          if (
            text.trim().startsWith("<!DOCTYPE") ||
            text.trim().startsWith("<html")
          ) {
            console.error(
              `${name} returned HTML instead of JSON:`,
              text.substring(0, 100) + "..."
            );
            return null;
          }

          return JSON.parse(text);
        } catch (error) {
          console.error(`Error parsing JSON for ${name}:`, error);
          return null;
        }
      };

      const [todayData, weekData, monthData, clientsData] = await Promise.all([
        parseJsonSafely(todayRes, "today appointments"),
        parseJsonSafely(weekRes, "week appointments"),
        parseJsonSafely(monthRes, "month appointments"),
        parseJsonSafely(clientsRes, "customers"),
      ]);

      // Set appointments data (handle null responses)
      setTodayAppointments(todayData?.appointments || []);
      setWeekAppointments(weekData?.appointments || []);
      setMonthAppointments(monthData?.appointments || []);

      // Calculate stats safely
      const safeToday = todayData?.appointments || [];
      const safeMonth = monthData?.appointments || [];
      const safeClients = clientsData?.customers || [];

      const pendingToday = safeToday.filter(
        (apt: Appointment) =>
          apt.status === "PENDING" || apt.status === "CONFIRMED"
      ).length;

      // Calculate monthly income from completed appointments
      const monthlyIncome =
        safeMonth.filter((apt: Appointment) => apt.status === "COMPLETED")
          .length * 45000; // Assuming average $45,000 per appointment

      setStats({
        appointmentsToday: safeToday.length,
        totalClients: Array.isArray(safeClients) ? safeClients.length : 0,
        monthlyIncome: monthlyIncome,
        pendingAppointments: pendingToday,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLandingPageInfo = async () => {
    try {
      const response = await fetch("/api/landing-page");
      if (response.ok) {
        const data = await response.json();
        setLandingPageInfo(data);
      }
    } catch (error) {
      console.error("Error al obtener info de landing page:", error);
    }
  };

  const handleViewPublicPage = () => {
    if (landingPageInfo?.slug && landingPageInfo?.isPublished) {
      window.open(`/p/${landingPageInfo.slug}`, "_blank");
    } else {
      showWarning(
        "Página no publicada",
        'Tu página no está publicada aún. Ve a "Mi Página Web" para publicarla.'
      );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "Confirmada";
      case "PENDING":
        return "Pendiente";
      case "CANCELLED":
        return "Cancelada";
      case "COMPLETED":
        return "Completada";
      default:
        return status;
    }
  };

  const getCurrentAppointments = () => {
    switch (currentView) {
      case "today":
        return todayAppointments;
      case "week":
        return weekAppointments;
      case "month":
        return monthAppointments;
      case "custom":
        return customAppointments;
      default:
        return todayAppointments;
    }
  };

  const fetchCustomPeriodAppointments = async (days: number) => {
    try {
      setLoading(true);
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(startDate.getDate() + days);

      const response = await fetch(
        `/api/appointments?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      if (response.ok) {
        const data = await response.json();
        setCustomAppointments(data.appointments || []);
        setCurrentView("custom");
      }
    } catch (error) {
      console.error("Error fetching custom period appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDateRangeAppointments = async (
    startDate: string,
    endDate: string
  ) => {
    try {
      setLoading(true);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include the whole end day

      const response = await fetch(
        `/api/appointments?startDate=${start.toISOString()}&endDate=${end.toISOString()}`
      );
      if (response.ok) {
        const data = await response.json();
        setCustomAppointments(data.appointments || []);
        setCurrentView("custom");
      }
    } catch (error) {
      console.error("Error fetching date range appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (filterType: string) => {
    setSelectedFilter(filterType);

    switch (filterType) {
      case "today":
        setCurrentView("today");
        break;
      case "week":
        setCurrentView("week");
        break;
      case "month":
        setCurrentView("month");
        break;
      case "7days":
        fetchCustomPeriodAppointments(7);
        break;
      case "15days":
        fetchCustomPeriodAppointments(15);
        break;
      case "28days":
        fetchCustomPeriodAppointments(28);
        break;
      case "6months":
        fetchCustomPeriodAppointments(180);
        break;
      case "custom":
        setShowDatePicker(true);
        break;
    }
  };

  const handleCustomDateSubmit = () => {
    if (customStartDate && customEndDate) {
      fetchDateRangeAppointments(customStartDate, customEndDate);
      setShowDatePicker(false);
    }
  };

  const getFilterLabel = () => {
    switch (selectedFilter) {
      case "today":
        return "Hoy";
      case "week":
        return "Esta Semana";
      case "month":
        return "Este Mes";
      case "7days":
        return "7 Días";
      case "15days":
        return "15 Días";
      case "28days":
        return "28 Días";
      case "6months":
        return "6 Meses";
      case "custom":
        return customStartDate && customEndDate
          ? `${new Date(customStartDate).toLocaleDateString(
              "es-ES"
            )} - ${new Date(customEndDate).toLocaleDateString("es-ES")}`
          : "Personalizado";
      default:
        return "Hoy";
    }
  };

  const openCustomerDetails = async (customerId: string) => {
    try {
      const response = await fetch(`/api/customers/${customerId}`);
      if (response.ok) {
        const customerData = await response.json();
        const customer = {
          ...customerData,
          totalIncome: calculateCustomerIncome(customerData.appointments || []),
          lastAppointment: getLastAppointmentDate(
            customerData.appointments || []
          ),
          averageAppointmentsPerMonth: calculateAverageAppointments(
            customerData.appointments || []
          ),
        };
        setSelectedCustomer(customer);
      }
    } catch (error) {
      console.error("Error fetching customer details:", error);
    }
  };

  const openCustomerDetailsByName = async (customerName: string) => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        const customer = data.customers?.find(
          (c: Customer) => c.name === customerName
        );
        if (customer) {
          await openCustomerDetails(customer.id);
        }
      }
    } catch (error) {
      console.error("Error finding customer by name:", error);
    }
  };

  const calculateCustomerIncome = (appointments: Appointment[]) => {
    return appointments
      .filter((apt) => apt.status === "COMPLETED")
      .reduce(
        (total, apt) => total + (apt.publicPrice || apt.internalPrice || 45000),
        0
      );
  };

  const getLastAppointmentDate = (appointments: Appointment[]) => {
    if (appointments.length === 0) return null;
    const lastApt = appointments.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    return lastApt.date;
  };

  const calculateAverageAppointments = (appointments: Appointment[]) => {
    if (appointments.length === 0) return 0;
    const firstAppointment = new Date(
      Math.min(...appointments.map((apt) => new Date(apt.date).getTime()))
    );
    const monthsSinceFirst =
      (Date.now() - firstAppointment.getTime()) / (1000 * 60 * 60 * 24 * 30);
    return (
      Math.round((appointments.length / Math.max(monthsSinceFirst, 1)) * 10) /
      10
    );
  };

  const calculateServiceStats = (appointments: Customer["appointments"]) => {
    if (!appointments || appointments.length === 0) return [];

    const serviceGroups: {
      [key: string]: { count: number; totalAmount: number; price: number };
    } = {};
    const withoutService = { count: 0, totalAmount: 0 };

    appointments.forEach((appointment) => {
      const price = appointment.publicPrice || appointment.internalPrice;

      if (price) {
        const key = `service_${price}`;
        if (!serviceGroups[key]) {
          serviceGroups[key] = { count: 0, totalAmount: 0, price };
        }
        serviceGroups[key].count += 1;
        serviceGroups[key].totalAmount += price;
      } else {
        withoutService.count += 1;
        withoutService.totalAmount += 0;
      }
    });

    const services = Object.values(serviceGroups)
      .sort((a, b) => b.price - a.price)
      .map((service) => ({
        name: `Servicio ${formatCurrency(service.price)}`,
        count: service.count,
        totalAmount: service.totalAmount,
        avgPrice: service.price,
      }));

    if (withoutService.count > 0) {
      services.push({
        name: "Sin servicio definido",
        count: withoutService.count,
        totalAmount: withoutService.totalAmount,
        avgPrice: 0,
      });
    }

    return services;
  };

  const getCustomerStatus = (customer: Customer) => {
    const appointmentCount = customer._count?.appointments || 0;
    const lastAppointment = customer.lastAppointment;

    if (appointmentCount === 0) {
      return { status: "Nuevo", color: "bg-blue-100 text-blue-800" };
    }

    if (lastAppointment) {
      const daysSinceLastAppointment = Math.floor(
        (Date.now() - new Date(lastAppointment).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (daysSinceLastAppointment <= 30) {
        return { status: "Activo", color: "bg-green-100 text-green-800" };
      } else if (daysSinceLastAppointment <= 90) {
        return { status: "Regular", color: "bg-yellow-100 text-yellow-800" };
      } else {
        return { status: "Inactivo", color: "bg-red-100 text-red-800" };
      }
    }

    return { status: "Inactivo", color: "bg-gray-100 text-gray-800" };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const renderCustomerModal = () => {
    if (!selectedCustomer) return null;

    const customerStatus = getCustomerStatus(selectedCustomer);

    const handleCloseModal = () => {
      setSelectedCustomer(null);
    };

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={handleCloseModal}
      >
        <div
          className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <UserIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedCustomer.name}
                  </h2>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${customerStatus.color}`}
                  >
                    {customerStatus.status}
                  </span>
                </div>
              </div>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Información de Contacto
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <UserIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {selectedCustomer.name}
                      </span>
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex items-center space-x-3">
                        <MailIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {selectedCustomer.email}
                        </span>
                      </div>
                    )}
                    {selectedCustomer.phone && (
                      <div className="flex items-center space-x-3">
                        <PhoneIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {selectedCustomer.phone}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <CalendarIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Cliente desde {formatDate(selectedCustomer.createdAt)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Estadísticas
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Citas</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCustomer._count?.appointments || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Ingresos Totales
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {formatCurrency(selectedCustomer.totalIncome || 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">
                        Promedio Mensual
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedCustomer.averageAppointmentsPerMonth} citas/mes
                      </span>
                    </div>
                    {selectedCustomer.lastAppointment && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">
                          Última Cita
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(selectedCustomer.lastAppointment)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <BriefcaseIcon className="h-5 w-5 text-indigo-600" />
                    <h3 className="text-lg font-medium text-gray-900">
                      Servicios Contratados
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {(() => {
                      const serviceStats = calculateServiceStats(
                        selectedCustomer.appointments || []
                      );

                      if (serviceStats.length === 0) {
                        return (
                          <div className="text-center py-4">
                            <div className="text-gray-400 text-sm">
                              Sin servicios contratados
                            </div>
                          </div>
                        );
                      }

                      return serviceStats.map((service, index) => (
                        <div
                          key={index}
                          className="border-b border-gray-200 pb-2 last:border-b-0"
                        >
                          <div className="flex justify-between items-start">
                            <span className="text-sm font-medium text-gray-700">
                              {service.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {service.count} cita
                              {service.count !== 1 ? "s" : ""}
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>
                              Total: {formatCurrency(service.totalAmount)}
                            </span>
                            {service.avgPrice > 0 && (
                              <span>
                                Precio: {formatCurrency(service.avgPrice)}
                              </span>
                            )}
                          </div>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    Historial de Citas
                  </h3>
                  {selectedCustomer.appointments &&
                  selectedCustomer.appointments.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedCustomer.appointments
                        .sort(
                          (a, b) =>
                            new Date(b.date).getTime() -
                            new Date(a.date).getTime()
                        )
                        .map((appointment) => (
                          <div
                            key={appointment.id}
                            className="border border-gray-200 rounded-lg p-3"
                          >
                            <div className="flex justify-between items-start mb-2">
                              <div className="text-sm font-medium text-gray-900">
                                {formatDate(appointment.date)} -{" "}
                                {formatTime(appointment.date)}
                              </div>
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                  appointment.status
                                )}`}
                              >
                                {getStatusText(appointment.status)}
                              </span>
                            </div>

                            <div className="text-xs text-gray-600 space-y-1">
                              <div>
                                Duración: {appointment.duration} minutos
                              </div>
                              {appointment.notes && (
                                <div>
                                  <strong>Notas:</strong> {appointment.notes}
                                </div>
                              )}
                              {appointment.internalComment && (
                                <div className="bg-yellow-50 p-2 rounded flex items-start space-x-1">
                                  <LockIcon className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
                                  <span className="text-yellow-800">
                                    <strong>Comentario interno:</strong>{" "}
                                    {appointment.internalComment}
                                  </span>
                                </div>
                              )}
                              {(appointment.publicPrice ||
                                appointment.internalPrice) && (
                                <div className="flex justify-between text-xs">
                                  {appointment.publicPrice && (
                                    <span>
                                      <strong>Precio público:</strong>{" "}
                                      {formatCurrency(appointment.publicPrice)}
                                    </span>
                                  )}
                                  {appointment.internalPrice &&
                                    appointment.internalPrice !==
                                      appointment.publicPrice && (
                                      <span className="text-yellow-700">
                                        <LockIcon className="h-3 w-3 inline mr-1" />
                                        <strong>Precio interno:</strong>{" "}
                                        {formatCurrency(
                                          appointment.internalPrice
                                        )}
                                      </span>
                                    )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <div className="text-gray-400 text-sm">
                        Sin historial de citas
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Navigation />

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
                ¡Bienvenido, {user?.firstName || "Usuario"}!
              </h3>
              <p className="text-indigo-700 text-sm mt-1">
                ✅ Sistema funcionando correctamente • 🔒 Sesión activa
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
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.appointmentsToday}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <UsersIcon className="h-8 w-8 text-green-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Clientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.totalClients}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <CreditCardIcon className="h-8 w-8 text-purple-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Ingresos Mes
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : formatCurrency(stats.monthlyIncome)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center">
              <BellIcon className="h-8 w-8 text-orange-500" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading ? "..." : stats.pendingAppointments}
                </p>
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
                  <h2 className="text-2xl font-semibold text-gray-900">
                    Citas
                  </h2>
                  <Link
                    href="/appointments"
                    className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                  >
                    Ver todas
                  </Link>
                </div>

                {/* Filter Controls */}
                <div className="flex items-center space-x-4">
                  {/* Quick Period Buttons with Counters */}
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleFilterChange("today")}
                      className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${
                        selectedFilter === "today"
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Hoy
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          selectedFilter === "today"
                            ? "bg-indigo-200 text-indigo-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {loading ? "..." : todayAppointments.length}
                      </span>
                    </button>
                    <button
                      onClick={() => handleFilterChange("week")}
                      className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${
                        selectedFilter === "week"
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Semana
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          selectedFilter === "week"
                            ? "bg-indigo-200 text-indigo-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {loading ? "..." : weekAppointments.length}
                      </span>
                    </button>
                    <button
                      onClick={() => handleFilterChange("month")}
                      className={`px-3 py-2 rounded-lg transition-colors text-sm font-medium flex items-center gap-2 ${
                        selectedFilter === "month"
                          ? "text-indigo-600 bg-indigo-50"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      Mes
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          selectedFilter === "month"
                            ? "bg-indigo-200 text-indigo-800"
                            : "bg-gray-200 text-gray-700"
                        }`}
                      >
                        {loading ? "..." : monthAppointments.length}
                      </span>
                    </button>
                  </div>

                  {/* Advanced Filter Dropdown */}
                  <div className="relative">
                    <select
                      value={selectedFilter}
                      onChange={(e) => handleFilterChange(e.target.value)}
                      className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="today">Hoy</option>
                      <option value="week">Esta Semana</option>
                      <option value="month">Este Mes</option>
                      <option value="7days">Próximos 7 días</option>
                      <option value="15days">Próximos 15 días</option>
                      <option value="28days">Próximos 28 días</option>
                      <option value="6months">Próximos 6 meses</option>
                      <option value="custom">Rango personalizado...</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Custom Date Range Picker */}
              {showDatePicker && (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg border">
                  <h4 className="text-sm font-medium text-gray-900 mb-3">
                    Seleccionar rango de fechas
                  </h4>
                  <div className="flex items-center space-x-4">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Fecha inicio
                      </label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">
                        Fecha fin
                      </label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-sm"
                      />
                    </div>
                    <div className="flex space-x-2 pt-4">
                      <button
                        onClick={handleCustomDateSubmit}
                        className="bg-indigo-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-indigo-700"
                        disabled={!customStartDate || !customEndDate}
                      >
                        Aplicar
                      </button>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="bg-gray-300 text-gray-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Current Filter Display */}
              <div className="mb-4 flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Mostrando:{" "}
                  <span className="font-medium text-gray-900">
                    {getFilterLabel()}
                  </span>
                  {currentView === "custom" && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                      {getCurrentAppointments().length} citas
                    </span>
                  )}
                </div>
              </div>

              {/* Appointments List */}
              <div className="space-y-4">
                {loading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse bg-gray-100 h-20 rounded-lg"
                      ></div>
                    ))}
                  </div>
                ) : getCurrentAppointments().length > 0 ? (
                  getCurrentAppointments()
                    .slice(0, 5)
                    .map((appointment) => (
                      <div
                        key={appointment.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex items-center space-x-4">
                          <div
                            className={`w-1 h-16 rounded-full ${
                              appointment.status === "CONFIRMED"
                                ? "bg-green-500"
                                : appointment.status === "PENDING"
                                ? "bg-yellow-500"
                                : appointment.status === "CANCELLED"
                                ? "bg-red-500"
                                : "bg-blue-500"
                            }`}
                          ></div>
                          <div>
                            <button
                              onClick={() =>
                                openCustomerDetailsByName(
                                  appointment.customer.name
                                )
                              }
                              className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
                            >
                              {appointment.customer.name}
                            </button>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center space-x-1">
                                <Clock className="h-4 w-4" />
                                <span>
                                  {formatTime(appointment.date)} (
                                  {appointment.duration} min)
                                </span>
                              </span>
                              {appointment.customer.phone && (
                                <span className="flex items-center space-x-1">
                                  <PhoneIcon className="h-4 w-4" />
                                  <span>{appointment.customer.phone}</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                              appointment.status
                            )}`}
                          >
                            {getStatusText(appointment.status)}
                          </span>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      No hay citas para {getFilterLabel().toLowerCase()}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {selectedFilter === "today"
                        ? "No tienes citas programadas para hoy."
                        : selectedFilter === "week"
                        ? "No tienes citas programadas para esta semana."
                        : selectedFilter === "month"
                        ? "No tienes citas programadas para este mes."
                        : selectedFilter === "7days"
                        ? "No tienes citas programadas para los próximos 7 días."
                        : selectedFilter === "15days"
                        ? "No tienes citas programadas para los próximos 15 días."
                        : selectedFilter === "28days"
                        ? "No tienes citas programadas para los próximos 28 días."
                        : selectedFilter === "6months"
                        ? "No tienes citas programadas para los próximos 6 meses."
                        : "No tienes citas programadas para el período seleccionado."}
                    </p>
                    <div className="mt-6">
                      <Link
                        href="/appointments"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Nueva Cita
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* My Landing Page Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Mi Página Web
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Crea tu landing page personalizada para recibir agendamientos.
              </p>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Estado</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      landingPageInfo?.isPublished
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {landingPageInfo?.isPublished ? "Publicada" : "Borrador"}
                  </span>
                </div>

                {landingPageInfo?.slug && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">URL</span>
                    <span className="text-sm text-blue-600 font-mono">
                      /p/{landingPageInfo.slug}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-col space-y-2 mt-6">
                <Link
                  href="/mi-pagina-web"
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm font-medium"
                >
                  Editar Página
                </Link>

                {landingPageInfo?.slug && landingPageInfo?.isPublished && (
                  <button
                    onClick={handleViewPublicPage}
                    className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-center text-sm font-medium"
                  >
                    Ver Página Pública
                  </button>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Acciones Rápidas
              </h2>
              <div className="space-y-3">
                <Link
                  href="/appointments"
                  className="flex items-center space-x-3 p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                >
                  <PlusIcon className="h-5 w-5 text-indigo-600" />
                  <span className="text-indigo-700 font-medium">
                    Nueva Cita
                  </span>
                </Link>

                <Link
                  href="/clientes"
                  className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <UsersIcon className="h-5 w-5 text-green-600" />
                  <span className="text-green-700 font-medium">
                    Ver Clientes
                  </span>
                </Link>

                <Link
                  href="/ingresos"
                  className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                >
                  <CreditCardIcon className="h-5 w-5 text-purple-600" />
                  <span className="text-purple-700 font-medium">
                    Revisar Ingresos
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {renderCustomerModal()}
    </div>
  );
}

// Componente principal exportado
export default function Home() {
  return (
    <>
      <SignedOut>
        <UnauthenticatedHome />
      </SignedOut>
      <SignedIn>
        <AuthenticatedDashboard />
      </SignedIn>
    </>
  );
}
