"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/components/ToastProvider";
import Navigation from "@/components/Navigation";
import {
  Calendar,
  Clock,
  User,
  Plus,
  Filter,
  Search,
  Edit,
  Trash2,
  Mail,
  Phone,
  Briefcase,
  Lock,
  X,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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

interface Appointment {
  id: string;
  date: string;
  duration: number;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes?: string;
  customer: Customer;
}

export default function AppointmentsPage() {
  const { showSuccess, showError } = useToast();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] =
    useState<Appointment | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Estados para crear nuevo cliente
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  // Form state
  const [formData, setFormData] = useState({
    customerId: "",
    date: "",
    time: "",
    duration: 60,
    notes: "",
  });

  // Calendar state for modal
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedDateForTimeView, setSelectedDateForTimeView] =
    useState<Date | null>(null);
  const [showTimeBlocks, setShowTimeBlocks] = useState(false);

  // Customer modal states
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  // Conflict modal states
  const [showConflictModal, setShowConflictModal] = useState(false);
  const [conflictingAppointments, setConflictingAppointments] = useState<
    Appointment[]
  >([]);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [pendingSubmit, setPendingSubmit] = useState(false);

  useEffect(() => {
    fetchAppointments();
    fetchCustomers();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch("/api/appointments");
      if (response.ok) {
        const data = await response.json();
        setAppointments(data.appointments || []);
      }
    } catch (error) {
      console.error("Error al cargar citas:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch("/api/customers");
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers || []);
      }
    } catch (error) {
      console.error("Error al cargar clientes:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Detectar conflictos de horarios
    const conflicts = detectTimeConflicts(
      formData.date,
      formData.time,
      formData.duration
    );

    // Si hay conflictos, mostrar modal de confirmación
    if (conflicts.length > 0) {
      setConflictingAppointments(conflicts);
      setShowConflictModal(true);
      setPendingSubmit(true);
      return; // Pausar el flujo hasta que el admin decida
    }

    // Continuar con el envío si no hay conflictos
    await submitAppointment();
  };

  const submitAppointment = async () => {
    const appointmentData = {
      customerId: formData.customerId,
      date: new Date(`${formData.date}T${formData.time}`).toISOString(),
      duration: formData.duration,
      status: "PENDING",
      notes: formData.notes,
    };

    try {
      const url = editingAppointment
        ? `/api/appointments/${editingAppointment.id}`
        : "/api/appointments";
      const method = editingAppointment ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentData),
      });

      if (response.ok) {
        await fetchAppointments();
        setShowForm(false);
        resetForm();
        const successMessage =
          conflictingAppointments.length > 0
            ? "Cita guardada con solapamiento"
            : editingAppointment
            ? "La cita se ha actualizado exitosamente"
            : "La cita se ha creado exitosamente";

        showSuccess(
          editingAppointment ? "¡Cita actualizada!" : "¡Cita creada!",
          successMessage
        );
      } else {
        const error = await response.json();
        showError(
          "Error al guardar",
          error.error || "No se pudo guardar la cita"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showError("Error de conexión", "No se pudo conectar con el servidor");
    } finally {
      // Limpiar estados del modal
      setShowConflictModal(false);
      setConflictingAppointments([]);
      setPendingSubmit(false);
    }
  };

  const handleConfirmConflict = async () => {
    await submitAppointment();
  };

  const handleCancelConflict = () => {
    setShowConflictModal(false);
    setConflictingAppointments([]);
    setPendingSubmit(false);
  };

  const handleEdit = (appointment: Appointment) => {
    const appointmentDate = new Date(appointment.date);
    // Usar zona horaria local para evitar problemas de conversión
    const year = appointmentDate.getFullYear();
    const month = String(appointmentDate.getMonth() + 1).padStart(2, "0");
    const day = String(appointmentDate.getDate()).padStart(2, "0");
    const hours = String(appointmentDate.getHours()).padStart(2, "0");
    const minutes = String(appointmentDate.getMinutes()).padStart(2, "0");

    setFormData({
      customerId: appointment.customer.id,
      date: `${year}-${month}-${day}`,
      time: `${hours}:${minutes}`,
      duration: appointment.duration,
      notes: appointment.notes || "",
    });
    setEditingAppointment(appointment);

    // Configurar el calendario para mostrar la fecha de la cita
    const dateForCalendar = new Date(
      year,
      appointmentDate.getMonth(),
      appointmentDate.getDate()
    );
    setCurrentCalendarDate(new Date(appointmentDate));
    setSelectedDateForTimeView(dateForCalendar);
    setShowTimeBlocks(true);

    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta cita?")) return;

    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchAppointments();
        showSuccess("¡Cita eliminada!", "La cita se ha eliminado exitosamente");
      } else {
        const error = await response.json();
        showError(
          "Error al eliminar",
          error.error || "No se pudo eliminar la cita"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showError("Error de conexión", "No se pudo conectar con el servidor");
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: "",
      date: "",
      time: "",
      duration: 60,
      notes: "",
    });
    setEditingAppointment(null);
    setSelectedDateForTimeView(null);
    setShowTimeBlocks(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "CONFIRMED":
        return "bg-green-100 text-green-800";
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
      case "PENDING":
        return "Pendiente";
      case "CONFIRMED":
        return "Confirmada";
      case "CANCELLED":
        return "Cancelada";
      case "COMPLETED":
        return "Completada";
      default:
        return status;
    }
  };

  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.customer.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      appointment.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

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
        setShowCustomerModal(true);
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

  const calculateCustomerIncome = (appointments: Customer["appointments"]) => {
    if (!appointments) return 0;
    return appointments
      .filter((apt) => apt.status === "COMPLETED")
      .reduce(
        (total, apt) => total + (apt.publicPrice || apt.internalPrice || 45000),
        0
      );
  };

  const getLastAppointmentDate = (appointments: Customer["appointments"]) => {
    if (!appointments || appointments.length === 0) return null;
    const lastApt = appointments.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )[0];
    return lastApt.date;
  };

  const calculateAverageAppointments = (
    appointments: Customer["appointments"]
  ) => {
    if (!appointments || appointments.length === 0) return 0;
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CL", {
      style: "currency",
      currency: "CLP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-CL");
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderCustomerModal = () => {
    if (!selectedCustomer) return null;

    const customerStatus = getCustomerStatus(selectedCustomer);

    const handleCloseModal = () => {
      setShowCustomerModal(false);
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
                  <User className="h-6 w-6 text-indigo-600" />
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
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        {selectedCustomer.name}
                      </span>
                    </div>
                    {selectedCustomer.email && (
                      <div className="flex items-center space-x-3">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {selectedCustomer.email}
                        </span>
                      </div>
                    )}
                    {selectedCustomer.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {selectedCustomer.phone}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-gray-400" />
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
                    <Briefcase className="h-5 w-5 text-indigo-600" />
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
                                  <Lock className="h-3 w-3 text-yellow-600 mt-0.5 flex-shrink-0" />
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
                                        <Lock className="h-3 w-3 inline mr-1" />
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

  // Calendar functions for modal
  const getCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const current = new Date(startDate);

    for (let i = 0; i < 42; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }

    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return appointments.filter(
      (apt) => new Date(apt.date).toDateString() === dateStr
    );
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isSameMonth = (date: Date, month: Date) => {
    return (
      date.getMonth() === month.getMonth() &&
      date.getFullYear() === month.getFullYear()
    );
  };

  const isSelectedDate = (date: Date) => {
    if (!formData.date) return false;
    const selectedDate = new Date(formData.date);
    return date.toDateString() === selectedDate.toDateString();
  };

  const handleDateClick = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date >= today) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      setFormData({ ...formData, date: `${year}-${month}-${day}` });
      setSelectedDateForTimeView(date);
      setShowTimeBlocks(true);
    }
  };

  // Generar bloques de tiempo (cada 30 minutos de 8:00 a 20:00)
  const generateTimeBlocks = () => {
    const blocks = [];
    for (let hour = 8; hour <= 20; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 20 && minute > 0) break; // Terminar a las 20:00
        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        blocks.push({
          time: timeString,
          hour,
          minute,
        });
      }
    }
    return blocks;
  };

  // Verificar si un bloque de tiempo está ocupado
  const isTimeBlockOccupied = (date: Date, hour: number, minute: number) => {
    if (!selectedDateForTimeView) return false;

    const blockStart = new Date(date);
    blockStart.setHours(hour, minute, 0, 0);
    const blockEnd = new Date(blockStart);
    blockEnd.setMinutes(blockEnd.getMinutes() + 30);

    return appointments.some((apt) => {
      if (editingAppointment && apt.id === editingAppointment.id) return false; // Excluir la cita que se está editando

      const aptDate = new Date(apt.date);
      if (aptDate.toDateString() !== date.toDateString()) return false;

      const aptStart = new Date(aptDate);
      const aptEnd = new Date(aptDate);
      aptEnd.setMinutes(aptEnd.getMinutes() + apt.duration);

      // Verificar solapamiento
      return aptStart < blockEnd && aptEnd > blockStart;
    });
  };

  // Obtener citas en un bloque específico
  const getAppointmentsInTimeBlock = (
    date: Date,
    hour: number,
    minute: number
  ) => {
    if (!selectedDateForTimeView) return [];

    const blockStart = new Date(date);
    blockStart.setHours(hour, minute, 0, 0);
    const blockEnd = new Date(blockStart);
    blockEnd.setMinutes(blockEnd.getMinutes() + 30);

    return appointments.filter((apt) => {
      if (editingAppointment && apt.id === editingAppointment.id) return false;

      const aptDate = new Date(apt.date);
      if (aptDate.toDateString() !== date.toDateString()) return false;

      const aptStart = new Date(aptDate);
      const aptEnd = new Date(aptDate);
      aptEnd.setMinutes(aptEnd.getMinutes() + apt.duration);

      return aptStart < blockEnd && aptEnd > blockStart;
    });
  };

  // Detectar conflictos de horarios
  const detectTimeConflicts = (
    selectedDate: string,
    selectedTime: string,
    duration: number
  ) => {
    if (!selectedDate || !selectedTime) return [];

    const newAptStart = new Date(`${selectedDate}T${selectedTime}`);
    const newAptEnd = new Date(newAptStart);
    newAptEnd.setMinutes(newAptEnd.getMinutes() + duration);

    return appointments.filter((apt) => {
      if (editingAppointment && apt.id === editingAppointment.id) return false;

      const aptDate = new Date(apt.date);
      const aptStart = new Date(aptDate);
      const aptEnd = new Date(aptDate);
      aptEnd.setMinutes(aptEnd.getMinutes() + apt.duration);

      // Verificar solapamiento
      return aptStart < newAptEnd && aptEnd > newAptStart;
    });
  };

  // Manejar selección de bloque de tiempo
  const handleTimeBlockClick = (hour: number, minute: number) => {
    const timeString = `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
    setFormData({ ...formData, time: timeString });
  };

  const navigateCalendar = (direction: "prev" | "next") => {
    setCurrentCalendarDate((prev) => {
      const newDate = new Date(prev);
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const handleCreateNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomerData),
      });

      if (response.ok) {
        const newCustomer = await response.json();
        await fetchCustomers(); // Actualizar la lista de clientes
        setFormData({ ...formData, customerId: newCustomer.id }); // Seleccionar automáticamente el nuevo cliente
        setShowNewCustomerModal(false);
        setNewCustomerData({ name: "", email: "", phone: "" }); // Limpiar formulario
        showSuccess(
          "¡Cliente creado!",
          "El cliente se ha creado y seleccionado automáticamente"
        );
      } else {
        const error = await response.json();
        showError(
          "Error al crear cliente",
          error.error || "No se pudo crear el cliente"
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showError("Error de conexión", "No se pudo conectar con el servidor");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-24">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando citas...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-blue-600" />
                Gestión de Citas
              </h1>
              <p className="text-gray-600 mt-1">
                Administra todas tus citas y appointments
              </p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Nueva Cita
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar por cliente o notas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todos los estados</option>
                <option value="PENDING">Pendiente</option>
                <option value="CONFIRMED">Confirmada</option>
                <option value="CANCELLED">Cancelada</option>
                <option value="COMPLETED">Completada</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Citas */}
        <div className="bg-white rounded-lg shadow-sm">
          {filteredAppointments.length === 0 ? (
            <div className="p-8 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No hay citas que mostrar</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-700"
              >
                Crear tu primera cita
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha y Hora
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Duración
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notas
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-8 h-8 text-gray-400 mr-3" />
                          <div>
                            <button
                              onClick={() =>
                                openCustomerDetailsByName(
                                  appointment.customer.name
                                )
                              }
                              className="text-gray-900 hover:text-indigo-600 transition-colors cursor-pointer"
                            >
                              {appointment.customer.name}
                            </button>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {new Date(appointment.date).toLocaleDateString(
                            "es-ES",
                            {
                              weekday: "short",
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            }
                          )}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(appointment.date).toLocaleTimeString(
                            "es-ES",
                            {
                              hour: "2-digit",
                              minute: "2-digit",
                            }
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Clock className="w-4 h-4 mr-1 text-gray-400" />
                          {appointment.duration} min
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            appointment.status
                          )}`}
                        >
                          {getStatusText(appointment.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-xs truncate">
                          {appointment.notes || "Sin notas"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(appointment)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(appointment.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Formulario */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowForm(false);
            resetForm();
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingAppointment ? "Editar Cita" : "Nueva Cita"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    resetForm();
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Formulario */}
                <div>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-sm font-medium text-gray-700">
                          Cliente
                        </label>
                        <button
                          type="button"
                          onClick={() => setShowNewCustomerModal(true)}
                          className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Nuevo Cliente
                        </button>
                      </div>
                      <select
                        value={formData.customerId}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            customerId: e.target.value,
                          })
                        }
                        required
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="" className="text-gray-500">
                          Seleccionar cliente
                        </option>
                        {customers.map((customer) => (
                          <option
                            key={customer.id}
                            value={customer.id}
                            className="text-gray-900"
                          >
                            {customer.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Fecha
                        </label>
                        <input
                          type="date"
                          value={formData.date}
                          onChange={(e) =>
                            setFormData({ ...formData, date: e.target.value })
                          }
                          required
                          min={new Date().toISOString().split("T")[0]}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Hora
                        </label>
                        <input
                          type="time"
                          value={formData.time}
                          onChange={(e) =>
                            setFormData({ ...formData, time: e.target.value })
                          }
                          required
                          step="900"
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duración (minutos)
                      </label>
                      <select
                        value={formData.duration}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            duration: parseInt(e.target.value),
                          })
                        }
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value={30} className="text-gray-900">
                          30 minutos
                        </option>
                        <option value={60} className="text-gray-900">
                          1 hora
                        </option>
                        <option value={90} className="text-gray-900">
                          1.5 horas
                        </option>
                        <option value={120} className="text-gray-900">
                          2 horas
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas (opcional)
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) =>
                          setFormData({ ...formData, notes: e.target.value })
                        }
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 resize-none"
                        placeholder="Detalles adicionales sobre la cita..."
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForm(false);
                          resetForm();
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                      >
                        {editingAppointment ? "Actualizar" : "Crear"} Cita
                      </button>
                    </div>
                  </form>
                </div>

                {/* Calendario */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Calendario
                    </h3>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => navigateCalendar("prev")}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="text-sm font-medium min-w-[120px] text-center">
                        {currentCalendarDate.toLocaleDateString("es-ES", {
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigateCalendar("next")}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {/* Días de la semana */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"].map(
                      (day) => (
                        <div
                          key={day}
                          className="p-2 text-xs font-medium text-gray-500 text-center"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  {/* Días del calendario */}
                  <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays(currentCalendarDate).map((date, index) => {
                      const appointmentsForDate = getAppointmentsForDate(date);
                      const isCurrentMonth = isSameMonth(
                        date,
                        currentCalendarDate
                      );
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      const isPastDate = date < today;
                      const isSelected = isSelectedDate(date);
                      const isTodayDate = isToday(date);

                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => handleDateClick(date)}
                          disabled={isPastDate}
                          className={`
                            relative p-2 text-sm rounded hover:bg-blue-50 transition-colors
                            ${
                              isCurrentMonth ? "text-gray-900" : "text-gray-400"
                            }
                            ${
                              isTodayDate
                                ? "bg-blue-100 text-blue-700 font-medium"
                                : ""
                            }
                            ${
                              isSelected
                                ? "bg-blue-500 text-white hover:bg-blue-600"
                                : ""
                            }
                            ${
                              isPastDate
                                ? "opacity-50 cursor-not-allowed"
                                : "cursor-pointer"
                            }
                            ${
                              appointmentsForDate.length > 0 && !isSelected
                                ? "bg-green-100"
                                : ""
                            }
                          `}
                        >
                          <span>{date.getDate()}</span>
                          {appointmentsForDate.length > 0 && (
                            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 flex space-x-0.5">
                              <div
                                className={`w-1 h-1 rounded-full ${
                                  isSelected ? "bg-white" : "bg-green-600"
                                }`}
                              />
                              {appointmentsForDate.length > 1 && (
                                <div
                                  className={`w-1 h-1 rounded-full ${
                                    isSelected ? "bg-white" : "bg-green-600"
                                  }`}
                                />
                              )}
                              {appointmentsForDate.length > 2 && (
                                <div
                                  className={`w-1 h-1 rounded-full ${
                                    isSelected ? "bg-white" : "bg-green-600"
                                  }`}
                                />
                              )}
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Vista de bloques de tiempo */}
                  {showTimeBlocks && selectedDateForTimeView && (
                    <div className="mt-4 p-3 bg-white rounded-lg border">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">
                          Disponibilidad -{" "}
                          {selectedDateForTimeView.toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </h4>
                        <button
                          type="button"
                          onClick={() => setShowTimeBlocks(false)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Ocultar horarios
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-1 max-h-64 overflow-y-auto">
                        {generateTimeBlocks().map((block) => {
                          const isOccupied = isTimeBlockOccupied(
                            selectedDateForTimeView,
                            block.hour,
                            block.minute
                          );
                          const appointments = getAppointmentsInTimeBlock(
                            selectedDateForTimeView,
                            block.hour,
                            block.minute
                          );
                          const isSelectedTime = formData.time === block.time;

                          return (
                            <button
                              key={block.time}
                              type="button"
                              onClick={() =>
                                handleTimeBlockClick(block.hour, block.minute)
                              }
                              className={`
                                p-2 text-xs rounded border transition-colors text-left
                                ${
                                  isSelectedTime
                                    ? "bg-blue-500 text-white border-blue-600"
                                    : ""
                                }
                                ${
                                  isOccupied && !isSelectedTime
                                    ? "bg-red-100 border-red-300 text-red-700"
                                    : ""
                                }
                                ${
                                  !isOccupied && !isSelectedTime
                                    ? "bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                                    : ""
                                }
                              `}
                            >
                              <div className="font-medium">{block.time}</div>
                              {appointments.length > 0 && (
                                <div className="text-[10px] mt-1 truncate">
                                  {appointments[0].customer.name}
                                  {appointments.length > 1 &&
                                    ` +${appointments.length - 1}`}
                                </div>
                              )}
                              {appointments.length === 0 && (
                                <div className="text-[10px] mt-1 text-gray-500">
                                  Disponible
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </div>

                      <div className="mt-3 flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
                          <span>Disponible</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-red-100 border border-red-300 rounded"></div>
                          <span>Ocupado</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-3 h-3 bg-blue-500 rounded"></div>
                          <span>Seleccionado</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Información de la fecha seleccionada (versión simplificada) */}
                  {formData.date && !showTimeBlocks && (
                    <div className="mt-4 p-3 bg-white rounded-lg border">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Citas para{" "}
                        {new Date(
                          formData.date + "T00:00:00"
                        ).toLocaleDateString("es-ES", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </h4>
                      {(() => {
                        const selectedDate = new Date(
                          formData.date + "T00:00:00"
                        );
                        const dayAppointments =
                          getAppointmentsForDate(selectedDate);

                        if (dayAppointments.length === 0) {
                          return (
                            <p className="text-sm text-gray-500">
                              No hay citas programadas
                            </p>
                          );
                        }

                        return (
                          <div className="space-y-2">
                            {dayAppointments.map((apt) => (
                              <div
                                key={apt.id}
                                className="flex justify-between items-center text-xs"
                              >
                                <span className="font-medium">
                                  {apt.customer.name}
                                </span>
                                <span className="text-gray-500">
                                  {formatTime(apt.date)} ({apt.duration} min)
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDateForTimeView(
                            new Date(formData.date + "T00:00:00")
                          );
                          setShowTimeBlocks(true);
                        }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700"
                      >
                        Ver disponibilidad horaria →
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Crear Nuevo Cliente */}
      {showNewCustomerModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={() => {
            setShowNewCustomerModal(false);
            setNewCustomerData({ name: "", email: "", phone: "" });
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Crear Nuevo Cliente
                </h2>
                <button
                  onClick={() => {
                    setShowNewCustomerModal(false);
                    setNewCustomerData({ name: "", email: "", phone: "" });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateNewCustomer} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre *
                  </label>
                  <input
                    type="text"
                    value={newCustomerData.name}
                    onChange={(e) =>
                      setNewCustomerData({
                        ...newCustomerData,
                        name: e.target.value,
                      })
                    }
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre completo del cliente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={newCustomerData.email}
                    onChange={(e) =>
                      setNewCustomerData({
                        ...newCustomerData,
                        email: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="correo@ejemplo.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={newCustomerData.phone}
                    onChange={(e) =>
                      setNewCustomerData({
                        ...newCustomerData,
                        phone: e.target.value,
                      })
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+56 9 1234 5678"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowNewCustomerModal(false);
                      setNewCustomerData({ name: "", email: "", phone: "" });
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!newCustomerData.name.trim()}
                    className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Crear Cliente
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Conflicto de Horarios */}
      <Dialog open={showConflictModal} onOpenChange={setShowConflictModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Conflicto de horarios
            </DialogTitle>
            <DialogDescription>Se solapará con:</DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            {conflictingAppointments.map((apt) => (
              <div
                key={apt.id}
                className="flex items-center justify-between p-2 border border-gray-200 rounded"
              >
                <div>
                  <div className="font-medium text-sm">{apt.customer.name}</div>
                  <div className="text-xs text-gray-500">
                    {formatTime(apt.date)} ({apt.duration} min)
                  </div>
                </div>
                <span
                  className={`px-2 py-1 text-xs rounded ${getStatusColor(
                    apt.status
                  )}`}
                >
                  {getStatusText(apt.status)}
                </span>
              </div>
            ))}
          </div>

          <DialogFooter className="gap-2 pt-4">
            <Button
              variant="outline"
              onClick={handleCancelConflict}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button onClick={handleConfirmConflict} className="flex-1">
              Continuar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {renderCustomerModal()}
    </div>
  );
}
