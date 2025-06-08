// screens/auth/ConnexionEcran.js
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import Couleurs from '../../theme/Couleurs';

const ConnexionEcran = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    // Test d'authentification échouée pour démontrer l'accès restreint
    if (email === 'test@demo.com' && password === 'demo') {
      // Démonstration: Échec d'accès
      Alert.alert(
        'Démonstration',
        'Ceci montre que sans identifiants valides, vous ne pouvez pas accéder aux données.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Tentative de connexion réelle
    const success = await login(email, password);
    if (success) {
      console.log('Connexion réussie');
      // Le context de l'authentification se chargera de rediriger l'utilisateur
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.logoContainer}>
        <Image 
          source={require('../../assets/images/icon.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.title}>SaveEat</Text>
        <Text style={styles.subtitle}>Connectez-vous pour accéder à l'application</Text>
      </View>

      <View style={styles.formContainer}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Mot de passe</Text>
        <TextInput
          style={styles.input}
          placeholder="Votre mot de passe"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Se connecter</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.registerButton}
          onPress={() => navigation.navigate('Inscription')}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            Pas encore de compte ? Inscrivez-vous
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
  logoContainer: {
    alignItems: 'center',
    marginVertical: 30,
  },
  logo: {
    width: 120,
    height: 120,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Couleurs.primaire,
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: Couleurs.texte.secondaire,
    marginTop: 5,
    textAlign: 'center',
  },
  formContainer: {
    marginTop: 20,
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
  registerButton: {
    marginTop: 20,
    padding: 10,
    alignItems: 'center',
  },
  registerButtonText: {
    color: Couleurs.primaire,
    fontSize: 16,
  },
});

export default ConnexionEcran;