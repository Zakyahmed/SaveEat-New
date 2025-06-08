// components/AssociationForm.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
  Platform
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { Picker } from '@react-native-picker/picker'; // Assurez-vous d'installer cette dépendance

const AssociationForm = ({ association, onSuccess }) => {
  const { token } = useAuth();
  const [formData, setFormData] = useState({
    asso_nom: association?.asso_nom || '',
    asso_adresse: association?.asso_adresse || '',
    asso_npa: association?.asso_npa || '',
    asso_localite: association?.asso_localite || '',
    asso_canton: association?.asso_canton || '',
    asso_telephone: association?.asso_telephone || '',
    asso_email: association?.asso_email || '',
    asso_site_web: association?.asso_site_web || '',
    asso_description: association?.asso_description || '',
    asso_beneficiaires: association?.asso_beneficiaires || '',
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
    
    // Valider nom de l'association
    if (!formData.asso_nom) {
      newErrors.asso_nom = 'Le nom de l\'association est requis';
    }

    // Valider adresse
    if (!formData.asso_adresse) {
      newErrors.asso_adresse = 'L\'adresse est requise';
    }

    // Valider code postal
    if (!formData.asso_npa) {
      newErrors.asso_npa = 'Le code postal est requis';
    } else if (!/^[0-9]{4,5}$/.test(formData.asso_npa)) {
      newErrors.asso_npa = 'Format du code postal invalide';
    }

    // Valider localité
    if (!formData.asso_localite) {
      newErrors.asso_localite = 'La localité est requise';
    }

    // Valider canton
    if (!formData.asso_canton) {
      newErrors.asso_canton = 'Le canton est requis';
    }

    // Valider téléphone
    if (!formData.asso_telephone) {
      newErrors.asso_telephone = 'Le téléphone est requis';
    }

    // Valider email
    if (formData.asso_email && !/\S+@\S+\.\S+/.test(formData.asso_email)) {
      newErrors.asso_email = 'Format d\'email invalide';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const url = association 
        ? `http://localhost:8000/api/associations/${association.asso_id}`
        : 'http://localhost:8000/api/associations';
      
      const method = association ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          throw new Error(data.message || 'Une erreur est survenue');
        }
      } else {
        // Succès
        Alert.alert(
          'Succès',
          association ? 'Association modifiée avec succès' : 'Association créée avec succès',
          [{ text: 'OK', onPress: () => onSuccess(data) }]
        );
      }
    } catch (error) {
      Alert.alert('Erreur', error.message);
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

  return (
    <View style={styles.container}>
      {/* Nom de l'association */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nom de l'association *</Text>
        <TextInput
          style={[styles.input, errors.asso_nom && styles.inputError]}
          placeholder="Nom de l'association"
          value={formData.asso_nom}
          onChangeText={(text) => handleChange('asso_nom', text)}
        />
        {errors.asso_nom && (
          <Text style={styles.errorText}>{errors.asso_nom}</Text>
        )}
      </View>

      {/* Adresse */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Adresse *</Text>
        <TextInput
          style={[styles.input, errors.asso_adresse && styles.inputError]}
          placeholder="Rue et numéro"
          value={formData.asso_adresse}
          onChangeText={(text) => handleChange('asso_adresse', text)}
        />
        {errors.asso_adresse && (
          <Text style={styles.errorText}>{errors.asso_adresse}</Text>
        )}
      </View>

      {/* Code postal */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Code postal (NPA) *</Text>
        <TextInput
          style={[styles.input, errors.asso_npa && styles.inputError]}
          placeholder="Code postal"
          value={formData.asso_npa}
          onChangeText={(text) => handleChange('asso_npa', text)}
          keyboardType="numeric"
        />
        {errors.asso_npa && (
          <Text style={styles.errorText}>{errors.asso_npa}</Text>
        )}
      </View>

      {/* Localité */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Localité *</Text>
        <TextInput
          style={[styles.input, errors.asso_localite && styles.inputError]}
          placeholder="Localité"
          value={formData.asso_localite}
          onChangeText={(text) => handleChange('asso_localite', text)}
        />
        {errors.asso_localite && (
          <Text style={styles.errorText}>{errors.asso_localite}</Text>
        )}
      </View>

      {/* Canton */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Canton *</Text>
        <View style={[styles.pickerContainer, errors.asso_canton && styles.inputError]}>
          <Picker
            selectedValue={formData.asso_canton}
            onValueChange={(value) => handleChange('asso_canton', value)}
            style={styles.picker}
          >
            {cantons.map((canton, index) => (
              <Picker.Item key={index} label={canton.label} value={canton.value} />
            ))}
          </Picker>
        </View>
        {errors.asso_canton && (
          <Text style={styles.errorText}>{errors.asso_canton}</Text>
        )}
      </View>

      {/* Téléphone */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Téléphone *</Text>
        <TextInput
          style={[styles.input, errors.asso_telephone && styles.inputError]}
          placeholder="Numéro de téléphone"
          value={formData.asso_telephone}
          onChangeText={(text) => handleChange('asso_telephone', text)}
          keyboardType="phone-pad"
        />
        {errors.asso_telephone && (
          <Text style={styles.errorText}>{errors.asso_telephone}</Text>
        )}
      </View>

      {/* Email */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.asso_email && styles.inputError]}
          placeholder="Email de l'association"
          value={formData.asso_email}
          onChangeText={(text) => handleChange('asso_email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.asso_email && (
          <Text style={styles.errorText}>{errors.asso_email}</Text>
        )}
      </View>

      {/* Site web */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Site web</Text>
        <TextInput
          style={styles.input}
          placeholder="Site web de l'association"
          value={formData.asso_site_web}
          onChangeText={(text) => handleChange('asso_site_web', text)}
          autoCapitalize="none"
        />
      </View>

      {/* Bénéficiaires */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Bénéficiaires</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description des bénéficiaires de votre association"
          value={formData.asso_beneficiaires}
          onChangeText={(text) => handleChange('asso_beneficiaires', text)}
          multiline={true}
          numberOfLines={4}
        />
      </View>

      {/* Description */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description de votre association"
          value={formData.asso_description}
          onChangeText={(text) => handleChange('asso_description', text)}
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
            {association ? 'Enregistrer les modifications' : 'Créer mon association'}
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

export default AssociationForm;