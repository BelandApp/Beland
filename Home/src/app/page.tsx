import { Hero } from "@/components/home/hero";
import { Features } from "@/components/home/features";
import { About } from "@/components/home/about";
import { CTA } from "@/components/home/cta";
import { BlogPreview } from "@/components/home/blog-preview";
import { MediaGallery } from "@/components/home/media-gallery";
import { GuinnessChallenge } from "@/components/home/guinness-challenge";

export default function Home() {
  return (
    <div className="flex flex-col">
      <Hero />
      <Features />
      <About />
      <MediaGallery />
      <GuinnessChallenge />
      <CTA />
      <BlogPreview />
    </div>
  );
}