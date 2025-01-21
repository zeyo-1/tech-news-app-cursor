import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';
import LoginPage from './page';
import { supabase } from '@/lib/supabase';

// モックの設定
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

jest.mock('@/lib/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signInWithOAuth: jest.fn(),
    },
  },
}));

describe('LoginPage', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  // メールとパスワードによるログインのテスト
  describe('Email/Password Login', () => {
    it('正常にログインできる', async () => {
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ error: null });
      
      render(<LoginPage />);
      
      fireEvent.change(screen.getByPlaceholderText('メールアドレス'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('パスワード'), {
        target: { value: 'password123' },
      });
      
      fireEvent.submit(screen.getByRole('button', { name: 'ログイン' }));
      
      await waitFor(() => {
        expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
          email: 'test@example.com',
          password: 'password123',
        });
        expect(mockRouter.push).toHaveBeenCalledWith('/');
        expect(mockRouter.refresh).toHaveBeenCalled();
      });
    });

    it('ログインエラーを表示する', async () => {
      const errorMessage = 'Invalid credentials';
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
        error: new Error(errorMessage),
      });
      
      render(<LoginPage />);
      
      fireEvent.change(screen.getByPlaceholderText('メールアドレス'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('パスワード'), {
        target: { value: 'wrongpassword' },
      });
      
      fireEvent.submit(screen.getByRole('button', { name: 'ログイン' }));
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  // ソーシャルログインのテスト
  describe('Social Login', () => {
    it('Googleログインを実行できる', async () => {
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({ error: null });
      
      render(<LoginPage />);
      
      fireEvent.click(screen.getByRole('button', { name: /Sign in with Google/i }));
      
      await waitFor(() => {
        expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'google',
          options: {
            redirectTo: expect.stringContaining('/auth/callback'),
            queryParams: {
              next: '/'
            },
            skipBrowserRedirect: false
          }
        });
      });
    });

    it('GitHubログインを実行できる', async () => {
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({ error: null });
      
      render(<LoginPage />);
      
      fireEvent.click(screen.getByRole('button', { name: /Sign in with GitHub/i }));
      
      await waitFor(() => {
        expect(supabase.auth.signInWithOAuth).toHaveBeenCalledWith({
          provider: 'github',
          options: {
            redirectTo: expect.stringContaining('/auth/callback'),
            queryParams: {
              next: '/'
            },
            skipBrowserRedirect: false
          }
        });
      });
    });

    it('ソーシャルログインのエラーを表示する', async () => {
      const errorMessage = 'Failed to connect';
      (supabase.auth.signInWithOAuth as jest.Mock).mockResolvedValueOnce({
        error: new Error(errorMessage),
      });
      
      render(<LoginPage />);
      
      fireEvent.click(screen.getByRole('button', { name: /Sign in with Google/i }));
      
      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });
    });
  });

  // リダイレクト機能のテスト
  describe('Redirect Functionality', () => {
    it('redirectToパラメータがある場合、指定されたパスにリダイレクトする', async () => {
      const redirectPath = '/dashboard';
      Object.defineProperty(window, 'location', {
        value: {
          search: `?redirectTo=${redirectPath}`,
        },
        writable: true,
      });
      
      (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({ error: null });
      
      render(<LoginPage />);
      
      fireEvent.change(screen.getByPlaceholderText('メールアドレス'), {
        target: { value: 'test@example.com' },
      });
      fireEvent.change(screen.getByPlaceholderText('パスワード'), {
        target: { value: 'password123' },
      });
      
      fireEvent.submit(screen.getByRole('button', { name: 'ログイン' }));
      
      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith(redirectPath);
      });
    });
  });
}); 