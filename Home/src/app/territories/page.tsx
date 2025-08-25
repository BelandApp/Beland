import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { MapPin, Users, Heart } from "lucide-react";

const territories = [
  {
    name: "Territorio del Sol",
    description: "Una comunidad costera que ha reducido su plástico de un solo uso en un 40% gracias a nuestras iniciativas.",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "coastal community"
  },
  {
    name: "Distrito Verde",
    description: "Un centro urbano denso que ahora cuenta con compostaje comunitario y un mercado de agricultores próspero.",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "urban center"
  },
  {
    name: "Valle Esmeralda",
    description: "Una zona rural que ha revitalizado su economía local a través de la venta de productos sostenibles en nuestra plataforma.",
    imageUrl: "https://placehold.co/600x400.png",
    aiHint: "rural valley"
  },
];

export default function TerritoriesPage() {
  return (
    <>
      <section className="bg-primary/10 py-20">
        <div className="container text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Territorios Beland</h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-muted-foreground">
            Donde la circularidad echa raíces. Creamos soluciones a medida que respetan la identidad única de cada comunidad y potencian su desarrollo sostenible.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Nuestro Modelo de Impacto Local</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              No creemos en soluciones únicas. Trabajamos mano a mano con los residentes y líderes locales para construir un Beland que funcione para ellos.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <MapPin className="w-12 h-12 text-primary mx-auto mb-4"/>
              <h3 className="text-xl font-semibold">Análisis y Co-diseño</h3>
              <p className="text-muted-foreground mt-2">Estudiamos las necesidades y activos de cada territorio para diseñar un plan de acción conjunto.</p>
            </div>
            <div className="p-6">
              <Users className="w-12 h-12 text-primary mx-auto mb-4"/>
              <h3 className="text-xl font-semibold">Empoderamiento Comunitario</h3>
              <p className="text-muted-foreground mt-2">Capacitamos a embajadores locales y promovemos la participación activa a través de nuestra plataforma.</p>
            </div>
            <div className="p-6">
              <Heart className="w-12 h-12 text-primary mx-auto mb-4"/>
              <h3 className="text-xl font-semibold">Resultados y Evolución</h3>
              <p className="text-muted-foreground mt-2">Medimos el impacto social, económico y ambiental, y adaptamos nuestras estrategias continuamente.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-secondary">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">Historias de Éxito</h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              Conoce el impacto de Beland a través de nuestras comunidades asociadas.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {territories.map(territory => (
              <Card key={territory.name} className="overflow-hidden">
                 <Image
                  src={territory.imageUrl}
                  alt={territory.name}
                  width={600}
                  height={400}
                  className="w-full h-48 object-cover"
                  data-ai-hint={territory.aiHint}
                />
                <CardHeader>
                  <CardTitle>{territory.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{territory.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
