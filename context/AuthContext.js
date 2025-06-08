// context/AuthContext.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { login, logout, register } from '../services/AuthService';

export const AuthContext = createContext();

// Hook personnalisé pour accéder au contexte
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const loadStoredData = async () => {
      try {
        // Pour la démonstration, on efface les données stockées au démarrage
        await AsyncStorage.removeItem('user');
        await AsyncStorage.removeItem('token');
        
        // Ne pas charger les données stockées
        setUser(null);
        setToken(null);
      } catch (error) {
        console.error('Erreur lors du chargement des données stockées:', error);
      } finally {
        setLoading(false);
      }
    };

    loadStoredData();
  }, []);

  // Connexion
  const handleLogin = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await login(email, password);
      
      if (response.token && response.utilisateur) {
        await AsyncStorage.setItem('user', JSON.stringify(response.utilisateur));
        await AsyncStorage.setItem('token', response.token);
        
        setUser(response.utilisateur);
        setToken(response.token);
        return true;
      } else {
        throw new Error('Réponse de connexion invalide');
      }
    } catch (error) {
      setError(error.message || 'Erreur de connexion');
      Alert.alert('Erreur', 'Identifiants incorrects');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Inscription
  const handleRegister = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await register(userData);
      
      if (response.token && response.utilisateur) {
        await AsyncStorage.setItem('user', JSON.stringify(response.utilisateur));
        await AsyncStorage.setItem('token', response.token);
        
        setUser(response.utilisateur);
        setToken(response.token);
        return true;
      } else {
        throw new Error('Réponse d\'inscription invalide');
      }
    } catch (error) {
      setError(error.message || 'Erreur d\'inscription');
      Alert.alert('Erreur', error.message || 'Erreur lors de l\'inscription');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Déconnexion
  const handleLogout = async () => {
    setLoading(true);
    
    try {
      if (token) {
        await logout(token);
      }
      
      await AsyncStorage.removeItem('user');
      await AsyncStorage.removeItem('token');
      
      setUser(null);
      setToken(null);
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    } finally {
      setLoading(false);
    }
  };

  // Mettre à jour les données utilisateur
  const updateUser = async (updatedUserData) => {
    try {
      // Mettre à jour l'état local
      setUser(updatedUserData);
      
      // Sauvegarder dans AsyncStorage
      await AsyncStorage.setItem('user', JSON.stringify(updatedUserData));
      
      console.log('Utilisateur mis à jour avec succès:', updatedUserData);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        isLoggedIn: !!token,
        login: handleLogin,
        register: handleRegister,
        logout: handleLogout,
        updateUser  // Ajout de la fonction updateUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};