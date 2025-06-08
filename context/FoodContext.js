// context/FoodContext.js
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import * as invenduService from '../services/InvenduService';
import * as reservationService from '../services/ReservationService';
import { useAuth } from './AuthContext';

// Création d'un wrapper ApiService pour structurer les appels
const ApiService = {
  invendus: {
    getAll: (token) => invenduService.getAllInvendus(token),
    getMine: (token) => invenduService.getMesInvendus(token),
    get: (id, token) => invenduService.getInvendu(id, token),
    create: (data, token) => invenduService.creerInvendu(data, token),
    update: (id, data, token) => invenduService.modifierInvendu(id, data, token),
    delete: (id, token) => invenduService.supprimerInvendu(id, token),
    search: (params, token) => invenduService.rechercherInvendus(params, token)
  },
  reservations: {
    getForAssociation: (token) => reservationService.getMesReservationsAssociation(token),
    getForRestaurant: (token) => reservationService.getMesReservationsRestaurant(token),
    create: (data, token) => reservationService.creerReservation(data, token),
    updateStatus: (id, status, token) => reservationService.modifierStatutReservation(id, status, token),
    cancel: (id, token) => reservationService.updateReservationStatus(id, 'annulée', token)
  }
};

// Création du contexte
const FoodContext = createContext(null);

// Hook personnalisé pour utiliser le contexte
export const useFood = () => {
  const context = useContext(FoodContext);
  if (!context) {
    throw new Error("useFood doit être utilisé à l'intérieur d'un FoodProvider");
  }
  return context;
};

