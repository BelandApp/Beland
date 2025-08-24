"use client";

import Link from "next/link";
import { useState } from "react";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Twitter, Linkedin, Instagram, Loader2 } from "lucide-react";

export function Footer() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Error",
        description: "Por favor, introduce tu dirección de correo electrónico.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("La respuesta de la red no fue exitosa");
      }

      const result = await response.json();
      toast({
        title: "¡Suscripción exitosa!",
        description: "Gracias por unirte a nuestro boletín.",
      });
      setEmail("");
    } catch (error) {
      toast({
        title: "Error en la suscripción",
        description: "Hubo un problema al procesar tu solicitud. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <footer className="border-t bg-background">
      <div className="container py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="space-y-4 md:col-span-1">
            <Logo />
            <p className="text-sm text-muted-foreground">
              Construyendo un futuro más verde y circular, una comunidad a la vez.
            </p>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Enlaces Rápidos</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/#about" className="text-muted-foreground hover:text-foreground">Sobre Nosotros</Link></li>
              <li><Link href="/circularity" className="text-muted-foreground hover:text-foreground">Circularidad</Link></li>
              <li><Link href="/territories" className="text-muted-foreground hover:text-foreground">Territorios</Link></li>
              <li><Link href="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link></li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Contacto</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: <a href="mailto:hola@beland.com" className="hover:text-foreground">hola@beland.com</a></li>
              <li>Teléfono: +1 (234) 567-890</li>
              <li>Dirección: 123 Calle Verde, Ciudad Sostenible</li>
            </ul>
          </div>
          <div className="space-y-4">
            <h4 className="font-semibold">Únete a nuestro boletín</h4>
            <form className="flex gap-2" onSubmit={handleSubmit}>
              <Input 
                type="email" 
                placeholder="tu@email.com" 
                className="flex-1" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? <Loader2 className="animate-spin" /> : 'Suscribirse'}
              </Button>
            </form>
          </div>
        </div>
        <div className="mt-8 flex flex-col items-center justify-between border-t pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Beland. Todos los derechos reservados.
          </p>
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <a href="#" className="text-muted-foreground hover:text-foreground"><Twitter className="h-5 w-5" /></a>
            <a href="#" className="text-muted-foreground hover:text-foreground"><Linkedin className="h-5 w-5" /></a>
            <a href="#" className="text-muted-foreground hover:text-foreground"><Instagram className="h-5 w-5" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}