"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserNav } from "@/components/user-nav";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  const routes = [
    {
      href: "/clients",
      label: "Clients",
      active: pathname.startsWith("/clients"),
    },
    {
      href: "/quotes",
      label: "Quotes",
      active: pathname.startsWith("/quotes"),
    },
  ];

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="font-bold text-xl mr-8">DevisGen</div>
        <nav
          className={cn(
            "flex items-center space-x-4 lg:space-x-6 mx-6",
            className
          )}
          {...props}
        >
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                route.active
                  ? "text-black dark:text-white"
                  : "text-muted-foreground"
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center space-x-4">
          <UserNav />
        </div>
      </div>
    </div>
  );
}
