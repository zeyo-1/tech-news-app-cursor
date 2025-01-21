'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { formatDistanceToNow } from 'date-fns';
import { ja } from 'date-fns/locale';
import { Pencil, Trash2, MessageCircle, ChevronDown, ChevronUp, ArrowUpDown, Flag, ThumbsUp, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type SortOption = 'newest' | 'oldest' | 'most_replies' | 'most_likes' | 'most_active';

type Comment = {
  id: string;
  content: string;
  created_at: string;
  user_id: string;
  parent_id: string | null;
  reply_count: number;
  like_count: number;
  user: {
    id: string;
    name: string;
    avatar_url: string;
  };
};

type ReportReason = '不適切な内容' | 'スパム' | '荒らし' | 'その他';

type CommentsProps = {
  articleId: string;
};

export default function Comments({ articleId }: CommentsProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [expandedComments, setExpandedComments] = useState<string[]>([]);
  const [replies, setReplies] = useState<{ [key: string]: Comment[] }>({});
  const [sortOption, setSortOption] = useState<SortOption>('newest');
  const supabase = createClientComponentClient();
  const { toast } = useToast();

  // コメントを取得
  useEffect(() => {
    const fetchComments = async () => {
      try {
        let query = supabase
          .from('comments')
          .select(`
            *,
            user:profiles(id, name, avatar_url),
            likes:comment_likes(count),
            latest_reply:comments(
              created_at
            )
          `)
          .eq('article_id', articleId)
          .is('parent_id', null);

        // 並び替えの適用
        switch (sortOption) {
          case 'newest':
            query = query.order('created_at', { ascending: false });
            break;
          case 'oldest':
            query = query.order('created_at', { ascending: true });
            break;
          case 'most_replies':
            query = query.order('reply_count', { ascending: false });
            break;
          case 'most_likes':
            query = query.order('like_count', { ascending: false });
            break;
          case 'most_active':
            // 返信数といいね数の合計で並び替え
            query = query.order('reply_count', { ascending: false })
                        .order('like_count', { ascending: false });
            break;
        }

        const { data, error } = await query;

        if (error) throw error;
        setComments(data || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        toast({
          title: 'エラー',
          description: 'コメントの取得に失敗しました。',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchComments();
  }, [articleId, supabase, toast, sortOption]);

  // 返信を取得
  const fetchReplies = async (commentId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          user:profiles(id, name, avatar_url)
        `)
        .eq('article_id', articleId)
        .eq('parent_id', commentId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setReplies(prev => ({ ...prev, [commentId]: data || [] }));
    } catch (error) {
      console.error('Error fetching replies:', error);
      toast({
        title: 'エラー',
        description: '返信の取得に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  // 返信の表示/非表示を切り替え
  const toggleReplies = async (commentId: string) => {
    if (expandedComments.includes(commentId)) {
      setExpandedComments(expandedComments.filter(id => id !== commentId));
    } else {
      setExpandedComments([...expandedComments, commentId]);
      if (!replies[commentId]) {
        await fetchReplies(commentId);
      }
    }
  };

  // 返信を開始
  const handleReplyStart = (commentId: string) => {
    setReplyingToId(commentId);
    setReplyContent('');
  };

  // 返信をキャンセル
  const handleReplyCancel = () => {
    setReplyingToId(null);
    setReplyContent('');
  };

  // 返信を投稿
  const handleReplySubmit = async (parentId: string) => {
    if (!replyContent.trim()) return;

    try {
      setIsSubmitting(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        toast({
          title: 'エラー',
          description: '返信を投稿するにはログインが必要です。',
          variant: 'destructive',
        });
        return;
      }

      const { data: reply, error: replyError } = await supabase
        .from('comments')
        .insert({
          content: replyContent.trim(),
          article_id: articleId,
          user_id: session.session.user.id,
          parent_id: parentId,
        })
        .select(`
          *,
          user:profiles(id, name, avatar_url)
        `)
        .single();

      if (replyError) throw replyError;

      // 親コメントの返信数を更新
      const { error: updateError } = await supabase
        .from('comments')
        .update({ reply_count: (replies[parentId]?.length || 0) + 1 })
        .eq('id', parentId);

      if (updateError) throw updateError;

      // 返信を追加
      setReplies(prev => ({
        ...prev,
        [parentId]: [...(prev[parentId] || []), reply],
      }));

      // 親コメントの返信数を更新
      setComments(prev =>
        prev.map(c =>
          c.id === parentId
            ? { ...c, reply_count: (c.reply_count || 0) + 1 }
            : c
        )
      );

      setReplyingToId(null);
      setReplyContent('');
      
      if (!expandedComments.includes(parentId)) {
        setExpandedComments([...expandedComments, parentId]);
      }

      toast({
        title: '投稿完了',
        description: '返信を投稿しました。',
      });
    } catch (error) {
      console.error('Error posting reply:', error);
      toast({
        title: 'エラー',
        description: '返信の投稿に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // コメントを投稿
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setIsSubmitting(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        toast({
          title: 'エラー',
          description: 'コメントを投稿するにはログインが必要です。',
          variant: 'destructive',
        });
        return;
      }

      const { data: comment, error } = await supabase
        .from('comments')
        .insert({
          content: newComment.trim(),
          article_id: articleId,
          user_id: session.session.user.id,
        })
        .select(`
          *,
          user:profiles(id, name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setComments([comment, ...comments]);
      setNewComment('');
      toast({
        title: '投稿完了',
        description: 'コメントを投稿しました。',
      });
    } catch (error) {
      console.error('Error posting comment:', error);
      toast({
        title: 'エラー',
        description: 'コメントの投稿に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // コメントの編集を開始
  const handleEditStart = (comment: Comment) => {
    setEditingCommentId(comment.id);
    setEditContent(comment.content);
  };

  // コメントの編集をキャンセル
  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditContent('');
  };

  // コメントの編集を保存
  const handleEditSave = async (commentId: string) => {
    if (!editContent.trim()) return;

    try {
      setIsSubmitting(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        toast({
          title: 'エラー',
          description: 'コメントを編集するにはログインが必要です。',
          variant: 'destructive',
        });
        return;
      }

      // 現在のコメント内容を履歴に保存
      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      const { error: historyError } = await supabase
        .from('comment_edit_history')
        .insert({
          comment_id: commentId,
          content: comment.content,
          edited_by: session.session.user.id
        });

      if (historyError) throw historyError;

      // コメントを更新
      const { data: updatedComment, error } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId)
        .select(`
          *,
          user:profiles(id, name, avatar_url)
        `)
        .single();

      if (error) throw error;

      setComments(comments.map(c => c.id === commentId ? updatedComment : c));
      setEditingCommentId(null);
      setEditContent('');
      toast({
        title: '更新完了',
        description: 'コメントを更新しました。',
      });
    } catch (error) {
      console.error('Error updating comment:', error);
      toast({
        title: 'エラー',
        description: 'コメントの更新に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 編集履歴を取得
  const fetchEditHistory = async (commentId: string) => {
    try {
      const { data, error } = await supabase
        .from('comment_edit_history')
        .select(`
          *,
          editor:profiles(name)
        `)
        .eq('comment_id', commentId)
        .order('edited_at', { ascending: false });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching edit history:', error);
      toast({
        title: 'エラー',
        description: '編集履歴の取得に失敗しました。',
        variant: 'destructive',
      });
      return [];
    }
  };

  // コメントを削除
  const handleDelete = async (commentId: string) => {
    if (!window.confirm('このコメントを削除してもよろしいですか？')) return;

    try {
      setIsSubmitting(true);
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      setComments(comments.filter(c => c.id !== commentId));
      toast({
        title: '削除完了',
        description: 'コメントを削除しました。',
      });
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: 'エラー',
        description: 'コメントの削除に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 現在のユーザーIDを取得
  const getCurrentUserId = async () => {
    const { data: session } = await supabase.auth.getSession();
    return session?.session?.user?.id;
  };

  // コメントを通報
  const handleReport = async (commentId: string, reason: ReportReason) => {
    try {
      setIsSubmitting(true);
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        toast({
          title: 'エラー',
          description: 'コメントを通報するにはログインが必要です。',
          variant: 'destructive',
        });
        return;
      }

      const { error } = await supabase
        .from('comment_reports')
        .insert({
          comment_id: commentId,
          user_id: session.session.user.id,
          reason: reason,
        });

      if (error) {
        if (error.code === '23505') { // unique_violation
          toast({
            title: '通報済み',
            description: 'このコメントは既に通報済みです。',
            variant: 'destructive',
          });
        } else {
          throw error;
        }
        return;
      }

      toast({
        title: '通報完了',
        description: 'コメントを通報しました。ご協力ありがとうございます。',
      });
    } catch (error) {
      console.error('Error reporting comment:', error);
      toast({
        title: 'エラー',
        description: 'コメントの通報に失敗しました。',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // コメントのいいね機能を追加
  const handleLike = async (commentId: string) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user) {
        toast({
          title: 'エラー',
          description: 'いいねするにはログインが必要です。',
          variant: 'destructive',
        });
        return;
      }

      const comment = comments.find(c => c.id === commentId);
      if (!comment) return;

      const { data: existingLike } = await supabase
        .from('comment_likes')
        .select()
        .eq('comment_id', commentId)
        .eq('user_id', session.session.user.id)
        .single();

      if (existingLike) {
        // いいねを削除
        const { error: deleteError } = await supabase
          .from('comment_likes')
          .delete()
          .eq('comment_id', commentId)
          .eq('user_id', session.session.user.id);

        if (deleteError) throw deleteError;

        // いいね数を減らす
        const { error: updateError } = await supabase
          .from('comments')
          .update({ like_count: comment.like_count - 1 })
          .eq('id', commentId);

        if (updateError) throw updateError;

        setComments(comments.map(c =>
          c.id === commentId
            ? { ...c, like_count: c.like_count - 1 }
            : c
        ));
      } else {
        // いいねを追加
        const { error: insertError } = await supabase
          .from('comment_likes')
          .insert({
            comment_id: commentId,
            user_id: session.session.user.id,
          });

        if (insertError) throw insertError;

        // いいね数を増やす
        const { error: updateError } = await supabase
          .from('comments')
          .update({ like_count: comment.like_count + 1 })
          .eq('id', commentId);

        if (updateError) throw updateError;

        setComments(comments.map(c =>
          c.id === commentId
            ? { ...c, like_count: c.like_count + 1 }
            : c
        ));
      }
    } catch (error) {
      console.error('Error handling like:', error);
      toast({
        title: 'エラー',
        description: 'いいねの処理に失敗しました。',
        variant: 'destructive',
      });
    }
  };

  // コメントコンポーネント
  const CommentItem = ({ comment, isReply = false }: { comment: Comment; isReply?: boolean }) => {
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [selectedReason, setSelectedReason] = useState<ReportReason>('不適切な内容');
    const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
    const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
    const [editHistory, setEditHistory] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    useEffect(() => {
      getCurrentUserId().then(id => setCurrentUserId(id || null));
    }, []);

    const handleHistoryClick = async () => {
      setIsHistoryDialogOpen(true);
      setIsLoadingHistory(true);
      const history = await fetchEditHistory(comment.id);
      setEditHistory(history);
      setIsLoadingHistory(false);
    };

    return (
      <div className={`${isReply ? 'ml-8 mt-4' : 'border-b pb-6'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {comment.user.avatar_url && (
              <img
                src={comment.user.avatar_url}
                alt={comment.user.name}
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <div className="font-medium">{comment.user.name}</div>
              <time className="text-sm text-gray-600">
                {formatDistanceToNow(new Date(comment.created_at), {
                  addSuffix: true,
                  locale: ja,
                })}
              </time>
            </div>
          </div>
          <div className="flex gap-2">
            {comment.user_id === currentUserId ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditStart(comment)}
                  disabled={isSubmitting}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleHistoryClick}
                  disabled={isSubmitting}
                >
                  <History className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(comment.id)}
                  disabled={isSubmitting}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={isSubmitting}
                  >
                    <Flag className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>コメントを通報</DialogTitle>
                    <DialogDescription>
                      このコメントを通報する理由を選択してください。
                    </DialogDescription>
                  </DialogHeader>
                  <Select
                    value={selectedReason}
                    onValueChange={(value: ReportReason) => setSelectedReason(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="通報理由を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="不適切な内容">不適切な内容</SelectItem>
                      <SelectItem value="スパム">スパム</SelectItem>
                      <SelectItem value="荒らし">荒らし</SelectItem>
                      <SelectItem value="その他">その他</SelectItem>
                    </SelectContent>
                  </Select>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsReportDialogOpen(false)}
                    >
                      キャンセル
                    </Button>
                    <Button
                      onClick={() => {
                        handleReport(comment.id, selectedReason);
                        setIsReportDialogOpen(false);
                      }}
                      disabled={isSubmitting}
                    >
                      通報する
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>

        {editingCommentId === comment.id ? (
          <div>
            <Textarea
              value={editContent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setEditContent(e.target.value)}
              className="mb-4"
              disabled={isSubmitting}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleEditSave(comment.id)}
                disabled={isSubmitting || !editContent.trim()}
              >
                保存
              </Button>
              <Button
                variant="outline"
                onClick={handleEditCancel}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
            {!isReply && (
              <div className="mt-4 flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReplyStart(comment.id)}
                  disabled={isSubmitting}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  返信
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(comment.id)}
                  disabled={isSubmitting}
                >
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  いいね ({comment.like_count})
                </Button>
                {comment.reply_count > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReplies(comment.id)}
                  >
                    {expandedComments.includes(comment.id) ? (
                      <ChevronUp className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    )}
                    返信を{expandedComments.includes(comment.id) ? '非表示' : '表示'}
                    ({comment.reply_count})
                  </Button>
                )}
              </div>
            )}
          </>
        )}

        {replyingToId === comment.id && (
          <div className="mt-4 ml-8">
            <Textarea
              value={replyContent}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReplyContent(e.target.value)}
              placeholder="返信を入力..."
              className="mb-4"
              disabled={isSubmitting}
            />
            <div className="flex gap-2">
              <Button
                onClick={() => handleReplySubmit(comment.id)}
                disabled={isSubmitting || !replyContent.trim()}
              >
                返信を投稿
              </Button>
              <Button
                variant="outline"
                onClick={handleReplyCancel}
                disabled={isSubmitting}
              >
                キャンセル
              </Button>
            </div>
          </div>
        )}

        {!isReply && expandedComments.includes(comment.id) && replies[comment.id] && (
          <div className="mt-4">
            {replies[comment.id].map((reply) => (
              <CommentItem key={reply.id} comment={reply} isReply />
            ))}
          </div>
        )}

        {/* 編集履歴ダイアログ */}
        <Dialog open={isHistoryDialogOpen} onOpenChange={setIsHistoryDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>編集履歴</DialogTitle>
              <DialogDescription>
                このコメントの編集履歴を表示しています。
              </DialogDescription>
            </DialogHeader>
            {isLoadingHistory ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : editHistory.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                編集履歴はありません。
              </div>
            ) : (
              <div className="space-y-4">
                {editHistory.map((history) => (
                  <div key={history.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div className="text-sm text-gray-500">
                        編集者: {history.editor.name}
                      </div>
                      <time className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(history.edited_at), {
                          addSuffix: true,
                          locale: ja,
                        })}
                      </time>
                    </div>
                    <p className="text-gray-800 whitespace-pre-wrap">{history.content}</p>
                  </div>
                ))}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // 並び替えオプションを変更
  const handleSortChange = (option: SortOption) => {
    setSortOption(option);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">コメント</h2>
        <div className="flex gap-2">
          <Button
            variant={sortOption === 'newest' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSortChange('newest')}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            新しい順
          </Button>
          <Button
            variant={sortOption === 'oldest' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSortChange('oldest')}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            古い順
          </Button>
          <Button
            variant={sortOption === 'most_replies' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSortChange('most_replies')}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            返信数順
          </Button>
          <Button
            variant={sortOption === 'most_likes' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSortChange('most_likes')}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            人気順
          </Button>
          <Button
            variant={sortOption === 'most_active' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleSortChange('most_active')}
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            アクティブ順
          </Button>
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <Textarea
          value={newComment}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewComment(e.target.value)}
          placeholder="コメントを入力..."
          className="mb-4"
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={isSubmitting || !newComment.trim()}>
          {isSubmitting ? '投稿中...' : 'コメントを投稿'}
        </Button>
      </form>

      <div className="space-y-6">
        {comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
} 