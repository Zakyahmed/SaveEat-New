import { Ionicons } from '@expo/vector-icons';
import { useContext, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import AssociationForm from '../components/AssociationForm';
import RestaurantForm from '../components/RestaurantForm';
import { AuthContext } from '../context/AuthContext';
import apiRequest from '../services/ApiService';
import Couleurs from '../theme/Couleurs';

const ProfilEcran = () => {
  const { user, logout, updateUser, token } = useContext(AuthContext);
  const [modalVisible, setModalVisible] = useState(false);

  // Vérifier si un restaurant existe déjà au chargement
  useEffect(() => {
    // Vérifier si l'utilisateur est un restaurant sans rest_id
    if (user?.type === 'restaurant' && !user?.rest_id) {
      checkExistingRestaurant();
    }
  }, [user]);

  const checkExistingRestaurant = async () => {
    try {
      const response = await apiRequest('/restaurants/me', 'GET', null, token);
      if (response && (response.data || response.rest_id)) {
        const restaurantData = response.data || response;
        const updatedUser = { ...user, rest_id: restaurantData.rest_id };
        updateUser(updatedUser);
        console.log('Restaurant existant récupéré et synchronisé:', restaurantData);
      }
    } catch (error) {
      console.log('Pas de restaurant existant ou erreur:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Déconnexion',
          onPress: () => logout(),
          style: 'destructive',
        },
      ]
    );
  };

  const handleEntityCreated = (data) => {
    console.log('Entité créée/modifiée:', data);
    
    // Mettre à jour l'utilisateur avec l'ID du restaurant/association
    let updatedUser = { ...user };
    
    if (user?.type === 'restaurant' && data.rest_id) {
      updatedUser.rest_id = data.rest_id;
      console.log('Mise à jour de l\'utilisateur avec rest_id:', data.rest_id);
    } else if (user?.type === 'association' && data.asso_id) {
      updatedUser.asso_id = data.asso_id;
      console.log('Mise à jour de l\'utilisateur avec asso_id:', data.asso_id);
    }
    
    // Mettre à jour le contexte utilisateur
    updateUser(updatedUser);
    
    // Fermer le modal
    setModalVisible(false);
    
    // Message de succès
    const entityType = user?.type === 'restaurant' ? 'Restaurant' : 'Association';
    Alert.alert('Succès', `${entityType} créé(e) avec succès ! Vous pouvez maintenant ${user?.type === 'restaurant' ? 'publier des invendus' : 'réserver des invendus'}.`);
  };

  // Type d'utilisateur pour l'affichage
  const userType = user?.type || '';
  const displayType = 
    userType === 'restaurant' ? 'Restaurant' : 
    userType === 'association' ? 'Association' : 
    'Utilisateur';

  // Vérifier si l'utilisateur a déjà créé son restaurant/association
  const hasEntity = 
    (userType === 'restaurant' && user?.rest_id) ||
    (userType === 'association' && user?.asso_id);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Text style={styles.avatarText}>
            {user?.prenom?.charAt(0) || ''}
            {user?.nom?.charAt(0) || ''}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.prenom} {user?.nom}</Text>
        <Text style={styles.userType}>{displayType}</Text>
      </View>

      {/* Message si pas encore de restaurant/association */}
      {!hasEntity && userType && (
        <View style={styles.warningSection}>
          <Ionicons name="warning" size={24} color={Couleurs.warning} />
          <Text style={styles.warningText}>
            {userType === 'restaurant' 
              ? 'Vous n\'avez pas encore créé votre restaurant'
              : 'Vous n\'avez pas encore créé votre association'}
          </Text>
          <TouchableOpacity 
            style={styles.createButton}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.createButtonText}>
              Créer mon {userType === 'restaurant' ? 'restaurant' : 'association'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informations personnelles</Text>
        
        <View style={styles.infoRow}>
          <Ionicons name="mail" size={20} color={Couleurs.texte.secondaire} />
          <Text style={styles.infoLabel}>Email:</Text>
          <Text style={styles.infoValue}>{user?.email || 'Non renseigné'}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="person" size={20} color={Couleurs.texte.secondaire} />
          <Text style={styles.infoLabel}>Nom complet:</Text>
          <Text style={styles.infoValue}>{user?.prenom} {user?.nom}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Ionicons name="calendar" size={20} color={Couleurs.texte.secondaire} />
          <Text style={styles.infoLabel}>Membre depuis:</Text>
          <Text style={styles.infoValue}>
            {user?.date_inscription ? new Date(user.date_inscription).toLocaleDateString() : 'Non renseigné'}
          </Text>
        </View>
        
        {user?.telephone && (
          <View style={styles.infoRow}>
            <Ionicons name="call" size={20} color={Couleurs.texte.secondaire} />
            <Text style={styles.infoLabel}>Téléphone:</Text>
            <Text style={styles.infoValue}>{user.telephone}</Text>
          </View>
        )}
        
        {/* Afficher l'ID du restaurant/association si existant */}
        {hasEntity && (
          <View style={styles.infoRow}>
            <Ionicons name="business" size={20} color={Couleurs.texte.secondaire} />
            <Text style={styles.infoLabel}>
              {userType === 'restaurant' ? 'Restaurant ID:' : 'Association ID:'}
            </Text>
            <Text style={styles.infoValue}>
              {user?.rest_id || user?.asso_id}
            </Text>
          </View>
        )}
      </View>

      {/* Actions disponibles */}
      <View style={styles.actionsSection}>
        <Text style={styles.sectionTitle}>Actions</Text>
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="create-outline" size={20} color={Couleurs.primaire} />
          <Text style={styles.actionButtonText}>Modifier mon profil</Text>
        </TouchableOpacity>
        
        {hasEntity && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setModalVisible(true)}
          >
            <Ionicons name="business-outline" size={20} color={Couleurs.primaire} />
            <Text style={styles.actionButtonText}>
              Modifier mon {userType === 'restaurant' ? 'restaurant' : 'association'}
            </Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="key-outline" size={20} color={Couleurs.primaire} />
          <Text style={styles.actionButtonText}>Changer mon mot de passe</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={Couleurs.error} />
          <Text style={[styles.actionButtonText, styles.logoutText]}>
            Déconnexion
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.appInfo}>
        <Text style={styles.appVersion}>SaveEat v1.0.0</Text>
        <Text style={styles.appCopyright}>© 2025 SaveEat - Tous droits réservés</Text>
      </View>

      {/* Modal pour créer/modifier restaurant ou association */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {hasEntity ? 'Modifier' : 'Créer'} mon {userType === 'restaurant' ? 'restaurant' : 'association'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={Couleurs.texte.primaire} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScroll}>
              {userType === 'restaurant' ? (
                <RestaurantForm 
                  restaurant={hasEntity ? { rest_id: user.rest_id } : null}
                  onSuccess={handleEntityCreated}
                />
              ) : (
                <AssociationForm 
                  association={hasEntity ? { asso_id: user.asso_id } : null}
                  onSuccess={handleEntityCreated}
                />
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Couleurs.fond.secondaire,
  },
  header: {
    backgroundColor: Couleurs.primaire,
    padding: 30,
    alignItems: 'center',
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Couleurs.fond.primaire,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  avatarText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Couleurs.primaire,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Couleurs.texte.inverse,
  },
  userType: {
    fontSize: 16,
    color: '#e8f5e9',
    marginTop: 5,
  },
  warningSection: {
    backgroundColor: '#FEF3C7',
    margin: 15,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    marginTop: 10,
    marginBottom: 15,
    textAlign: 'center',
  },
  createButton: {
    backgroundColor: Couleurs.primaire,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
  },
  createButtonText: {
    color: Couleurs.texte.inverse,
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: Couleurs.fond.primaire,
    borderRadius: 10,
    margin: 15,
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: Couleurs.texte.secondaire,
    marginLeft: 10,
    marginRight: 5,
    fontWeight: '500',
  },
  infoValue: {
    fontSize: 16,
    color: Couleurs.texte.primaire,
    flex: 1,
    textAlign: 'right',
  },
  actionsSection: {
    backgroundColor: Couleurs.fond.primaire,
    borderRadius: 10,
    margin: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Couleurs.fond.gris,
  },
  actionButtonText: {
    fontSize: 16,
    color: Couleurs.texte.primaire,
    marginLeft: 10,
  },
  logoutButton: {
    borderBottomWidth: 0,
    marginTop: 5,
  },
  logoutText: {
    color: Couleurs.error,
  },
  appInfo: {
    margin: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  appVersion: {
    fontSize: 14,
    color: Couleurs.texte.pale,
  },
  appCopyright: {
    fontSize: 12,
    color: Couleurs.texte.pale,
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: Couleurs.fond.primaire,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Couleurs.fond.gris,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Couleurs.texte.primaire,
  },
  modalScroll: {
    padding: 20,
  },
});

export default ProfilEcran;