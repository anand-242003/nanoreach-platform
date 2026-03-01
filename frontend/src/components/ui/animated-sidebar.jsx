import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "@/store/authSlice";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  LayoutDashboard,
  Target,
  FileText,
  LogOut,
  Settings,
  UserCircle,
  ChevronsUpDown,
  Sparkles,
  Building2,
  ClipboardList,
  DollarSign,
  Plus,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
const sidebarVariants = {
  open:   { width: "15rem" },
  closed: { width: "3.05rem" },
};

const contentVariants = {
  open:   { display: "block", opacity: 1 },
  closed: { display: "block", opacity: 1 },
};

const labelVariants = {
  open:   { x: 0,   opacity: 1, transition: { x: { stiffness: 1000, velocity: -100 } } },
  closed: { x: -16, opacity: 0, transition: { x: { stiffness: 100  } } },
};

const staggerVariants = {
  open: { transition: { staggerChildren: 0.03, delayChildren: 0.02 } },
};

const transitionProps = {
  type:     "tween",
  ease:     "easeOut",
  duration: 0.2,
};
const adminNav = [
  { to: "/dashboard",                        icon: LayoutDashboard, label: "Dashboard"              },
  { to: "/admin/verifications/influencers",  icon: Sparkles,        label: "Influencer Reviews"    },
  { to: "/admin/verifications/brands",       icon: Building2,       label: "Brand Reviews"         },
  { to: "/admin/applications",               icon: ClipboardList,   label: "Application Queue"     },
  { to: "/admin/escrow",                     icon: DollarSign,      label: "Escrow"                },
  { to: "/campaigns",                        icon: Target,          label: "All Campaigns"         },
  { to: "/admin/submissions",                icon: FileText,        label: "Submission Reviews"    },
];

const brandNav = [
  { to: "/dashboard",         icon: LayoutDashboard, label: "Dashboard"       },
  { to: "/campaigns/my",      icon: Target,          label: "My Campaigns"    },
  { to: "/campaigns/create",  icon: Plus,            label: "Create Campaign" },
  { to: "/payments/pending",  icon: DollarSign,      label: "Pending Payments"},
];

