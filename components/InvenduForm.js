// components/InvenduForm.js
import { format } from 'date-fns';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useFood } from '../context/FoodContext';
import DateSelector from './DateSelector';

const InvenduForm = ({ invendu, onSuccess }) => {
  const { token, user } = useAuth();
  const { createInvendu, updateInvendu } = useFood();
  
  console.log('createInvendu disponible:', !!createInvendu);
  console.log('User info:', user);
  
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const [formData, setFormData] = useState({
    inv_titre: invendu?.inv_titre || '',
    inv_description: invendu?.inv_description || '',
    inv_quantite: invendu?.inv_quantite?.toString() || '',
    inv_unite: invendu?.inv_unite || 'portions',
    inv_date_disponibilite: invendu?.inv_date_disponibilite ? new Date(invendu.inv_date_disponibilite) : now,
    inv_date_limite: invendu?.inv_date_limite ? new Date(invendu.inv_date_limite) : tomorrow,
    inv_allergenes: invendu?.inv_allergenes || '',
    inv_urgent: invendu?.inv_urgent || false,
    inv_statut: invendu?.inv_statut || 'disponible',
    inv_temperature: invendu?.inv_temperature || 'ambiant',
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
    
    // Valider titre
    if (!formData.inv_titre) {
      newErrors.inv_titre = 'Le titre est requis';
    }

    // Valider description
    if (!formData.inv_description) {
      newErrors.inv_description = 'La description est requise';
    }

    // Valider quantité
    if (!formData.inv_quantite || isNaN(parseFloat(formData.inv_quantite)) || parseFloat(formData.inv_quantite) <= 0) {
      newErrors.inv_quantite = 'La quantité doit être un nombre positif';
    }

    // Valider unité
    if (!formData.inv_unite) {
      newErrors.inv_unite = 'L\'unité est requise';
    }

    // Valider date limite > date disponibilité
    if (formData.inv_date_limite <= formData.inv_date_disponibilite) {
      newErrors.inv_date_limite = 'La date limite doit être postérieure à la date de disponibilité';
    }
    
    // Vérifier que l'utilisateur a un restaurant
    if (!user?.rest_id) {
      newErrors.general = 'Vous devez d\'abord créer votre restaurant dans votre profil';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("Bouton pressé - handleSubmit démarré");
    
    if (!validate()) {
      console.log("Validation échouée");
      if (errors.general) {
        Alert.alert('Attention', errors.general);
      }
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Adapter les noms des champs pour correspondre à ce que le backend attend
      const apiData = {
        titre: formData.inv_titre,
        description: formData.inv_description,
        quantite: parseInt(formData.inv_quantite, 10),
        unite: formData.inv_unite,
        date_disponibilite: format(formData.inv_date_disponibilite, "yyyy-MM-dd'T'HH:mm:ss"),
        date_limite: format(formData.inv_date_limite, "yyyy-MM-dd'T'HH:mm:ss"),
        allergenes: formData.inv_allergenes,
        urgent: formData.inv_urgent ? 1 : 0,
        statut: formData.inv_statut,
        temperature: formData.inv_temperature,
        // Utiliser rest_id de l'utilisateur connecté
        rest_id: user?.rest_id,
      };
      
      console.log('Données adaptées pour l\'API:', apiData);
      console.log('rest_id utilisé:', user?.rest_id);
      
      let result;
      
      if (invendu) {
        console.log("Appel de updateInvendu");
        result = await updateInvendu(invendu.inv_id, apiData);
      } else {
        console.log("Appel de createInvendu");
        result = await createInvendu(apiData);
      }
      
      console.log("Résultat de l'API:", result);
      
      if (result && result.success) {
        const invenduData = result.data;
        Alert.alert(
          'Succès',
          result.message || (invendu ? 'Invendu modifié avec succès' : 'Invendu créé avec succès'),
          [{ text: 'OK', onPress: () => onSuccess(invenduData) }]
        );
      } else {
        // Gestion des erreurs de validation du serveur
        if (result && result.errors) {
          const serverErrors = {};
          // Conversion des erreurs Laravel en format compatible avec notre UI
          Object.entries(result.errors).forEach(([key, messages]) => {
            // Convertir les noms de champs du backend vers les noms du frontend
            const fieldName = key.startsWith('inv_') ? key : `inv_${key}`;
            serverErrors[fieldName] = Array.isArray(messages) ? messages[0] : messages;
          });
          setErrors(serverErrors);
          Alert.alert('Validation', 'Veuillez corriger les erreurs dans le formulaire');
        } else {
          throw new Error((result && result.error) || 'Une erreur est survenue lors du traitement');
        }
      }
    } catch (error) {
      console.error('Erreur complète:', error);
      Alert.alert('Erreur', error.message || 'Une erreur inattendue est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Message d'avertissement si pas de restaurant */}
      {!user?.rest_id && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>
            ⚠️ Vous devez d'abord créer votre restaurant dans votre profil avant de pouvoir ajouter des invendus.
          </Text>
        </View>
      )}
      
      {/* Titre */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Titre *</Text>
        <TextInput
          style={[styles.input, errors.inv_titre && styles.inputError]}
          placeholder="Ex: Sandwiches jambon-fromage"
          value={formData.inv_titre}
          onChangeText={(text) => handleChange('inv_titre', text)}
        />
        {errors.inv_titre && (
          <Text style={styles.errorText}>{errors.inv_titre}</Text>
        )}
      </View>

      {/* Description */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.textArea, errors.inv_description && styles.inputError]}
          placeholder="Détails sur les invendus à donner..."
          value={formData.inv_description}
          onChangeText={(text) => handleChange('inv_description', text)}
          multiline={true}
          numberOfLines={4}
        />
        {errors.inv_description && (
          <Text style={styles.errorText}>{errors.inv_description}</Text>
        )}
      </View>

      {/* Quantité et unité */}
      <View style={styles.rowContainer}>
        <View style={[styles.inputContainer, { flex: 1, marginRight: 8 }]}>
          <Text style={styles.label}>Quantité *</Text>
          <TextInput
            style={[styles.input, errors.inv_quantite && styles.inputError]}
            placeholder="Ex: 10"
            value={formData.inv_quantite}
            onChangeText={(text) => handleChange('inv_quantite', text)}
            keyboardType="numeric"
          />
          {errors.inv_quantite && (
            <Text style={styles.errorText}>{errors.inv_quantite}</Text>
          )}
        </View>
        
        <View style={[styles.inputContainer, { flex: 1, marginLeft: 8 }]}>
          <Text style={styles.label}>Unité *</Text>
          <TextInput
            style={[styles.input, errors.inv_unite && styles.inputError]}
            placeholder="Ex: portions"
            value={formData.inv_unite}
            onChangeText={(text) => handleChange('inv_unite', text)}
          />
          {errors.inv_unite && (
            <Text style={styles.errorText}>{errors.inv_unite}</Text>
          )}
        </View>
      </View>

      {/* Date de disponibilité - Nouveau composant DateSelector */}
      <DateSelector
        label="Disponible à partir de *"
        value={formData.inv_date_disponibilite}
        onChange={(date) => handleChange('inv_date_disponibilite', date)}
        error={errors.inv_date_disponibilite}
        minimumDate={new Date()}
      />

      {/* Date limite - Nouveau composant DateSelector */}
      <DateSelector
        label="Disponible jusqu'à *"
        value={formData.inv_date_limite}
        onChange={(date) => handleChange('inv_date_limite', date)}
        error={errors.inv_date_limite}
        minimumDate={new Date(formData.inv_date_disponibilite)}
      />

      {/* Allergènes */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Allergènes</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: gluten, fruits à coque, œufs..."
          value={formData.inv_allergenes}
          onChangeText={(text) => handleChange('inv_allergenes', text)}
        />
        <Text style={styles.helperText}>
          Séparez les allergènes par des virgules
        </Text>
      </View>

      {/* Urgent */}
      <View style={styles.switchContainer}>
        <View>
          <Text style={styles.switchLabel}>Urgent</Text>
          <Text style={styles.switchDescription}>
            Signaler cet invendu comme urgent pour attirer l'attention des associations
          </Text>
        </View>
        <Switch
          value={formData.inv_urgent}
          onValueChange={(value) => handleChange('inv_urgent', value)}
          trackColor={{ false: '#d1d5db', true: '#d1fae5' }}
          thumbColor={formData.inv_urgent ? '#10b981' : '#f3f4f6'}
        />
      </View>

      {/* Température de conservation */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Température de conservation</Text>
        <View style={styles.temperatureContainer}>
          {['réfrigéré', 'ambiant', 'surgelé'].map((temp) => (
            <TouchableOpacity
              key={temp}
              style={[
                styles.temperatureOption,
                formData.inv_temperature === temp && styles.temperatureSelected
              ]}
              onPress={() => handleChange('inv_temperature', temp)}
            >
              <Text 
                style={[
                  styles.temperatureText,
                  formData.inv_temperature === temp && styles.temperatureTextSelected
                ]}
              >
                {temp.charAt(0).toUpperCase() + temp.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Submit Button */}
      <TouchableOpacity 
        style={[styles.button, !user?.rest_id && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={isSubmitting || !user?.rest_id}
        activeOpacity={0.7}
      >
        {isSubmitting ? (
          <ActivityIndicator size="small" color="#ffffff" />
        ) : (
          <Text style={styles.buttonText}>
            {invendu ? 'Enregistrer les modifications' : 'Publier l\'invendu'}
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
  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  warningText: {
    color: '#92400E',
    fontSize: 14,
    textAlign: 'center',
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
  helperText: {
    color: '#6b7280', // text-gray-500 équivalent
    fontSize: 12,
    marginTop: 4,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151', // text-gray-700 équivalent
    marginBottom: 4,
  },
  switchDescription: {
    fontSize: 12,
    color: '#6b7280', // text-gray-500 équivalent
    maxWidth: '80%',
  },
  temperatureContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  temperatureOption: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d1d5db',
    padding: 8,
    borderRadius: 6,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  temperatureSelected: {
    borderColor: '#10b981',
    backgroundColor: '#ecfdf5',
  },
  temperatureText: {
    fontSize: 14,
    color: '#374151',
  },
  temperatureTextSelected: {
    color: '#10b981',
    fontWeight: '500',
  },
  button: {
    backgroundColor: '#10b981', // bg-green-600 équivalent
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    backgroundColor: '#9CA3AF', // gray-400
    opacity: 0.7,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default InvenduForm;