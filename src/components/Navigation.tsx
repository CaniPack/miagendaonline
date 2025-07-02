'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CalendarIcon, 
  UserIcon, 
  PlusIcon, 
  CreditCardIcon, 
  BellIcon, 
  UsersIcon,
  HomeIcon,
  TrendingUpIcon,
  SettingsIcon,
  GlobeIcon
} from "lucide-react";
import { UserButton } from '@clerk/nextjs';
import { useAuthUser } from '@/hooks/useAuthUser';
import NotificationBell from '@/components/NotificationBell';

const navigationItems = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Calendario', href: '/calendario', icon: CalendarIcon },
  { name: 'Citas', href: '/appointments', icon: PlusIcon },
  { name: 'Clientes', href: '/clientes', icon: UsersIcon },
  { name: 'Ingresos', href: '/ingresos', icon: TrendingUpIcon },
  { name: 'Mi Página Web', href: '/mi-pagina-web', icon: GlobeIcon },
];

export default function Navigation() {
  const { user, isLoaded } = useAuthUser();
  const pathname = usePathname();
  const isDevelopment = process.env.NODE_ENV === 'development';

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
            <CalendarIcon className="h-8 w-8 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Mi Agenda Online</h1>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
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
              {isDevelopment ? (
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">JP</span>
                </div>
              ) : (
                <UserButton afterSignOutUrl="/sign-in" />
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="md:hidden border-t border-gray-200 pt-4 pb-3">
          <div className="flex flex-wrap gap-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </header>
  );
} 