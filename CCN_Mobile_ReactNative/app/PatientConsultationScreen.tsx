import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, TextInput, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface ConsultationSlot {
  id: string;
  date: string;
  time: string;
  duration: number;
  type: 'video' | 'audio' | 'chat';
  available: boolean;
}

interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  lastVisit: string;
  avatar: string;
}

export default function PatientConsultationScreen() {
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [consultationType, setConsultationType] = useState<'video' | 'audio' | 'chat'>('video');
  const [selectedSlot, setSelectedSlot] = useState<string>('');
  const [notes, setNotes] = useState('');

  const patients: Patient[] = [
    {
      id: '1',
      name: 'John Smith',
      age: 45,
      condition: 'Hypertension',
      lastVisit: '2024-01-10',
      avatar: '👨‍💼'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      age: 32,
      condition: 'Diabetes Type 2',
      lastVisit: '2024-01-08',
      avatar: '👩‍💼'
    },
    {
      id: '3',
      name: 'Michael Brown',
      age: 67,
      condition: 'Arthritis',
      lastVisit: '2024-01-05',
      avatar: '👨‍🦳'
    }
  ];

  const consultationSlots: ConsultationSlot[] = [
    {
      id: '1',
      date: 'Today',
      time: '2:00 PM',
      duration: 30,
      type: 'video',
      available: true
    },
    {
      id: '2',
      date: 'Today',
      time: '3:30 PM',
      duration: 30,
      type: 'video',
      available: true
    },
    {
      id: '3',
      date: 'Tomorrow',
      time: '10:00 AM',
      duration: 45,
      type: 'video',
      available: true
    },
    {
      id: '4',
      date: 'Tomorrow',
      time: '2:00 PM',
      duration: 30,
      type: 'audio',
      available: false
    }
  ];

  const handlePatientSelect = (patientId: string) => {
    setSelectedPatient(patientId);
  };

  const handleConsultationTypeSelect = (type: 'video' | 'audio' | 'chat') => {
    setConsultationType(type);
  };

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlot(slotId);
  };

  const handleScheduleConsultation = () => {
    if (!selectedPatient) {
      Alert.alert('Error', 'Please select a patient');
      return;
    }
    if (!selectedSlot) {
      Alert.alert('Error', 'Please select a time slot');
      return;
    }

    const patient = patients.find(p => p.id === selectedPatient);
    const slot = consultationSlots.find(s => s.id === selectedSlot);

    Alert.alert(
      'Consultation Scheduled',
      `Video consultation scheduled with ${patient?.name} on ${slot?.date} at ${slot?.time}`,
      [
        {
          text: 'OK',
          onPress: () => router.back()
        }
      ]
    );
  };

  const handleStartConsultation = () => {
    Alert.alert('Start Consultation', 'Starting video consultation with patient...');
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return 'videocam';
      case 'audio': return 'call';
      case 'chat': return 'chatbubbles';
      default: return 'call';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return '#007AFF';
      case 'audio': return '#34C759';
      case 'chat': return '#FF9500';
      default: return '#8E8E93';
    }
  };

  const renderPatient = ({ item }: { item: Patient }) => (
    <TouchableOpacity
      style={[
        styles.patientCard,
        selectedPatient === item.id && styles.selectedPatientCard
      ]}
      onPress={() => handlePatientSelect(item.id)}
    >
      <Text style={styles.patientAvatar}>{item.avatar}</Text>
      <View style={styles.patientInfo}>
        <Text style={styles.patientName}>{item.name}</Text>
        <Text style={styles.patientDetails}>
          {item.age} years • {item.condition}
        </Text>
        <Text style={styles.lastVisit}>Last visit: {item.lastVisit}</Text>
      </View>
      {selectedPatient === item.id && (
        <Ionicons name="checkmark-circle" size={24} color="#007AFF" />
      )}
    </TouchableOpacity>
  );

  const renderSlot = ({ item }: { item: ConsultationSlot }) => (
    <TouchableOpacity
      style={[
        styles.slotCard,
        !item.available && styles.unavailableSlot,
        selectedSlot === item.id && styles.selectedSlot
      ]}
      onPress={() => item.available && handleSlotSelect(item.id)}
      disabled={!item.available}
    >
      <View style={styles.slotHeader}>
        <Text style={styles.slotDate}>{item.date}</Text>
        <View style={[styles.typeBadge, { backgroundColor: getTypeColor(item.type) }]}>
          <Ionicons name={getTypeIcon(item.type)} size={12} color="#FFFFFF" />
          <Text style={styles.typeText}>{item.type.toUpperCase()}</Text>
        </View>
      </View>
      <Text style={styles.slotTime}>{item.time}</Text>
      <Text style={styles.slotDuration}>{item.duration} minutes</Text>
      {!item.available && (
        <Text style={styles.unavailableText}>Unavailable</Text>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Patient Consultation</Text>
          <View style={styles.placeholder} />
        </View>

        {/* Patient Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Patient</Text>
          <FlatList
            data={patients}
            renderItem={renderPatient}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Consultation Type */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation Type</Text>
          <View style={styles.typeOptions}>
            {[
              { type: 'video', label: 'Video Call', description: 'Face-to-face consultation' },
              { type: 'audio', label: 'Audio Call', description: 'Voice-only consultation' },
              { type: 'chat', label: 'Chat', description: 'Text-based consultation' }
            ].map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.typeOption,
                  consultationType === option.type && styles.selectedTypeOption
                ]}
                onPress={() => handleConsultationTypeSelect(option.type as any)}
              >
                <Ionicons 
                  name={getTypeIcon(option.type)} 
                  size={24} 
                  color={consultationType === option.type ? '#007AFF' : '#8E8E93'} 
                />
                <Text style={[
                  styles.typeLabel,
                  consultationType === option.type && styles.selectedTypeLabel
                ]}>
                  {option.label}
                </Text>
                <Text style={styles.typeDescription}>{option.description}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Time Slots */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Time Slots</Text>
          <FlatList
            data={consultationSlots}
            renderItem={renderSlot}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            showsVerticalScrollIndicator={false}
          />
        </View>

        {/* Consultation Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Consultation Notes</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="Add any notes or topics to discuss during the consultation..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.scheduleButton]} 
            onPress={handleScheduleConsultation}
          >
            <Ionicons name="calendar" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Schedule Consultation</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.startButton]} 
            onPress={handleStartConsultation}
          >
            <Ionicons name="play" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Start Now</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="document-text" size={20} color="#007AFF" />
              <Text style={styles.quickActionText}>View Records</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="pills" size={20} color="#007AFF" />
              <Text style={styles.quickActionText}>Medications</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="clipboard" size={20} color="#007AFF" />
              <Text style={styles.quickActionText}>Prescriptions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.quickAction}>
              <Ionicons name="calendar" size={20} color="#007AFF" />
              <Text style={styles.quickActionText}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Info Section */}
        <View style={styles.infoSection}>
          <Ionicons name="information-circle" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            All consultations are HIPAA-compliant and encrypted. Patient data is protected 
            according to medical privacy standards.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  placeholder: {
    width: 40,
  },
  section: {
    backgroundColor: '#FFFFFF',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  patientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  },
  selectedPatientCard: {
    borderColor: '#007AFF',
    borderWidth: 2,
    backgroundColor: '#F0F8FF',
  },
  patientAvatar: {
    fontSize: 32,
    marginRight: 16,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  patientDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 2,
  },
  lastVisit: {
    fontSize: 12,
    color: '#8E8E93',
  },
  typeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  typeOption: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    marginHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  selectedTypeOption: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  typeLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
    marginTop: 8,
    marginBottom: 4,
  },
  selectedTypeLabel: {
    color: '#007AFF',
  },
  typeDescription: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  slotCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  },
  unavailableSlot: {
    opacity: 0.5,
    backgroundColor: '#F2F2F7',
  },
  selectedSlot: {
    borderColor: '#007AFF',
    borderWidth: 2,
    backgroundColor: '#F0F8FF',
  },
  slotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slotDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 4,
  },
  slotTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 4,
  },
  slotDuration: {
    fontSize: 14,
    color: '#8E8E93',
  },
  unavailableText: {
    fontSize: 12,
    color: '#FF3B30',
    fontWeight: '600',
    marginTop: 4,
  },
  notesInput: {
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#1C1C1E',
    backgroundColor: '#F2F2F7',
    minHeight: 100,
  },
  buttonContainer: {
    flexDirection: 'row',
    margin: 16,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
  },
  scheduleButton: {
    backgroundColor: '#007AFF',
  },
  startButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAction: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 12,
  },
  quickActionText: {
    fontSize: 14,
    color: '#007AFF',
    marginLeft: 8,
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  infoText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
});