const influencerNav = [
  { to: "/dashboard",    icon: LayoutDashboard, label: "Dashboard"        },
  { to: "/campaigns",    icon: Target,          label: "Browse Campaigns" },
  { to: "/applications", icon: ClipboardList,   label: "My Applications"  },
  { to: "/submissions",  icon: FileText,        label: "My Activity"      },
  { to: "/referrals",    icon: BarChart3,       label: "Referrals"        },
];
export function NanoReachSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const location   = useLocation();
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const { user, verificationStatus } = useSelector((state) => state.auth);

  const role       = user?.role ?? "INFLUENCER";
  const isAdmin    = role === "ADMIN";
  const isBrand    = role === "BRAND";
  const isLocked   = !isAdmin && verificationStatus === 'UNDER_REVIEW';
  const navLinks   = isAdmin ? adminNav : isBrand ? brandNav : influencerNav;
  const roleBadge  = isAdmin ? "Admin" : isBrand ? "Brand" : "Influencer";
  const initials   = user?.name
    ?.split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() ?? "NR";

  const handleLogout = () => {
    dispatch(logout());
    navigate("/auth/login");
  };

  const isActive = (to) =>
    location.pathname === to || location.pathname.startsWith(to + "/");

  return (
    <motion.div
      className="fixed left-0 top-0 z-40 h-full shrink-0 border-r border-border"
      initial={isCollapsed ? "closed" : "open"}
      animate={isCollapsed ? "closed" : "open"}
      variants={sidebarVariants}
      transition={transitionProps}
      onMouseEnter={() => setIsCollapsed(false)}
      onMouseLeave={() => setIsCollapsed(true)}
    >
      <motion.div
        className="relative flex h-full flex-col bg-background text-muted-foreground"
        variants={contentVariants}
      >
        <motion.ul variants={staggerVariants} className="flex h-full flex-col">
          <div className="flex h-full flex-col">
            <div className="flex h-[54px] w-full shrink-0 items-center border-b border-border px-2">
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 hover:bg-muted transition-colors">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded bg-primary">
                      <ShieldCheck className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <motion.li variants={labelVariants} className="flex items-center gap-2 overflow-hidden">
                      {!isCollapsed && (
                        <>
                          <span className="whitespace-nowrap text-sm font-semibold text-foreground">
                            DRK<span className="text-primary">/</span>MTTR
                          </span>
                          <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-fit capitalize">
                            {roleBadge}
                          </Badge>
                          <ChevronsUpDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                        </>
                      )}
                    </motion.li>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <LayoutDashboard className="h-4 w-4" /> Dashboard
                    </Link>
                  </DropdownMenuItem>
                  {!isAdmin && (
                    <DropdownMenuItem asChild>
                      <Link to="/onboarding" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" /> Profile Settings
                      </Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <ScrollArea className="flex-1 p-2">
              <div className="flex flex-col gap-0.5">
                {navLinks.map((link, idx) => {
                  const active = isActive(link.to);
                  const disabled = isLocked && link.to !== '/dashboard';
                  if (disabled) {
                    return (
                      <span
                        key={link.to}
                        title="Available after verification approval"
                        className="flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 cursor-not-allowed opacity-35 select-none"
                      >
                        <link.icon className="h-4 w-4 shrink-0" />
                        <motion.li variants={labelVariants} className="overflow-hidden">
                          {!isCollapsed && (
                            <p className="ml-2 whitespace-nowrap text-sm font-medium">{link.label}</p>
                          )}
                        </motion.li>
                      </span>
                    );
                  }
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={cn(
                        "flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition-colors",
                        active
                          ? "bg-primary/10 text-primary"
                          : "hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <link.icon className={cn("h-4 w-4 shrink-0", active ? "text-primary" : "")} />
                      <motion.li variants={labelVariants} className="overflow-hidden">
                        {!isCollapsed && (
                          <p className="ml-2 whitespace-nowrap text-sm font-medium">{link.label}</p>
                        )}
                      </motion.li>
                    </Link>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="flex flex-col gap-0.5 p-2 border-t border-border">
              <Link
                to="/settings"
                className="flex h-8 w-full flex-row items-center rounded-md px-2 py-1.5 transition-colors hover:bg-muted hover:text-foreground"
              >
                <Settings className="h-4 w-4 shrink-0" />
                <motion.li variants={labelVariants} className="overflow-hidden">
                  {!isCollapsed && (
                    <p className="ml-2 whitespace-nowrap text-sm font-medium">Settings</p>
                  )}
                </motion.li>
              </Link>
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <button className="flex h-8 w-full flex-row items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-muted hover:text-foreground">
                    <Avatar className="h-4 w-4 shrink-0">
                      <AvatarFallback className="text-[8px]">{initials}</AvatarFallback>
                    </Avatar>
                    <motion.li variants={labelVariants} className="flex w-full items-center gap-2 overflow-hidden">
                      {!isCollapsed && (
                        <>
                          <p className="whitespace-nowrap text-sm font-medium">{user?.name ?? "Account"}</p>
                          <ChevronsUpDown className="ml-auto h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                        </>
                      )}
                    </motion.li>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent sideOffset={5} className="w-52">
                  <div className="flex items-center gap-2 p-2">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-sm font-medium truncate">{user?.name}</span>
                      <span className="text-xs text-muted-foreground truncate">{user?.email}</span>
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/onboarding" className="flex items-center gap-2">
                      <UserCircle className="h-4 w-4" /> Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="flex items-center gap-2 text-destructive focus:text-destructive"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

          </div>
        </motion.ul>
      </motion.div>
    </motion.div>
  );
}
