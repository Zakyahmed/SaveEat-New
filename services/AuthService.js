import apiRequest from './ApiService';

// Service pour l'authentification
export const login = async (email, password) => {
  return apiRequest('/auth/login', 'POST', { email, password });
};

export const register = async (userData) => {
  // Forcer la validation du restaurant/association
  const dataWithValidation = {
    ...userData,
    rest_valide: 1,  // Ajouter ce champ pour les restaurants
    asso_valide: 1   // Ajouter ce champ pour les associations
  };
  
  console.log('Données d\'inscription avec validation:', dataWithValidation);
  
  return apiRequest('/auth/register', 'POST', dataWithValidation);
};

export const logout = async (token) => {
  return apiRequest('/auth/logout', 'POST', null, token);
};

export const getProfile = async (token) => {
  return apiRequest('/auth/profile', 'GET', null, token);
};

// Fonction utilitaire pour valider un restaurant après création
// À appeler si la validation automatique ne fonctionne pas
export const validateRestaurant = async (restaurantId, token) => {
  return apiRequest(`/restaurants/${restaurantId}/validate`, 'POST', { rest_valide: 1 }, token);
};