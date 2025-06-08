import { API_URL } from '../constants/Config';
import apiRequest from './ApiService';

// Fonction utilitaire pour extraire les données d'une réponse paginée
const extractDataFromResponse = (response) => {
  // Si la réponse a une propriété 'data' et des propriétés de pagination
  if (response && response.data !== undefined && response.current_page !== undefined) {
    console.log('Réponse paginée détectée');
    return response.data;
  }
  
  // Si la réponse a une propriété 'data' simple
  if (response && response.data !== undefined) {
    return response.data;
  }
  
  // Si la réponse est directement un tableau
  if (Array.isArray(response)) {
    return response;
  }
  
  // Sinon, retourner la réponse telle quelle
  return response;
};

// Récupérer les invendus du restaurant connecté
export const getMesInvendus = async (token, filters = {}) => {
  let queryString = Object.keys(filters)
    .filter(key => filters[key] !== null && filters[key] !== undefined)
    .map(key => `${key}=${encodeURIComponent(filters[key])}`)
    .join('&');
  
  const endpoint = `/invendus/my${queryString ? `?${queryString}` : ''}`;
  
  try {
    const response = await apiRequest(endpoint, 'GET', null, token);
    
    // Log pour debug
    console.log('getMesInvendus - Réponse brute:', response);
    
    // Extraire les données
    const data = extractDataFromResponse(response);
    
    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Erreur dans getMesInvendus:', error);
    throw error;
  }
};

// Récupérer un invendu spécifique
export const getInvendu = async (id, token) => {
  return apiRequest(`/invendus/${id}`, 'GET', null, token);
};

// Créer un nouvel invendu
export const creerInvendu = async (invenduData, token) => {
  console.log('URL de création d\'invendu:', `${API_URL}/invendus`);
  console.log('Token d\'authentification:', token);
  console.log('Données de l\'invendu:', invenduData);
  
  try {
    const response = await apiRequest('/invendus', 'POST', invenduData, token);
    
    // Normaliser la réponse
    return {
      success: true,
      data: response.data || response.invendu || response,
      message: response.message || 'Invendu créé avec succès'
    };
  } catch (error) {
    console.error('Détails de l\'erreur lors de la création d\'invendu:', error);
    throw error;
  }
};

// Mettre à jour un invendu
export const modifierInvendu = async (id, invenduData, token) => {
  console.log('URL de modification d\'invendu:', `${API_URL}/invendus/${id}`);
  console.log('Token d\'authentification:', token);
  console.log('Données de l\'invendu:', invenduData);
  
  try {
    const response = await apiRequest(`/invendus/${id}`, 'PUT', invenduData, token);
    
    // Normaliser la réponse
    return {
      success: true,
      data: response.data || response.invendu || response,
      message: response.message || 'Invendu modifié avec succès'
    };
  } catch (error) {
    console.error('Détails de l\'erreur lors de la modification d\'invendu:', error);
    throw error;
  }
};

// Supprimer un invendu
export const supprimerInvendu = async (id, token) => {
  console.log('URL de suppression d\'invendu:', `${API_URL}/invendus/${id}`);
  console.log('Token d\'authentification:', token);
  
  try {
    const response = await apiRequest(`/invendus/${id}`, 'DELETE', null, token);
    
    // Normaliser la réponse
    return {
      success: true,
      message: response.message || 'Invendu supprimé avec succès'
    };
  } catch (error) {
    console.error('Détails de l\'erreur lors de la suppression d\'invendu:', error);
    throw error;
  }
};

// Recherche d'invendus (pour les associations)
export const rechercherInvendus = async (filters = {}, token) => {
  let queryString = Object.keys(filters)
    .filter(key => filters[key] !== null && filters[key] !== undefined)
    .map(key => `${key}=${encodeURIComponent(filters[key])}`)
    .join('&');
  
  // Ajout d'un timestamp pour éviter le cache
  const timestamp = new Date().getTime();
  queryString = queryString ? `${queryString}&timestamp=${timestamp}` : `timestamp=${timestamp}`;
  
  const endpoint = `/search/invendus${queryString ? `?${queryString}` : ''}`;
  
  try {
    const response = await apiRequest(endpoint, 'GET', null, token);
    
    console.log('rechercherInvendus - Réponse brute:', response);
    
    // Extraire les données de la réponse paginée
    const data = extractDataFromResponse(response);
    
    return {
      success: true,
      data: data || []
    };
  } catch (error) {
    console.error('Erreur dans rechercherInvendus:', error);
    throw error;
  }
};

// Récupérer tous les invendus disponibles sans cache
export const getAllInvendus = async (token) => {
  // Ajout de plusieurs paramètres pour éviter le cache
  const timestamp = new Date().getTime();
  const random = Math.random();
  
  // IMPORTANT: Ajouter per_page=100 pour avoir plus de résultats
  const endpoint = `/invendus?statut=disponible&per_page=100&timestamp=${timestamp}&nocache=true&_=${random}`;
  
  console.log('Récupération de tous les invendus disponibles avec contournement de cache');
  console.log('Endpoint utilisé:', endpoint);
  
  try {
    const response = await apiRequest(endpoint, 'GET', null, token);
    
    // Log de la réponse pour debug
    console.log('getAllInvendus - Réponse brute:', response);
    
    // IMPORTANT: La réponse est paginée, les données sont dans response.data
    if (response && response.data && Array.isArray(response.data)) {
      console.log('Données extraites de la pagination:', response.data.length);
      return {
        success: true,
        data: response.data
      };
    }
    
    // Si ce n'est pas le format attendu, log pour debug
    console.log('Format de réponse inattendu:', response);
    
    return {
      success: true,
      data: []
    };
  } catch (error) {
    console.error('Erreur dans getAllInvendus:', error);
    throw error;
  }
};