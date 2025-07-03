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
  XIcon,
} from "lucide-react";
import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useAuthUser } from "@/hooks/useAuthUser";
import { useToast } from "@/components/ToastProvider";
import Navigation from "@/components/Navigation";
import { useState, useEffect } from "react";

// shadcn/ui components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

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
            <Card>
              <CardHeader className="text-center">
                <CalendarIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <CardTitle>Gestión de Citas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Organiza tu calendario, confirma citas y evita conflictos de
                  horarios
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <UsersIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <CardTitle>Base de Clientes</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Mantén un registro completo de tus clientes y su historial
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="text-center">
                <BriefcaseIcon className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
                <CardTitle>Página Web Personal</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Crea tu página web profesional para recibir citas online
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <SignInButton mode="modal">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700">
                Iniciar Sesión
              </Button>
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
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  useEffect(() => {
    if (isLoaded) {
      if (user?.id) {
        fetchDashboardData();
        fetchLandingPageInfo();
      } else {
        setLoading(false);
        console.log("👤 User not authenticated - skipping data fetch");
      }
    }
  }, [isLoaded, user]);

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
      const parseJsonSafely = async (response: Response, name: string) => {
        const text = await response.text();
        if (!text) {
          console.warn(`⚠️ ${name} response is empty`);
          return null;
        }
        try {
          return JSON.parse(text);
        } catch (error) {
          console.error(`❌ ${name} - Error parsing JSON:`, error);
          console.log(`Raw response: ${text.substring(0, 200)}...`);
          return null;
        }
      };

      const [statsRes, todayRes, weekRes, monthRes] = await Promise.all([
        fetch("/api/appointments?stats=true"),
        fetch("/api/appointments?period=today"),
        fetch("/api/appointments?period=week"),
        fetch("/api/appointments?period=month"),
      ]);

      const statsData = await parseJsonSafely(statsRes, "Stats");
      const todayData = await parseJsonSafely(todayRes, "Today");
      const weekData = await parseJsonSafely(weekRes, "Week");
      const monthData = await parseJsonSafely(monthRes, "Month");

      if (statsData) {
        setStats(statsData);
      }
      if (todayData) {
        setTodayAppointments(todayData.appointments || []);
      }
      if (weekData) {
        setWeekAppointments(weekData.appointments || []);
      }
      if (monthData) {
        setMonthAppointments(monthData.appointments || []);
      }
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
      console.error("Error fetching landing page info:", error);
    }
  };

  const handleViewPublicPage = () => {
    if (landingPageInfo?.slug) {
      window.open(`/p/${landingPageInfo.slug}`, "_blank");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
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

  const handleFilterChange = (filterType: string) => {
    setSelectedFilter(filterType);
    setShowDatePicker(false);

    if (filterType === "custom") {
      setShowDatePicker(true);
      setCurrentView("custom");
      return;
    }

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
      default:
        if (filterType.includes("days") || filterType.includes("months")) {
          setCurrentView("custom");
          const days =
            filterType === "7days"
              ? 7
              : filterType === "15days"
              ? 15
              : filterType === "28days"
              ? 28
              : filterType === "6months"
              ? 180
              : 7;
          fetchCustomPeriodAppointments(days);
        }
        break;
    }
  };

  const fetchCustomPeriodAppointments = async (days: number) => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/appointments?period=custom&days=${days}`
      );
      if (response.ok) {
        const data = await response.json();
        setCustomAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error fetching custom period appointments:", error);
    } finally {
      setLoading(false);
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
        return "Próximos 7 días";
      case "15days":
        return "Próximos 15 días";
      case "28days":
        return "Próximos 28 días";
      case "6months":
        return "Próximos 6 meses";
      case "custom":
        return customStartDate && customEndDate
          ? `${customStartDate} - ${customEndDate}`
          : "Rango personalizado";
      default:
        return "Hoy";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL");
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
        <Alert className="mb-8 border-indigo-200 bg-indigo-50">
          <UserIcon className="h-4 w-4 text-indigo-600" />
          <AlertDescription className="text-indigo-800">
            <strong>¡Bienvenido, {user?.firstName || "Usuario"}!</strong>
            <br />
            <span className="text-indigo-700 text-sm">
              ✅ Sistema funcionando correctamente • 🔒 Sesión activa
            </span>
          </AlertDescription>
        </Alert>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Citas Hoy</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stats.appointmentsToday}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UsersIcon className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Clientes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stats.totalClients}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
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
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BellIcon className="h-8 w-8 text-orange-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">
                    Pendientes
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {loading ? "..." : stats.pendingAppointments}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Appointments Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <CardTitle className="text-2xl">Citas</CardTitle>
                    <Link
                      href="/appointments"
                      className="text-indigo-600 hover:text-indigo-700 text-sm font-medium"
                    >
                      Ver todas
                    </Link>
                  </div>

                  {/* Filter Controls */}
                  <div className="flex items-center space-x-4">
                    <Tabs
                      value={selectedFilter}
                      onValueChange={handleFilterChange}
                    >
                      <TabsList>
                        <TabsTrigger value="today">
                          Hoy
                          <Badge variant="secondary" className="ml-2">
                            {loading ? "..." : todayAppointments.length}
                          </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="week">
                          Semana
                          <Badge variant="secondary" className="ml-2">
                            {loading ? "..." : weekAppointments.length}
                          </Badge>
                        </TabsTrigger>
                        <TabsTrigger value="month">
                          Mes
                          <Badge variant="secondary" className="ml-2">
                            {loading ? "..." : monthAppointments.length}
                          </Badge>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>

                    <Select
                      value={selectedFilter}
                      onValueChange={handleFilterChange}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="Filtrar por período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="today">Hoy</SelectItem>
                        <SelectItem value="week">Esta Semana</SelectItem>
                        <SelectItem value="month">Este Mes</SelectItem>
                        <SelectItem value="7days">Próximos 7 días</SelectItem>
                        <SelectItem value="15days">Próximos 15 días</SelectItem>
                        <SelectItem value="28days">Próximos 28 días</SelectItem>
                        <SelectItem value="6months">
                          Próximos 6 meses
                        </SelectItem>
                        <SelectItem value="custom">
                          Rango personalizado...
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                {/* Custom Date Range Picker */}
                {showDatePicker && (
                  <Alert className="mb-6">
                    <AlertDescription>
                      <h4 className="font-medium mb-3">
                        Seleccionar rango de fechas
                      </h4>
                      <div className="flex items-center space-x-4">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Fecha inicio
                          </label>
                          <Input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => setCustomStartDate(e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">
                            Fecha fin
                          </label>
                          <Input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => setCustomEndDate(e.target.value)}
                          />
                        </div>
                        <div className="flex space-x-2 pt-4">
                          <Button
                            size="sm"
                            disabled={!customStartDate || !customEndDate}
                          >
                            Aplicar
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setShowDatePicker(false)}
                          >
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}

                {/* Current Filter Display */}
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    Mostrando:{" "}
                    <span className="font-medium text-gray-900">
                      {getFilterLabel()}
                    </span>
                    {currentView === "custom" && (
                      <Badge variant="outline" className="ml-2">
                        {getCurrentAppointments().length} citas
                      </Badge>
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
                        <Card key={appointment.id} className="p-4">
                          <div className="flex items-center justify-between">
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
                                <Button
                                  variant="link"
                                  className="font-semibold text-gray-900 hover:text-indigo-600 h-auto p-0"
                                >
                                  {appointment.customer.name}
                                </Button>
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
                              <Badge
                                className={getStatusColor(appointment.status)}
                              >
                                {getStatusText(appointment.status)}
                              </Badge>
                            </div>
                          </div>
                        </Card>
                      ))
                  ) : (
                    <div className="text-center py-12">
                      <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">
                        No hay citas para {getFilterLabel().toLowerCase()}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        No tienes citas programadas para este período.
                      </p>
                      <div className="mt-6">
                        <Button asChild>
                          <Link href="/appointments">
                            <PlusIcon className="h-4 w-4 mr-2" />
                            Nueva Cita
                          </Link>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* My Landing Page Section */}
            <Card>
              <CardHeader>
                <CardTitle>Mi Página Web</CardTitle>
                <CardDescription>
                  Crea tu landing page personalizada para recibir agendamientos.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Estado</span>
                    <Badge
                      variant={
                        landingPageInfo?.isPublished ? "default" : "secondary"
                      }
                    >
                      {landingPageInfo?.isPublished ? "Publicada" : "Borrador"}
                    </Badge>
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

                <Separator className="my-4" />

                <div className="flex flex-col space-y-2">
                  <Button asChild>
                    <Link href="/mi-pagina-web">Editar Página</Link>
                  </Button>

                  {landingPageInfo?.slug && landingPageInfo?.isPublished && (
                    <Button variant="outline" onClick={handleViewPublicPage}>
                      Ver Página Pública
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Acciones Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    asChild
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Link href="/appointments">
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Nueva Cita
                    </Link>
                  </Button>

                  <Button
                    asChild
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Link href="/clientes">
                      <UsersIcon className="h-4 w-4 mr-2" />
                      Ver Clientes
                    </Link>
                  </Button>

                  <Button
                    asChild
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Link href="/ingresos">
                      <CreditCardIcon className="h-4 w-4 mr-2" />
                      Revisar Ingresos
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

// Componente principal exportado
export default function IndexTest() {
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
