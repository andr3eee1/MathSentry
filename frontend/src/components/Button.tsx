import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { C, F, indigoShadow } from '../theme/tokens';

type Props = {
  title: string;
  onPress: () => void;
  icon?: ReactNode;
  loading?: boolean;
  variant?: 'primary' | 'ghost';
  disabled?: boolean;
};

export function Button({ title, onPress, icon, loading, variant = 'primary', disabled }: Props) {
  const style = variant === 'primary'
    ? {
        backgroundColor: C.primary,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        ...(indigoShadow as any),
        opacity: disabled || loading ? 0.7 : 1,
      }
    : {
        backgroundColor: C.card,
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        borderWidth: 1,
        borderColor: C.border,
        opacity: disabled || loading ? 0.7 : 1,
      };
  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || loading} style={style}>
      {loading && <ActivityIndicator color={variant === 'primary' ? C.card : C.foreground} size={14} />}
      {!loading && icon}
      <Text style={{ fontFamily: F.uiSemi, fontSize: 13, color: variant === 'primary' ? C.primaryFg : C.foreground }}>{title}</Text>
    </TouchableOpacity>
  );
}
