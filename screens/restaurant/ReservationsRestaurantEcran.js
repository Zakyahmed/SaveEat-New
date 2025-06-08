import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { AuthContext } from '../../context/AuthContext';
import { getMesReservationsRestaurant, modifierStatutReservation } from '../../services/ReservationService';
import Couleurs from '../../theme/Couleurs';

const ReservationsRestaurantEcran = () => {
  const { token } = useContext(AuthContext);
  
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  
  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);
  
  const fetchReservations = async () => {
    setLoading(true);
    
    try {
      const filters = {};
      if (statusFilter) {
        filters.statut = statusFilter;
      }
      
      const response = await getMesReservationsRestaurant(token, filters);
      if (response && response.data) {
        setReservations(response.data);
      } else {
        setReservations([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des réservations:', error);
      setError('Impossible de charger vos réservations. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleChangeStatus = (id, currentStatus) => {
    // Options de statut disponibles selon le statut actuel
    let options = [];
    
    switch (currentStatus) {
      case 'en_attente':
        options = [
          { label: 'Accepter', value: 'accepte' },
          { label: 'Refuser', value: 'refuse' },
        ];
        break;
      case 'accepte':
        options = [
          { label: 'Terminé (collecté)', value: 'termine' },
          { label: 'Annuler', value: 'annule' },
        ];
        break;
      default:
        Alert.alert('Info', 'Le statut ne peut plus être modifié');
        return;
    }
    
    // Afficher les options à l'utilisateur
    Alert.alert(
      'Changer le statut',
      'Choisissez le nouveau statut',
      options.map(option => ({
        text: option.label,
        onPress: () => updateReservationStatus(id, option.value),
      })).concat([
        {
          text: 'Annuler',
          style: 'cancel',
        },
      ])
    );
  };
  
  const updateReservationStatus = async (id, status) => {
    try {
      await modifierStatutReservation(id, status, token);
      
      // Mettre à jour la liste localement
      setReservations(prevReservations => 
        prevReservations.map(reservation => 
          reservation.res_id === id 
            ? { ...reservation, res_statut: status } 
            : reservation
        )
      );
      
      Alert.alert('Succès', 'Statut mis à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      Alert.alert('Erreur', 'Impossible de modifier le statut');
    }
  };
  
  // Formatage de la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Obtenir la couleur en fonction du statut
  const getStatusColor = (status) => {
    switch (status) {
      case 'en_attente':
        return Couleurs.info;
      case 'accepte':
        return Couleurs.success;
      case 'refuse':
        return Couleurs.error;
      case 'termine':
        return Couleurs.primaire;
      case 'annule':
        return Couleurs.texte.pale;
      default:
        return Couleurs.texte.pale;
    }
  };
  
  // Formater le texte du statut
  const formatStatus = (status) => {
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'accepte':
        return 'Acceptée';
      case 'refuse':
        return 'Refusée';
      case 'termine':
        return 'Terminée';
      case 'annule':
        return 'Annulée';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };
  
  const renderItem = ({ item }) => {
    const invendu = item.invendu || {};
    const association = item.association || {};
    
    return (
      <View style={styles.reservationCard}>
        <View style={styles.header}>
          <Text style={styles.titre}>{invendu.inv_titre || 'Invendu inconnu'}</Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.res_statut) }]}>
            <Text style={styles.statusText}>{formatStatus(item.res_statut)}</Text>
          </View>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={18} color={Couleurs.texte.secondaire} />
          <Text style={styles.infoLabel}>Association:</Text>
          <Text style={styles.infoValue}>{association.asso_nom || 'Non spécifiée'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={18} color={Couleurs.texte.secondaire} />
          <Text style={styles.infoLabel}>Quantité:</Text>
          <Text style={styles.infoValue}>
            {invendu.inv_quantite} {invendu.inv_unite}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={18} color={Couleurs.texte.secondaire} />
          <Text style={styles.infoLabel}>Date de collecte:</Text>
          <Text style={styles.infoValue}>
            {formatDate(item.res_date_collecte)}
          </Text>
        </View>
        
        {item.res_commentaire && (
          <View style={styles.commentSection}>
            <Text style={styles.commentLabel}>Commentaire:</Text>
            <Text style={styles.commentText}>{item.res_commentaire}</Text>
          </View>
        )}
        
        {(item.res_statut === 'en_attente' || item.res_statut === 'accepte') && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleChangeStatus(item.res_id, item.res_statut)}
          >
            <Ionicons name="create-outline" size={18} color={Couleurs.texte.inverse} />
            <Text style={styles.actionButtonText}>
              Changer le statut
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <Text style={styles.filterLabel}>Filtrer par statut:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={statusFilter}
            style={styles.picker}
            onValueChange={setStatusFilter}
          >
            <Picker.Item label="Tous" value="" />
            <Picker.Item label="En attente" value="en_attente" />
            <Picker.Item label="Acceptées" value="accepte" />
            <Picker.Item label="Refusées" value="refuse" />
            <Picker.Item label="Terminées" value="termine" />
            <Picker.Item label="Annulées" value="annule" />
          </Picker>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Couleurs.primaire} />
          <Text style={styles.loadingText}>Chargement des réservations...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={50} color={Couleurs.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchReservations}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : reservations.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="calendar-outline" size={50} color={Couleurs.texte.pale} />
          <Text style={styles.emptyText}>Aucune réservation trouvée</Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          renderItem={renderItem}
          keyExtractor={(item) => item.res_id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchReservations}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Couleurs.fond.secondaire,
  },
  filterContainer: {
    backgroundColor: Couleurs.fond.primaire,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: Couleurs.fond.gris,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: Couleurs.texte.primaire,
    marginBottom: 5,
  },
  pickerContainer: {
    backgroundColor: Couleurs.fond.secondaire,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Couleurs.fond.gris,
  },
  picker: {
    height: 50,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: Couleurs.texte.secondaire,
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: Couleurs.error,
    textAlign: 'center',
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: Couleurs.texte.secondaire,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 15,
    backgroundColor: Couleurs.primaire,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: Couleurs.texte.inverse,
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 15,
  },
  reservationCard: {
    backgroundColor: Couleurs.fond.primaire,
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  titre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Couleurs.texte.primaire,
    flex: 1,
  },
  statusBadge: {
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  statusText: {
    color: Couleurs.texte.inverse,
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Couleurs.texte.secondaire,
    marginLeft: 8,
    marginRight: 5,
  },
  infoValue: {
    fontSize: 14,
    color: Couleurs.texte.primaire,
    flex: 1,
    textAlign: 'right',
  },
  commentSection: {
    marginTop: 5,
    padding: 10,
    backgroundColor: Couleurs.fond.secondaire,
    borderRadius: 5,
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: Couleurs.texte.secondaire,
    marginBottom: 5,
  },
  commentText: {
    fontSize: 14,
    color: Couleurs.texte.primaire,
  },
  actionButton: {
    backgroundColor: Couleurs.info,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  actionButtonText: {
    color: Couleurs.texte.inverse,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default ReservationsRestaurantEcran;