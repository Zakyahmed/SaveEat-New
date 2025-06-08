// theme/styles.js
import { StyleSheet, Platform, StatusBar } from 'react-native';
import { colors } from '../constantes/couleurs';

export const globalStyles = StyleSheet.create({
  // Styles de conteneur principal
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    padding: 15,
    paddingBottom: 30,
  },
  
  // En-têtes
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: colors.green,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  backButton: {
    color: 'white',
    fontSize: 16,
  },
  
  // Boutons
  primaryButton: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    backgroundColor: colors.green,
    alignItems: 'center',
    marginBottom: 15,
  },
  primaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  secondaryButton: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.green,
    alignItems: 'center',
    marginBottom: 15,
  },
  secondaryButtonText: {
    color: colors.green,
    fontWeight: 'bold',
    fontSize: 16,
  },
  warningButton: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    backgroundColor: colors.orange,
    alignItems: 'center',
    marginBottom: 15,
  },
  
  // Inputs
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: 'red',
  },
  label: {
    fontSize: 14,
    marginBottom: 5,
    color: '#333',
    fontWeight: '500',
  },
  
  // Textes
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  bodyText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
  },
  note: {
    fontSize: 14,
    color: '#777',
    fontStyle: 'italic',
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
  
  // Logo
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  
  // Cartes
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  
  // Séparateurs
  separator: {
    height: 1,
    backgroundColor: '#eee',
    marginVertical: 15,
  },
  
  // Indicateurs de statut
  statusContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
  },
  successStatus: {
    backgroundColor: '#E8F5E9',
  },
  successStatusText: {
    color: '#2E7D32',
    fontWeight: '500',
    fontSize: 12,
  },
  warningStatus: {
    backgroundColor: '#FFF8E1',
  },
  warningStatusText: {
    color: '#F57F17',
    fontWeight: '500',
    fontSize: 12,
  },
  pendingStatus: {
    backgroundColor: '#E3F2FD',
  },
  pendingStatusText: {
    color: '#1565C0',
    fontWeight: '500',
    fontSize: 12,
  },
  
  // Tableaux et listes
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  rowLast: {
    borderBottomWidth: 0,
  },
  
  // Grille de statistiques
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  
  // Navigation
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  navItem: {
    padding: 10,
    alignItems: 'center',
  },
  navText: {
    fontSize: 12,
    color: '#999',
  },
  activeNavText: {
    color: colors.green,
    fontWeight: '500',
  },

  // Checkbox
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: colors.green,
    fontSize: 12,
  },
});