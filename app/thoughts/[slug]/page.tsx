import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { getThought, getThoughtSlugs, formatDate } from "../_data";

export function generateStaticParams() {
  return getThoughtSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = getThought(slug);
  if (!t) return {};
  return { title: t.title, description: t.description };
}

export default async function ThoughtPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const t = getThought(slug);
  if (!t) notFound();

  return (
    <article className="thoughts-wrap">
      <Link href="/thoughts" className="thoughts-back">
        ← Thoughts
      </Link>
      <h1 className="article-title">{t.title}</h1>
      <div className="article-meta">
        {formatDate(t.date)} · {t.readingMin} min read
      </div>
      <div className="prose-thoughts">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{t.content}</ReactMarkdown>
      </div>
    </article>
  );
}
