import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Dimensions } from 'react-native';
import { Camera, Check, X, ChevronDown, ChevronUp, Bell, Clock } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  useSharedValue,
  withSequence
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

// Initialize global medicine list if it doesn't exist
if (typeof global.medicineList === 'undefined') {
  global.medicineList = [
    { id: 1, name: 'Aspirin', dosage: '100mg', schedule: 'Morning', status: 'pending', time: '08:00 AM', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60' },
    { id: 2, name: 'Vitamin D', dosage: '1000IU', schedule: 'Morning', status: 'pending', time: '09:00 AM', image: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=800&auto=format&fit=crop&q=60' },
    { id: 3, name: 'Ibuprofen', dosage: '400mg', schedule: 'Evening', status: 'pending', time: '08:00 PM', image: 'https://images.unsplash.com/photo-1626716493137-b67fe9501e76?w=800&auto=format&fit=crop&q=60' },
  ];
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeScreen() {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [medicines, setMedicines] = useState(global.medicineList);
  const router = useRouter();
  
  const headerScale = useSharedValue(1);
  const scrollY = useSharedValue(0);

  useEffect(() => {
    // Pulse animation for header on mount
    headerScale.value = withSequence(
      withSpring(1.05),
      withSpring(1)
    );
  }, []);

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

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: headerScale.value },
      {
        translateY: interpolate(
          scrollY.value,
          [0, 100],
          [0, -20],
          'clamp'
        )
      }
    ],
    opacity: interpolate(
      scrollY.value,
      [0, 100],
      [1, 0.8],
      'clamp'
    )
  }));

  const renderNextDose = () => {
    const pendingMeds = medicines.filter(med => med.status === 'pending');
    if (pendingMeds.length === 0) return null;

    return (
      <View style={styles.nextDoseContainer}>
        <View style={styles.nextDoseHeader}>
          <Clock size={20} color="#007AFF" />
          <Text style={styles.nextDoseTitle}>Next Dose</Text>
        </View>
        <View style={styles.nextDoseContent}>
          <Image 
            source={{ uri: pendingMeds[0].image }} 
            style={styles.nextDoseImage}
          />
          <View style={styles.nextDoseInfo}>
            <Text style={styles.nextDoseMedicine}>{pendingMeds[0].name}</Text>
            <Text style={styles.nextDoseTime}>{pendingMeds[0].time}</Text>
          </View>
          <TouchableOpacity 
            style={styles.nextDoseButton}
            onPress={() => handleStatusChange(pendingMeds[0].id, 'taken')}
          >
            <Check size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.title}>My Medications</Text>
            <Text style={styles.subtitle}>Track your daily doses</Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Bell size={24} color="#1a1a1a" />
          </TouchableOpacity>
        </View>
        <TouchableOpacity 
          style={styles.scanButton}
          onPress={() => router.push('/camera')}
        >
          <Camera size={24} color="#fff" />
          <Text style={styles.scanButtonText}>Scan Prescription</Text>
        </TouchableOpacity>
      </Animated.View>

      {renderNextDose()}

      <ScrollView 
        style={styles.medicineList}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        {medicines.map((medicine) => (
          <AnimatedTouchableOpacity
            key={medicine.id}
            style={[styles.medicineCard]}
            onPress={() => setExpandedId(expandedId === medicine.id ? null : medicine.id)}
          >
            <View style={styles.medicineHeader}>
              <Image 
                source={{ uri: medicine.image }} 
                style={styles.medicineImage}
              />
              <View style={styles.medicineInfo}>
                <Text style={styles.medicineName}>{medicine.name}</Text>
                <Text style={styles.medicineDetails}>
                  {medicine.dosage} • {medicine.time}
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
            </View>

            {expandedId === medicine.id && (
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[styles.statusButton, medicine.status === 'taken' && styles.activeButton]}
                  onPress={() => handleStatusChange(medicine.id, 'taken')}
                >
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
                  onPress={() => handleStatusChange(medicine.id, 'missed')}
                >
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
          </AnimatedTouchableOpacity>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter-Bold',
    color: '#1a1a1a',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Inter-Regular',
    marginTop: 4,
  },
  scanButton: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  nextDoseContainer: {
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  nextDoseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  nextDoseTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  nextDoseContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  nextDoseImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  nextDoseInfo: {
    flex: 1,
  },
  nextDoseMedicine: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  nextDoseTime: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
  nextDoseButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
  },
  medicineList: {
    padding: 20,
  },
  medicineCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    position: 'relative',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  medicineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  medicineImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  medicineInfo: {
    flex: 1,
  },
  medicineName: {
    fontSize: 18,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  medicineDetails: {
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
    borderRadius: 12,
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