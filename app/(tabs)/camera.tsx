import { useState, useEffect, useRef } from 'react';
import { Text, View, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Camera, CameraType, PermissionResponse } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Check, X } from 'lucide-react-native';

// Add type for medicine
type Medicine = {
  id: number;
  name: string;
  dosage: string;
  schedule: string;
  status: string;
};

export default function CameraScreen() {
  const [permission, setPermission] = useState<PermissionResponse | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const router = useRouter();

  const requestPermission = async () => {
    const response = await Camera.requestCameraPermissionsAsync();
    setPermission(response);
  };

  useEffect(() => {
    requestPermission();
  }, []);

  const handleCapture = async () => {
    if (cameraRef.current) {
      try {
        const newMedicine: Medicine = {
          id: Date.now(),
          name: 'New Prescription',
          dosage: '50mg',
          schedule: 'Morning',
          status: 'pending',
        };

        if (!global.medicineList) {
          global.medicineList = [];
        }
        global.medicineList.push(newMedicine);
        
        router.back();
      } catch (error) {
        console.error('Failed to capture:', error);
      }
    }
  };

  if (!permission) {
    return <View style={styles.container}><Text>Requesting permission...</Text></View>;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>We need your permission to show the camera</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Camera is not supported on web.</Text>
        <TouchableOpacity 
          style={styles.button} 
          onPress={() => {
            const newMedicine: Medicine = {
              id: Date.now(),
              name: 'Web Test Medicine',
              dosage: '100mg',
              schedule: 'Evening',
              status: 'pending',
            };
            if (!global.medicineList) {
              global.medicineList = [];
            }
            global.medicineList.push(newMedicine);
            router.back();
          }}>
          <Text style={styles.buttonText}>Add Test Medicine</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Camera
        ref={cameraRef}
        style={styles.camera}
        type={CameraType.back}
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.captureButton} onPress={handleCapture}>
            <Check size={32} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.captureButton, styles.cancelButton]} 
            onPress={() => router.back()}
          >
            <X size={32} color="#fff" />
          </TouchableOpacity>
        </View>
      </Camera>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    flex: 1,
    width: '100%',
  },
  text: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
    fontFamily: 'Inter-Regular',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    gap: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
  },
  captureButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
  },
});