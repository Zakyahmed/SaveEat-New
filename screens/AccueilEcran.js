// screens/AccueilEcran.js
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFood } from '../context/FoodContext';
import Couleurs from '../theme/Couleurs';

const AccueilEcran = ({ navigation }) => {
  const { user } = useAuth();
  const { 
    myInvendus, 
    invendus, 
    reservations, 
    fetchMyInvendus, 
    fetchInvendus,
    fetchReservationsAssociation,
    fetchReservationsRestaurant,
    isLoading
  } = useFood();
  
  const [refreshing, setRefreshing] = useState(false);
  
  const userType = user?.type || 'restaurant';
  const isRestaurant = userType === 'restaurant';

  // Fonction pour charger les données
  const loadData = async () => {
    setRefreshing(true);
    try {
      if (isRestaurant) {
        await fetchMyInvendus();
        await fetchReservationsRestaurant();
      } else {
        await fetchInvendus();
        await fetchReservationsAssociation();
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Charger les données au chargement du composant
  useEffect(() => {
    loadData();
  }, [isRestaurant]);
  
  // Fonction pour rafraîchir les données
  const onRefresh = () => {
    loadData();
  };
  
  // Obtenir le nombre d'invendus selon le type d'utilisateur
  const invendusCount = isRestaurant 
    ? myInvendus.length 
    : invendus.filter(i => i.inv_statut === 'disponible').length;
  
  // Obtenir le nombre de réservations
  const reservationsCount = reservations.length;

  const renderRestaurantContent = () => {
    return (
      <>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Bonjour {user?.prenom || 'Restaurateur'},
          </Text>
          <Text style={styles.welcomeSubText}>
            Partagez vos invendus et luttez contre le gaspillage alimentaire
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="fast-food" size={30} color={Couleurs.primaire} />
            <Text style={styles.statNumber}>{invendusCount}</Text>
            <Text style={styles.statLabel}>Invendus publiés</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={30} color={Couleurs.secondaire} />
            <Text style={styles.statNumber}>{reservationsCount}</Text>
            <Text style={styles.statLabel}>Réservations</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Actions rapides</Text>
        
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Invendus', { 
              screen: 'FormulaireInvendu' 
            })}
          >
            <Ionicons name="add-circle" size={24} color={Couleurs.texte.inverse} />
            <Text style={styles.actionButtonText}>Ajouter un invendu</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('Invendus', { 
              screen: 'ListeInvendus'
            })}
          >
            <Ionicons name="list" size={24} color={Couleurs.texte.inverse} />
            <Text style={styles.actionButtonText}>Voir mes invendus</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  const renderAssociationContent = () => {
    return (
      <>
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>
            Bonjour {user?.prenom || 'Association'},
          </Text>
          <Text style={styles.welcomeSubText}>
            Récupérez des invendus pour votre association
          </Text>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="calendar" size={30} color={Couleurs.primaire} />
            <Text style={styles.statNumber}>{reservationsCount}</Text>
            <Text style={styles.statLabel}>Réservations</Text>
          </View>
          
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={30} color={Couleurs.secondaire} />
            <Text style={styles.statNumber}>{invendusCount}</Text>
            <Text style={styles.statLabel}>Invendus disponibles</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Actions rapides</Text>
        
        <View style={styles.quickActionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('Recherche')}
          >
            <Ionicons name="search" size={24} color={Couleurs.texte.inverse} />
            <Text style={styles.actionButtonText}>Rechercher des invendus</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={() => navigation.navigate('Reservations')}
          >
            <Ionicons name="calendar" size={24} color={Couleurs.texte.inverse} />
            <Text style={styles.actionButtonText}>Mes réservations</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[Couleurs.primaire]}
          tintColor={Couleurs.primaire}
        />
      }
    >
      <View style={styles.logoContainer}>
        <Image 
          source={require('../assets/images/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {isRestaurant ? renderRestaurantContent() : renderAssociationContent()}

      <View style={styles.infoCard}>
        <Ionicons name="information-circle" size={24} color={Couleurs.info} />
        <Text style={styles.infoCardTitle}>SaveEat</Text>
        <Text style={styles.infoCardText}>
          Ensemble, luttons contre le gaspillage alimentaire en redistribuant les surplus.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Couleurs.fond.primaire,
  },
  logoContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  logo: {
    width: 100,
    height: 100,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Couleurs.texte.primaire,
  },
  welcomeSubText: {
    fontSize: 16,
    color: Couleurs.texte.secondaire,
    marginTop: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 25,
    paddingHorizontal: 10,
  },
  statCard: {
    backgroundColor: Couleurs.fond.secondaire,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    width: '45%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Couleurs.texte.primaire,
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 14,
    color: Couleurs.texte.secondaire,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Couleurs.texte.primaire,
    marginHorizontal: 20,
    marginBottom: 15,
  },
  quickActionsContainer: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  actionButton: {
    backgroundColor: Couleurs.primaire,
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: Couleurs.secondaire,
  },
  actionButtonText: {
    color: Couleurs.texte.inverse,
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 10,
  },
  infoCard: {
    backgroundColor: '#E3F2FD',
    borderRadius: 10,
    padding: 20,
    margin: 20,
    alignItems: 'center',
  },
  infoCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Couleurs.texte.primaire,
    marginVertical: 5,
  },
  infoCardText: {
    fontSize: 14,
    color: Couleurs.texte.secondaire,
    textAlign: 'center',
  },
});

export default AccueilEcran;