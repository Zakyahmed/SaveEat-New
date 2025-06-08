import apiRequest from './ApiService';

// Réservations pour les associations
export const getMesReservationsAssociation = async (token, filters = {}) => {
  let queryString = Object.keys(filters)
    .filter(key => filters[key] !== null && filters[key] !== undefined)
    .map(key => `${key}=${encodeURIComponent(filters[key])}`)
    .join('&');
  
  const endpoint = `/reservations/association${queryString ? `?${queryString}` : ''}`;
  return apiRequest(endpoint, 'GET', null, token);
};

// Créer une réservation
export const creerReservation = async (reservationData, token) => {
  return apiRequest('/reservations', 'POST', reservationData, token);
};

// Modifiez la fonction existante en l'exportant correctement
export const updateReservationStatus = async (reservationId, newStatus, token) => {
  return apiRequest(`/reservations/${reservationId}`, 'PUT', { statut: newStatus }, token);
};

// Réservations pour les restaurants
export const getMesReservationsRestaurant = async (token, filters = {}) => {
  let queryString = Object.keys(filters)
    .filter(key => filters[key] !== null && filters[key] !== undefined)
    .map(key => `${key}=${encodeURIComponent(filters[key])}`)
    .join('&');
  
  const endpoint = `/reservations/restaurant${queryString ? `?${queryString}` : ''}`;
  return apiRequest(endpoint, 'GET', null, token);
};

// Mettre à jour le statut d'une réservation
export const modifierStatutReservation = async (id, statut, token) => {
  return apiRequest(`/reservations/${id}/status`, 'PUT', { statut }, token);
};