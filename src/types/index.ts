// ============================================================================
// TIPOS COMPARTIDOS - Mi Agenda Online
// ============================================================================

// 📊 ESTADÍSTICAS Y MÉTRICAS
export interface Stats {
  appointmentsToday: number;
  totalClients: number;
  monthlyIncome: number;
  pendingAppointments: number;
}

export interface IncomeData {
  totalThisMonth: number;
  totalLastMonth: number;
  totalThisYear: number;
  growthPercentage: number;
  averageMonthly: number;
  appointmentsThisMonth: number;
  pendingAppointments: number;
  futureAppointments: number;
}

export interface ClientMetrics {
  id: string;
  name: string;
  totalIncome: number;
  appointmentCount: number;
  averagePerMonth: number;
  lastAppointment: string | null;
  growthTrend: "up" | "down" | "stable";
}

// 📅 CITAS Y APPOINTMENTS
export interface Appointment {
  id: string;
  date: string;
  duration: number;
  status: AppointmentStatus;
  notes?: string;
  internalComment?: string;
  internalPrice?: number;
  publicPrice?: number;
  customer: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

export interface AppointmentIncome extends Appointment {
  income: number;
}

export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED", 
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

// 👥 CLIENTES Y CUSTOMERS
export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  createdAt: string;
  _count?: {
    appointments: number;
  };
  appointments?: Appointment[];
  totalIncome?: number;
  averageAppointmentsPerMonth?: number;
  lastAppointment?: string | null;
}

export interface CustomerDetail extends Customer {
  appointments: Appointment[];
  totalIncome: number;
  averageAppointmentsPerMonth: number;
  lastAppointment: string | null;
}

// 🌐 LANDING PAGE Y SERVICIOS
export interface Service {
  id: string;
  name: string;
  description: string;
  price?: string;
  duration?: number;
  bufferTime?: number;
}

export interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

export interface LandingPageData {
  professionalName: string;
  title: string;
  tagline: string;
  description: string;
  profileImage?: string;
  coverImage?: string;
  logo?: string;
  services: Service[];
  showCalendar: boolean;
  calendarDescription: string;
  appointmentDuration: number;
  bufferTime: number;
  buttonText: string;
  requirePayment: boolean;
  formFields: FormField[];
  colorScheme: string;
  slug: string;
  isPublished: boolean;
  // Contacto
  whatsapp?: string;
  instagram?: string;
  contactEmail?: string;
  // SEO
  metaTitle?: string;
  metaDescription?: string;
}

export interface LandingPageInfo {
  slug?: string;
  isPublished?: boolean;
}

// 📅 CALENDARIO Y SLOTS
export interface AvailableDay {
  date: string;
  slots: string[];
}

export interface TimeSlot {
  time: string;
  available: boolean;
  reason?: string;
}

// 🎨 UI Y COMPONENTES
export interface ColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent?: string;
}

export interface StatusConfig {
  status: string;
  color: string;
  text: string;
}

// 📱 FORMULARIOS
export interface AppointmentFormData {
  customerId: string;
  date: string;
  time: string;
  duration: number;
  notes: string;
  internalComment?: string;
  publicPrice?: number;
  internalPrice?: number;
  status?: AppointmentStatus;
}

export interface CustomerFormData {
  name: string;
  email: string;
  phone: string;
}

export interface NewAppointmentData {
  date: string;
  time: string;
  duration: number;
  notes: string;
}

// 🔔 NOTIFICACIONES
export interface Notification {
  id: string;
  type: "EMAIL" | "WHATSAPP" | "SYSTEM";
  message: string;
  read: boolean;
  createdAt: string;
}

// 💳 PAGOS Y PLANES
export interface Plan {
  id: string;
  name: string;
  price: number;
  whatsappQuota: number;
  emailQuota: number;
  features: string;
}

export interface Payment {
  id: string;
  amount: number;
  status: "PENDING" | "PAID" | "FAILED";
  paymentDate: string;
  createdAt: string;
}

// 🔧 UTILIDADES Y FILTROS
export type ViewMode = "today" | "week" | "month" | "custom";
export type CalendarViewMode = "month" | "week" | "day";
export type SortBy = "name" | "appointments" | "lastVisit" | "revenue" | "date" | "income" | "client";
export type FilterBy = "all" | "active" | "inactive";
export type PeriodType = "month" | "quarter" | "year";
export type IncomeViewMode = "overview" | "history" | "clients" | "projections";

// 🎯 PROPS DE COMPONENTES
export interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: number;
    direction: "up" | "down";
  };
  color?: "blue" | "green" | "purple" | "orange" | "red";
}

export interface AppointmentCardProps {
  appointment: Appointment;
  onClick?: (appointment: Appointment) => void;
  showCustomer?: boolean;
  compact?: boolean;
}

export interface CustomerCardProps {
  customer: Customer;
  onClick?: (customer: Customer) => void;
  onEdit?: (customer: Customer) => void;
  onDelete?: (customer: Customer) => void;
  onWhatsApp?: (customer: Customer) => void;
  showMetrics?: boolean;
  compact?: boolean;
  showActions?: boolean;
  showContactInfo?: boolean;
  showStats?: boolean;
}

export interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  className?: string;
}

export interface EmptyStateProps {
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  actionLabel?: string;
  onAction?: () => void;
}

// 🔄 ESTADOS DE CARGA Y ERROR
export interface LoadingState {
  isLoading: boolean;
  error?: string | null;
}

export interface AsyncState<T> extends LoadingState {
  data: T | null;
} 