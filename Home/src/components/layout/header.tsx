// src/components/Header.tsx
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
import { useAuth } from "@/hooks/authProvider";
// ✅ Importa el hook de autenticación que acabas de crear

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
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  // ✅ Llama al hook useAuth para obtener el estado del usuario y las funciones
  const { user, isLoading, login, logout } = useAuth();

  const activeSection = useScrollSpy(
    mounted
      ? navLinks.filter(l => isHomePage && l.sectionId).map(l => l.sectionId!)
      : [],
    { rootMargin: "0% 0px -40% 0px" }
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const getLinkClass = (link: (typeof navLinks)[0]) => {
    if (mounted) {
      if (isHomePage && link.sectionId && link.sectionId === activeSection) {
        return "text-primary font-semibold";
      }
    }
    if (pathname === link.href) {
      return "text-primary font-semibold";
    }
    return "text-foreground/80 hover:text-foreground transition-colors";
  };

  // ✅ Nuevo componente para mostrar los botones de autenticación
  const AuthButtons = ({ isMobile = false }) => {
    // Si la página se está cargando, muestra un estado de "cargando"
    if (isLoading) {
      return <div className="text-sm">Cargando...</div>;
    }
    // Si hay un usuario, muestra el nombre y el botón de Cerrar Sesión
    if (user) {
      return (
        <div className="flex items-center space-x-2">
          {/* ✅ Muestra el nombre del usuario si está disponible */}
          <span className="text-sm font-medium hidden md:block">
            Hola, {user.name || user.email}!
          </span>
          <Button
            variant="ghost"
            onClick={() => {
              logout();
              if (isMobile) setSheetOpen(false);
            }}>
            Cerrar Sesión
          </Button>
        </div>
      );
    }
    // Si no hay usuario, muestra los botones de Iniciar Sesión y Registrarse
    return (
      <>
        <Button
          variant="ghost"
          onClick={() => {
            login();
            if (isMobile) setSheetOpen(false);
          }}>
          Iniciar Sesión
        </Button>
        {/*
          Para la opción de "Registrarse", puedes redirigir a un login con
          un estado o usar la opción `screen_hint=signup` de Auth0 si la necesitas,
          o simplemente un enlace a una página de registro si tienes una.
        */}
        <Button asChild onClick={() => setSheetOpen(false)}>
          <Link href="/register">Registrarse</Link>
        </Button>
      </>
    );
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Logo />
        </div>
        {/* ✅ Versión móvil de los botones */}
        <div className="flex flex-1 items-center justify-end space-x-2 md:hidden">
          {mounted && <ThemeToggle />}
          <AuthButtons isMobile={true} />
          <Sheet open={isSheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Abrir menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="p-4">
                <SheetTitle className="sr-only">Menú Principal</SheetTitle>
                <Logo />
              </SheetHeader>
              <nav className="mt-8 flex flex-col items-start space-y-4 px-4">
                {navLinks.map(link => (
                  <Button
                    key={link.href}
                    variant="link"
                    asChild
                    className="w-full justify-start text-lg text-foreground/80"
                    onClick={() => setSheetOpen(false)}>
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
              </nav>
              {/* ✅ Botones de autenticación en la versión móvil */}
              <div className="absolute bottom-4 right-4 left-4 p-4 border-t">
                <div className="flex flex-col space-y-2">
                  <AuthButtons isMobile={true} />
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
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
        {/* ✅ Versión de escritorio de los botones */}
        <div className="hidden items-center justify-end space-x-2 md:flex">
          <div className="hidden md:flex items-center space-x-2">
            <AuthButtons />
            <Separator orientation="vertical" className="h-6" />
            {mounted && <ThemeToggle />}
          </div>
        </div>
      </div>
    </header>
  );
}
