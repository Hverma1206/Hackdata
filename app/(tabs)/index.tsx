import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Camera, Check, X, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useRouter } from 'expo-router';

// Initialize global medicine list if it doesn't exist
if (typeof global.medicineList === 'undefined') {
  global.medicineList = [
    { id: 1, name: 'Aspirin', dosage: '100mg', schedule: 'Morning', status: 'pending' },
    { id: 2, name: 'Vitamin D', dosage: '1000IU', schedule: 'Morning', status: 'pending' },
    { id: 3, name: 'Ibuprofen', dosage: '400mg', schedule: 'Evening', status: 'pending' },
  ];
}

export default function HomeScreen() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [medicines, setMedicines] = useState(global.medicineList);
  const router = useRouter();

  // Update local state when global medicine list changes
  useEffect(() => {
    setMedicines(global.medicineList);
  }, [global.medicineList]);

  const handleStatusChange = (id: number, newStatus: string) => {
    const updatedMedicines = medicines.map(medicine => 
      medicine.id === id ? { ...medicine, status: newStatus } : medicine
    );
    global.medicineList = updatedMedicines;
    setMedicines(updatedMedicines);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'taken':
        return '#34C759';
      case 'missed':
        return '#FF3B30';
      default:
        return '#007AFF';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Medications</Text>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => router.push('/camera')}
        >
          <Camera size={24} color="#fff" />
          <Text style={styles.scanButtonText}>Scan Prescription</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.medicineList}>
        {medicines.map((medicine) => (
          <View key={medicine.id} style={styles.medicineCard}>
            <TouchableOpacity
              style={styles.medicineHeader}
              onPress={() => setExpandedId(expandedId === medicine.id ? null : medicine.id)}>
              <View>
                <Text style={styles.medicineName}>{medicine.name}</Text>
                <Text style={styles.medicineInfo}>
                  {medicine.dosage} • {medicine.schedule}
                  {medicine.status !== 'pending' && (
                    <Text style={[
                      styles.statusText,
                      { color: getStatusColor(medicine.status) }
                    ]}>
                      {' • '}{medicine.status.charAt(0).toUpperCase() + medicine.status.slice(1)}
                    </Text>
                  )}
                </Text>
              </View>
              {expandedId === medicine.id ? (
                <ChevronUp size={24} color="#666" />
              ) : (
                <ChevronDown size={24} color="#666" />
              )}
            </TouchableOpacity>

            {expandedId === medicine.id && (
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[styles.statusButton, medicine.status === 'taken' && styles.activeButton]}
                  onPress={() => handleStatusChange(medicine.id, 'taken')}>
                  <Check size={20} color={medicine.status === 'taken' ? '#fff' : '#34C759'} />
                  <Text
                    style={[
                      styles.statusButtonText,
                      medicine.status === 'taken' && styles.activeButtonText,
                    ]}>
                    Taken
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.statusButton, medicine.status === 'missed' && styles.missedButton]}
                  onPress={() => handleStatusChange(medicine.id, 'missed')}>
                  <X size={20} color={medicine.status === 'missed' ? '#fff' : '#FF3B30'} />
                  <Text
                    style={[
                      styles.statusButtonText,
                      medicine.status === 'missed' && styles.activeButtonText,
                    ]}>
                    Missed
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <View
              style={[
                styles.statusIndicator,
                { backgroundColor: getStatusColor(medicine.status) },
              ]}
            />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  medicineList: {
    padding: 20,
  },
  medicineCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
  },
  medicineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medicineName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  medicineInfo: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontFamily: 'Inter-Regular',
  },
  statusText: {
    fontFamily: 'Inter-SemiBold',
  },
  statusButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  statusButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    gap: 8,
  },
  activeButton: {
    backgroundColor: '#34C759',
    borderColor: '#34C759',
  },
  missedButton: {
    backgroundColor: '#FF3B30',
    borderColor: '#FF3B30',
  },
  statusButtonText: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#666',
  },
  activeButtonText: {
    color: '#fff',
  },
  statusIndicator: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 4,
    height: '100%',
  },
});