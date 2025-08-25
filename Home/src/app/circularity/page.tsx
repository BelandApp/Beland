import Image from "next/image";
import { Check } from "lucide-react";

export default function CircularityPage() {
  return (
    <>
      <section className="bg-primary/10 py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Circularidad como un Servicio (CaaS)</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Nuestra solución integral para que empresas, municipios y organizaciones se sumen a la economía circular de forma eficiente y medible.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <Image
                src="https://placehold.co/600x450.png"
                alt="Diagrama del servicio de circularidad"
                width={600}
                height={450}
                className="rounded-lg shadow-lg"
                data-ai-hint="circular economy diagram"
              />
            </div>
            <div className="space-y-6">
              <h2 className="text-3xl font-bold">¿Qué es CaaS?</h2>
              <p className="text-muted-foreground">
                'Circularidad como un Servicio' es un modelo de suscripción que proporciona todas las herramientas, la logística y la tecnología necesarias para implementar y gestionar programas de sostenibilidad y reciclaje a gran escala. Eliminamos la complejidad para que puedas concentrarte en el impacto.
              </p>
              <p className="text-muted-foreground">
                Desde la instalación de estaciones de reciclaje inteligentes hasta una plataforma digital para el seguimiento de datos, Beland CaaS es tu socio estratégico para un futuro más verde.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Componentes Clave</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Todo lo que necesitas para una transición exitosa a la circularidad.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Estaciones de Reciclaje</h3>
              <p className="text-muted-foreground">Puntos de recolección modernos y eficientes, estratégicamente ubicados para maximizar la participación.</p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Plataforma Digital</h3>
              <p className="text-muted-foreground">Un panel de control para monitorear métricas, gestionar recompensas y visualizar el impacto ambiental en tiempo real.</p>
            </div>
            <div className="p-6 bg-background rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">Logística Inversa</h3>
              <p className="text-muted-foreground">Nos encargamos de la recolección, clasificación y reintroducción de materiales en la cadena de valor.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Beneficios Tangibles</h2>
          <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 text-left">
            <div className="flex items-start gap-4">
              <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Reducción de Costos</h4>
                <p className="text-muted-foreground text-sm">Optimiza la gestión de residuos y reduce los gastos operativos.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Cumplimiento Normativo</h4>
                <p className="text-muted-foreground text-sm">Asegura el cumplimiento de las regulaciones ambientales locales e internacionales.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Mejora de la Reputación</h4>
                <p className="text-muted-foreground text-sm">Demuestra un compromiso real con la sostenibilidad y atrae a clientes y talento.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Check className="w-6 h-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-semibold">Datos para la Acción</h4>
                <p className="text-muted-foreground text-sm">Obtén informes detallados para tomar decisiones estratégicas y comunicar tus logros.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
