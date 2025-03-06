import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, SafeAreaView, Image } from 'react-native';
import { Calendar, Home, PieChart, List, Plus } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, withSpring, withSequence } from 'react-native-reanimated';
import { useSharedValue } from 'react-native-reanimated';

const router = useRouter();

declare global {
  var medicineList: {
    id: string;
    name: string;
    dosage: string;
    schedule: string;
    status: 'pending' | 'taken' | 'completed' | 'missed';
    time: string;
    image: string;
    countdown?: string;
  }[];
}

interface Medicine {
  id: string;
  name: string;
  dosage: string;
  time: string;
  status: 'pending' | 'taken' | 'completed' | 'missed';
  schedule?: string;
  countdown?: string;
}

if (typeof global.medicineList === 'undefined') {
  global.medicineList = [
    { id: '1', name: 'Lisinopril', dosage: '10mg • 1 pill', schedule: 'Morning', status: 'pending', time: '9:00 AM', image: '', countdown: '15 min' },
    { id: '2', name: 'Vitamin D3', dosage: '1000IU • 1 capsule', schedule: 'Morning', status: 'pending', time: '9:00 AM', image: '', countdown: '15 min' },
    { id: '3', name: 'Metformin', dosage: '500mg • 1 tablet', schedule: 'Morning', status: 'completed', time: '8:00 AM', image: '', countdown: '' },
    { id: '4', name: 'Aspirin', dosage: '81mg • 1 tablet', schedule: 'Morning', status: 'completed', time: '8:00 AM', image: '', countdown: '' },
    { id: '5', name: 'Metformin', dosage: '500mg • 1 tablet', schedule: 'Afternoon', status: 'pending', time: '1:00 PM', image: '', countdown: '' },
    { id: '6', name: 'Metformin', dosage: '500mg • 1 tablet', schedule: 'Evening', status: 'pending', time: '8:00 PM', image: '', countdown: '' },
    { id: '7', name: 'Amlodipine', dosage: '5mg • 1 tablet', schedule: 'Evening', status: 'pending', time: '8:00 PM', image: '', countdown: '' },
    { id: '8', name: 'Vitamin C', dosage: '500mg • 1 tablet', schedule: 'Evening', status: 'pending', time: '8:00 PM', image: '', countdown: '' },
  ];
}

