import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function GuinnessChallenge() {
  return (
    <section id="guinness-challenge" className="py-16 md:py-24 bg-background">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div>
                <h2 className="text-3xl md:text-4xl font-bold text-primary">Reto Guinness</h2>
                <p className="mt-4 text-muted-foreground">
                Este año nos propusimos demostrar que la circularidad funciona. Activamos barrios, reciclamos desde la base y generamos comunidad, contenido y retorno real. Todo esto es solo el comienzo.
                </p>
                <p className="mt-4 text-muted-foreground">
                En 2026 lanzamos el primer Festival Circular del mundo, con un objetivo claro: romper un Récord Guinness reciclando en toda la ciudad de Quito en simultáneo, durante una semana de música, cultura y producción circular. Buscamos marcas que no quieran solo visibilidad, sino ser parte del nuevo modelo. ¿Te sumas?
                </p>
            </div>
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground">
            “No se trata solo de romper un récord. Se trata de transformar lo que el mundo desecha en riqueza para la comunidad, valor para el mercado e impacto real para el planeta. La circularidad no es el futuro, es el nuevo estándar.”
            <cite className="mt-2 block not-italic font-semibold text-foreground">Team Beland</cite>
            </blockquote>
          </div>
          <div className="space-y-8 rounded-lg bg-secondary p-8">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
                <div>
                    <p className="text-4xl font-bold text-primary">1</p>
                    <p className="mt-2 text-muted-foreground">Record Guinness</p>
                </div>
                <div>
                    <p className="text-4xl font-bold text-primary">50k+</p>
                    <p className="mt-2 text-muted-foreground">Toneladas de residuos</p>
                </div>
                <div>
                    <p className="text-4xl font-bold text-primary">1.8M+</p>
                    <p className="mt-2 text-muted-foreground">En ingresos para la comunidad</p>
                </div>
            </div>
            <Button asChild size="lg" className="w-full">
                <Link href="#"> 
                    Agenda tu Consultoría Circular y participa en nuestro reto
                    <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}