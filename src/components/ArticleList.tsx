'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types/article';
import CategoryFilter from './CategoryFilter';
import SortFilter, { SortOption } from './SortFilter';
import SearchBar from './SearchBar';
import Highlight from '@/utils/highlight';
import Pagination from './Pagination';
import { useDebounce } from '@/hooks/useDebounce';

type PaginationData = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

interface ArticleListProps {
  initialArticles?: Article[];
  featured?: boolean;
}

export default function ArticleList({ initialArticles = [], featured = false }: ArticleListProps) {
  const [articles, setArticles] = useState<Article[]>(initialArticles);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSort, setSelectedSort] = useState<SortOption>('latest');
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    fetchArticles();
  }, [debouncedSearchQuery, pagination.page, featured]);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (debouncedSearchQuery) {
        params.append('query', debouncedSearchQuery);
      }

      if (featured) {
        params.append('featured', 'true');
      }

      const response = await fetch(`/api/articles?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch articles');
      }

      setArticles(data.articles);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages,
      }));
    } catch (error) {
      console.error('Error fetching articles:', error);
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (sort: SortOption) => {
    setSelectedSort(sort);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (pagination.page !== 1) {
      setPagination(prev => ({ ...prev, page: 1 }));
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  return (
    <div className="space-y-6">
      <SearchBar onSearch={handleSearch} />
      
      {isLoading ? (
        <div className="text-center">Loading...</div>
      ) : error ? (
        <div className="text-center text-red-500 py-8">
          <p>{error}</p>
        </div>
      ) : articles.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.map(article => (
            <Link
              key={article.id}
              href={`/articles/${article.slug}`}
              className="group"
            >
              <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="relative h-48">
                  {article.thumbnailUrl ? (
                    <Image
                      src={article.thumbnailUrl}
                      alt={article.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                  {article.featured && (
                    <span className="absolute top-2 right-2 bg-yellow-400 text-xs font-bold px-2 py-1 rounded">
                      注目
                    </span>
                  )}
                </div>
                
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    {article.category && (
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {article.category}
                      </span>
                    )}
                    {article.readingTime && (
                      <span className="text-xs text-gray-500">
                        {article.readingTime}分で読める
                      </span>
                    )}
                  </div>
                  
                  <h2 className="text-xl font-bold mb-2 group-hover:text-blue-600 transition-colors">
                    {searchQuery ? (
                      <Highlight text={article.title} query={searchQuery} />
                    ) : (
                      article.title
                    )}
                  </h2>
                  
                  {article.summary && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {searchQuery ? (
                        <Highlight text={article.summary} query={searchQuery} />
                      ) : (
                        article.summary
                      )}
                    </p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <span>👁 {article.viewCount}</span>
                      <span>❤️ {article.likeCount}</span>
                    </div>
                    <time dateTime={article.publishedAt?.toISOString()}>
                      {article.publishedAt?.toLocaleDateString()}
                    </time>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500">
          No articles found
        </div>
      )}

      {pagination.totalPages > 1 && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
} 