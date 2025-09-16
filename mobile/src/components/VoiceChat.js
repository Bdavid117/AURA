import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, Text, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as Speech from 'expo-speech';

const VoiceChat = ({ onVoiceMessage, isListening: parentListening }) => {
  const [recording, setRecording] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
    };
  }, [recording]);

  const requestPermissions = async () => {
    try {
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos', 'Se necesitan permisos de micrófono para usar la función de voz');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error requesting permissions:', error);
      return false;
    }
  };

  const startRecording = async () => {
    try {
      const hasPermission = await requestPermissions();
      if (!hasPermission) return;

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
    } catch (error) {
      console.error('Failed to start recording:', error);
      Alert.alert('Error', 'No se pudo iniciar la grabación');
    }
  };

  const stopRecording = async () => {
    try {
      if (!recording) return;

      setIsRecording(false);
      
      // Get URI before unloading
      const uri = recording.getURI();
      
      // Stop and unload the recording
      await recording.stopAndUnloadAsync();
      setRecording(null);

      // For now, we'll simulate speech-to-text
      // In a real implementation, you'd send the audio to a speech recognition service
      Alert.alert(
        'Función de Voz',
        'La grabación se completó. Por ahora, escribe tu mensaje manualmente. La función de reconocimiento de voz se implementará próximamente.',
        [{ text: 'OK' }]
      );

    } catch (error) {
      console.error('Failed to stop recording:', error);
      setRecording(null); // Reset recording state on error
      Alert.alert('Error', 'No se pudo detener la grabación');
    }
  };

  const speakText = async (text) => {
    try {
      if (isSpeaking) {
        Speech.stop();
        setIsSpeaking(false);
        return;
      }

      setIsSpeaking(true);
      
      await Speech.speak(text, {
        language: 'es-ES',
        pitch: 1.0,
        rate: 0.8, // Slower rate for seniors
        voice: 'es-ES-language', // Spanish voice
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch (error) {
      console.error('Speech error:', error);
      setIsSpeaking(false);
      Alert.alert('Error', 'No se pudo reproducir el audio');
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return {
    VoiceButton: () => (
      <TouchableOpacity
        style={[styles.voiceButton, isRecording && styles.voiceButtonActive]}
        onPress={toggleRecording}
        disabled={parentListening}
      >
        <Ionicons 
          name={isRecording ? "stop" : "mic"} 
          size={24} 
          color={isRecording ? "#DC3545" : "#4A90E2"} 
        />
      </TouchableOpacity>
    ),
    SpeakButton: ({ text, style }) => (
      <TouchableOpacity
        style={[styles.speakButton, style]}
        onPress={() => speakText(text)}
      >
        <Ionicons 
          name={isSpeaking ? "volume-high" : "volume-medium"} 
          size={20} 
          color={isSpeaking ? "#28A745" : "#6C757D"} 
        />
      </TouchableOpacity>
    ),
    isSpeaking,
    isRecording,
    speakText
  };
};

const styles = StyleSheet.create({
  voiceButton: {
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 25,
    marginLeft: 8,
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  voiceButtonActive: {
    backgroundColor: '#FFE6E6',
    borderColor: '#DC3545',
  },
  speakButton: {
    padding: 8,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    marginLeft: 8,
  },
});

export default VoiceChat;
