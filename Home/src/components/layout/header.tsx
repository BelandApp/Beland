"use client";

import Link from "next/link";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/ui/logo";
import { useState, useEffect } from "react";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { useAuth0 } from "@auth0/auth0-react";

// Navegación principal
const navLinks = [
  {
    href: "/#media-gallery",
    label: "Experiencia Beland",
    sectionId: "media-gallery",
  },
  { href: "/circularity", label: "Circularity as a Service" },
  { href: "/territories", label: "Territorios" },
  { href: "/blog", label: "Blog" },
];

export function Header() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Obtenemos las funciones y el estado de Auth0
  const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

  // Función para manejar el inicio de sesión
  const handleLogin = () => {
    loginWithRedirect();
  };

  // Función para manejar el cierre de sesión, con redirección correcta
  const handleLogout = () => {
    logout({
      logoutParams: {
        // Redirigimos a la página principal después de cerrar sesión
        returnTo: window.location.origin,
      },
    });
  };

  const activeSection = useScrollSpy(
    navLinks.filter(l => isHomePage && l.sectionId).map(l => l.sectionId!),
    { rootMargin: "0% 0px -40% 0px" }
  );

  const getLinkClass = (link: (typeof navLinks)[0]) => {
    if (isHomePage && link.sectionId && link.sectionId === activeSection) {
      return "text-primary font-semibold";
    }
    return "";
  };

  return (
    <header className="fixed top-0 z-50 w-full bg-background/95 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Logo />
          {/* Menú para móviles */}
          <div className="md:hidden">
            <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left">
                <SheetHeader>
                  <SheetTitle>Menú</SheetTitle>
                </SheetHeader>
                <div className="flex flex-col space-y-4 pt-8">
                  <ul className="flex flex-col space-y-2">
                    {navLinks.map(link => (
                      <li key={link.href}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start"
                          asChild
                          onClick={() => setSheetOpen(false)}>
                          <Link href={link.href}>{link.label}</Link>
                        </Button>
                      </li>
                    ))}
                  </ul>
                  <Separator />
                  <div className="flex flex-col space-y-2">
                    {isAuthenticated ? (
                      <Button onClick={handleLogout}>Cerrar Sesión</Button>
                    ) : (
                      <>
                        <Button variant="outline" onClick={handleLogin}>
                          Iniciar Sesión
                        </Button>
                        <Button onClick={handleLogin}>Registrarse</Button>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
        {/* Navegación para escritorio */}
        <nav className="hidden flex-1 items-center justify-center md:flex">
          <ul className="flex items-center space-x-6 text-sm font-medium">
            {navLinks.map(link => (
              <li key={link.href}>
                <Button variant="link" asChild className={getLinkClass(link)}>
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              </li>
            ))}
          </ul>
        </nav>
        {/* Botones de autenticación para escritorio */}
        <div className="hidden items-center justify-end space-x-2 md:flex">
          <div className="hidden md:flex items-center space-x-2">
            {isAuthenticated ? (
              <Button onClick={handleLogout}>Cerrar Sesión</Button>
            ) : (
              <>
                <Button variant="ghost" onClick={handleLogin}>
                  Iniciar Sesión
                </Button>
                <Button onClick={handleLogin}>Registrarse</Button>
              </>
            )}
            <Separator orientation="vertical" className="h-6" />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
