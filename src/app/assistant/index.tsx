import { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput as RNTextInput } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';
import { BottomNav } from '@/components/ui/BottomNav';
import { sendChatMessage, formatAIErrorMessage } from '@/features/ai/services/aiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isError?: boolean;
  retryText?: string;
  timestamp?: string;
}

export default function AssistantScreen() {
  const { profile } = useConfigStore();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const SUGGESTIONS = [
    '¿Cómo está el inventario actualmente?',
    '¿Qué productos tienen poco stock o están agotados?',
    '¿Qué productos tuvieron mayores salidas recientemente?',
    '¿Qué productos llevan tiempo sin registrar salidas?',
  ];

  useEffect(() => {
    // Scroll to bottom when messages change
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [messages, isLoading]);

  const handleSend = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    setInput('');
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const response = await sendChatMessage({
        message: trimmed,
        businessId: profile?.id,
      });

      const replyText = response.reply?.trim() || 'No se obtuvo una respuesta del asistente.';
      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: replyText,
        timestamp: response.timestamp,
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (error: unknown) {
      const friendlyError = formatAIErrorMessage(error);
      const errorMsg: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: friendlyError,
        isError: true,
        retryText: trimmed,
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMessageContent = (content: string, isError?: boolean) => {
    // Splits by lines and bold formatting (**text**)
    const lines = content.split('\n');

    return (
      <View className="gap-1">
        {lines.map((line, lineIdx) => {
          if (!line.trim()) {
            return <View key={lineIdx} className="h-1.5" />;
          }

          const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
          const cleanLine = isBullet ? line.trim().substring(2) : line;
          const parts = cleanLine.split(/(\*\*.*?\*\*)/g);

          return (
            <View key={lineIdx} className={isBullet ? 'flex-row items-start pl-1' : ''}>
              {isBullet && (
                <Text className={`mr-2 mt-1 text-xs ${isError ? 'text-error' : 'text-primary'}`}>•</Text>
              )}
              <Text className={`leading-relaxed text-base flex-1 ${isError ? 'text-error' : ''}`}>
                {parts.map((part, i) => {
                  if (part.startsWith('**') && part.endsWith('**')) {
                    return (
                      <Text key={i} className="font-bold">
                        {part.replace(/\*\*/g, '')}
                      </Text>
                    );
                  }
                  return part;
                })}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  return (
    <Screen className="bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4 border-b border-border bg-surface flex-row items-center justify-between">
          <View>
            <Text variant="h2">Asistente PollyStock</Text>
            <Text variant="caption" color="secondary">
              {profile?.name ? `${profile.name} • Respuestas reales con IA` : 'Gestión inteligente de inventario'}
            </Text>
          </View>
          <View className="w-9 h-9 rounded-full bg-primary/10 items-center justify-center">
            <SymbolView name="sparkles" size={18} tintColor="rgb(var(--color-primary))" />
          </View>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-4" 
          contentContainerStyle={{ paddingVertical: 20, paddingBottom: 100 }}
          keyboardShouldPersistTaps="handled"
        >
          {messages.length === 0 ? (
            <View className="flex-1 justify-center items-center py-6 mt-4">
              <View className="w-16 h-16 bg-primary/10 rounded-[20px] items-center justify-center mb-5 shadow-sm">
                <SymbolView name="sparkles" size={32} tintColor="rgb(var(--color-primary))" />
              </View>
              <Text variant="h3" className="mb-2 text-text text-center">
                ¿En qué puedo ayudarte hoy?
              </Text>
              <Text variant="caption" color="secondary" className="text-center mb-8 px-4 text-base">
                Consulta sobre tus existencias, productos con baja rotación o reposiciones recomendadas.
              </Text>
              
              <View className="w-full gap-3">
                <Text className="text-xs font-semibold text-text-secondary uppercase px-1 tracking-wider">
                  Sugerencias rápidas
                </Text>
                {SUGGESTIONS.map((sug, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    onPress={() => handleSend(sug)}
                    className="bg-surface border border-border/70 rounded-xl px-4 py-3 flex-row items-center active:bg-surface-variant shadow-sm"
                  >
                    <SymbolView name="bubble.left.and.bubble.right" size={16} tintColor="rgb(var(--color-primary))" className="mr-3" />
                    <Text className="text-text-secondary font-medium flex-1 text-sm">{sug}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View className="gap-5">
              {messages.map((msg) => (
                <View 
                  key={msg.id} 
                  className={`flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <View className={`w-8 h-8 rounded-full items-center justify-center mr-2.5 mt-1 ${msg.isError ? 'bg-error/10' : 'bg-primary/10'}`}>
                      <SymbolView 
                        name={msg.isError ? 'exclamationmark.triangle' : 'sparkles'} 
                        size={14} 
                        tintColor={msg.isError ? 'rgb(var(--color-error))' : 'rgb(var(--color-primary))'} 
                      />
                    </View>
                  )}
                  
                  <View 
                    className={`max-w-[85%] rounded-2xl p-4 ${
                      msg.role === 'user' 
                        ? 'bg-primary rounded-tr-sm' 
                        : msg.isError
                          ? 'bg-surface border border-error/40 shadow-sm rounded-tl-sm'
                          : 'bg-surface border border-border shadow-sm rounded-tl-sm'
                    }`}
                  >
                    {msg.role === 'user' ? (
                      <Text className="text-white text-base leading-relaxed">{msg.content}</Text>
                    ) : (
                      <View>
                        {renderMessageContent(msg.content, msg.isError)}
                        {msg.isError && msg.retryText && (
                          <TouchableOpacity
                            onPress={() => handleSend(msg.retryText!)}
                            disabled={isLoading}
                            className="mt-3 pt-2.5 border-t border-error/20 flex-row items-center self-start"
                          >
                            <SymbolView name="arrow.clockwise" size={12} tintColor="rgb(var(--color-error))" className="mr-1.5" />
                            <Text className="text-error text-xs font-bold">Reintentar consulta</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}
                  </View>
                </View>
              ))}
              
              {isLoading && (
                <View className="flex-row justify-start items-center">
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-2.5 mt-1">
                    <SymbolView name="sparkles" size={14} tintColor="rgb(var(--color-primary))" />
                  </View>
                  <View className="bg-surface border border-border shadow-sm rounded-2xl rounded-tl-sm p-4 flex-row items-center">
                    <ActivityIndicator size="small" color="rgb(var(--color-primary))" className="mr-2.5" />
                    <Text className="text-text-secondary text-sm">PollyStock está analizando tu inventario...</Text>
                  </View>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Input Area */}
        <View className="border-t border-border bg-surface px-4 py-3 pb-8">
          <View className="flex-row items-center bg-background border border-border rounded-2xl pl-4 pr-1 py-1">
            <RNTextInput
              className="flex-1 text-text text-base leading-tight"
              placeholder="Haz una pregunta sobre tu inventario..."
              placeholderTextColor="rgb(var(--color-disabled))"
              value={input}
              onChangeText={setInput}
              maxLength={500}
              multiline
              editable={!isLoading}
              style={{ minHeight: 40, maxHeight: 100, paddingTop: 10, paddingBottom: 10 }}
            />
            <TouchableOpacity 
              onPress={() => handleSend(input)}
              disabled={!input.trim() || isLoading}
              className={`w-10 h-10 rounded-full items-center justify-center ${input.trim() && !isLoading ? 'bg-primary' : 'bg-surface-variant'}`}
            >
              <SymbolView name="arrow.up" size={18} tintColor={input.trim() && !isLoading ? 'white' : 'rgb(var(--color-disabled))'} />
            </TouchableOpacity>
          </View>
        </View>

      </KeyboardAvoidingView>
      
      <BottomNav />
    </Screen>
  );
}
