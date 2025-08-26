import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { RefreshCw, Gift, ShoppingCart, Users } from "lucide-react";
import Link from "next/link";

const authUrl = "https://beland-project.netlify.app";

const features = [
  {
    icon: <RefreshCw className="w-8 h-8 text-primary" />,
    title: "Eventos Circulares",
    description:
      "Participa en eventos que promueven la reutilización y el intercambio para dar una segunda vida a los productos.",
    href: authUrl,
  },
  {
    icon: <Gift className="w-8 h-8 text-primary" />,
    title: "Reciclaje Incentivado",
    description:
      "Gana recompensas por tus hábitos de reciclaje y contribuye a una economía más limpia y sostenible.",
    href: authUrl,
  },
  {
    icon: <ShoppingCart className="w-8 h-8 text-primary" />,
    title: "Compras Responsables",
    description:
      "Accede a un mercado de productos locales y sostenibles, apoyando a la economía de tu comunidad.",
    href: authUrl,
  },
  {
    icon: <Users className="w-8 h-8 text-primary" />,
    title: "Reuniones Sociales",
    description:
      "Conecta con vecinos y amigos en espacios comunitarios diseñados para fortalecer los lazos sociales.",
    href: authUrl,
  },
];

export function Features() {
  return (
    <section id="features" className="py-16 md:py-24 bg-secondary">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">
            Un Ecosistema para Vivir Mejor
          </h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            Ofrecemos herramientas y espacios para que cada acción cuente en la
            construcción de un futuro sostenible.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href} className="flex">
              <Card className="text-center p-6 transform hover:-translate-y-2 transition-transform duration-300 w-full flex flex-col">
                <CardHeader className="items-center flex-grow">
                  <div className="p-4 bg-primary/10 rounded-full mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription className="pt-2">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
