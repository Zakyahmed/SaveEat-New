// App.js
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './context/AuthContext';
import { FoodProvider } from './context/FoodContext';
import NavigateurPrincipal from './navigation/NavigateurPrincipal';

export default function App() {
  return (
    <AuthProvider>
      <FoodProvider>
        <NavigationContainer>
          <StatusBar style="auto" />
          <NavigateurPrincipal />
        </NavigationContainer>
      </FoodProvider>
    </AuthProvider>
  );
}