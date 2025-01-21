'use client';

import { useSupabase } from '@/providers/SupabaseProvider';

export default function ProfilePage() {
  const { user, loading } = useSupabase();

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">読み込み中...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900">プロフィール</h1>
        <div className="mt-6 bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                アカウント情報
              </h3>
              <div className="mt-2 max-w-xl text-sm text-gray-500">
                <p>あなたのアカウントの基本情報です。</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  メールアドレス
                </label>
                <div className="mt-1">
                  <p className="text-sm text-gray-900">{user.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ユーザーID
                </label>
                <div className="mt-1">
                  <p className="text-sm text-gray-900">{user.id}</p>
                </div>
              </div>

              {user.user_metadata?.name && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    名前
                  </label>
                  <div className="mt-1">
                    <p className="text-sm text-gray-900">
                      {user.user_metadata.name}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  認証プロバイダー
                </label>
                <div className="mt-1">
                  <p className="text-sm text-gray-900">
                    {user.app_metadata.provider || 'email'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 