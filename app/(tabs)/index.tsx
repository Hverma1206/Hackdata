import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, Image, Dimensions, SafeAreaView } from 'react-native';
import { Calendar, Clock, Bell, User, Home, PieChart, Menu, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useAnimatedStyle, 
  withSpring, 
  withTiming,
  interpolate,
  useSharedValue,
  withSequence
} from 'react-native-reanimated';
import UpcomingMedicinesComponent from './upcomingMedicines';

const { width } = Dimensions.get('window');

// Initialize global medicine list if it doesn't exist
if (typeof global.medicineList === 'undefined') {
  global.medicineList = [
    { 
      id: 1, 
      name: 'Lisinopril', 
      dosage: '10mg • 1 pill', 
      schedule: 'Morning', 
      status: 'pending', 
      time: '9:00 AM', 
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60',
      countdown: '15 min'
    },
    { 
      id: 2, 
      name: 'Vitamin D3', 
      dosage: '1000IU • 1 capsule', 
      schedule: 'Morning', 
      status: 'pending', 
      time: '9:00 AM', 
      image: 'https://images.unsplash.com/photo-1607619056574-7b8d3ee536b2?w=800&auto=format&fit=crop&q=60',
      countdown: '15 min'
    },
    { 
      id: 3, 
      name: 'Metformin', 
      dosage: '500mg • 1 tablet', 
      schedule: 'Morning', 
      status: 'taken', 
      time: '8:00 AM', 
      image: 'https://images.unsplash.com/photo-1626716493137-b67fe9501e76?w=800&auto=format&fit=crop&q=60' 
    },
    { 
      id: 4, 
      name: 'Aspirin', 
      dosage: '81mg • 1 tablet', 
      schedule: 'Morning', 
      status: 'taken', 
      time: '8:00 AM', 
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60' 
    },
    { 
      id: 5, 
      name: 'Metformin', 
      dosage: '500mg • 1 tablet', 
      schedule: 'Afternoon', 
      status: 'pending', 
      time: '1:00 PM', 
      image: 'https://images.unsplash.com/photo-1626716493137-b67fe9501e76?w=800&auto=format&fit=crop&q=60' 
    },
    { 
      id: 6, 
      name: 'Metformin', 
      dosage: '500mg • 1 tablet', 
      schedule: 'Evening', 
      status: 'pending', 
      time: '8:00 PM', 
      image: 'https://images.unsplash.com/photo-1626716493137-b67fe9501e76?w=800&auto=format&fit=crop&q=60' 
    },
    { 
      id: 7, 
      name: 'Amlodipine', 
      dosage: '5mg • 1 tablet', 
      schedule: 'Evening', 
      status: 'pending', 
      time: '8:00 PM', 
      image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&auto=format&fit=crop&q=60' 
    },
    { 
      id: 8, 
      name: 'Vitamin C', 
      dosage: '500mg • 1 tablet', 
      schedule: 'Evening', 
      status: 'pending', 
      time: '8:00 PM', 
      image: 'https://images.unsplash.com/photo-1616671276441-2f2c277b8bf6?w=800&auto=format&fit=crop&q=60' 
    },
  ];
}

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function HomeScreen() {
  const [medicines, setMedicines] = useState(global.medicineList);
  const [activeTab, setActiveTab] = useState('home');
  const router = useRouter();
  
  const headerScale = useSharedValue(1);
  const scrollY = useSharedValue(0);

  // Current date
  const getCurrentDate = () => {
    const date = new Date();
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  useEffect(() => {
    // Pulse animation for header on mount
    headerScale.value = withSequence(
      withSpring(1.05),
      withSpring(1)
    );
  }, []);

  // Group medicines by time slot
  const groupByTimeSlot = () => {
    const timeSlots = {};
    
    medicines.forEach(med => {
      if (!timeSlots[med.time]) {
        timeSlots[med.time] = {
          time: med.time,
          schedule: med.schedule,
          meds: [],
          status: 'pending'
        };
      }
      
      timeSlots[med.time].meds.push(med);
      
      // If all meds in this time slot are taken, mark the slot as completed
      const allTaken = timeSlots[med.time].meds.every(m => m.status === 'taken');
      if (allTaken) {
        timeSlots[med.time].status = 'completed';
      }
    });
    
    return Object.values(timeSlots).sort((a, b) => {
      // Convert time strings to comparable values
      const timeA = convertTimeToMinutes(a.time);
      const timeB = convertTimeToMinutes(b.time);
      return timeA - timeB;
    });
  };

  // Helper to convert time string to minutes for sorting
  const convertTimeToMinutes = (timeStr) => {
    const [time, period] = timeStr.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period === 'PM' && hours < 12) {
      hours += 12;
    } else if (period === 'AM' && hours === 12) {
      hours = 0;
    }
    
    return hours * 60 + minutes;
  };

  const timeSlots = groupByTimeSlot();

  // Get next pending medications
  const getNextPendingMeds = () => {
    return medicines.filter(med => med.status === 'pending')
      .sort((a, b) => {
        const timeA = convertTimeToMinutes(a.time);
        const timeB = convertTimeToMinutes(b.time);
        return timeA - timeB;
      });
  };

  const nextPendingMeds = getNextPendingMeds();

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

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>MediRemind</Text>
          <View style={styles.profileIcon}>
            <Text style={styles.profileText}>JS</Text>
          </View>
        </View>
        <Text style={styles.greeting}>Good morning, John</Text>
        <Text style={styles.date}>{getCurrentDate()}</Text>
      </Animated.View>

      {nextPendingMeds.length > 0 && (
        <View style={styles.upcomingDoseCard}>
          <View style={styles.upcomingDoseHeader}>
            <Text style={styles.upcomingDoseTitle}>Upcoming Dose</Text>
            <View style={styles.timePill}>
              <Text style={styles.timePillText}>{nextPendingMeds[0].time}</Text>
            </View>
          </View>
          
          {nextPendingMeds.slice(0, 2).map((med) => (
            <View key={med.id} style={styles.medicationItem}>
              <View style={styles.medicationIcon}>
                <Text style={styles.medicationIconText}>💊</Text>
              </View>
              <View style={styles.medicationDetails}>
                <Text style={styles.medicationName}>{med.name}</Text>
                <Text style={styles.medicationDosage}>{med.dosage}</Text>
              </View>
              <View style={styles.medicationStatus}>
                <Text style={styles.medicationStatusText}>Take in {med.countdown}</Text>
              </View>
            </View>
          ))}
        </View>
      )}
<UpcomingMedicinesComponent />
      <Text style={styles.sectionTitle}>Today's Schedule</Text>

      <ScrollView 
        style={styles.scheduleContainer}
        onScroll={(event) => {
          scrollY.value = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
      >
        {timeSlots.map((slot, index) => (
          <View key={index} style={styles.timeSlot}>
            <View style={styles.timeIndicator}>
              <Text style={styles.timeText}>{slot.time}</Text>
              <View style={styles.timeLine}>
                <View style={styles.timeCircle} />
              </View>
            </View>
            
            <View style={[
              styles.timeCard,
              slot.status === 'completed' && styles.completedTimeCard
            ]}>
              <Text style={styles.timeCardTitle}>{slot.schedule} Medications</Text>
              
              <View style={styles.pillsContainer}>
                {slot.meds.map((med) => (
                  <View key={med.id} style={styles.pill}>
                    <View style={[styles.pillDot, 
                      med.name.includes('Vitamin') ? styles.greenDot : 
                      med.name === 'Aspirin' ? styles.redDot : styles.blueDot
                    ]} />
                    <Text style={styles.pillText}>{med.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
        
        {/* Add padding at bottom for FAB and nav */}
        <View style={styles.bottomPadding} />
      </ScrollView>

      <TouchableOpacity style={styles.fab}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>

      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'home' && styles.activeNavItem]}
          onPress={() => setActiveTab('home')}
        >
          <Home size={24} color={activeTab === 'home' ? "#4a6bff" : "#abb0c5"} />
          <Text style={[styles.navText, activeTab === 'home' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'meds' && styles.activeNavItem]}
          onPress={() => setActiveTab('meds')}
        >
          <Menu size={24} color={activeTab === 'meds' ? "#4a6bff" : "#abb0c5"} />
          <Text style={[styles.navText, activeTab === 'meds' && styles.activeNavText]}>Meds</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'calendar' && styles.activeNavItem]}
          onPress={() => setActiveTab('calendar')}
        >
          <Calendar size={24} color={activeTab === 'calendar' ? "#4a6bff" : "#abb0c5"} />
          <Text style={[styles.navText, activeTab === 'calendar' && styles.activeNavText]}>Calendar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'reports' && styles.activeNavItem]}
          onPress={() => setActiveTab('reports')}
        >
          <PieChart size={24} color={activeTab === 'reports' ? "#4a6bff" : "#abb0c5"} />
          <Text style={[styles.navText, activeTab === 'reports' && styles.activeNavText]}>Reports</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  header: {
    backgroundColor: '#4a6bff',
    padding: 20,
    paddingTop: 10,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  profileIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4a6bff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '600',
    color: 'white',
    marginBottom: 4,
  },
  date: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  upcomingDoseCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    margin: 20,
    marginTop: -20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  upcomingDoseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  upcomingDoseTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  timePill: {
    backgroundColor: '#f0f3ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  timePillText: {
    color: '#4a6bff',
    fontSize: 14,
    fontWeight: '500',
  },
  medicationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  medicationIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  medicationIconText: {
    fontSize: 20,
  },
  medicationDetails: {
    flex: 1,
  },
  medicationName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  medicationDosage: {
    fontSize: 14,
    color: '#666',
  },
  medicationStatus: {
    backgroundColor: '#f0f3ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  medicationStatusText: {
    color: '#4a6bff',
    fontSize: 13,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 16,
  },
  scheduleContainer: {
    paddingHorizontal: 20,
  },
  timeSlot: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timeIndicator: {
    width: 60,
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  timeLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#e0e7ff',
    alignItems: 'center',
    position: 'relative',
  },
  timeCircle: {
    position: 'absolute',
    top: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4a6bff',
    marginLeft: -4,
  },
  timeCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginLeft: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#f0f3ff',
  },
  completedTimeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#4caf50',
  },
  missedTimeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#f44336',
  },
  timeCardTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  pill: {
    backgroundColor: '#f0f3ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pillDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  blueDot: {
    backgroundColor: '#4a6bff',
  },
  redDot: {
    backgroundColor: '#ff4a6b',
  },
  greenDot: {
    backgroundColor: '#4aff6b',
  },
  pillText: {
    fontSize: 13,
    color: '#4a6bff',
  },
  fab: {
    position: 'absolute',
    bottom: 80,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#4a6bff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4a6bff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  fabText: {
    fontSize: 24,
    color: 'white',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    flexDirection: 'row',
    width: '100%',
    height: 70,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#f0f3ff',
    paddingBottom: 10,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 10,
  },
  activeNavItem: {
    color: '#4a6bff',
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
    color: '#abb0c5',
  },
  activeNavText: {
    color: '#4a6bff',
  },
  bottomPadding: {
    height: 100,
  },
});