import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import { useContext, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { AuthContext } from '../../context/AuthContext';
import { getMesInvendus, supprimerInvendu } from '../../services/InvenduService';
import Couleurs from '../../theme/Couleurs';

const ListeInvendusEcran = ({ navigation }) => {
  console.log("======= ListeInvendusEcran monté =======");
  const { token } = useContext(AuthContext);
  console.log("Token disponible:", !!token);
  
  const [invendus, setInvendus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  useEffect(() => {
    console.log("useEffect pour focus listener exécuté");
    // Focus listener pour rafraîchir la liste quand on revient sur cet écran
    const unsubscribe = navigation.addListener('focus', () => {
      console.log("Écran a reçu le focus, appel fetchInvendus");
      fetchInvendus();
    });
    
    return unsubscribe;
  }, [navigation]);
  
  const fetchInvendus = async () => {
    console.log("======= fetchInvendus démarré =======");
    setLoading(true);
    
    try {
      const filters = {};
      if (statusFilter) {
        filters.statut = statusFilter;
        console.log("Filtre statut appliqué:", statusFilter);
      }
      
      console.log("Appel API getMesInvendus avec token:", token ? "Token présent" : "Token absent");
      const response = await getMesInvendus(token, filters);
      console.log("Réponse API reçue:", response);
      
      if (response && response.data) {
        console.log("Nombre d'invendus reçus:", Array.isArray(response.data) ? response.data.length : "Non tableau");
        console.log("Structure de response.data:", typeof response.data, response.data);
        setInvendus(response.data);
      } else {
        console.log("Aucun invendu retourné ou format incorrect, initialisation tableau vide");
        setInvendus([]);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des invendus:', error);
      console.log("Message d'erreur:", error.message);
      setError('Impossible de charger vos invendus. Veuillez réessayer.');
    } finally {
      setLoading(false);
      console.log("État final - loading:", false, "| error:", !!error, "| invendus.length:", invendus.length);
    }
  };
  
  const handleDeleteInvendu = (id, titre) => {
    console.log("Demande de suppression invendu:", id, titre);
    Alert.alert(
      'Confirmation',
      `Êtes-vous sûr de vouloir supprimer l'invendu "${titre}" ?`,
      [
        {
          text: 'Annuler',
          style: 'cancel',
          onPress: () => console.log("Suppression annulée"),
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              console.log("Suppression confirmée, appel API pour id:", id);
              await supprimerInvendu(id, token);
              // Rafraîchir la liste après suppression
              setInvendus(invendus.filter(item => item.inv_id !== id));
              console.log("Invendu supprimé avec succès");
              Alert.alert('Succès', `L'invendu "${titre}" a été supprimé avec succès.`);
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer cet invendu');
            }
          },
        },
      ]
    );
  };
  
  // Filtrer les invendus en fonction du terme de recherche
  const filteredInvendus = invendus.filter(item => 
    item.inv_titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.inv_description && item.inv_description.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  
  console.log("Nombre d'invendus après filtrage:", filteredInvendus.length);

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
    return Couleurs.statut[status] || Couleurs.texte.pale;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.invenduItem}
      onPress={() => {
        console.log("Navigation vers DetailInvendu, id:", item.inv_id);
        navigation.navigate('DetailInvendu', { id: item.inv_id });
      }}
    >
      <View style={styles.invenduHeader}>
        <Text style={styles.invenduTitle}>{item.inv_titre}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.inv_statut) }]}>
          <Text style={styles.statusText}>
            {item.inv_statut.charAt(0).toUpperCase() + item.inv_statut.slice(1)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.invenduDescription} numberOfLines={2}>
        {item.inv_description || 'Aucune description'}
      </Text>
      
      <View style={styles.invenduDetails}>
        <Text style={styles.detailText}>
          <Ionicons name="cube-outline" size={16} /> 
          {item.inv_quantite} {item.inv_unite}
        </Text>
        <Text style={styles.detailText}>
          <Ionicons name="time-outline" size={16} /> 
          Jusqu'au {formatDate(item.inv_date_limite)}
        </Text>
      </View>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => {
            console.log("Navigation vers FormulaireInvendu pour édition, id:", item.inv_id);
            navigation.navigate('FormulaireInvendu', { item });
          }}
        >
          <Ionicons name="create-outline" size={20} color={Couleurs.texte.inverse} />
          <Text style={styles.actionButtonText}>Modifier</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteInvendu(item.inv_id, item.inv_titre)}
        >
          <Ionicons name="trash-outline" size={20} color={Couleurs.texte.inverse} />
          <Text style={styles.actionButtonText}>Supprimer</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  console.log("Rendu de l'interface - État:", loading ? "Chargement" : error ? "Erreur" : filteredInvendus.length === 0 ? "Liste vide" : "Liste avec données");

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Rechercher un invendu..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
        
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={statusFilter}
            style={styles.picker}
            onValueChange={(value) => {
              console.log("Changement de filtre statut:", value);
              setStatusFilter(value);
              // Refetch data with new filter
              fetchInvendus();
            }}
          >
            <Picker.Item label="Tous les statuts" value="" />
            <Picker.Item label="Disponible" value="disponible" />
            <Picker.Item label="Réservé" value="reserve" />
            <Picker.Item label="Distribué" value="distribue" />
            <Picker.Item label="Expiré" value="expire" />
            <Picker.Item label="Annulé" value="annule" />
          </Picker>
        </View>
      </View>
      
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={Couleurs.primaire} />
          <Text style={styles.loadingText}>Chargement des invendus...</Text>
        </View>
      ) : error ? (
        <View style={styles.centered}>
          <Ionicons name="alert-circle" size={50} color={Couleurs.error} />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={fetchInvendus}>
            <Text style={styles.retryButtonText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : filteredInvendus.length === 0 ? (
        <View style={styles.centered}>
          <Ionicons name="fast-food-outline" size={50} color={Couleurs.texte.pale} />
          <Text style={styles.emptyText}>Vous n'avez pas encore d'invendus</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              console.log("Navigation vers FormulaireInvendu depuis état vide");
              navigation.navigate('FormulaireInvendu');
            }}
          >
            <Text style={styles.addButtonText}>Ajouter un invendu</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredInvendus}
          renderItem={renderItem}
          keyExtractor={(item) => item.inv_id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshing={loading}
          onRefresh={fetchInvendus}
        />
      )}
      
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => {
          console.log("Navigation vers FormulaireInvendu depuis bouton flottant");
          navigation.navigate('FormulaireInvendu');
        }}
      >
        <Ionicons name="add" size={30} color={Couleurs.texte.inverse} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  // Styles inchangés...
  container: {
    flex: 1,
    backgroundColor: Couleurs.fond.secondaire,
  },
  filterContainer: {
    backgroundColor: Couleurs.fond.primaire,
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: Couleurs.fond.gris,
  },
  searchInput: {
    backgroundColor: Couleurs.fond.secondaire,
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: Couleurs.fond.gris,
    borderRadius: 5,
    marginBottom: 10,
  },
  picker: {
    height: 50,
  },
  listContainer: {
    padding: 15,
  },
  invenduItem: {
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
  invenduHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  invenduTitle: {
    fontSize: 18,
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
  invenduDescription: {
    fontSize: 14,
    color: Couleurs.texte.secondaire,
    marginBottom: 10,
  },
  invenduDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailText: {
    fontSize: 14,
    color: Couleurs.texte.secondaire,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    paddingVertical: 8,
    paddingHorizontal: 15,
    flex: 1,
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: Couleurs.info,
  },
  deleteButton: {
    backgroundColor: Couleurs.error,
  },
  actionButtonText: {
    color: Couleurs.texte.inverse,
    fontWeight: 'bold',
    fontSize: 14,
    marginLeft: 5,
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
  addButton: {
    marginTop: 15,
    backgroundColor: Couleurs.primaire,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  addButtonText: {
    color: Couleurs.texte.inverse,
    fontWeight: 'bold',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Couleurs.primaire,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
});

export default ListeInvendusEcran;