const UpcomingMedicinesComponent = ({ medicines }: { medicines: Medicine[] }) => {
  // Filter medicines for upcoming doses (9:00 AM)
  const upcomingMeds = medicines.filter(med => med.time === '9:00 AM' && med.status === 'pending');
  
  return (
    <View style={styles.nextDoseContainer}>
      <View style={styles.nextDoseTitle}>
        <Text style={styles.nextDoseHeading}>Upcoming Dose</Text>
        <View style={styles.timePill}>
          <Text style={styles.timePillText}>9:00 AM</Text>
        </View>
      </View>
      
      {upcomingMeds.map(med => (
        <View key={med.id} style={styles.medicationCard}>
          <View style={styles.medIcon}>
            <Text style={styles.medIconText}>💊</Text>
          </View>
          <View style={styles.medDetails}>
            <Text style={styles.medName}>{med.name}</Text>
            <Text style={styles.medDosage}>{med.dosage}</Text>
          </View>
          <View style={styles.medStatus}>
            <Text style={styles.medStatusText}>Take in {med.countdown}</Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const TimeSlot = ({ time, medicines }: { time: string; medicines: Medicine[] }) => {
  const filteredMeds = medicines.filter(med => med.time === time);
  const status = time === '8:00 AM' ? 'completed' : 'pending';
  
  return (
    <View style={styles.timeSlot}>
      <View style={styles.timeIndicator}>
        <Text style={styles.timeText}>{time}</Text>
        <View style={styles.timeLine}>
          <View style={styles.timeCircle} />
        </View>
      </View>
      <View style={[
        styles.timeCard, 
        status === 'completed' && styles.completedTimeCard,
      ]}>
        <Text style={styles.timeCardTitle}>
          {time === '8:00 AM' ? 'Morning Medications' : 
           time === '9:00 AM' ? 'Blood Pressure Meds' : 
           time === '1:00 PM' ? 'Lunch Medications' : 'Evening Medications'}
        </Text>
        <View style={styles.pills}>
          {filteredMeds.map(med => {
            let dotColor;
            if (med.name === 'Metformin' || med.name === 'Lisinopril') dotColor = styles.blueDot;
            else if (med.name === 'Aspirin' || med.name === 'Amlodipine') dotColor = styles.redDot;
            else dotColor = styles.greenDot;
            
            return (
              <View key={med.id} style={styles.pill}>
                <View style={[styles.pillDot, dotColor]} />
                <Text style={styles.pillText}>{med.name}</Text>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const HomeScreen = () => {
  const [medicines, setMedicines] = useState<Medicine[]>(global.medicineList as Medicine[]);
  const [activeTab, setActiveTab] = useState('home');
  const headerScale = useSharedValue(1);
  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric', 
    year: 'numeric' 
  });

  useEffect(() => {
    headerScale.value = withSequence(
      withSpring(1.05),
      withSpring(1)
    );
  }, []);

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: headerScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerTop}>
          <Text style={styles.logo}>MediSure</Text>
          <View style={styles.profile}>
            <Text style={styles.profileText}>JS</Text>
          </View>
        </View>
        <Text style={styles.greeting}>Good morning, John</Text>
        <Text style={styles.date}>{formattedDate}</Text>
      </Animated.View>
      
      <UpcomingMedicinesComponent medicines={medicines} />
      
      <Text style={styles.sectionTitle}>Today's Schedule</Text>
      
      <ScrollView style={styles.scheduleContainer} contentContainerStyle={styles.scheduleContent}>
        <TimeSlot time="8:00 AM" medicines={medicines} />
        <TimeSlot time="9:00 AM" medicines={medicines} />
        <TimeSlot time="1:00 PM" medicines={medicines} />
        <TimeSlot time="8:00 PM" medicines={medicines} />
      </ScrollView>
      
      <TouchableOpacity style={styles.fab}>
        <Plus size={28} color="#ffffff" />
      </TouchableOpacity>
      
      <View style={styles.bottomNav}>
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'home' && styles.activeNavItem]} 
          onPress={() => setActiveTab('home')}
        >
          <Home size={24} color={activeTab === 'home' ? '#4361ee' : '#94a3b8'} />
          <Text style={[styles.navText, activeTab === 'home' && styles.activeNavText]}>Home</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'meds' && styles.activeNavItem]} 
          onPress={() => setActiveTab('meds')}
        >
          <Text style={[styles.navIcon, activeTab === 'meds' && styles.activeNavText]}>💊</Text>
          <Text style={[styles.navText, activeTab === 'meds' && styles.activeNavText]}>Meds</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'calendar' && styles.activeNavItem]} 
          onPress={() => setActiveTab('calendar')}
        >
          <Calendar size={24} color={activeTab === 'calendar' ? '#4361ee' : '#94a3b8'} />
          <Text style={[styles.navText, activeTab === 'calendar' && styles.activeNavText]}>Calendar</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navItem, activeTab === 'reports' && styles.activeNavItem]} 
          onPress={() => setActiveTab('reports')}
        >
          <PieChart size={24} color={activeTab === 'reports' ? '#4361ee' : '#94a3b8'} />
          <Text style={[styles.navText, activeTab === 'reports' && styles.activeNavText]}>Reports</Text>
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
  header: {
    padding: 28,
    backgroundColor: '#4361ee',
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
    fontSize: 22,
    fontWeight: '700',
    color: 'white',
    letterSpacing: -0.5,
  },
  profile: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 22,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
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
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  nextDoseContainer: {
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
    elevation: 5,
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
    backgroundColor: '#4361ee',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 24,
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
  },
  medIconText: {
    fontSize: 22,
    color: '#4361ee',
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
    backgroundColor: '#4361ee',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  medStatusText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  sectionTitle: {
    marginTop: 34,
    marginBottom: 18,
    marginLeft: 24,
    fontSize: 19,
    fontWeight: '600',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  scheduleContainer: {
    paddingHorizontal: 20,
  },
  scheduleContent: {
    paddingBottom: 100,
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
  },
  timeCircle: {
    position: 'absolute',
    top: 0,
    left: -5,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#4361ee',
  },
  timeCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 18,
    marginLeft: 18,
    borderWidth: 1,
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  completedTimeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
    backgroundColor: '#f0fdf4',
  },
  missedTimeCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
    backgroundColor: '#fef2f2',
  },
  timeCardTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#1e293b',
  },
  pills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 14,
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.6)',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#334155',
  },
  pillDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
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
  fab: {
    position: 'absolute',
    bottom: 90,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#4361ee',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4361ee',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 6,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 3,
  },
  navItem: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  activeNavItem: {
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
  activeNavText: {
    color: '#4361ee',
    fontWeight: '500',
  },
});

export default HomeScreen;