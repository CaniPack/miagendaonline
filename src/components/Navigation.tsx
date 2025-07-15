"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarIcon,
  PlusIcon,
  UsersIcon,
  HomeIcon,
  TrendingUpIcon,
  GlobeIcon,
  SettingsIcon,
} from "lucide-react";
import { UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { useAuthUser } from "@/hooks/useAuthUser";
import NotificationBell from "@/components/NotificationBell";

const navigationItems = [
  { name: "Dashboard", href: "/", icon: HomeIcon },
  { name: "Calendario", href: "/calendario", icon: CalendarIcon },
  { name: "Citas", href: "/appointments", icon: PlusIcon },
  { name: "Clientes", href: "/clientes", icon: UsersIcon },
  { name: "Ingresos", href: "/ingresos", icon: TrendingUpIcon },
  { name: "Mi web", href: "/mi-pagina-web", icon: GlobeIcon },
  { name: "Configuración", href: "/configuracion", icon: SettingsIcon },
];

export default function Navigation() {
  const { user, isLoaded } = useAuthUser();
  const pathname = usePathname();

  if (!isLoaded) {
    return (
      <header className="bg-white shadow-lg border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <h1 className="text-2xl font-extrabold text-green-600 tracking-tight">
              OntheDot
            </h1>
          </div>

          {/* Navigation Links - Only show when signed in */}
          <SignedIn>
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-indigo-100 text-indigo-700"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </SignedIn>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <SignedIn>
              <NotificationBell />

              {/* User Info */}
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
                <UserButton
                  afterSignOutUrl="/sign-in"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              </div>
            </SignedIn>

            <SignedOut>
              <SignInButton mode="modal">
                <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                  Iniciar Sesión
                </button>
              </SignInButton>
            </SignedOut>
          </div>
        </div>

        {/* Mobile Navigation - Only show when signed in */}
        <SignedIn>
          <div className="md:hidden border-t border-gray-200 pt-4 pb-3">
            {/* First row with 4 main items */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {navigationItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-green-50 text-green-700 shadow-sm border border-green-200"
                        : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                    }`}
                  >
                    <Icon className={`h-6 w-6 mb-1 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
                    <span className="text-center leading-tight">{item.name}</span>
                  </Link>
                );
              })}
            </div>
            
            {/* Second row with remaining 3 items centered */}
            <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
              {navigationItems.slice(4).map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl text-xs font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-green-50 text-green-700 shadow-sm border border-green-200"
                        : "text-gray-600 hover:text-green-600 hover:bg-green-50"
                    }`}
                  >
                    <Icon className={`h-6 w-6 mb-1 ${isActive ? 'text-green-600' : 'text-gray-500'}`} />
                    <span className="text-center leading-tight">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </SignedIn>
      </div>
    </header>
  );
}
