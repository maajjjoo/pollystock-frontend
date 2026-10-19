import { apiClient, ApiError } from '@/core/api/client';
import { AIInsightsData, AIChatData, AIChatRequest } from '../types';

export function formatAIErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.code) {
      case 'AI_NOT_CONFIGURED':
        return 'El asistente de IA aún no ha sido configurado en el servidor. Falta definir la variable GEMINI_API_KEY en el backend.';
      case 'AI_RATE_LIMIT':
        return 'Se ha alcanzado temporalmente el límite de solicitudes de la IA. Por favor, intenta de nuevo en unos momentos.';
      case 'AI_NETWORK_ERROR':
        return 'El servicio de IA de Google Gemini no está disponible temporalmente por alta demanda o problemas de red. Por favor, intenta de nuevo.';
      case 'AI_EMPTY_RESPONSE':
        return 'El asistente de IA no pudo generar una respuesta. Por favor, intenta reformular tu pregunta.';
      case 'VALIDATION_ERROR':
        return error.message || 'La consulta no es válida.';
      case 'NETWORK_ERROR':
        return 'No fue posible conectar con el servidor de PollyStock. Verifica tu conexión de red o que el servidor backend esté activo.';
      default:
        return error.message || 'Ocurrió un error inesperado al consultar el asistente de IA.';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Ocurrió un error inesperado al procesar la solicitud con el asistente.';
}

export async function getInventoryInsights(businessId?: string): Promise<AIInsightsData> {
  const query = businessId ? `?businessId=${encodeURIComponent(businessId)}` : '';
  return await apiClient.get<AIInsightsData>(`/ai/insights${query}`);
}

export async function sendChatMessage(request: AIChatRequest): Promise<AIChatData> {
  return await apiClient.post<AIChatData>('/ai/chat', request);
}
