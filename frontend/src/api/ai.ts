import { api } from './client';

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  source?: string;
  confidence?: 'high' | 'medium' | 'low';
  suggestedActions?: string[];
  navigationUrl?: string;
}

export interface AiChatResponse {
  answer: string;
  source?: string;
  sources?: string[];
  confidence?: 'high' | 'medium' | 'low';
  suggestedActions?: string[];
  navigationUrl?: string;
  isEstimate?: boolean;
}

export const aiApi = {
  chat: async (question: string, language: 'ne' | 'en' = 'ne'): Promise<AiChatResponse> => {
    // Call the new Smart AI Backend (ai_service) at /api/v1/chat/
    const res: any = await api.post('/chat/', { 
      messages: [{ role: 'user', content: question }],
      language 
    });
    
    const data = res?.data || res;
    const answerText = data.reply || "माफ गर्नुहोला, म यसको उत्तर दिन असमर्थ छु।";

    return {
      answer: answerText,
      suggestedActions: data.actions || [],
      navigationUrl: data.navigationUrl
    };
  },
};
