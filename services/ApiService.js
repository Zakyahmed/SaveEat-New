import { API_URL } from '../constants/Config';

// Fonction utilitaire pour les requêtes
const apiRequest = async (endpoint, method = 'GET', data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
    cache: 'no-store',
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  // Débogage des requêtes
  console.log(`Requête API: ${method} ${API_URL}${endpoint}`);
  console.log('Headers:', headers);
  if (config.body) {
    console.log('Données:', JSON.parse(config.body));
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    
    // Débogage des réponses
    console.log(`Statut de la réponse: ${response.status}`);
    
    const responseData = await response.json();
    console.log('Données de réponse:', responseData);

    if (!response.ok) {
      // Gérer les erreurs de validation
      if (response.status === 422) {
        throw new Error(
          responseData.message || 
          Object.values(responseData.errors).flat().join('\n')
        );
      }
      
      // Autres erreurs
      throw new Error(responseData.message || 'Une erreur est survenue');
    }

    return responseData;
  } catch (error) {
    // Intercepter les erreurs de syntaxe JSON
    if (error instanceof SyntaxError && error.message.includes('JSON')) {
      console.error('Erreur de connexion au serveur');
      throw new Error('Impossible de se connecter au serveur. Veuillez vérifier votre connexion internet et la disponibilité du serveur.');
    }
    
    // Intercepter les erreurs de connexion réseau
    if (error.message === 'Network request failed') {
      console.error('Erreur de réseau');
      throw new Error('Problème de connexion au serveur. Veuillez vérifier votre connexion internet.');
    }
    
    console.error('API Error:', error);
    throw error;
  }
};

export default apiRequest;