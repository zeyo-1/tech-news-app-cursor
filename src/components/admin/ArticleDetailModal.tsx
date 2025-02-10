'use client';

import { useState } from 'react';
import { Article } from '@/types/article';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { ExternalLink, Pencil } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArticleEditForm } from './ArticleEditForm';

interface ArticleDetailModalProps {
  article: Article | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate?: () => void;
}

export function ArticleDetailModal({
  article,
  isOpen,
  onClose,
  onUpdate,
}: ArticleDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);

  if (!article) return null;

  const handleSave = () => {
    setIsEditing(false);
    if (onUpdate) onUpdate();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[80vh]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">
              {isEditing ? '記事の編集' : '記事の詳細'}
            </DialogTitle>
            {!isEditing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="mr-2 h-4 w-4" />
                編集
              </Button>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="h-full pr-4">
          {isEditing ? (
            <ArticleEditForm
              article={article}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <div className="space-y-6">
              {/* ヘッダー情報 */}
              <div className="space-y-2">
                <h2 className="text-2xl font-bold">{article.title}</h2>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant={article.is_published ? "default" : "secondary"}>
                    {article.is_published ? "公開中" : "非公開"}
                  </Badge>
                  <span>•</span>
                  <span>{article.category}</span>
                  <span>•</span>
                  <time dateTime={article.published_at}>
                    {format(new Date(article.published_at), 'yyyy年M月d日 HH:mm', { locale: ja })}
                  </time>
                </div>
              </div>

              {/* 要約 */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">要約</h3>
                <div className="rounded-lg border bg-muted/50 p-4">
                  <p className="whitespace-pre-wrap">{article.summary}</p>
                </div>
              </div>

              {/* 本文 */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">本文</h3>
                <div className="rounded-lg border p-4">
                  <p className="whitespace-pre-wrap">{article.content}</p>
                </div>
              </div>

              {/* メタ情報 */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">メタ情報</h3>
                <dl className="grid gap-2 rounded-lg border p-4">
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="font-medium text-muted-foreground">作成日時</dt>
                    <dd className="col-span-2">
                      {format(new Date(article.created_at), 'yyyy年M月d日 HH:mm:ss', { locale: ja })}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="font-medium text-muted-foreground">更新日時</dt>
                    <dd className="col-span-2">
                      {format(new Date(article.updated_at), 'yyyy年M月d日 HH:mm:ss', { locale: ja })}
                    </dd>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <dt className="font-medium text-muted-foreground">元記事</dt>
                    <dd className="col-span-2">
                      <Button
                        variant="link"
                        className="h-auto p-0 text-blue-500"
                        asChild
                      >
                        <a
                          href={article.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1"
                        >
                          {article.source_url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </Button>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
} 