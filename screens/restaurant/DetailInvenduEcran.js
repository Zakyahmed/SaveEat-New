import React, { useState, useEffect, useContext } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthContext } from '../../context/AuthContext';
import { getInvendu, supprimerInvendu } from '../../services/InvenduService';
import Couleurs from '../../theme/Couleurs';

const DetailInvenduEcran = ({ route, navigation }) => {
  const { id } = route.params;
  const { token } = useContext(AuthContext);
  
  const [invendu, setInvendu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchInvenduDetails();
  }, []);
  
  const fetchInvenduDetails = async () => {
    setLoading(true);
    
    try {
      const response = await getInvendu(id, token);
      setInvendu(response);
    } catch (error) {
      console.error('Erreur lors de la récupération des détails:', error);
      setError('Impossible de charger les détails de cet invendu. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = () => {
    navigation.navigate('FormulaireInvendu', { item: invendu });
  };
  
  const handleDelete = () => {
    Alert.alert(
      'Confirmation',
      'Êtes-vous sûr de vouloir supprimer cet invendu ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await supprimerInvendu(id, token);
              Alert.alert(
                'Succès', 
                `L'invendu "${invendu.inv_titre}" a été supprimé avec succès.`,
                [{ text: 'OK', onPress: () => navigation.goBack() }]
              );
            } catch (error) {
              console.error('Erreur lors de la suppression:', error);
              Alert.alert('Erreur', 'Impossible de supprimer cet invendu');
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
    return Couleurs.statut[status] || Couleurs.texte.pale;
  };
  
  // Obtenir le texte du statut
  const getStatusText = (status) => {
    switch (status) {
      case 'disponible':
        return 'Disponible';
      case 'reserve':
        return 'Réservé';
      case 'distribue':
        return 'Distribué';
      case 'expire':
        return 'Expiré';
      case 'annule':
        return 'Annulé';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={Couleurs.primaire} />
        <Text style={styles.loadingText}>Chargement des détails...</Text>
      </View>
    );
  }
  
  if (error) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle" size={50} color={Couleurs.error} />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchInvenduDetails}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }
  
  if (!invendu) {
    return (
      <View style={styles.centered}>
        <Ionicons name="help-circle" size={50} color={Couleurs.texte.pale} />
        <Text style={styles.errorText}>Invendu non trouvé</Text>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const canEdit = invendu.inv_statut === 'disponible';
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{invendu.inv_titre}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(invendu.inv_statut) }]}>
          <Text style={styles.statusText}>
            {getStatusText(invendu.inv_statut)}
          </Text>
        </View>
      </View>
      
      <View style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Détails</Text>
        
        <View style={styles.detailRow}>
          <Ionicons name="cube-outline" size={20} color={Couleurs.texte.secondaire} />
          <Text style={styles.detailLabel}>Quantité:</Text>
          <Text style={styles.detailValue}>
            {invendu.inv_quantite} {invendu.inv_unite}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={20} color={Couleurs.texte.secondaire} />
          <Text style={styles.detailLabel}>Disponible:</Text>
          <Text style={styles.detailValue}>
            {formatDate(invendu.inv_date_disponibilite)}
          </Text>
        </View>
        
        <View style={styles.detailRow}>
          <Ionicons name="calendar-outline" size={20} color={Couleurs.texte.secondaire} />
          <Text style={styles.detailLabel}>Date limite:</Text>
          <Text style={styles.detailValue}>
            {formatDate(invendu.inv_date_limite)}
          </Text>
        </View>
        
        {invendu.inv_temperature && (
          <View style={styles.detailRow}>
            <Ionicons name="thermometer-outline" size={20} color={Couleurs.texte.secondaire} />
            <Text style={styles.detailLabel}>Température:</Text>
            <Text style={styles.detailValue}>{invendu.inv_temperature}</Text>
          </View>
        )}
        
        {invendu.inv_urgent && (
          <View style={styles.urgentBanner}>
            <Ionicons name="alert-circle" size={20} color={Couleurs.texte.inverse} />
            <Text style={styles.urgentText}>Urgent - À récupérer rapidement</Text>
          </View>
        )}
      </View>
      
      <View style={styles.descriptionCard}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.description}>
          {invendu.inv_description || 'Aucune description fournie.'}
        </Text>
      </View>
      
      {invendu.inv_allergenes && (
        <View style={styles.allergenesCard}>
          <Text style={styles.sectionTitle}>Allergènes</Text>
          <Text style={styles.allergenes}>{invendu.inv_allergenes}</Text>
        </View>
      )}
      
      <View style={styles.actionButtons}>
        {canEdit && (
          <>
            <TouchableOpacity 
              style={[styles.actionButton, styles.editButton]}
              onPress={handleEdit}
            >
              <Ionicons name="create-outline" size={20} color={Couleurs.texte.inverse} />
              <Text style={styles.actionButtonText}>Modifier</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Ionicons name="trash-outline" size={20} color={Couleurs.texte.inverse} />
              <Text style={styles.actionButtonText}>Supprimer</Text>
            </TouchableOpacity>
          </>
        )}
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back-outline" size={20} color={Couleurs.texte.inverse} />
          <Text style={styles.actionButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Couleurs.fond.secondaire,
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
  header: {
    backgroundColor: Couleurs.fond.primaire,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Couleurs.fond.gris,
  },
  title: {
    fontSize: 22,
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
  detailsCard: {
    backgroundColor: Couleurs.fond.primaire,
    margin: 15,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Couleurs.texte.primaire,
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: Couleurs.fond.gris,
    paddingBottom: 5,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailLabel: {
    fontSize: 16,
    color: Couleurs.texte.secondaire,
    marginLeft: 10,
    marginRight: 5,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: Couleurs.texte.primaire,
    flex: 1,
    textAlign: 'right',
  },
  urgentBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Couleurs.error,
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
  },
  urgentText: {
    color: Couleurs.texte.inverse,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  descriptionCard: {
    backgroundColor: Couleurs.fond.primaire,
    margin: 15,
    marginTop: 0,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  description: {
    fontSize: 16,
    color: Couleurs.texte.primaire,
    lineHeight: 24,
  },
  allergenesCard: {
    backgroundColor: Couleurs.fond.primaire,
    margin: 15,
    marginTop: 0,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  allergenes: {
    fontSize: 16,
    color: Couleurs.texte.primaire,
  },
  actionButtons: {
    flexDirection: 'column',
    margin: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    padding: 15,
    marginBottom: 10,
  },
  editButton: {
    backgroundColor: Couleurs.info,
  },
  deleteButton: {
    backgroundColor: Couleurs.error,
  },
  backButton: {
    backgroundColor: Couleurs.secondaire,
  },
  actionButtonText: {
    color: Couleurs.texte.inverse,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
});

export default DetailInvenduEcran;