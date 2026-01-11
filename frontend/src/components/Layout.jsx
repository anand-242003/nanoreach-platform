import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  Briefcase, 
  LogOut, 
  Menu, 
  Trophy,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

export default function Layout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Define navigation items based on Role
  const navItems = user?.role === 'BRAND' ? [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/campaigns/create', label: 'Create Campaign', icon: PlusCircle },
    { href: '/campaigns/my', label: 'My Campaigns', icon: Briefcase },
  ] : [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/campaigns', label: 'Find Work', icon: Briefcase },
    { href: '/submissions', label: 'My Submissions', icon: Trophy },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/auth/login');
  };

  const SidebarContent = ({ isCollapsed = false }) => (
    <div className="flex h-full flex-col gap-4">
      <div className="flex h-16 items-center border-b px-6 justify-between">
        <Link to="/dashboard" className={cn(
          "flex items-center gap-2 font-bold text-xl text-primary transition-all",
          isCollapsed && "justify-center"
        )}>
          <span className="text-2xl">⚡</span>
          {!isCollapsed && <span>NanoReach</span>}
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-4">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all hover:text-primary",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-muted-foreground hover:bg-muted",
                  isCollapsed && "justify-center"
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t p-4">
        {!isCollapsed ? (
          <>
            <div className="flex items-center gap-3 mb-4 px-2">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="text-sm">
                <p className="font-medium leading-none">{user?.name}</p>
                <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
                <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 font-medium mt-1 inline-block">
                  {user?.role}
                </span>
              </div>
            </div>
            <Button 
              variant="outline" 
              className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log out
            </Button>
          </>
        ) : (
          <div className="flex flex-col gap-2 items-center">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </AvatarFallback>
            </Avatar>
            <Button 
              variant="outline" 
              size="icon"
              className="text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={handleLogout}
              title="Log out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={cn(
      "grid min-h-screen w-full transition-all duration-300",
      collapsed 
        ? "md:grid-cols-[80px_1fr]" 
        : "md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]"
    )}>
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-zinc-50/40 dark:bg-zinc-900/40 md:block relative">
        <SidebarContent isCollapsed={collapsed} />
        
        {/* Collapse Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute -right-3 top-20 h-6 w-6 rounded-full border shadow-md bg-background hover:bg-accent z-10"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3" />
          ) : (
            <ChevronLeft className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Mobile & Main Content */}
      <div className="flex flex-col">
        {/* Mobile Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-background px-6 md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0">
              <SidebarContent isCollapsed={false} />
            </SheetContent>
          </Sheet>
          <span className="font-bold">NanoReach</span>
        </header>

        {/* Main Page Content Injected Here */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}