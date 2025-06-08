// components/DateSelector.js
import { Ionicons } from '@expo/vector-icons';
import { addDays, addMonths, format, isValid, setHours, setMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import {
    Dimensions,
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

const screenWidth = Dimensions.get('window').width;

const DateSelector = ({ 
  value, 
  onChange, 
  label, 
  error, 
  minimumDate = new Date() 
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('date'); // 'date' ou 'time'
  const [tempDate, setTempDate] = useState(value);
  
  // Options rapides
  const quickDateOptions = [
    { label: "Aujourd'hui", value: new Date() },
    { label: "Demain", value: addDays(new Date(), 1) },
    { label: "Après-demain", value: addDays(new Date(), 2) },
    { label: "+1 semaine", value: addDays(new Date(), 7) },
    { label: "+1 mois", value: addMonths(new Date(), 1) },
  ];
  
  // Heures
  const hours = Array.from({ length: 24 }, (_, i) => i);
  
  // Minutes
  const minutes = [0, 15, 30, 45];
  
  const handleSelectQuickDate = (date) => {
    // Préserver l'heure actuelle
    const newDate = new Date(date);
    newDate.setHours(tempDate.getHours(), tempDate.getMinutes());
    setTempDate(newDate);
  };
  
  const handleSelectHour = (hour) => {
    const newDate = setHours(tempDate, hour);
    setTempDate(newDate);
  };
  
  const handleSelectMinute = (minute) => {
    const newDate = setMinutes(tempDate, minute);
    setTempDate(newDate);
  };
  
  const handleCancel = () => {
    setTempDate(value); // Restaurer la valeur précédente
    setModalVisible(false);
  };
  
  const handleConfirm = () => {
    if (isValid(tempDate)) {
      onChange(tempDate);
      setModalVisible(false);
    }
  };
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={[styles.dateDisplay, error && styles.dateDisplayError]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.dateText}>
          {format(value, 'dd MMMM yyyy à HH:mm', { locale: fr })}
        </Text>
        <Ionicons name="calendar-outline" size={20} color="#6b7280" />
      </TouchableOpacity>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleCancel}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sélectionner une date et heure</Text>
              <TouchableOpacity onPress={handleCancel}>
                <Ionicons name="close" size={24} color="#374151" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.tabContainer}>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'date' && styles.activeTab]}
                onPress={() => setActiveTab('date')}
              >
                <Text style={[styles.tabText, activeTab === 'date' && styles.activeTabText]}>Date</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.tab, activeTab === 'time' && styles.activeTab]}
                onPress={() => setActiveTab('time')}
              >
                <Text style={[styles.tabText, activeTab === 'time' && styles.activeTabText]}>Heure</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.selectedDateText}>
              {format(tempDate, 'EEEE dd MMMM yyyy à HH:mm', { locale: fr })}
            </Text>
            
            {activeTab === 'date' ? (
              <View style={styles.datePickerContainer}>
                <Text style={styles.sectionTitle}>Sélection rapide</Text>
                <View style={styles.quickOptionsContainer}>
                  {quickDateOptions.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.quickOptionButton}
                      onPress={() => handleSelectQuickDate(option.value)}
                    >
                      <Text style={styles.quickOptionText}>{option.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <Text style={styles.sectionTitle}>Date personnalisée</Text>
                <Text style={styles.helperText}>
                  Pour une sélection plus précise, utilisez les options rapides puis ajustez l'heure.
                </Text>
              </View>
            ) : (
              <View style={styles.timePickerContainer}>
                <Text style={styles.sectionTitle}>Heures</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.hoursContainer}>
                    {hours.map((hour) => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.hourButton,
                          tempDate.getHours() === hour && styles.selectedTimeButton
                        ]}
                        onPress={() => handleSelectHour(hour)}
                      >
                        <Text 
                          style={[
                            styles.hourText,
                            tempDate.getHours() === hour && styles.selectedTimeText
                          ]}
                        >
                          {hour < 10 ? `0${hour}` : hour}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
                
                <Text style={styles.sectionTitle}>Minutes</Text>
                <View style={styles.minutesContainer}>
                  {minutes.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.minuteButton,
                        tempDate.getMinutes() === minute && styles.selectedTimeButton
                      ]}
                      onPress={() => handleSelectMinute(minute)}
                    >
                      <Text 
                        style={[
                          styles.minuteText,
                          tempDate.getMinutes() === minute && styles.selectedTimeText
                        ]}
                      >
                        {minute < 10 ? `0${minute}` : minute}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 6,
    color: '#374151',
  },
  dateDisplay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'white',
  },
  dateDisplayError: {
    borderColor: '#ef4444',
  },
  dateText: {
    fontSize: 16,
    color: '#1f2937',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 12,
    marginTop: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
  },
  activeTab: {
    backgroundColor: '#10b981',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
  },
  activeTabText: {
    color: 'white',
  },
  selectedDateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#10b981',
    textAlign: 'center',
    marginBottom: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#ecfdf5',
  },
  datePickerContainer: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 8,
  },
  quickOptionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  quickOptionButton: {
    backgroundColor: '#f3f4f6',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  quickOptionText: {
    color: '#4b5563',
    fontWeight: '500',
  },
  helperText: {
    fontSize: 12,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 16,
  },
  timePickerContainer: {
    marginBottom: 16,
  },
  hoursContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  hourButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
  },
  selectedTimeButton: {
    backgroundColor: '#10b981',
  },
  hourText: {
    fontSize: 16,
    color: '#4b5563',
  },
  selectedTimeText: {
    color: 'white',
    fontWeight: '600',
  },
  minutesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  minuteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: '#f3f4f6',
  },
  minuteText: {
    fontSize: 16,
    color: '#4b5563',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 6,
    marginRight: 8,
  },
  cancelButtonText: {
    color: '#4b5563',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#10b981',
    borderRadius: 6,
    marginLeft: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

export default DateSelector;