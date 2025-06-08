// screens/auth/InscriptionEcran.js
import { Picker } from '@react-native-picker/picker';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Couleurs from '../../theme/Couleurs';

const InscriptionEcran = ({ navigation }) => {
  const { register, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password_confirmation: '',
    nom: '',
    prenom: '',
    type: 'restaurant', // 'restaurant' ou 'association'
  });

  const handleChange = (field, value) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const validateForm = () => {
    // Vérifier que tous les champs sont remplis
    for (const key in formData) {
      if (!formData[key] && key !== 'password_confirmation') {
        Alert.alert('Erreur', 'Veuillez remplir tous les champs obligatoires');
        return false;
      }
    }

    // Vérifier que les mots de passe correspondent
    if (formData.password !== formData.password_confirmation) {
      Alert.alert('Erreur', 'Les mots de passe ne correspondent pas');
      return false;
    }

    // Vérifier que le mot de passe a au moins 8 caractères
    if (formData.password.length < 8) {
      Alert.alert('Erreur', 'Le mot de passe doit contenir au moins 8 caractères');
      return false;
    }

    // Vérifier que l'email est valide
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      Alert.alert('Erreur', 'Veuillez entrer une adresse email valide');
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      const success = await register(formData);
      if (success) {
        console.log('Inscription réussie');
        
        // Ajouter une alerte de confirmation avec redirection
        Alert.alert(
          'Inscription réussie',
          'Votre compte a été créé avec succès. Vous êtes maintenant connecté.',
          [
            {
              text: 'OK',
              onPress: () => {
                // La navigation se fera automatiquement grâce au contexte d'authentification
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Créer un compte</Text>
      <Text style={styles.subtitle}>Rejoignez SaveEat et luttez contre le gaspillage alimentaire</Text>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Type de compte</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={formData.type}
            style={styles.picker}
            onValueChange={(value) => handleChange('type', value)}
          >
            <Picker.Item label="Restaurant" value="restaurant" />
            <Picker.Item label="Association" value="association" />
          </Picker>
        </View>

        <Text style={styles.label}>Prénom</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre prénom"
          value={formData.prenom}
          onChangeText={(value) => handleChange('prenom', value)}
        />

        <Text style={styles.label}>Nom</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre nom"
          value={formData.nom}
          onChangeText={(value) => handleChange('nom', value)}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre email"
          value={formData.email}
          onChangeText={(value) => handleChange('email', value)}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre mot de passe"
          value={formData.password}
          onChangeText={(value) => handleChange('password', value)}
          secureTextEntry
        />

        <Text style={styles.label}>Confirmer le mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="Confirmez votre mot de passe"
          value={formData.password_confirmation}
          onChangeText={(value) => handleChange('password_confirmation', value)}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>S'inscrire</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.loginButton}
          onPress={() => navigation.navigate('Connexion')}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            Déjà un compte ? Connectez-vous
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: Couleurs.fond.primaire,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Couleurs.primaire,
    marginTop: 20,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: Couleurs.texte.secondaire,
    marginTop: 5,
    marginBottom: 20,
    textAlign: 'center',
  },
  formContainer: {
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    color: Couleurs.texte.primaire,
    marginBottom: 5,
  },
  input: {
    backgroundColor: Couleurs.fond.secondaire,
    borderRadius: 5,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: Couleurs.fond.gris,
    fontSize: 16,
  },
  pickerContainer: {
    backgroundColor: Couleurs.fond.secondaire,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: Couleurs.fond.gris,
    marginBottom: 15,
  },
  picker: {
    height: 50,
  },
  button: {
    backgroundColor: Couleurs.primaire,
    borderRadius: 5,
    padding: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: Couleurs.texte.inverse,
    fontWeight: 'bold',
    fontSize: 16,
  },
  loginButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
  loginButtonText: {
    color: Couleurs.primaire,
    fontSize: 16,
  },
});

export default InscriptionEcran;