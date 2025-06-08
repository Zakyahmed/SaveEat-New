import { Ionicons } from '@expo/vector-icons';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { API_URL } from '../../constants/Config';
import { AuthContext } from '../../context/AuthContext';
import { creerReservation } from '../../services/ReservationService';
import Couleurs from '../../theme/Couleurs';

const RechercheInvendusEcran = ({ navigation }) => {
  const { token } = useContext(AuthContext);
  
  const [invendus, setInvendus] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Modal de réservation
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedInvendu, setSelectedInvendu] = useState(null);
  const [reservationDate, setReservationDate] = useState(new Date());
  const [commentaire, setCommentaire] = useState('');
  const [reservationLoading, setReservationLoading] = useState(false);

  // Fonction simplifiée pour charger TOUS les invendus
  const loadAllInvendus = async () => {
  console.log("=== CHARGEMENT DES INVENDUS ===");
  setLoading(true);
  setError(null);
  
  try {
    const url = `${API_URL}/invendus?statut=disponible&per_page=100&timestamp=${Date.now()}`;
    console.log("URL appelée:", url);
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
      }
    });
    
    console.log("Statut de la réponse:", response.status);
    
    const responseText = await response.text();
    console.log("Réponse brute (texte):", responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      console.error("Erreur de parsing JSON:", e);
      throw new Error("Réponse invalide du serveur");
    }
    
    console.log("=== STRUCTURE DE LA RÉPONSE ===");
    console.log("Type de data:", typeof data);
    console.log("Clés de l'objet:", Object.keys(data));
    console.log("data.data existe?", !!data.data);
    console.log("data.data est un tableau?", Array.isArray(data.data));
    
    if (data.data) {
      console.log("Nombre d'éléments dans data.data:", data.data.length);
      if (data.data.length > 0) {
        console.log("Premier invendu:", JSON.stringify(data.data[0], null, 2));
      }
    }
    
    // Pagination info
    if (data.current_page) {
      console.log("Info pagination:", {
        current_page: data.current_page,
        total: data.total,
        per_page: data.per_page,
        last_page: data.last_page
      });
    }
    
    if (data && data.data && Array.isArray(data.data)) {
      console.log(`✓ ${data.data.length} invendus trouvés`);
      setInvendus(data.data);
    } else {
      console.log("✗ Aucun invendu ou format incorrect");
      setInvendus([]);
    }
  } catch (error) {
    console.error('Erreur complète:', error);
    setError('Impossible de charger les invendus');
  } finally {
    setLoading(false);
  }
};

  // Charger au montage et au focus
  useEffect(() => {
    loadAllInvendus();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      loadAllInvendus();
    });
    return unsubscribe;
  }, [navigation]);

  const handleReserverPress = (invendu) => {
    setSelectedInvendu(invendu);
    setReservationDate(new Date());
    setCommentaire('');
    setModalVisible(true);
  };

  const handleReserver = async () => {
    if (!selectedInvendu) return;
    
    setReservationLoading(true);
    
    try {
      const reservationData = {
        invendu_id: selectedInvendu.inv_id,
        date_collecte: reservationDate.toISOString(),
        commentaire: commentaire,
      };
      
      await creerReservation(reservationData, token);
      
      Alert.alert('Succès', 'Réservation créée avec succès');
      setModalVisible(false);
      
      // Recharger
      loadAllInvendus();
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer la réservation');
    } finally {
      setReservationLoading(false);
    }
  };

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

  const renderInvenduItem = ({ item }) => {
    const restaurant = item.restaurant || {};
    
    return (
      <View style={styles.invenduCard}>
        <View style={styles.header}>
          <Text style={styles.titre}>{item.inv_titre}</Text>
          {item.inv_urgent && (
            <View style={styles.urgentBadge}>
              <Text style={styles.urgentText}>Urgent</Text>
            </View>
          )}
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {item.inv_description || 'Aucune description'}
        </Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="business-outline" size={16} color={Couleurs.texte.secondaire} />
          <Text style={styles.infoLabel}>Restaurant:</Text>
          <Text style={styles.infoValue}>{restaurant.rest_nom || 'Non spécifié'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="cube-outline" size={16} color={Couleurs.texte.secondaire} />
          <Text style={styles.infoLabel}>Quantité:</Text>
          <Text style={styles.infoValue}>
            {item.inv_quantite} {item.inv_unite}
          </Text>
        </View>
        
        <TouchableOpacity 
          style={styles.reserverButton}
          onPress={() => handleReserverPress(item)}
        >
          <Ionicons name="calendar-outline" size={18} color={Couleurs.texte.inverse} />
          <Text style={styles.reserverButtonText}>Réserver</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Bouton de rafraîchissement en haut */}
      <TouchableOpacity 
        style={styles.refreshHeader}
        onPress={loadAllInvendus}
      >
        <Ionicons name="refresh" size={20} color={Couleurs.primaire} />
        <Text style={styles.refreshText}>Rafraîchir la liste</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Couleurs.primaire} />
          <Text style={styles.loadingText}>Chargement...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAllInvendus}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : invendus.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="search" size={50} color={Couleurs.texte.pale} />
          <Text style={styles.emptyText}>Aucun invendu disponible</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadAllInvendus}>
            <Text style={styles.retryButtonText}>Rafraîchir</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={invendus}
          renderItem={renderInvenduItem}
          keyExtractor={(item) => item.inv_id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={loadAllInvendus}
        />
      )}
      
      {/* Modal de réservation simplifié */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Réserver l'invendu</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-outline" size={24} />
              </TouchableOpacity>
            </View>
            
            {selectedInvendu && (
              <ScrollView>
                <Text style={styles.invenduTitle}>{selectedInvendu.inv_titre}</Text>
                
                <Text style={styles.sectionTitle}>Commentaire (facultatif)</Text>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Informations complémentaires"
                  value={commentaire}
                  onChangeText={setCommentaire}
                  multiline
                  numberOfLines={3}
                />
                
                <TouchableOpacity
                  style={styles.reserverButtonModal}
                  onPress={handleReserver}
                  disabled={reservationLoading}
                >
                  {reservationLoading ? (
                    <ActivityIndicator color={Couleurs.texte.inverse} />
                  ) : (
                    <Text style={styles.reserverButtonText}>Confirmer la réservation</Text>
                  )}
                </TouchableOpacity>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Couleurs.fond.secondaire,
  },
  refreshHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: Couleurs.fond.primaire,
    borderBottomWidth: 1,
    borderBottomColor: Couleurs.fond.gris,
  },
  refreshText: {
    marginLeft: 10,
    color: Couleurs.primaire,
    fontWeight: 'bold',
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
  invenduCard: {
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
    marginBottom: 5,
  },
  titre: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Couleurs.texte.primaire,
    flex: 1,
  },
  urgentBadge: {
    backgroundColor: Couleurs.error,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  urgentText: {
    color: Couleurs.texte.inverse,
    fontSize: 12,
    fontWeight: 'bold',
  },
  description: {
    fontSize: 14,
    color: Couleurs.texte.secondaire,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
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
  reserverButton: {
    backgroundColor: Couleurs.primaire,
    borderRadius: 5,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  reserverButtonText: {
    color: Couleurs.texte.inverse,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Couleurs.fond.primaire,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Couleurs.fond.gris,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Couleurs.texte.primaire,
  },
  invenduTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Couleurs.texte.primaire,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Couleurs.texte.primaire,
    marginTop: 15,
    marginBottom: 10,
  },
  commentInput: {
    backgroundColor: Couleurs.fond.secondaire,
    borderRadius: 5,
    padding: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Couleurs.fond.gris,
    textAlignVertical: 'top',
    minHeight: 80,
  },
  reserverButtonModal: {
    backgroundColor: Couleurs.primaire,
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
});

export default RechercheInvendusEcran;