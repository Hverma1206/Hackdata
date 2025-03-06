import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

// If using react-navigation
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
// const Tab = createBottomTabNavigator();

// Types
interface Medication {
  name: string;
  dosage: string;
  icon: string;
  status: string;
}

interface TimeSlot {
  id: string; // Add ID for identifying slots
  time: string;
  title: string;
  pills: Array<{
    name: string;
    dotColor: string;
  }>;
  completed?: boolean;
  missed?: boolean;
  showOptions?: boolean; // For dropdown visibility
}

const HomeScreen: React.FC = () => {
  const router = useRouter();
  // Current date
  const currentDate = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  };
  const formattedDate = currentDate.toLocaleDateString('en-US', dateOptions);

  // Mock data
  const upcomingMedications: Medication[] = [
    {
      name: 'Lisinopril',
      dosage: '10mg • 1 pill',
      icon: '💊',
      status: 'Take in 15 min',
    },
    {
      name: 'Vitamin D3',
      dosage: '1000IU • 1 capsule',
      icon: '💊',
      status: 'Take in 15 min',
    },
  ];

  // Updated todaySchedule with IDs
  const [todaySchedule, setTodaySchedule] = useState<TimeSlot[]>([
    {
      id: '1',
      time: '8:00 AM',
      title: 'Morning Medications',
      pills: [
        { name: 'Metformin', dotColor: 'blue' },
        { name: 'Aspirin', dotColor: 'red' },
      ],
      completed: true,
    },
    {
      id: '2',
      time: '9:00 AM',
      title: 'Blood Pressure Meds',
      pills: [
        { name: 'Lisinopril', dotColor: 'blue' },
        { name: 'Vitamin D3', dotColor: 'green' },
      ],
      showOptions: false,
    },
    {
      id: '3',
      time: '1:00 PM',
      title: 'Lunch Medications',
      pills: [{ name: 'Metformin', dotColor: 'blue' }],
      showOptions: false,
    },
    {
      id: '4',
      time: '8:00 PM',
      title: 'Evening Medications',
      pills: [
        { name: 'Metformin', dotColor: 'blue' },
        { name: 'Amlodipine', dotColor: 'red' },
        { name: 'Vitamin C', dotColor: 'green' },
      ],
      showOptions: false,
    },
  ]);

  // Function to toggle options dropdown
  const toggleOptions = (id: string) => {
    setTodaySchedule(schedule =>
      schedule.map(slot => ({
        ...slot,
        showOptions: slot.id === id ? !slot.showOptions : false
      }))
    );
  };

  // Function to mark medication as taken or missed
  const updateMedicationStatus = (id: string, status: 'taken' | 'missed') => {
    setTodaySchedule(schedule =>
      schedule.map(slot => {
        if (slot.id === id) {
          return {
            ...slot,
            completed: status === 'taken',
            missed: status === 'missed',
            showOptions: false,
          };
        }
        return slot;
      })
    );
  };

  // Render medication card
  const renderMedicationCard = (medication: Medication, index: number) => (
    <TouchableOpacity
      key={index}
      style={styles.medicationCard}
      activeOpacity={0.7}
    >
      <View style={styles.medIcon}>
        <Text style={styles.medIconText}>{medication.icon}</Text>
      </View>
      <View style={styles.medDetails}>
        <Text style={styles.medName}>{medication.name}</Text>
        <Text style={styles.medDosage}>{medication.dosage}</Text>
      </View>
      <LinearGradient
        colors={['#4361ee', '#3a0ca3']}
        style={styles.medStatus}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
      >
        <Text style={styles.medStatusText}>{medication.status}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  // Updated render time slot function with dropdown buttons
  const renderTimeSlot = (slot: TimeSlot, index: number) => {
    const cardStyle = [
      styles.timeCard,
      slot.completed && styles.completedCard,
      slot.missed && styles.missedCard,
    ];

    return (
      <View key={index} style={styles.timeSlot}>
        <View style={styles.timeIndicator}>
          <Text style={styles.timeText}>{slot.time}</Text>
          <View style={styles.timeLine}>
            <View style={[styles.timeCircle, 
              slot.completed && styles.completedCircle,
              slot.missed && styles.missedCircle
            ]} />
          </View>
        </View>

        <View style={styles.slotContainer}>
          <TouchableOpacity 
            style={cardStyle} 
            activeOpacity={0.7}
            onPress={() => toggleOptions(slot.id)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.timeCardTitle}>{slot.title}</Text>
              {slot.completed && (
                <View style={styles.statusIndicator}>
                  <Text style={styles.statusText}>Taken ✓</Text>
                </View>
              )}
              {slot.missed && (
                <View style={[styles.statusIndicator, styles.missedIndicator]}>
                  <Text style={styles.statusText}>Missed ✗</Text>
                </View>
              )}
            </View>
            
            <View style={styles.pills}>
              {slot.pills.map((pill, pillIndex) => (
                <View key={pillIndex} style={styles.pill}>
                  <View
                    style={[
                      styles.pillDot,
                      pill.dotColor === 'blue' && styles.blueDot,
                      pill.dotColor === 'red' && styles.redDot,
                      pill.dotColor === 'green' && styles.greenDot,
                    ]}
                  />
                  <Text style={styles.pillText}>{pill.name}</Text>
                </View>
              ))}
            </View>
          </TouchableOpacity>

          {/* Dropdown options */}
          {slot.showOptions && (
            <View style={styles.optionsDropdown}>
              <TouchableOpacity 
                style={styles.optionButton}
                onPress={() => updateMedicationStatus(slot.id, 'taken')}
              >
                <LinearGradient
                  colors={['#10b981', '#059669']}
                  style={styles.optionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.optionText}>Mark as Taken</Text>
                </LinearGradient>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.optionButton}
                onPress={() => updateMedicationStatus(slot.id, 'missed')}
              >
                <LinearGradient
                  colors={['#ef4444', '#dc2626']}
                  style={styles.optionGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.optionText}>Mark as Missed</Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    );
  };

  // Ensure handleScanPress is properly defined
  const handleScanPress = () => {
    console.log('Navigating to scan page');  // Add logging for debugging
    router.push('/scanPage');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Header */}
        <LinearGradient
          colors={['#4361ee', '#3a0ca3']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerTop}>
            <Text style={styles.logo}>MediSure</Text>
            <TouchableOpacity 
              style={styles.profile}
              onPress={() => router.push('/profile')}
            >
              <Text style={styles.profileText}>JS</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.greeting}>Good morning, John</Text>
          <Text style={styles.date}>{formattedDate}</Text>
        </LinearGradient>

        {/* Next Dose */}
        <View style={styles.nextDose}>
          <View style={styles.nextDoseTitle}>
            <Text style={styles.nextDoseHeading}>Upcoming Dose</Text>
            <LinearGradient
              colors={['#4361ee', '#3a0ca3']}
              style={styles.timePill}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.timePillText}>9:00 AM</Text>
            </LinearGradient>
          </View>

          {upcomingMedications.map(renderMedicationCard)}
        </View>

        {/* Today's Schedule */}
        <Text style={styles.sectionTitle}>Today's Schedule</Text>
        <View style={styles.todaySchedule}>
          {todaySchedule.map(renderTimeSlot)}
        </View>
      </ScrollView>

      {/* Add Button - Floating Action Button */}
      <TouchableOpacity 
        activeOpacity={0.8} 
        style={styles.fabContainer}
        onPress={handleScanPress}  // This is already correctly set
      >
        <LinearGradient
          colors={['#4361ee', '#3a0ca3']}
          style={styles.fab}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <Text style={styles.fabText}>+</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={[styles.navItem, styles.navActive]}>
          <Text style={[styles.navIcon, styles.navActiveText]}>🏠</Text>
          <Text style={[styles.navText, styles.navActiveText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/schedule')}
        >
          <Text style={styles.navIcon}>📅</Text>
          <Text style={styles.navText}>Calendar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navItem}
          onPress={() => router.push('/reports')}
        >
          <Text style={styles.navIcon}>📊</Text>
          <Text style={styles.navText}>Reports</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navItem}>
          <Text style={styles.navIcon}>👥</Text>
          <Text style={styles.navText}>Care Team</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    paddingBottom: 100,
  },
  header: {
    padding: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontWeight: '700',
    fontSize: 22,
    color: 'white',
    letterSpacing: -0.5,
  },
  profile: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  profileText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  greeting: {
    fontSize: 26,
    fontWeight: '600',
    color: 'white',
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  date: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
  },
  nextDose: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 24,
    marginHorizontal: 20,
    marginTop: -50,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 8,
  },
  nextDoseTitle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  nextDoseHeading: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  timePill: {
    borderRadius: 24,
    padding: 6,
    paddingHorizontal: 14,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  timePillText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  medicationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
  },
  medIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 18,
    shadowColor: '#e0e7ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 2,
  },
  medIconText: {
    fontSize: 22,
  },
  medDetails: {
    flex: 1,
  },
  medName: {
    fontWeight: '600',
    marginBottom: 5,
    fontSize: 16,
    color: '#1e293b',
  },
  medDosage: {
    fontSize: 14,
    color: '#64748b',
  },
  medStatus: {
    borderRadius: 12,
    padding: 8,
    paddingHorizontal: 14,
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 2,
  },
  medStatusText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  sectionTitle: {
    paddingHorizontal: 24,
    marginTop: 34,
    marginBottom: 18,
    fontSize: 19,
    fontWeight: '600',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  todaySchedule: {
    paddingHorizontal: 20,
  },
  timeSlot: {
    flexDirection: 'row',
    marginBottom: 22,
  },
  timeIndicator: {
    alignItems: 'center',
    width: 60,
  },
  timeText: {
    fontWeight: '500',
    marginBottom: 10,
    color: '#64748b',
    fontSize: 14,
  },
  timeLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
  },
  timeCircle: {
    position: 'absolute',
    top: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4361ee',
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  completedCircle: {
    backgroundColor: '#10b981',
    shadowColor: '#10b981',
  },
  missedCircle: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  timeCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    marginLeft: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    backgroundColor: '#10b981',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#10b981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  missedIndicator: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 12,
  },
  slotContainer: {
    flex: 1,
  },
  optionsDropdown: {
    marginLeft: 18,
    marginTop: 8,
    gap: 8,
  },
  optionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  optionGradient: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 15,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
    maxWidth: '100%',
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    flexShrink: 0,
  },
  blueDot: {
    backgroundColor: '#4361ee',
  },
  redDot: {
    backgroundColor: '#f72585',
  },
  greenDot: {
    backgroundColor: '#10b981',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  fab: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 8,
  },
  fabText: {
    color: '#ffffff',
    fontSize: 36,
    fontWeight: '300',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 63,  // Changed from 100 to 120 to move it higher
    right: 171,
    zIndex: 999,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingVertical: 16,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 4,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  navActive: {
    backgroundColor: '#eff6ff',
  },
  navIcon: {
    fontSize: 24,
    marginBottom: 6,
    color: '#94a3b8',
  },
  navText: {
    fontSize: 12,
    color: '#94a3b8',
  },
  navActiveText: {
    color: '#4361ee',
    fontWeight: '500',
  },
});

export default HomeScreen;