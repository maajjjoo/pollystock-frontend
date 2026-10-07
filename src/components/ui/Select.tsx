import React, { useState } from 'react';
import { View, TouchableOpacity, Modal, ScrollView } from 'react-native';
import { SymbolView } from 'expo-symbols';
import { Text } from './Text';

interface Option {
  label: string;
  value: string;
}

interface SelectProps {
  label?: string;
  options: Option[];
  selectedValue?: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

export function Select({ label, options, selectedValue, onSelect, placeholder = 'Seleccionar...' }: SelectProps) {
  const [visible, setVisible] = useState(false);
  
  const selectedOption = options.find(o => o.value === selectedValue);

  return (
    <View className="mb-4">
      {label && <Text variant="caption" className="font-medium mb-1.5 ml-1 text-text-secondary">{label}</Text>}
      
      <TouchableOpacity 
        onPress={() => setVisible(true)}
        className="bg-surface border border-border rounded-xl py-3.5 px-4 flex-row justify-between items-center"
      >
        <Text className={`text-base ${selectedOption ? 'text-text' : 'text-text-secondary'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <SymbolView name="chevron.down" size={16} tintColor="rgb(var(--color-disabled))" />
      </TouchableOpacity>

      <Modal visible={visible} animationType="fade" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-surface rounded-t-3xl p-6 max-h-[80%] pb-10">
            <View className="flex-row justify-between items-center mb-6">
              <Text variant="h2">{label || 'Seleccionar'}</Text>
              <TouchableOpacity onPress={() => setVisible(false)} className="bg-surface-variant rounded-full w-8 h-8 items-center justify-center">
                <SymbolView name="xmark" size={14} tintColor="rgb(var(--color-text-secondary))" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {options.map((option) => {
                const isSelected = option.value === selectedValue;
                return (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => {
                      onSelect(option.value);
                      setVisible(false);
                    }}
                    className={`py-4 px-4 mb-2 rounded-xl border flex-row justify-between items-center ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-background'}`}
                  >
                    <Text className={`font-medium text-base ${isSelected ? 'text-primary' : 'text-text'}`}>
                      {option.label}
                    </Text>
                    {isSelected && (
                      <SymbolView name="checkmark" size={18} tintColor="rgb(var(--color-primary))" />
                    )}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
