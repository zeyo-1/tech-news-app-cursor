import Image from "next/image";
import ArticleList from '@/components/ArticleList';

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-3xl font-bold mb-8">注目の記事</h1>
        <ArticleList featured={true} />
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-8">最新の記事</h2>
        <ArticleList />
      </section>
    </main>
  );
}
