export class NotificationService {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  async notifyError(error: Error, context: Record<string, unknown>): Promise<void> {
    const message = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "🚨 エラーが発生しました",
            emoji: true
          }
        },
        {
          type: "section",
          fields: [
            {
              type: "mrkdwn",
              text: `*エラー種別:*\n${error.name}`
            },
            {
              type: "mrkdwn",
              text: `*タイムスタンプ:*\n${new Date().toLocaleString('ja-JP')}`
            }
          ]
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*エラーメッセージ:*\n\`\`\`${error.message}\`\`\``
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*コンテキスト:*\n\`\`\`${JSON.stringify(context, null, 2)}\`\`\``
          }
        }
      ]
    };

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        console.error('Slack通知の送信に失敗しました:', response.statusText);
      }
    } catch (error) {
      console.error('Slack通知の送信中にエラーが発生しました:', error);
    }
  }

  async notifySuccess(message: string, details?: Record<string, unknown>): Promise<void> {
    const payload = {
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: "✅ 処理が完了しました",
            emoji: true
          }
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: message
          }
        }
      ]
    };

    if (details) {
      payload.blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*詳細:*\n\`\`\`${JSON.stringify(details, null, 2)}\`\`\``
        }
      });
    }

    try {
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        console.error('Slack通知の送信に失敗しました:', response.statusText);
      }
    } catch (error) {
      console.error('Slack通知の送信中にエラーが発生しました:', error);
    }
  }
} 