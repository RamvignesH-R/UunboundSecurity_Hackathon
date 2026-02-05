import { Link, useLocation } from "wouter";
import { LayoutDashboard, GitBranch, History, Settings, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Workflows', href: '/workflows', icon: GitBranch },
  { name: 'Executions', href: '/executions', icon: History },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
      <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-white/5 bg-card px-6 pb-4 ring-1 ring-white/5">
        <div className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Bot className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl tracking-tight text-white">Agentic</span>
        </div>
        <nav className="flex flex-1 flex-col">
          <ul role="list" className="flex flex-1 flex-col gap-y-7">
            <li>
              <ul role="list" className="-mx-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
                  return (
                    <li key={item.name}>
                      <Link 
                        href={item.href}
                        className={cn(
                          isActive 
                            ? "bg-primary/10 text-primary border-r-2 border-primary" 
                            : "text-muted-foreground hover:bg-white/5 hover:text-white",
                          "group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold transition-all duration-200"
                        )}
                      >
                        <item.icon className={cn(
                          isActive ? "text-primary" : "text-muted-foreground group-hover:text-white",
                          "h-6 w-6 shrink-0 transition-colors"
                        )} aria-hidden="true" />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  );
}
