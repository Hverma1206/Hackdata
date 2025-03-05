import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Clock } from 'lucide-react-native';

const SCHEDULE = [
  { time: '08:00 AM', medicines: ['Aspirin', 'Vitamin D'] },
  { time: '02:00 PM', medicines: ['Ibuprofen'] },
  { time: '08:00 PM', medicines: ['Vitamin C', 'Calcium'] },
];

export default function ScheduleScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Daily Schedule</Text>
        <Text style={styles.subtitle}>Today's medication timeline</Text>
      </View>

      <ScrollView style={styles.timeline}>
        {SCHEDULE.map((slot, index) => (
          <View key={index} style={styles.timeSlot}>
            <View style={styles.timeHeader}>
              <Clock size={20} color="#007AFF" />
              <Text style={styles.timeText}>{slot.time}</Text>
            </View>
            <View style={styles.medicineList}>
              {slot.medicines.map((medicine, medIndex) => (
                <View key={medIndex} style={styles.medicineItem}>
                  <Text style={styles.medicineName}>{medicine}</Text>
                </View>
              ))}
            </View>
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
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    fontFamily: 'Inter-Regular',
  },
  timeline: {
    padding: 20,
  },
  timeSlot: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  timeText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1a1a1a',
  },
  medicineList: {
    gap: 8,
  },
  medicineItem: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 8,
  },
  medicineName: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#666',
  },
});