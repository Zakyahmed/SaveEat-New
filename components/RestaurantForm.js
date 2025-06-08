// components/RestaurantForm.js
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { API_URL } from '../constants/Config';
import { useAuth } from '../context/AuthContext';
import apiRequest from '../services/ApiService';

const RestaurantForm = ({ restaurant, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    rest_nom: restaurant?.rest_nom || '',
    rest_adresse: restaurant?.rest_adresse || '',
    rest_npa: restaurant?.rest_npa || '',
    rest_localite: restaurant?.rest_localite || '',
    rest_canton: restaurant?.rest_canton || '',
    rest_telephone: restaurant?.rest_telephone || '',
    rest_email: restaurant?.rest_email || '',
    rest_site_web: restaurant?.rest_site_web || '',
    rest_description: restaurant?.rest_description || '',
    rest_type_cuisine: restaurant?.rest_type_cuisine || '',
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    // Effacer l'erreur quand l'utilisateur modifie le champ
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    // Valider nom du restaurant
    if (!formData.rest_nom) {
      newErrors.rest_nom = 'Le nom du restaurant est requis';
    }

    // Valider adresse
    if (!formData.rest_adresse) {
      newErrors.rest_adresse = 'L\'adresse est requise';
    }

    // Valider code postal
    if (!formData.rest_npa) {
      newErrors.rest_npa = 'Le code postal est requis';
    } else if (!/^[0-9]{4,5}$/.test(formData.rest_npa)) {
      newErrors.rest_npa = 'Format du code postal invalide';
    }

    // Valider localité
    if (!formData.rest_localite) {
      newErrors.rest_localite = 'La localité est requise';
    }

    // Valider canton
    if (!formData.rest_canton) {
      newErrors.rest_canton = 'Le canton est requis';
    }

    // Valider téléphone
    if (!formData.rest_telephone) {
      newErrors.rest_telephone = 'Le téléphone est requis';
    }

    // Valider email
    if (formData.rest_email && !/\S+@\S+\.\S+/.test(formData.rest_email)) {
      newErrors.rest_email = 'Format d\'email invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Fonction pour récupérer le restaurant existant
  const fetchExistingRestaurant = async () => {
    try {
      console.log('Récupération du restaurant existant...');
      const response = await apiRequest('/restaurants/me', 'GET', null, token);
      
      if (response && response.data) {
        console.log('Restaurant existant trouvé:', response.data);
        return response.data;
      } else if (response && response.rest_id) {
        console.log('Restaurant existant trouvé (format direct):', response);
        return response;
      }
      
      return null;
    } catch (error) {
      console.error('Erreur lors de la récupération du restaurant:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      // Utiliser l'URL de l'API depuis la configuration
      const endpoint = restaurant 
        ? `/restaurants/${restaurant.rest_id}`
        : '/restaurants';
      
      const url = `${API_URL}${endpoint}`;
      const method = restaurant ? 'PUT' : 'POST';
      
      console.log('Envoi de la requête:', method, url);
      console.log('Données envoyées:', formData);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const responseText = await response.text();
      console.log('Réponse brute:', responseText);
      
      let data;
      try {
        data = JSON.parse(responseText);
      } catch (e) {
        console.error('Erreur de parsing JSON:', e);
        throw new Error('Réponse invalide du serveur');
      }
      
      console.log('Données reçues:', data);
      
      if (!response.ok) {
        // Cas spécial : restaurant déjà existant
        if (data.message === 'Vous avez déjà un restaurant') {
          console.log('Restaurant déjà existant détecté');
          
          // Essayer de récupérer le restaurant existant
          const existingRestaurant = await fetchExistingRestaurant();
          
          if (existingRestaurant) {
            Alert.alert(
              'Information',
              'Vous avez déjà un restaurant. Les informations ont été récupérées.',
              [{ 
                text: 'OK', 
                onPress: () => onSuccess(existingRestaurant) 
              }]
            );
            return;
          } else {
            // Si on ne peut pas récupérer le restaurant, informer l'utilisateur
            Alert.alert(
              'Information',
              'Vous avez déjà un restaurant mais nous n\'avons pas pu récupérer ses informations. Veuillez recharger la page.',
              [{ text: 'OK' }]
            );
            return;
          }
        }
        
        // Autres erreurs
        if (data.errors) {
          setErrors(data.errors);
        } else {
          throw new Error(data.message || 'Une erreur est survenue');
        }
      } else {
        // Succès - Extraire les données du restaurant
        const restaurantData = data.data || data.restaurant || data;
        
        console.log('Restaurant créé/modifié avec succès:', restaurantData);
        
        Alert.alert(
          'Succès',
          restaurant ? 'Restaurant modifié avec succès' : 'Restaurant créé avec succès',
          [{ text: 'OK', onPress: () => onSuccess(restaurantData) }]
        );
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      
      // Gestion spécifique des erreurs réseau
      if (error.message === 'Network request failed') {
        Alert.alert(
          'Erreur de connexion', 
          'Impossible de contacter le serveur. Vérifiez votre connexion internet et que le serveur est accessible.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erreur', error.message || 'Une erreur inattendue est survenue');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Liste des cantons suisses
  const cantons = [
    { label: 'Sélectionner un canton', value: '' },
    { label: 'Genève', value: 'Genève' },
    { label: 'Vaud', value: 'Vaud' },
    { label: 'Neuchâtel', value: 'Neuchâtel' },
    { label: 'Fribourg', value: 'Fribourg' },
    { label: 'Valais', value: 'Valais' },
    { label: 'Berne', value: 'Berne' },
    { label: 'Jura', value: 'Jura' },
    { label: 'Zurich', value: 'Zurich' },
    { label: 'Bâle-Ville', value: 'Bâle-Ville' },
    { label: 'Bâle-Campagne', value: 'Bâle-Campagne' },
    { label: 'Soleure', value: 'Soleure' },
    { label: 'Argovie', value: 'Argovie' },
    { label: 'Lucerne', value: 'Lucerne' },
    { label: 'Uri', value: 'Uri' },
    { label: 'Schwyz', value: 'Schwyz' },
    { label: 'Obwald', value: 'Obwald' },
    { label: 'Nidwald', value: 'Nidwald' },
    { label: 'Glaris', value: 'Glaris' },
    { label: 'Zoug', value: 'Zoug' },
    { label: 'Schaffhouse', value: 'Schaffhouse' },
    { label: 'Appenzell Rhodes-Extérieures', value: 'Appenzell Rhodes-Extérieures' },
    { label: 'Appenzell Rhodes-Intérieures', value: 'Appenzell Rhodes-Intérieures' },
    { label: 'Saint-Gall', value: 'Saint-Gall' },
    { label: 'Grisons', value: 'Grisons' },
    { label: 'Thurgovie', value: 'Thurgovie' },
    { label: 'Tessin', value: 'Tessin' },
  ];

  // Types de cuisine
  const typeCuisines = [
    { label: 'Sélectionner un type de cuisine', value: '' },
    { label: 'Française', value: 'Française' },
    { label: 'Italienne', value: 'Italienne' },
    { label: 'Asiatique', value: 'Asiatique' },
    { label: 'Méditerranéenne', value: 'Méditerranéenne' },
    { label: 'Fast-food', value: 'Fast-food' },
    { label: 'Végétarienne', value: 'Végétarienne' },
    { label: 'Végane', value: 'Végane' },
    { label: 'Autre', value: 'Autre' },
  ];

  return (
    <View style={styles.container}>
      {/* Nom du restaurant */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nom du restaurant *</Text>
        <TextInput
          style={[styles.input, errors.rest_nom && styles.inputError]}
          placeholder="Nom du restaurant"
          value={formData.rest_nom}
          onChangeText={(text) => handleChange('rest_nom', text)}
        />
        {errors.rest_nom && (
          <Text style={styles.errorText}>{errors.rest_nom}</Text>
        )}
      </View>

      {/* Adresse */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Adresse *</Text>
        <TextInput
          style={[styles.input, errors.rest_adresse && styles.inputError]}
          placeholder="Rue et numéro"
          value={formData.rest_adresse}
          onChangeText={(text) => handleChange('rest_adresse', text)}
        />
        {errors.rest_adresse && (
          <Text style={styles.errorText}>{errors.rest_adresse}</Text>
        )}
      </View>

      {/* Code postal */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Code postal (NPA) *</Text>
        <TextInput
          style={[styles.input, errors.rest_npa && styles.inputError]}
          placeholder="Code postal"
          value={formData.rest_npa}
          onChangeText={(text) => handleChange('rest_npa', text)}
          keyboardType="numeric"
        />
        {errors.rest_npa && (
          <Text style={styles.errorText}>{errors.rest_npa}</Text>
        )}
      </View>

      {/* Localité */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Localité *</Text>
        <TextInput
          style={[styles.input, errors.rest_localite && styles.inputError]}
          placeholder="Localité"
          value={formData.rest_localite}
          onChangeText={(text) => handleChange('rest_localite', text)}
        />
        {errors.rest_localite && (
          <Text style={styles.errorText}>{errors.rest_localite}</Text>
        )}
      </View>

      {/* Canton */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Canton *</Text>
        <View style={[styles.pickerContainer, errors.rest_canton && styles.inputError]}>
          <Picker
            selectedValue={formData.rest_canton}
            onValueChange={(value) => handleChange('rest_canton', value)}
            style={styles.picker}
          >
            {cantons.map((canton, index) => (
              <Picker.Item key={index} label={canton.label} value={canton.value} />
            ))}
          </Picker>
        </View>
        {errors.rest_canton && (
          <Text style={styles.errorText}>{errors.rest_canton}</Text>
        )}
      </View>

      {/* Téléphone */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Téléphone *</Text>
        <TextInput
          style={[styles.input, errors.rest_telephone && styles.inputError]}
          placeholder="Numéro de téléphone"
          value={formData.rest_telephone}
          onChangeText={(text) => handleChange('rest_telephone', text)}
          keyboardType="phone-pad"
        />
        {errors.rest_telephone && (
          <Text style={styles.errorText}>{errors.rest_telephone}</Text>
        )}
      </View>

      {/* Email */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.rest_email && styles.inputError]}
          placeholder="Email du restaurant"
          value={formData.rest_email}
          onChangeText={(text) => handleChange('rest_email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.rest_email && (
          <Text style={styles.errorText}>{errors.rest_email}</Text>
        )}
      </View>

      {/* Site web */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Site web</Text>
        <TextInput
          style={styles.input}
          placeholder="Site web du restaurant"
          value={formData.rest_site_web}
          onChangeText={(text) => handleChange('rest_site_web', text)}
          autoCapitalize="none"
        />
      </View>

      {/* Type de cuisine */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Type de cuisine</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.rest_type_cuisine}
            onValueChange={(value) => handleChange('rest_type_cuisine', value)}
            style={styles.picker}
          >
            {typeCuisines.map((type, index) => (
              <Picker.Item key={index} label={type.label} value={type.value} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Description */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description de votre restaurant"
          value={formData.rest_description}
          onChangeText={(text) => handleChange('rest_description', text)}
          multiline={true}
          numberOfLines={4}
        />
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={styles.button}
        onPress={handleSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>
            {restaurant ? 'Enregistrer les modifications' : 'Créer mon restaurant'}
          </Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#374151', // text-gray-700 équivalent
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db', // border-gray-300 équivalent
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#ef4444', // text-red-500 équivalent
  },
  errorText: {
    color: '#ef4444', // text-red-500 équivalent
    fontSize: 12,
    marginTop: 4,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    backgroundColor: 'white',
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: '#10b981', // bg-green-600 équivalent
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RestaurantForm;