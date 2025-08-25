import Image from "next/image";

const mediaItems = [
  { type: "image", src: "https://placehold.co/600x400.png", alt: "Evento de reciclaje comunitario", hint: "community recycling" },
  { type: "image", src: "https://placehold.co/600x400.png", alt: "Taller de compostaje", hint: "composting workshop" },
  { type: "image", src: "https://placehold.co/600x400.png", alt: "Mercado de productos locales", hint: "local market" },
  { type: "image", src: "https://placehold.co/600x400.png", alt: "Niños aprendiendo sobre sostenibilidad", hint: "kids learning" },
  { type: "image", src: "https://placehold.co/600x400.png", alt: "Punto de recolección inteligente", hint: "smart recycling" },
  { type: "image", src: "https://placehold.co/600x400.png", alt: "Equipo de Beland en acción", hint: "team working" },
];

export function MediaGallery() {
  return (
    <section id="media-gallery" className="py-16 md:py-24 bg-secondary">
      <div className="container">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">La Experiencia Beland</h2>
          <p className="max-w-2xl mx-auto text-muted-foreground">
            Un vistazo a nuestras iniciativas, nuestra comunidad y el impacto que estamos creando juntos.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {mediaItems.map((item, index) => (
            <div key={index} className="overflow-hidden rounded-lg shadow-lg">
              <Image
                src={item.src}
                alt={item.alt}
                width={600}
                height={400}
                className="w-full h-full object-cover aspect-video transform hover:scale-105 transition-transform duration-300"
                data-ai-hint={item.hint}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
