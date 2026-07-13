import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import { AppProviders } from '@/providers/AppProviders';

// Fonte da marca (Plus Jakarta Sans) — carregada via Google Fonts na web.
// O seletor `#root *` em global.css aplica a família a todos os textos.
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const id = 'gf-plus-jakarta-sans';
  if (!document.getElementById(id)) {
    const link = document.createElement('link');
    link.id = id;
    link.rel = 'stylesheet';
    link.href =
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap';
    document.head.appendChild(link);
  }
}

export default function RootLayout() {
  return (
    <AppProviders>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(app)" />
        <Stack.Screen name="(auth)" />
      </Stack>
    </AppProviders>
  );
}
