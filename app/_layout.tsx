// app/_layout.js
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { AuthProvider } from '../context/AuthContext';
import { FoodProvider } from '../context/FoodContext';

export default function RootLayout() {
  return (
    <AuthProvider>
      <FoodProvider>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen 
            name="(tabs)" 
            options={{ headerShown: false }} 
          />
          <Stack.Screen 
            name="restaurant/invendus/formulaire" 
            options={{ 
              title: "Formulaire d'invendu",
              presentation: 'modal' 
            }} 
          />
        </Stack>
      </FoodProvider>
    </AuthProvider>
  );
}