// Fournisseur du contexte
export const FoodProvider = ({ children }) => {
  const { user, token } = useAuth();
  const [invendus, setInvendus] = useState([]);
  const [myInvendus, setMyInvendus] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fonction pour récupérer les invendus disponibles
  const fetchInvendus = useCallback(async (filters = {}) => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Utiliser getAllInvendus avec les paramètres anti-cache
      const result = await ApiService.invendus.getAll(token);
      
      if (result && result.data) {
        console.log("fetchInvendus - Données reçues:", result.data);
        setInvendus(result.data);
      } else if (result && Array.isArray(result)) {
        console.log("fetchInvendus - Tableau reçu directement:", result.length);
        setInvendus(result);
      } else {
        console.log("fetchInvendus - Format de réponse inattendu:", result);
        setInvendus([]);
        setError('Format de données inattendu');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Une erreur est survenue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Fonction pour récupérer mes invendus (restaurant)
  const fetchMyInvendus = useCallback(async (filters = {}) => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ApiService.invendus.getMine(token, filters);
      
      if (result && result.data) {
        setMyInvendus(result.data);
      } else {
        setMyInvendus([]);
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Une erreur est survenue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Fonction pour récupérer un invendu spécifique
  const fetchInvendu = async (id) => {
    if (!token) return { success: false, error: 'Non authentifié' };
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ApiService.invendus.get(id, token);
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Une erreur est survenue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour créer un nouvel invendu (restaurant)
  const createInvendu = async (invenduData) => {
    if (!token) return { success: false, error: 'Non authentifié' };
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ApiService.invendus.create(invenduData, token);
      
      if (result.success) {
        console.log("Invendu créé avec succès, mise à jour des listes");
        
        // Attendre un peu pour que le serveur ait le temps de traiter
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mettre à jour la liste des invendus du restaurant
        await fetchMyInvendus();
        
        // IMPORTANT: Forcer le rafraîchissement de la liste générale
        await fetchInvendus();
      } else {
        setError(result.error || 'Erreur lors de la création de l\'invendu');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Une erreur est survenue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour mettre à jour un invendu (restaurant)
  const updateInvendu = async (id, invenduData) => {
    if (!token) return { success: false, error: 'Non authentifié' };
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ApiService.invendus.update(id, invenduData, token);
      
      if (result.success) {
        console.log("Invendu mis à jour avec succès, rafraîchissement des listes");
        
        // Attendre un peu pour que le serveur ait le temps de traiter
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mettre à jour la liste des invendus du restaurant
        await fetchMyInvendus();
        
        // IMPORTANT: Forcer le rafraîchissement de la liste générale
        await fetchInvendus();
      } else {
        setError(result.error || 'Erreur lors de la mise à jour de l\'invendu');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Une erreur est survenue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour supprimer un invendu (restaurant)
  const deleteInvendu = async (id) => {
    if (!token) return { success: false, error: 'Non authentifié' };
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ApiService.invendus.delete(id, token);
      
      if (result.success) {
        // Mettre à jour la liste des invendus
        await fetchMyInvendus();
        await fetchInvendus();
      } else {
        setError(result.error || 'Erreur lors de la suppression de l\'invendu');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Une erreur est survenue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour récupérer les réservations (association)
  const fetchReservationsAssociation = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ApiService.reservations.getForAssociation(token);
      
      if (result.success) {
        setReservations(result.data.data || result.data);
      } else {
        setError(result.error || 'Erreur lors de la récupération des réservations');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Une erreur est survenue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Fonction pour récupérer les réservations (restaurant)
  const fetchReservationsRestaurant = useCallback(async () => {
    if (!token) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ApiService.reservations.getForRestaurant(token);
      
      if (result.success) {
        setReservations(result.data.data || result.data);
      } else {
        setError(result.error || 'Erreur lors de la récupération des réservations');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Une erreur est survenue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  // Fonction pour créer une réservation (association)
  const createReservation = async (reservationData) => {
    if (!token) return { success: false, error: 'Non authentifié' };
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ApiService.reservations.create(reservationData, token);
      
      if (result.success) {
        // Mettre à jour la liste des réservations
        if (user && user.type === 'association') {
          fetchReservationsAssociation();
        }
      } else {
        setError(result.error || 'Erreur lors de la création de la réservation');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Une erreur est survenue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour mettre à jour le statut d'une réservation (restaurant)
  const updateReservationStatus = async (id, status, commentaire = null) => {
    if (!token) return { success: false, error: 'Non authentifié' };
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ApiService.reservations.updateStatus(id, status, token);
      
      if (result.success) {
        // Mettre à jour la liste des réservations
        if (user && user.type === 'restaurant') {
          fetchReservationsRestaurant();
        }
      } else {
        setError(result.error || 'Erreur lors de la mise à jour du statut');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Une erreur est survenue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour annuler une réservation (association)
  const cancelReservation = async (id) => {
    if (!token) return { success: false, error: 'Non authentifié' };
    
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ApiService.reservations.cancel(id, token);
      
      if (result.success) {
        // Mettre à jour la liste des réservations
        if (user && user.type === 'association') {
          fetchReservationsAssociation();
        }
      } else {
        setError(result.error || 'Erreur lors de l\'annulation de la réservation');
      }
      
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Une erreur est survenue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour rechercher des invendus
  const searchInvendus = async (searchParams) => {
    if (!token) return { success: false, error: 'Non authentifié' };
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Ajouter un timestamp pour éviter le cache
      searchParams.timestamp = new Date().getTime();
      searchParams.nocache = true;
      
      const result = await ApiService.invendus.search(searchParams, token);
      return result;
    } catch (err) {
      const errorMsg = err.message || 'Une erreur est survenue';
      setError(errorMsg);
      return { success: false, error: errorMsg };
    } finally {
      setIsLoading(false);
    }
  };

  // Fonction pour obtenir les invendus disponibles (utilitaire)
  const getAvailableInvendus = () => {
    return invendus.filter(invendu => 
      invendu.inv_statut === 'disponible' && 
      new Date(invendu.inv_date_limite) > new Date()
    );
  };

  // Effet pour charger les données initiales en fonction du type d'utilisateur
  useEffect(() => {
    if (token && user) {
      if (user.type === 'restaurant') {
        fetchMyInvendus();
        fetchReservationsRestaurant();
      } else if (user.type === 'association') {
        fetchInvendus();
        fetchReservationsAssociation();
      }
    }
  }, [token, user, fetchInvendus, fetchMyInvendus, fetchReservationsAssociation, fetchReservationsRestaurant]);

  // Valeurs exposées par le contexte
  const value = {
    invendus,
    myInvendus,
    reservations,
    isLoading,
    error,
    fetchInvendus,
    fetchMyInvendus,
    fetchInvendu,
    createInvendu,
    updateInvendu,
    deleteInvendu,
    fetchReservationsAssociation,
    fetchReservationsRestaurant,
    createReservation,
    updateReservationStatus,
    cancelReservation,
    searchInvendus,
    getAvailableInvendus
  };

  return (
    <FoodContext.Provider value={value}>
      {children}
    </FoodContext.Provider>
  );
};

export default FoodContext;