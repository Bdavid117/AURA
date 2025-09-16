import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import apiService from '../services/apiService';

const MOOD_OPTIONS = [
  { value: 'very_happy', label: 'Muy feliz', emoji: '😄', color: '#28A745' },
  { value: 'happy', label: 'Feliz', emoji: '😊', color: '#17A2B8' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: '#6C757D' },
  { value: 'sad', label: 'Triste', emoji: '😢', color: '#FFC107' },
  { value: 'very_sad', label: 'Muy triste', emoji: '😭', color: '#DC3545' },
];

export default function DiaryScreen() {
  const [entries, setEntries] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [currentEntry, setCurrentEntry] = useState({
    title: '',
    content: '',
    mood: 'neutral',
    date: new Date().toISOString().split('T')[0]
  });
  const [loading, setLoading] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedEntries, setSelectedEntries] = useState([]);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = async () => {
    try {
      console.log('📖 Loading diary entries...');
      const response = await apiService.getDiaryEntries();
      console.log('📥 Diary entries response:', response);
      if (response && response.success) {
        setEntries(response.data.entries || []);
      } else {
        setEntries([]);
      }
    } catch (error) {
      console.error('❌ Error loading diary entries:', error);
      setEntries([]);
    }
  };

  const deleteEntry = async (entryId) => {
    try {
      console.log('🗑️ Deleting diary entry:', entryId);
      const response = await apiService.deleteDiaryEntry(entryId);
      if (response && response.success) {
        setEntries(prev => prev.filter(entry => entry.id !== entryId));
        await loadEntries();
      }
    } catch (error) {
      console.error('❌ Error deleting diary entry:', error);
      Alert.alert('Error', 'No se pudo eliminar la entrada del diario');
    }
  };

  const confirmDeleteEntry = (entry) => {
    Alert.alert(
      'Eliminar Entrada',
      `¿Estás seguro de que quieres eliminar "${entry.title || 'esta entrada'}"?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Sí, eliminar', 
          style: 'destructive',
          onPress: () => deleteEntry(entry.id)
        }
      ]
    );
  };

  const deleteMultipleEntries = async () => {
    try {
      for (const entryId of selectedEntries) {
        await apiService.deleteDiaryEntry(entryId);
      }
      setEntries(prev => prev.filter(entry => !selectedEntries.includes(entry.id)));
      setSelectedEntries([]);
      setIsSelectionMode(false);
      Alert.alert('Éxito', `${selectedEntries.length} entradas eliminadas`);
      await loadEntries();
    } catch (error) {
      console.error('❌ Error deleting multiple entries:', error);
      Alert.alert('Error', 'No se pudieron eliminar todas las entradas');
    }
  };

  const confirmDeleteMultiple = () => {
    Alert.alert(
      'Eliminar Entradas',
      `¿Estás seguro de que quieres eliminar ${selectedEntries.length} entradas?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Sí, eliminar todas', 
          style: 'destructive',
          onPress: deleteMultipleEntries
        }
      ]
    );
  };

  const toggleEntrySelection = (entryId) => {
    setSelectedEntries(prev => {
      if (prev.includes(entryId)) {
        return prev.filter(id => id !== entryId);
      } else {
        return [...prev, entryId];
      }
    });
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedEntries([]);
  };

  const startVoiceRecording = async () => {
    try {
      console.log('🎤 Starting voice recording...');
      setIsRecording(true);
      
      // Request microphone permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Error', 'Se necesitan permisos de micrófono para grabar');
        setIsRecording(false);
        return;
      }

      // Configure audio recording
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_ANDROID_OUTPUT_FORMAT_MPEG_4,
          audioEncoder: Audio.RECORDING_OPTION_ANDROID_AUDIO_ENCODER_AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          outputFormat: Audio.RECORDING_OPTION_IOS_OUTPUT_FORMAT_MPEG4AAC,
          audioQuality: Audio.RECORDING_OPTION_IOS_AUDIO_QUALITY_HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
      };

      const recording = new Audio.Recording();
      await recording.prepareToRecordAsync(recordingOptions);
      await recording.startAsync();
      console.log('🎤 Recording started successfully');

      // Show recording UI feedback
      Alert.alert(
        'Grabando...',
        'Habla ahora. Tu voz será transcrita automáticamente.',
        [
          {
            text: 'Detener',
            onPress: async () => {
              try {
                console.log('🛑 Stopping recording...');
                await recording.stopAndUnloadAsync();
                const uri = recording.getURI();
                console.log('📁 Recording URI:', uri);
                
                if (uri) {
                  // Transcribe the audio using AI
                  await transcribeAudio(uri);
                } else {
                  console.error('❌ No recording URI available');
                  Alert.alert('Error', 'No se pudo obtener la grabación');
                }
                setIsRecording(false);
              } catch (error) {
                console.error('❌ Error stopping recording:', error);
                Alert.alert('Error', 'Error al detener la grabación');
                setIsRecording(false);
              }
            }
          }
        ],
        { cancelable: false }
      );
    } catch (error) {
      console.error('❌ Voice recording error:', error);
      Alert.alert('Error', 'No se pudo iniciar la grabación: ' + error.message);
      setIsRecording(false);
    }
  };

  const transcribeAudio = async (audioUri) => {
    try {
      console.log('🎤 Transcribing audio:', audioUri);
      
      // Create FormData for audio file upload
      const formData = new FormData();
      formData.append('audio', {
        uri: audioUri,
        type: 'audio/m4a',
        name: 'diary_recording.m4a',
      });

      // Send to backend for transcription
      const response = await apiService.transcribeAudio(formData);
      
      if (response && response.success && response.data.transcription) {
        const transcribedText = response.data.transcription;
        
        // Add transcribed text to current entry content
        setCurrentEntry(prev => ({
          ...prev,
          content: prev.content ? `${prev.content}\n\n${transcribedText}` : transcribedText
        }));
        
        Alert.alert(
          'Transcripción Completada',
          'Tu voz ha sido transcrita y añadida a la entrada del diario.',
          [{ text: 'OK' }]
        );
      } else {
        throw new Error('No transcription received');
      }
    } catch (error) {
      console.error('❌ Error transcribing audio:', error);
      Alert.alert(
        'Error de Transcripción',
        'No se pudo transcribir el audio. Por favor, intenta escribir manualmente.',
        [{ text: 'OK' }]
      );
    }
  };

  const openNewEntry = () => {
    setEditingEntry(null);
    setCurrentEntry({
      title: '',
      content: '',
      mood: 'neutral',
      date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const openEditEntry = (entry) => {
    setEditingEntry(entry);
    setCurrentEntry({
      title: entry.title || '',
      content: entry.content,
      mood: entry.mood || 'neutral',
      date: entry.entry_date
    });
    setShowModal(true);
  };

  const saveEntry = async () => {
    if (!currentEntry.content.trim()) {
      Alert.alert('Error', 'Por favor, escribe algo en tu diario');
      return;
    }

    setLoading(true);
    try {
      const entryData = {
        title: currentEntry.title.trim() || null,
        content: currentEntry.content.trim(),
        mood: currentEntry.mood || null,
        entry_date: currentEntry.date
      };

      let response;
      if (editingEntry) {
        response = await apiService.updateDiaryEntry(editingEntry.id, entryData);
      } else {
        response = await apiService.createDiaryEntry(entryData);
      }

      if (response.success) {
        // Close modal first
        setShowModal(false);
        
        // Reset form
        setCurrentEntry({
          title: '',
          content: '',
          mood: 'neutral',
          date: new Date().toISOString().split('T')[0]
        });
        setEditingEntry(null);
        
        // Reload entries to show the new/updated entry
        await loadEntries();
        
        // Show success message
        Alert.alert(
          'Éxito', 
          editingEntry ? 'Entrada actualizada correctamente' : 'Entrada guardada correctamente',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Error', response.message || 'No se pudo guardar la entrada');
      }
    } catch (error) {
      console.error('Error saving diary entry:', error);
      Alert.alert('Error', 'No se pudo guardar la entrada');
    } finally {
      setLoading(false);
    }
  };

  const getMoodDisplay = (mood) => {
    const moodOption = MOOD_OPTIONS.find(option => option.value === mood);
    return moodOption ? `${moodOption.emoji} ${moodOption.label}` : '';
  };

  const renderEntry = ({ item }) => (
    <View style={styles.entryItemContainer}>
      {isSelectionMode && (
        <TouchableOpacity
          style={styles.selectionCheckbox}
          onPress={() => toggleEntrySelection(item.id)}
        >
          <Ionicons 
            name={selectedEntries.includes(item.id) ? "checkbox" : "square-outline"} 
            size={24} 
            color={selectedEntries.includes(item.id) ? "#4A90E2" : "#6C757D"} 
          />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.entryItem, isSelectionMode && styles.entryItemSelection]}
        onPress={() => {
          if (isSelectionMode) {
            toggleEntrySelection(item.id);
          } else {
            openEditEntry(item);
          }
        }}
      >
        <View style={styles.entryHeader}>
          <Text style={styles.entryTitle}>{item.title || 'Entrada sin título'}</Text>
          <View style={styles.moodContainer}>
            <Text style={styles.moodEmoji}>
              {MOOD_OPTIONS.find(mood => mood.value === item.mood)?.emoji || '😐'}
            </Text>
          </View>
        </View>
        <Text style={styles.entryContent} numberOfLines={2}>
          {item.content}
        </Text>
        <Text style={styles.entryDate}>
          {new Date(item.entry_date || item.date).toLocaleDateString('es-ES')}
        </Text>
        
        {item.ai_suggestions && (
          <View style={styles.aiSuggestions}>
            <Text style={styles.aiSuggestionsTitle}>💡 Sugerencias de IA:</Text>
            <Text style={styles.aiSuggestionsText} numberOfLines={2}>
              {item.ai_suggestions}
            </Text>
          </View>
        )}
      </TouchableOpacity>
      {!isSelectionMode && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmDeleteEntry(item)}
        >
          <Ionicons name="trash-outline" size={20} color="#DC3545" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderMoodSelector = () => (
    <View style={styles.moodSelector}>
      <Text style={styles.moodSelectorTitle}>¿Cómo te sientes hoy?</Text>
      <View style={styles.moodOptions}>
        {MOOD_OPTIONS.map((mood) => (
          <TouchableOpacity
            key={mood.value}
            style={[
              styles.moodOption,
              currentEntry.mood === mood.value && { backgroundColor: mood.color }
            ]}
            onPress={() => setCurrentEntry(prev => ({ ...prev, mood: mood.value }))}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={[
              styles.moodLabel,
              currentEntry.mood === mood.value && { color: 'white' }
            ]}>
              {mood.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Diario Personal</Text>
        <View style={styles.headerControls}>
          <TouchableOpacity
            style={styles.addButton}
            onPress={openNewEntry}
          >
            <Ionicons name="add" size={24} color="white" />
            <Text style={styles.addButtonText}>Nueva Entrada</Text>
          </TouchableOpacity>
          
          <View style={styles.selectionControls}>
            <TouchableOpacity
              style={styles.selectionModeButton}
              onPress={toggleSelectionMode}
            >
              <Ionicons 
                name={isSelectionMode ? "close" : "checkmark-circle-outline"} 
                size={24} 
                color={isSelectionMode ? "#DC3545" : "#4A90E2"} 
              />
              <Text style={styles.selectionModeText}>
                {isSelectionMode ? 'Cancelar' : 'Seleccionar'}
              </Text>
            </TouchableOpacity>
            
            {isSelectionMode && selectedEntries.length > 0 && (
              <TouchableOpacity
                style={styles.deleteMultipleButton}
                onPress={confirmDeleteMultiple}
              >
                <Ionicons name="trash" size={20} color="white" />
                <Text style={styles.deleteMultipleText}>
                  Eliminar ({selectedEntries.length})
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      <FlatList
        data={entries}
        renderItem={renderEntry}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={entries.length === 0 ? styles.emptyEntriesList : styles.entriesList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyState}>
            <Ionicons name="book-outline" size={80} color="#CCC" />
            <Text style={styles.emptyStateTitle}>Tu diario está vacío</Text>
            <Text style={styles.emptyStateText}>
              Comienza escribiendo tu primera entrada para registrar tus pensamientos y emociones
            </Text>
          </View>
        )}
      />

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelButton}>Cancelar</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingEntry ? 'Editar entrada' : 'Nueva entrada'}
            </Text>
            <TouchableOpacity
              onPress={saveEntry}
              disabled={loading || !currentEntry.content.trim()}
            >
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.voiceButton}
                  onPress={startVoiceRecording}
                  disabled={isRecording}
                >
                  <Ionicons 
                    name={isRecording ? "stop" : "mic"} 
                    size={20} 
                    color={isRecording ? "#DC3545" : "#4A90E2"} 
                  />
                  <Text style={styles.voiceButtonText}>
                    {isRecording ? 'Detener' : 'Grabar'}
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={saveEntry}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? 'Guardando...' : editingEntry ? 'Actualizar' : 'Guardar'}
                  </Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <Text style={styles.label}>Título (opcional)</Text>
            <TextInput
              style={styles.titleInput}
              value={currentEntry.title}
              onChangeText={(text) => setCurrentEntry(prev => ({ ...prev, title: text }))}
              placeholder="Dale un título a tu entrada"
              placeholderTextColor="#999"
            />

            {renderMoodSelector()}

            <Text style={styles.label}>¿Qué quieres escribir hoy?</Text>
            <TextInput
              style={styles.contentInput}
              value={currentEntry.content}
              onChangeText={(text) => setCurrentEntry(prev => ({ ...prev, content: text }))}
              placeholder="Escribe sobre tu día, tus pensamientos, sentimientos..."
              placeholderTextColor="#999"
              multiline
              textAlignVertical="top"
            />
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  headerControls: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  addButton: {
    backgroundColor: '#4A90E2',
    flexDirection: 'row',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
  },
  selectionControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  selectionModeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    backgroundColor: '#F8F9FA',
    marginRight: 10,
  },
  selectionModeText: {
    marginLeft: 5,
    fontSize: 12,
    color: '#4A90E2',
  },
  deleteMultipleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC3545',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
  },
  deleteMultipleText: {
    color: 'white',
    marginLeft: 5,
    fontSize: 12,
    fontWeight: '600',
  },
  entryItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  selectionCheckbox: {
    marginRight: 10,
    padding: 5,
  },
  entryItem: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  entryItemSelection: {
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  deleteButton: {
    marginLeft: 10,
    padding: 8,
    backgroundColor: '#FFF5F5',
    borderRadius: 8,
  },
  moodContainer: {
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 20,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 24,
  },
  startButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    marginTop: 30,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  entriesList: {
    padding: 20,
  },
  emptyEntriesList: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  entryCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  entryInfo: {
    flex: 1,
  },
  entryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  entryDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  entryMood: {
    fontSize: 14,
    color: '#4A90E2',
    fontWeight: '600',
  },
  entryActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
  entryContent: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    marginBottom: 10,
  },
  aiSuggestions: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#4A90E2',
  },
  aiSuggestionsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4A90E2',
    marginBottom: 5,
  },
  aiSuggestionsText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  cancelButton: {
    fontSize: 16,
    color: '#DC3545',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 10,
  },
  voiceButtonText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#4A90E2',
  },
  saveButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 15,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    color: '#CCC',
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 15,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  moodSelector: {
    marginVertical: 20,
  },
  moodSelectorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  moodOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  moodOption: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    width: '18%',
    marginBottom: 10,
  },
  moodEmoji: {
    fontSize: 24,
    marginBottom: 5,
  },
  moodLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  contentInput: {
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
    minHeight: 200,
  },
});
