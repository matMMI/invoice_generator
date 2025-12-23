"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { UserNav } from "@/components/user-nav";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function MainNav({
  className,
  ...props
}: React.HTMLAttributes<HTMLElement>) {
  const pathname = usePathname();

  const routes = [
    {
      href: "/",
      label: "Tableau de bord",
      active: pathname === "/",
    },
    {
      href: "/clients",
      label: "Clients",
      active: pathname.startsWith("/clients"),
    },
    {
      href: "/quotes",
      label: "Devis",
      active: pathname.startsWith("/quotes"),
    },
  ];

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        {/* Mobile Menu Trigger */}
        <div className="md:hidden mr-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              {routes.map((route) => (
                <DropdownMenuItem key={route.href} asChild>
                  <Link
                    href={route.href}
                    className={cn(
                      "w-full cursor-pointer",
                      route.active ? "font-bold" : ""
                    )}
                  >
                    {route.label}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="font-bold text-xl mr-8">DevisGen</div>

        {/* Desktop Nav */}
        <nav
          className={cn(
            "hidden md:flex items-center space-x-4 lg:space-x-6 mx-6",
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
