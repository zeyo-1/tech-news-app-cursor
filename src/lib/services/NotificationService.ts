import axios from 'axios';

interface NotificationOptions {
  color?: string;
  fields?: Record<string, string | number>;
}

export class NotificationService {
  private webhookUrl: string;

  constructor(webhookUrl: string) {
    this.webhookUrl = webhookUrl;
  }

  private async sendToSlack(message: any) {
    try {
      await axios.post(this.webhookUrl, message);
    } catch (error) {
      console.error('Failed to send Slack notification:', error);
      throw error;
    }
  }

  async notifySuccess(message: string, data?: Record<string, any>) {
    const fields = data ? Object.entries(data).map(([key, value]) => ({
      title: key,
      value: String(value),
      short: true
    })) : [];

    await this.sendToSlack({
      attachments: [{
        color: '#36a64f',
        text: message,
        fields,
        footer: 'Tech News App',
        ts: Math.floor(Date.now() / 1000)
      }]
    });
  }

  async notifyError(error: Error, context?: { context: string; stats?: any }) {
    const fields = [];
    
    if (context?.context) {
      fields.push({
        title: 'Context',
        value: context.context,
        short: true
      });
    }

    if (context?.stats) {
      fields.push({
        title: 'Stats',
        value: JSON.stringify(context.stats, null, 2),
        short: false
      });
    }

    await this.sendToSlack({
      attachments: [{
        color: '#ff0000',
        title: 'エラーが発生しました',
        text: error.message,
        fields,
        footer: 'Tech News App',
        ts: Math.floor(Date.now() / 1000)
      }]
    });
  }
} 