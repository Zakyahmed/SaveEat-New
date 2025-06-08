import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getMesReservationsAssociation, updateReservationStatus } from '../../services/ReservationService';
import Couleurs from '../../theme/Couleurs';


const ReservationsAssociationEcran = ({ navigation }) => {
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
      
      const response = await getMesReservationsAssociation(token, filters);
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
  
  const handleCancelReservation = (id) => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir annuler cette réservation ?',
      [
        {
          text: 'Non',
          style: 'cancel',
        },
        {
          text: 'Oui, annuler',
          style: 'destructive',
          onPress: async () => {
            try {
                // Mise à jour du statut à "annulé"
                const updatedReservation = await updateReservationStatus(id, 'annule', token);              
              // Mettre à jour la liste localement
              setReservations(prevReservations => 
                prevReservations.map(reservation => 
                  reservation.res_id === id 
                    ? { ...reservation, res_statut: 'annule' } 
                    : reservation
                )
              );
              
              Alert.alert('Succès', 'Réservation annulée avec succès');
            } catch (error) {
              console.error('Erreur lors de l\'annulation:', error);
              Alert.alert('Erreur', 'Impossible d\'annuler cette réservation');
            }
          },
        },
      ]
    );
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
    const restaurant = invendu.restaurant || {};
    
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
          <Text style={styles.infoLabel}>Restaurant:</Text>
          <Text style={styles.infoValue}>{restaurant.rest_nom || 'Non spécifié'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={18} color={Couleurs.texte.secondaire} />
          <Text style={styles.infoLabel}>Adresse:</Text>
          <Text style={styles.infoValue}>
            {restaurant.rest_adresse ? `${restaurant.rest_adresse}, ` : ''}
            {restaurant.rest_npa || ''} {restaurant.rest_localite || ''}
          </Text>
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
        
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={18} color={Couleurs.texte.secondaire} />
          <Text style={styles.infoLabel}>Date limite:</Text>
          <Text style={styles.infoValue}>
            {formatDate(invendu.inv_date_limite)}
          </Text>
        </View>
        
        {item.res_commentaire && (
          <View style={styles.commentSection}>
            <Text style={styles.commentLabel}>Votre commentaire:</Text>
            <Text style={styles.commentText}>{item.res_commentaire}</Text>
          </View>
        )}
        
        {(item.res_statut === 'en_attente' || item.res_statut === 'accepte') && (
          <TouchableOpacity 
            style={styles.cancelButton}
            onPress={() => handleCancelReservation(item.res_id)}
          >
            <Ionicons name="close-circle-outline" size={18} color={Couleurs.texte.inverse} />
            <Text style={styles.cancelButtonText}>
              Annuler la réservation
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
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => navigation.navigate('Recherche')}
          >
            <Text style={styles.searchButtonText}>Rechercher des invendus</Text>
          </TouchableOpacity>
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
    marginBottom: 20,
  },
  searchButton: {
    backgroundColor: Couleurs.primaire,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  searchButtonText: {
    color: Couleurs.texte.inverse,
    fontWeight: 'bold',
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
  cancelButton: {
    backgroundColor: Couleurs.error,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    padding: 10,
    marginTop: 10,
  },
  cancelButtonText: {
    color: Couleurs.texte.inverse,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default ReservationsAssociationEcran;