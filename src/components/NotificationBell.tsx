"use client";

import { useState, useEffect } from "react";
import { Bell, X, CheckCheck } from "lucide-react";

interface Notification {
  id: string;
  type: "EMAIL" | "WHATSAPP" | "SYSTEM";
  message: string;
  read: boolean;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [hasNetworkError, setHasNetworkError] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 60 seconds (reduced from 30s to be less aggressive)
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async (isRetry = false) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // Increased to 15s timeout
      
      const response = await fetch("/api/notifications", {
        signal: controller.signal,
        cache: 'no-cache',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        // Ensure data is an array
        const notificationsArray = Array.isArray(data) ? data : [];
        setNotifications(notificationsArray);
        setUnreadCount(notificationsArray.filter((n: Notification) => !n.read).length);
        // Reset retry count on success
        setRetryCount(0);
        setHasNetworkError(false);
      } else {
        console.error("Error al cargar notificaciones:", response.status, response.statusText);
        // Don't clear existing notifications on error, just log it
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          console.warn("Petición de notificaciones cancelada por timeout");
        } else if (error.message === 'Failed to fetch') {
          console.warn("Error de red al cargar notificaciones (posible interferencia de extensión del navegador)");
          
          // Implement retry logic for fetch failures
          if (!isRetry && retryCount < 3) {
            setRetryCount(prev => prev + 1);
            setHasNetworkError(true);
            setTimeout(() => {
              console.log(`Reintentando petición de notificaciones (intento ${retryCount + 1}/3)`);
              fetchNotifications(true);
            }, 2000 * (retryCount + 1)); // Exponential backoff
            return;
          }
          
          // Set network error if retries exhausted
          setHasNetworkError(true);
          
          // Try a fallback request without AbortController if it's a fetch failure
          try {
            const fallbackResponse = await fetch("/api/notifications", {
              cache: 'no-cache',
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
            });
            if (fallbackResponse.ok) {
              const data = await fallbackResponse.json();
              const notificationsArray = Array.isArray(data) ? data : [];
              setNotifications(notificationsArray);
              setUnreadCount(notificationsArray.filter((n: Notification) => !n.read).length);
              setRetryCount(0);
              setHasNetworkError(false);
            }
          } catch (fallbackError) {
            console.error("Error en petición de respaldo:", fallbackError);
          }
        } else {
          console.error("Error al cargar notificaciones:", error);
        }
      } else {
        console.error("Error desconocido al cargar notificaciones:", error);
      }
    }
  };

  const markAsRead = async (notificationIds: string[]) => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ notificationIds }),
      });

      if (response.ok) {
        await fetchNotifications();
      } else {
        console.error("Error al marcar como leída:", response.status, response.statusText);
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Failed to fetch') {
        console.warn("Error de red al marcar notificación como leída");
      } else {
        console.error("Error al marcar como leída:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/notifications", {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (response.ok) {
        await fetchNotifications();
      } else {
        console.error("Error al marcar todas como leídas:", response.status, response.statusText);
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'Failed to fetch') {
        console.warn("Error de red al marcar todas las notificaciones como leídas");
      } else {
        console.error("Error al marcar todas como leídas:", error);
      }
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "EMAIL":
        return "📧";
      case "WHATSAPP":
        return "💬";
      case "SYSTEM":
        return "🔔";
      default:
        return "📢";
    }
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const notificationDate = new Date(dateString);
    const diffMs = now.getTime() - notificationDate.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Ahora";
    if (diffMins < 60) return `${diffMins}m`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h`;
    return `${Math.floor(diffMins / 1440)}d`;
  };

  return (
    <div className="relative">
      {/* Bell Icon */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className={`relative p-2 transition-colors ${
          hasNetworkError 
            ? 'text-red-500 hover:text-red-600 hover:bg-red-50' 
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
        } rounded-lg`}
        title={hasNetworkError ? 'Error de conexión de red' : 'Notificaciones'}
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
        {hasNetworkError && unreadCount === 0 && (
          <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            !
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-900">Notificaciones</h3>
              {unreadCount > 0 && (
                <span className="bg-red-100 text-red-600 text-xs px-2 py-1 rounded-full">
                  {unreadCount} nuevas
                </span>
              )}
              {hasNetworkError && (
                <span className="bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full">
                  Error de conexión
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasNetworkError && (
                <button
                  onClick={() => {
                    setRetryCount(0);
                    setHasNetworkError(false);
                    fetchNotifications();
                  }}
                  disabled={loading}
                  className="text-orange-600 hover:text-orange-700 text-sm px-2 py-1 rounded border border-orange-300 hover:bg-orange-50"
                  title="Reintentar conexión"
                >
                  Reintentar
                </button>
              )}
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  disabled={loading}
                  className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1"
                  title="Marcar todas como leídas"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setShowDropdown(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No hay notificaciones</p>
              </div>
            ) : (
              <div className="py-2">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`px-4 py-3 hover:bg-gray-50 border-b border-gray-100 cursor-pointer ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                    onClick={() =>
                      !notification.read && markAsRead([notification.id])
                    }
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-lg">
                        {getTypeIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            !notification.read
                              ? "font-medium text-gray-900"
                              : "text-gray-700"
                          }`}
                        >
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-xs text-gray-500">
                            {getTimeAgo(notification.createdAt)}
                          </p>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  setShowDropdown(false);
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700"
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
}
