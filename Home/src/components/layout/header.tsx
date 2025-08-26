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
import { useState } from "react";
import { Separator } from "@/components/ui/separator";
import { usePathname } from "next/navigation";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
// Se elimina la importación de Auth0
// import { useAuth0 } from "@auth0/auth0-react";

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

// URL de la aplicación desplegada en Netlify
const netlifyUrl = "https://beland-project.netlify.app";

export function Header() {
  const [isSheetOpen, setSheetOpen] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Se elimina la desestructuración de Auth0
  // const { isAuthenticated, loginWithRedirect, logout } = useAuth0();

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
                    {/* Se reemplaza la lógica de Auth0 con enlaces directos */}
                    <Button variant="outline" asChild>
                      <Link href={netlifyUrl}>Iniciar Sesión</Link>
                    </Button>
                    <Button asChild>
                      <Link href={netlifyUrl}>Registrarse</Link>
                    </Button>
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
            {/* Se reemplaza la lógica de Auth0 con enlaces directos */}
            <Button variant="ghost" asChild>
              <Link href={netlifyUrl}>Iniciar Sesión</Link>
            </Button>
            <Button asChild>
              <Link href={netlifyUrl}>Registrarse</Link>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
