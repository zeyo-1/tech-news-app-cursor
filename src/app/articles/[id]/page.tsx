'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Eye, Heart, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import Comments from '@/components/Comments';

type Article = {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  published_at: string;
  view_count: number;
  like_count: number;
  author: {
    id: string;
    name: string;
    avatar_url: string;
  };
};

export default function ArticlePage({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState<Article | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [isLikeLoading, setIsLikeLoading] = useState(false);
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  // シェア機能の処理
  const handleShare = async () => {
    if (!article) return;

    const shareData = {
      title: article.title,
      text: article.summary,
      url: window.location.href,
    };

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        // Web Share APIが利用可能な場合
        await navigator.share(shareData);
        toast({
          title: "シェアしました",
          description: "記事のシェアに成功しました。",
        });
      } else {
        // Web Share APIが利用できない場合、URLをコピー
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "URLをコピーしました",
          description: "記事のURLをクリップボードにコピーしました。",
        });
      }
    } catch (error) {
      console.error('Error sharing:', error);
      toast({
        title: "エラー",
        description: "シェアに失敗しました。",
        variant: "destructive",
      });
    }
  };

  // 記事データと「いいね」状態を取得
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // 記事データを取得
        const { data: article, error } = await supabase
          .from('articles')
          .select(`
            *,
            author:profiles(id, name, avatar_url)
          `)
          .eq('id', params.id)
          .single();

        if (error) throw error;

        if (article) {
          // 閲覧数を更新
          await supabase
            .from('articles')
            .update({ view_count: (article.view_count || 0) + 1 })
            .eq('id', params.id);

          setArticle(article);

          // ログインユーザーのいいね状態を確認
          const { data: session } = await supabase.auth.getSession();
          if (session?.session?.user) {
            const { data: like } = await supabase
              .from('article_likes')
              .select()
              .eq('article_id', params.id)
              .eq('user_id', session.session.user.id)
              .single();
            
            setIsLiked(!!like);
          }
        }
      } catch (error) {
        console.error('Error fetching article:', error);
        setError('記事の取得に失敗しました。');
      } finally {
        setIsLoading(false);
      }
    };

    fetchArticle();
  }, [params.id, supabase]);

  // いいねの処理
  const handleLike = async () => {
    try {
      setIsLikeLoading(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        toast({
          title: "エラー",
          description: "いいねするにはログインが必要です。",
          variant: "destructive",
        });
        return;
      }

      if (!article) return;

      if (isLiked) {
        // いいねを解除
        await supabase
          .from('article_likes')
          .delete()
          .eq('article_id', article.id)
          .eq('user_id', session.session.user.id);

        await supabase
          .from('articles')
          .update({ like_count: article.like_count - 1 })
          .eq('id', article.id);

        setArticle(prev => prev ? { ...prev, like_count: prev.like_count - 1 } : null);
        setIsLiked(false);
        
        toast({
          title: "いいねを解除しました",
          description: "この記事へのいいねを取り消しました。",
        });
      } else {
        // いいねを追加
        await supabase
          .from('article_likes')
          .insert({
            article_id: article.id,
            user_id: session.session.user.id,
          });

        await supabase
          .from('articles')
          .update({ like_count: article.like_count + 1 })
          .eq('id', article.id);

        setArticle(prev => prev ? { ...prev, like_count: prev.like_count + 1 } : null);
        setIsLiked(true);
        
        toast({
          title: "いいねしました",
          description: "この記事にいいねしました。",
        });
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: "エラー",
        description: "いいねの処理中にエラーが発生しました。",
        variant: "destructive",
      });
    } finally {
      setIsLikeLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-red-600 mb-4">エラー</h1>
        <p className="text-gray-600">{error || '記事が見つかりませんでした。'}</p>
      </div>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
          <span>{article.category}</span>
          <span>•</span>
          <time dateTime={article.published_at}>
            {formatDistanceToNow(new Date(article.published_at), {
              addSuffix: true,
              locale: ja,
            })}
          </time>
        </div>
        <h1 className="text-4xl font-bold mb-6">{article.title}</h1>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {article.author.avatar_url && (
              <img
                src={article.author.avatar_url}
                alt={article.author.name}
                className="w-12 h-12 rounded-full"
              />
            )}
            <div>
              <div className="font-medium">{article.author.name}</div>
              <div className="text-sm text-gray-600">著者</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              {article.view_count}
            </Button>
            <Button
              variant={isLiked ? "default" : "ghost"}
              size="sm"
              onClick={handleLike}
              disabled={isLikeLoading}
            >
              <Heart className={`h-4 w-4 mr-2 ${isLiked ? "fill-current" : ""}`} />
              {article.like_count}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="prose prose-lg max-w-none">
        {article.content}
      </div>

      <Comments articleId={article.id} />
    </article>
  );
} 