import { Redis } from '@upstash/redis'

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export async function getChatHistory(userId: string): Promise<any[]> {
  try {
    const history = await redis.get(`chat:${userId}`);

    return history ;
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return [];
  }
}

export async function updateChatHistory(userId: string, messages: any[]) {
  try {
    // Store with 7 days expiration (in seconds)
    await redis.set(`chat:${userId}`, messages, { ex: 7 * 24 * 60 * 60 });
  } catch (error) {
    console.error('Error updating chat history:', error);
  }
} 