import { Button } from "@/components/ui/button";
import Link from "next/link";

export function Hero() {
  return (
    <section id="hero" className="relative bg-background">
      <div className="container py-20 md:py-32 text-center">
        <div className="absolute inset-0 bg-grid-slate-100/[0.04] bg-[10px_10px] dark:bg-grid-slate-700/[0.05]"></div>
        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-foreground">
            Construyendo el Ecosistema <br/>
            <span className="text-primary">Circular del Mañana</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-muted-foreground">
            Beland integra tecnología y comunidad para crear ciudades más sostenibles, responsables y conectadas.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/circularity">Descubre la Circularidad</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/#about">Sobre Nosotros</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}