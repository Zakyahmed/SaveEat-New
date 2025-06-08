// screens/restaurant/FormulaireInvenduEcran.js
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import InvenduForm from '../../components/InvenduForm';
import { useAuth } from '../../context/AuthContext';
import { useFood } from '../../context/FoodContext';
import Couleurs from '../../theme/Couleurs';

const FormulaireInvenduEcran = ({ route, navigation }) => {
  const { item } = route.params || {};
  const isEditing = !!item;
  const { token } = useAuth();
  const { fetchInvendu } = useFood();
  const [loading, setLoading] = useState(false);
  
  // Fonction appelée après succès de création/modification
  const handleSuccess = () => {
    navigation.goBack();
  };
  
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>
            {isEditing ? 'Modifier un invendu' : 'Ajouter un invendu'}
          </Text>
          
          <InvenduForm 
            invendu={item} 
            onSuccess={handleSuccess} 
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Couleurs.fond.secondaire,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Couleurs.texte.primaire,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default FormulaireInvenduEcran;