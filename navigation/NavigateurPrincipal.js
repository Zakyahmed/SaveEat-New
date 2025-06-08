// navigation/NavigateurPrincipal.js
import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useContext } from 'react';

import { AuthContext } from '../context/AuthContext';
import Couleurs from '../theme/Couleurs';

// Écrans d'authentification
import ConnexionEcran from '../screens/auth/ConnexionEcran';
import InscriptionEcran from '../screens/auth/InscriptionEcran';

// Écrans communs
import AccueilEcran from '../screens/AccueilEcran';
import ProfilEcran from '../screens/ProfilEcran';

// Écrans des restaurants
import DetailInvenduEcran from '../screens/restaurant/DetailInvenduEcran';
import FormulaireInvenduEcran from '../screens/restaurant/FormulaireInvenduEcran';
import ListeInvendusEcran from '../screens/restaurant/ListeInvendusEcran';
import ReservationsRestaurantEcran from '../screens/restaurant/ReservationsRestaurantEcran';

// Écrans des associations
import RechercheInvendusEcran from '../screens/association/RechercheInvendusEcran';
import ReservationsAssociationEcran from '../screens/association/ReservationsAssociationEcran';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Navigation pour les utilisateurs non authentifiés
const NavigateurAuth = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Couleurs.primaire,
        },
        headerTintColor: Couleurs.texte.inverse,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="Connexion" 
        component={ConnexionEcran} 
        options={{ title: 'Connexion - SaveEat' }} 
      />
      <Stack.Screen 
        name="Inscription" 
        component={InscriptionEcran} 
        options={{ title: 'Inscription - SaveEat' }} 
      />
    </Stack.Navigator>
  );
};

// Navigation pour les restaurants
const NavigateurTabRestaurant = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Invendus') {
            iconName = focused ? 'fast-food' : 'fast-food-outline';
          } else if (route.name === 'Reservations') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Couleurs.primaire,
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Accueil" 
        component={AccueilEcran} 
        options={{ title: 'Accueil' }} 
      />
      <Tab.Screen 
        name="Invendus" 
        component={NavigateurInvendus} 
        options={{ headerShown: false, title: 'Mes invendus' }} 
      />
      <Tab.Screen 
        name="Reservations" 
        component={ReservationsRestaurantEcran} 
        options={{ title: 'Réservations' }} 
      />
      <Tab.Screen 
        name="Profil" 
        component={ProfilEcran} 
        options={{ title: 'Profil' }} 
      />
    </Tab.Navigator>
  );
};

// Navigation pour les associations
const NavigateurTabAssociation = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Accueil') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Recherche') {
            iconName = focused ? 'search' : 'search-outline';
          } else if (route.name === 'Reservations') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Couleurs.primaire,
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Accueil" 
        component={AccueilEcran} 
        options={{ title: 'Accueil' }} 
      />
      <Tab.Screen 
        name="Recherche" 
        component={RechercheInvendusEcran} 
        options={{ title: 'Rechercher' }} 
      />
      <Tab.Screen 
        name="Reservations" 
        component={ReservationsAssociationEcran} 
        options={{ title: 'Réservations' }} 
      />
      <Tab.Screen 
        name="Profil" 
        component={ProfilEcran} 
        options={{ title: 'Profil' }} 
      />
    </Tab.Navigator>
  );
};

// Navigation des invendus pour les restaurants
const NavigateurInvendus = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: Couleurs.primaire,
        },
        headerTintColor: Couleurs.texte.inverse,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen 
        name="ListeInvendus" 
        component={ListeInvendusEcran} 
        options={{ title: 'Mes invendus' }} 
      />
      <Stack.Screen 
        name="DetailInvendu" 
        component={DetailInvenduEcran} 
        options={{ title: 'Détails de l\'invendu' }} 
      />
      <Stack.Screen 
        name="FormulaireInvendu" 
        component={FormulaireInvenduEcran} 
        options={({ route }) => ({ 
          title: route.params?.item ? 'Modifier l\'invendu' : 'Ajouter un invendu' 
        })} 
      />
    </Stack.Navigator>
  );
};

// Navigateur principal
const NavigateurPrincipal = () => {
  const { isLoggedIn, user, loading } = useContext(AuthContext);

  // Si en cours de chargement, on pourrait afficher un écran de chargement
  if (loading) {
    return null;
  }

  if (!isLoggedIn) {
    return <NavigateurAuth />;
  }

  // Vérifier le type d'utilisateur pour afficher la navigation appropriée
  const userType = user?.type || '';
  
  if (userType === 'restaurant') {
    return <NavigateurTabRestaurant />;
  } else if (userType === 'association') {
    return <NavigateurTabAssociation />;
  } else {
    // Par défaut, on affiche la navigation pour restaurant
    return <NavigateurTabRestaurant />;
  }
};

export default NavigateurPrincipal;