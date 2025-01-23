import { NotificationService } from '../services/NotificationService';

async function testNotification() {
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

    console.log('通知テスト完了');
  } catch (error) {
    console.error('テスト中にエラーが発生しました:', error);
  }
}

// テストの実行
testNotification(); 