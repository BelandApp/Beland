import Image from "next/image";
import { notFound } from "next/navigation";
import { blogPosts } from "@/lib/data";
import { Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = blogPosts.find((p) => p.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="py-12 md:py-20">
      <div className="container max-w-4xl">
        <header className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">{post.title}</h1>
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <time dateTime={post.date}>{post.date}</time>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
          </div>
        </header>

        <Image
          src={post.imageUrl}
          alt={post.title}
          width={1200}
          height={600}
          className="w-full rounded-lg shadow-lg mb-8 md:mb-12"
          data-ai-hint="blog post header"
          priority
        />
        
        <div 
          className="prose prose-lg dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

      </div>
    </article>
  );
}
