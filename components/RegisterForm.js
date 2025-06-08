// components/RegisterForm.js
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useAuth } from '../context/AuthContext';

const RegisterForm = ({ onSuccess }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    password_confirmation: '',
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
    
    // Valider nom
    if (!formData.nom) {
      newErrors.nom = 'Le nom est requis';
    }

    // Valider prénom
    if (!formData.prenom) {
      newErrors.prenom = 'Le prénom est requis';
    }
    
    // Valider email
    if (!formData.email) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Format d\'email invalide';
    }
    
    // Valider mot de passe
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Le mot de passe doit contenir au moins 8 caractères';
    }
    
    // Valider confirmation de mot de passe
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    try {
      const result = await register(formData);
      
      if (result.success) {
        onSuccess();
      } else {
        // Afficher les erreurs de validation du backend
        if (result.errors) {
          setErrors(result.errors);
        } else {
          Alert.alert('Erreur', result.error || 'Échec de l\'inscription');
        }
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Nom Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={[styles.input, errors.nom && styles.inputError]}
          placeholder="Votre nom"
          value={formData.nom}
          onChangeText={(text) => handleChange('nom', text)}
        />
        {errors.nom && (
          <Text style={styles.errorText}>{errors.nom}</Text>
        )}
      </View>

      {/* Prénom Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={[styles.input, errors.prenom && styles.inputError]}
          placeholder="Votre prénom"
          value={formData.prenom}
          onChangeText={(text) => handleChange('prenom', text)}
        />
        {errors.prenom && (
          <Text style={styles.errorText}>{errors.prenom}</Text>
        )}
      </View>

      {/* Email Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          placeholder="Votre adresse email"
          value={formData.email}
          onChangeText={(text) => handleChange('email', text)}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCompleteType="email"
        />
        {errors.email && (
          <Text style={styles.errorText}>{errors.email}</Text>
        )}
      </View>

      {/* Password Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={[styles.input, errors.password && styles.inputError]}
          placeholder="Votre mot de passe"
          value={formData.password}
          onChangeText={(text) => handleChange('password', text)}
          secureTextEntry
        />
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>

      {/* Password Confirmation Field */}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Confirmation du mot de passe</Text>
        <TextInput
          style={[styles.input, errors.password_confirmation && styles.inputError]}
          placeholder="Confirmez votre mot de passe"
          value={formData.password_confirmation}
          onChangeText={(text) => handleChange('password_confirmation', text)}
          secureTextEntry
        />
        {errors.password_confirmation && (
          <Text style={styles.errorText}>{errors.password_confirmation}</Text>
        )}
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
          <Text style={styles.buttonText}>S'inscrire</Text>
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
  inputError: {
    borderColor: '#ef4444', // text-red-500 équivalent
  },
  errorText: {
    color: '#ef4444', // text-red-500 équivalent
    fontSize: 12,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#10b981', // bg-green-600 équivalent
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RegisterForm;