import React from 'react';
import { Button } from '../ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '../ui/avatar';
import {
  Bell,
  Menu,
  Search,
  Settings,
  Home,
  CheckSquare,
  Calendar,
  BarChart3,
  Target,
  LogOut,
  User
} from 'lucide-react';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, useLocation } from 'react-router-dom';

export interface HeaderProps {
  onMenuClick?: () => void;
  onSearchClick?: () => void;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  onLogout?: () => void;
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  showNavigation?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onMenuClick,
  onSearchClick,
  onNotificationsClick,
  onSettingsClick,
  onLogout,
  user
}) => {
  const location = useLocation();

  const navigationItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/tasks', label: 'Tasks', icon: CheckSquare },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/goals', label: 'Goals', icon: Target }
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container relative flex h-14 items-center">

        {/* Logo & Mobile Menu Button */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary"></div>
            <span className="hidden font-bold sm:inline-block">Edge Task</span>
          </div>
        </div>

        {/* 👇 Navigation Centrée */}
        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center space-x-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} to={item.href}>
                <Button
                  variant={isActive(item.href) ? 'default' : 'ghost'}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Actions (Search, Notifications, Settings, Avatar) */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={onSearchClick}
            >
              <Search className="h-5 w-5" />
              <span className="sr-only">Search</span>
            </Button>
          </div>

          <nav className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotificationsClick}
            >
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>

            <ThemeToggle />

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                    <AvatarImage src={user.avatar} alt={user.name || 'User'} />
                    <AvatarFallback>
                      {user.name ? user.name.split(' ').map(n => n[0]).join('') : 'U'}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name || 'User'}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={onLogout} className="cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};
