import { useState, useRef, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, TextInput as RNTextInput } from 'react-native';
import { router } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { Screen } from '@/components/ui/Screen';
import { Text } from '@/components/ui/Text';
import { TextInput } from '@/components/ui/TextInput';
import { Button } from '@/components/ui/Button';
import { useConfigStore } from '@/features/settings/hooks/use-config-store';
import { BottomNav } from '@/components/ui/BottomNav';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isMockData?: boolean;
}

export default function AssistantScreen() {
  const { profile } = useConfigStore();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const SUGGESTIONS = [
    '¿Qué productos tienen poco stock?',
    'Analiza mi inventario.',
    '¿Qué movimientos hubo hoy?',
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
    // eslint-disable-next-line react-hooks/purity
    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: trimmed };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    // Mock AI response logic
    setTimeout(() => {
      setMessages(prev => [...prev, {
        // eslint-disable-next-line react-hooks/purity
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'El asistente aún no está conectado a una IA real. Por ahora no puedo responder a tus consultas.',
        isMockData: true
      }]);
      setIsLoading(false);
    }, 1000);
  };

  const renderMessageContent = (content: string) => {
    // Simple markdown-like bold rendering for mock responses
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return (
      <Text className="leading-relaxed text-base">
        {parts.map((part, i) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <Text key={i} className="font-bold">{part.replace(/\*\*/g, '')}</Text>;
          }
          return part;
        })}
      </Text>
    );
  };

  return (
    <Screen className="bg-background">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
        className="flex-1"
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4 border-b border-border bg-surface">
          <Text variant="h2" >Análisis IA</Text>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          className="flex-1 px-4" 
          contentContainerStyle={{ paddingVertical: 24, paddingBottom: 100 }}
        >
          {messages.length === 0 ? (
            <View className="flex-1 justify-center items-center py-10 mt-10">
              <View className="w-16 h-16 bg-primary/10 rounded-[20px] items-center justify-center mb-6">
                <SymbolView name="sparkles" size={32} tintColor="rgb(var(--color-primary))" />
              </View>
              <Text variant="h3" className="mb-2 text-text">¿En qué puedo ayudarte con tu inventario?</Text>
              <Text variant="caption" color="secondary" className="text-center mb-8 px-4 text-base">
                Pregúntame sobre existencias, movimientos o recomendaciones para tu negocio.
              </Text>
              
              <View className="w-full gap-3">
                {SUGGESTIONS.map((sug, idx) => (
                  <TouchableOpacity 
                    key={idx} 
                    onPress={() => handleSend(sug)}
                    className="bg-surface border border-border/60 rounded-xl px-4 py-3 flex-row items-center active:bg-surface-variant shadow-sm"
                  >
                    <SymbolView name="message.fill" size={16} tintColor="rgb(var(--color-secondary))" className="mr-3" />
                    <Text className="text-text-secondary font-medium flex-1">{sug}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : (
            <View className="gap-6">
              {messages.map((msg) => (
                <View 
                  key={msg.id} 
                  className={`flex-row ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3 mt-1">
                      <SymbolView name="sparkles" size={14} tintColor="rgb(var(--color-primary))" />
                    </View>
                  )}
                  
                  <View 
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === 'user' 
                        ? 'bg-primary rounded-tr-sm' 
                        : 'bg-surface border border-border shadow-sm rounded-tl-sm'
                    }`}
                  >
                    <Text className={msg.role === 'user' ? 'text-white' : 'text-text'}>
                      {renderMessageContent(msg.content)}
                    </Text>
                  </View>
                </View>
              ))}
              
              {isLoading && (
                <View className="flex-row justify-start">
                  <View className="w-8 h-8 rounded-full bg-primary/10 items-center justify-center mr-3 mt-1">
                    <SymbolView name="sparkles" size={14} tintColor="rgb(var(--color-primary))" />
                  </View>
                  <View className="bg-surface border border-border shadow-sm rounded-2xl rounded-tl-sm p-4 w-16 items-center justify-center">
                    <ActivityIndicator size="small" color="rgb(var(--color-primary))" />
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
              placeholder="Escribe una pregunta..."
              placeholderTextColor="rgb(var(--color-disabled))"
              value={input}
              onChangeText={setInput}
              maxLength={500}
              multiline
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
