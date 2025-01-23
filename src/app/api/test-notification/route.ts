import { NextResponse } from 'next/server';
import { NotificationService } from '@/lib/services/NotificationService';

export async function GET() {
  const notificationService = new NotificationService(process.env.SLACK_WEBHOOK_URL!);

  try {
    // 成功通知のテスト
    await notificationService.notifySuccess(
      'これはテストメッセージです',
      {
        timestamp: new Date().toISOString(),
        environment: 'development'
      }
    );

    // エラー通知のテスト
    await notificationService.notifyError(
      new Error('テストエラー'),
      {
        context: 'Notification Test',
        timestamp: new Date().toISOString()
      }
    );

    return NextResponse.json({ success: true, message: '通知テスト完了' });
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
    return NextResponse.json(
      { success: false, error: 'テスト中にエラーが発生しました' },
      { status: 500 }
    );
  }
} 