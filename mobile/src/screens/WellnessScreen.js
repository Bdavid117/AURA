import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { apiService } from '../services/apiService';

const CATEGORY_ICONS = {
  physical: 'fitness',
  mental: 'brain',
  social: 'people',
  spiritual: 'leaf',
};

const DIFFICULTY_COLORS = {
  easy: '#28A745',
  moderate: '#FFC107',
  challenging: '#DC3545',
};

export default function WellnessScreen() {
  const [routines, setRoutines] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedRoutine, setSelectedRoutine] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [completionHistory, setCompletionHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadRoutines();
    loadRecommendations();
    loadCompletionHistory();
  }, []);

  const loadRoutines = async () => {
    try {
      const response = await apiService.getWellnessRoutines();
      if (response.success) {
        setRoutines(response.data.routines);
      }
    } catch (error) {
      console.error('Error loading routines:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await apiService.getWellnessRecommendations();
      if (response.success) {
        setRecommendations(response.data.recommendations);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const loadCompletionHistory = async () => {
    try {
      const response = await apiService.getCompletionHistory();
      if (response.success) {
        setCompletionHistory(response.data.completions);
      }
    } catch (error) {
      console.error('Error loading completion history:', error);
    }
  };

  const openRoutineDetails = (routine) => {
    setSelectedRoutine(routine);
    setShowModal(true);
  };

  const completeRoutine = async (routine, rating = null) => {
    try {
      setLoading(true);
      const completionData = {
        enjoyment_rating: rating,
        completed_date: new Date().toISOString().split('T')[0],
      };

      const response = await apiService.completeRoutine(routine.id, completionData);
      if (response.success) {
        Alert.alert('¡Felicitaciones!', 'Has completado la rutina exitosamente');
        setShowModal(false);
        await loadCompletionHistory();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo registrar la finalización de la rutina');
    } finally {
      setLoading(false);
    }
  };

  const renderRoutineCard = ({ item }) => (
    <TouchableOpacity
      style={styles.routineCard}
      onPress={() => openRoutineDetails(item)}
    >
      <View style={styles.routineHeader}>
        <View style={styles.routineInfo}>
          <View style={styles.routineTitleRow}>
            <Ionicons 
              name={CATEGORY_ICONS[item.category]} 
              size={24} 
              color="#4A90E2" 
            />
            <Text style={styles.routineTitle}>{item.name}</Text>
          </View>
          <Text style={styles.routineDescription} numberOfLines={2}>
            {item.description}
          </Text>
        </View>
        <View style={styles.routineMeta}>
          <View style={[
            styles.difficultyBadge,
            { backgroundColor: DIFFICULTY_COLORS[item.difficulty] }
          ]}>
            <Text style={styles.difficultyText}>
              {item.difficulty === 'easy' ? 'Fácil' : 
               item.difficulty === 'moderate' ? 'Moderado' : 'Desafiante'}
            </Text>
          </View>
          <Text style={styles.duration}>{item.duration_minutes} min</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderRecommendationCard = ({ item }) => (
    <TouchableOpacity
      style={styles.recommendationCard}
      onPress={() => openRoutineDetails(item)}
    >
      <View style={styles.recommendationHeader}>
        <Ionicons 
          name={CATEGORY_ICONS[item.category]} 
          size={20} 
          color="#28A745" 
        />
        <Text style={styles.recommendationTitle}>{item.name}</Text>
      </View>
      <Text style={styles.recommendationDescription} numberOfLines={2}>
        {item.description}
      </Text>
      <View style={styles.recommendationMeta}>
        <Text style={styles.recommendationDuration}>{item.duration_minutes} min</Text>
        <View style={[
          styles.recommendationDifficulty,
          { backgroundColor: DIFFICULTY_COLORS[item.difficulty] }
        ]}>
          <Text style={styles.recommendationDifficultyText}>
            {item.difficulty === 'easy' ? 'Fácil' : 
             item.difficulty === 'moderate' ? 'Moderado' : 'Desafiante'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCompletionItem = ({ item }) => (
    <View style={styles.completionItem}>
      <View style={styles.completionInfo}>
        <Text style={styles.completionRoutine}>
          {item.wellness_routine?.name || 'Rutina'}
        </Text>
        <Text style={styles.completionDate}>
          {new Date(item.completed_date).toLocaleDateString('es-ES')}
        </Text>
      </View>
      {item.enjoyment_rating && (
        <View style={styles.ratingContainer}>
          {[...Array(5)].map((_, index) => (
            <Ionicons
              key={index}
              name={index < item.enjoyment_rating ? 'star' : 'star-outline'}
              size={16}
              color="#FFC107"
            />
          ))}
        </View>
      )}
    </View>
  );

  const renderRoutineInstructions = () => {
    if (!selectedRoutine?.instructions) return null;

    return (
      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>Instrucciones:</Text>
        {selectedRoutine.instructions.map((instruction, index) => (
          <View key={index} style={styles.instructionItem}>
            <Text style={styles.instructionNumber}>{index + 1}.</Text>
            <Text style={styles.instructionText}>{instruction}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderCompletionModal = () => (
    <Modal
      visible={showModal}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowModal(false)}>
            <Text style={styles.closeButton}>Cerrar</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>{selectedRoutine?.name}</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.routineDetailHeader}>
            <View style={styles.routineDetailInfo}>
              <Ionicons 
                name={CATEGORY_ICONS[selectedRoutine?.category]} 
                size={30} 
                color="#4A90E2" 
              />
              <View style={styles.routineDetailText}>
                <Text style={styles.routineDetailTitle}>{selectedRoutine?.name}</Text>
                <Text style={styles.routineDetailMeta}>
                  {selectedRoutine?.duration_minutes} minutos • {
                    selectedRoutine?.difficulty === 'easy' ? 'Fácil' : 
                    selectedRoutine?.difficulty === 'moderate' ? 'Moderado' : 'Desafiante'
                  }
                </Text>
              </View>
            </View>
          </View>

          <Text style={styles.routineDescription}>
            {selectedRoutine?.description}
          </Text>

          {renderRoutineInstructions()}

          {selectedRoutine?.benefits && selectedRoutine.benefits.length > 0 && (
            <View style={styles.benefitsContainer}>
              <Text style={styles.benefitsTitle}>Beneficios:</Text>
              {selectedRoutine.benefits.map((benefit, index) => (
                <View key={index} style={styles.benefitItem}>
                  <Ionicons name="checkmark-circle" size={16} color="#28A745" />
                  <Text style={styles.benefitText}>{benefit}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.completionSection}>
            <Text style={styles.completionTitle}>¿Completaste esta rutina?</Text>
            <Text style={styles.completionSubtitle}>Califica tu experiencia:</Text>
            
            <View style={styles.ratingButtons}>
              {[1, 2, 3, 4, 5].map((rating) => (
                <TouchableOpacity
                  key={rating}
                  style={styles.ratingButton}
                  onPress={() => completeRoutine(selectedRoutine, rating)}
                  disabled={loading}
                >
                  <Ionicons name="star" size={24} color="#FFC107" />
                  <Text style={styles.ratingButtonText}>{rating}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={styles.completeButton}
              onPress={() => completeRoutine(selectedRoutine)}
              disabled={loading}
            >
              <Text style={styles.completeButtonText}>
                {loading ? 'Registrando...' : 'Marcar como completada'}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <ScrollView>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bienestar</Text>
          <Text style={styles.headerSubtitle}>Rutinas personalizadas para ti</Text>
        </View>

        {recommendations.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>✨ Recomendaciones para ti</Text>
              <TouchableOpacity onPress={() => setShowRecommendations(!showRecommendations)}>
                <Ionicons 
                  name={showRecommendations ? 'chevron-up' : 'chevron-down'} 
                  size={24} 
                  color="#4A90E2" 
                />
              </TouchableOpacity>
            </View>
            
            {showRecommendations && (
              <FlatList
                data={recommendations}
                renderItem={renderRecommendationCard}
                keyExtractor={(item, index) => `rec-${index}`}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.recommendationsList}
              />
            )}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Mis Rutinas</Text>
          {routines.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="fitness-outline" size={60} color="#CCC" />
              <Text style={styles.emptyStateText}>
                No tienes rutinas aún. Explora nuestras recomendaciones arriba.
              </Text>
            </View>
          ) : (
            <FlatList
              data={routines}
              renderItem={renderRoutineCard}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          )}
        </View>

        {completionHistory.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Historial Reciente</Text>
            <FlatList
              data={completionHistory.slice(0, 5)}
              renderItem={renderCompletionItem}
              keyExtractor={(item) => item.id.toString()}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>

      {renderCompletionModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 20,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: 'white',
    marginTop: 10,
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  recommendationsList: {
    paddingRight: 20,
  },
  recommendationCard: {
    backgroundColor: '#F0F8FF',
    padding: 15,
    borderRadius: 12,
    marginRight: 15,
    width: 200,
    borderLeftWidth: 4,
    borderLeftColor: '#28A745',
  },
  recommendationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recommendationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  recommendationDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 10,
  },
  recommendationMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recommendationDuration: {
    fontSize: 12,
    color: '#666',
  },
  recommendationDifficulty: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  recommendationDifficultyText: {
    fontSize: 10,
    color: 'white',
    fontWeight: '600',
  },
  routineCard: {
    backgroundColor: '#F8F9FA',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E1E5E9',
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  routineInfo: {
    flex: 1,
  },
  routineTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routineTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  routineDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  routineMeta: {
    alignItems: 'flex-end',
  },
  difficultyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 5,
  },
  difficultyText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
  },
  duration: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  completionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  completionInfo: {
    flex: 1,
  },
  completionRoutine: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  completionDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: 'row',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 15,
    lineHeight: 24,
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
  closeButton: {
    fontSize: 16,
    color: '#DC3545',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 50,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  routineDetailHeader: {
    marginBottom: 20,
  },
  routineDetailInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routineDetailText: {
    marginLeft: 15,
    flex: 1,
  },
  routineDetailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  routineDetailMeta: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  instructionsContainer: {
    marginVertical: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  instructionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    width: 25,
  },
  instructionText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 24,
    flex: 1,
  },
  benefitsContainer: {
    marginVertical: 20,
  },
  benefitsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  benefitText: {
    fontSize: 16,
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  completionSection: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#F0F8FF',
    borderRadius: 15,
  },
  completionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  completionSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  ratingButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  ratingButton: {
    alignItems: 'center',
    padding: 10,
  },
  ratingButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
  },
  completeButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  completeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
