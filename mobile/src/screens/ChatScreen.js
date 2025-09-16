import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import apiService from '../services/apiService';
import VoiceChat from '../components/VoiceChat';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ChatScreen() {
  const [conversations, setConversations] = useState([]);
  const [currentConversation, setCurrentConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [showConversationList, setShowConversationList] = useState(true);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedConversations, setSelectedConversations] = useState([]);
  const flatListRef = useRef();
  
  // Initialize voice chat
  const voiceChat = VoiceChat({
    onVoiceMessage: (message) => {
      setInputMessage(message);
    },
    isListening: loading
  });

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      const response = await apiService.getConversations();
      console.log('Conversations response:', response);
      if (response && response.success && response.data && Array.isArray(response.data.conversations)) {
        setConversations(response.data.conversations);
      } else {
        console.log('No conversations found or invalid response structure');
        setConversations([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  const startNewConversation = async (type = 'general') => {
    const initialMessage = type === 'general' 
      ? '¡Hola! Me gustaría conversar contigo.'
      : type === 'wellness'
      ? 'Hola, me gustaría hablar sobre mi bienestar.'
      : 'Hola, necesito apoyo emocional hoy.';

    try {
      setLoading(true);
      const response = await apiService.createConversation({
        type,
        initial_message: initialMessage,
      });

      if (response.success) {
        const newConversation = response.data.conversation;
        setCurrentConversation(newConversation);
        setMessages(newConversation.messages || []);
        setShowConversationList(false);
        await loadConversations();
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo crear la conversación');
    } finally {
      setLoading(false);
    }
  };

  const selectConversation = async (conversation) => {
    try {
      const response = await apiService.getConversation(conversation.id);
      console.log('Selected conversation response:', response);
      if (response && response.success && response.data && response.data.conversation) {
        setCurrentConversation(response.data.conversation);
        setSelectedConversation(conversation);
        setMessages(response.data.conversation.messages || []);
        setShowConversationList(false);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      } else {
        console.log('Invalid conversation response structure');
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      Alert.alert('Error', 'No se pudo cargar la conversación');
      setMessages([]);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentConversation) return;

    const messageText = inputMessage.trim();
    setInputMessage('');
    setLoading(true);

    try {
      const response = await apiService.sendMessage(currentConversation.id, messageText);
      if (response.success) {
        setMessages(prev => [...prev, response.data.user_message, response.data.ai_message]);
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudo enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.sender === 'user' ? styles.userMessage : styles.aiMessage
    ]}>
      <View style={[
        styles.messageBubble,
        item.sender === 'user' ? styles.userBubble : styles.aiBubble
      ]}>
        <View style={styles.messageContent}>
          <Text style={[
            styles.messageText,
            item.sender === 'user' ? styles.userMessageText : styles.aiMessageText
          ]}>
            {item.content}
          </Text>
          {item.sender === 'ai' && (
            <voiceChat.SpeakButton 
              text={item.content}
              style={styles.speakButtonInMessage}
            />
          )}
        </View>
        <Text style={styles.messageTime}>
          {new Date(item.created_at).toLocaleTimeString('es-ES', { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </Text>
      </View>
    </View>
  );

  const deleteConversation = async (conversationId) => {
    try {
      console.log('🗑️ Starting conversation deletion for ID:', conversationId);
      console.log('📋 Current conversations count:', conversations.length);
      
      const response = await apiService.deleteConversation(conversationId);
      console.log('📥 Delete response received:', response);
      
      if (response && response.success) {
        console.log('✅ Deletion successful, updating UI');
        setConversations(prev => {
          const updated = prev.filter(conv => conv.id !== conversationId);
          console.log('📊 Updated conversations count:', updated.length);
          return updated;
        });
        
        // If we're currently viewing the deleted conversation, go back to list
        if (selectedConversation && selectedConversation.id === conversationId) {
          console.log('🔄 Returning to conversation list');
          setSelectedConversation(null);
          setShowConversationList(true);
        }
        
        // Force re-render by reloading conversations
        await loadConversations();
      } else {
        console.log('❌ Deletion failed:', response?.message);
        Alert.alert('Error', response?.message || 'No se pudo eliminar la conversación');
      }
    } catch (error) {
      console.error('❌ Delete conversation error:', error);
      console.error('Error details:', error.message);
      Alert.alert('Error', 'No se pudo eliminar la conversación');
    }
  };

  const confirmDeleteConversation = (conversation) => {
    console.log('🔔 Showing delete confirmation for:', conversation.id);
    Alert.alert(
      'Eliminar Conversación',
      `¿Estás seguro de que quieres eliminar "${conversation.title || 'esta conversación'}"?`,
      [
        { 
          text: 'No', 
          style: 'cancel',
          onPress: () => console.log('❌ Delete cancelled')
        },
        { 
          text: 'Sí, eliminar', 
          style: 'destructive',
          onPress: () => {
            console.log('✅ Delete confirmed for conversation:', conversation.id);
            deleteConversation(conversation.id);
          }
        }
      ]
    );
  };

  const deleteMultipleConversations = async () => {
    try {
      console.log('🗑️ Deleting multiple conversations:', selectedConversations);
      
      for (const conversationId of selectedConversations) {
        await apiService.deleteConversation(conversationId);
      }
      
      setConversations(prev => 
        prev.filter(conv => !selectedConversations.includes(conv.id))
      );
      
      setSelectedConversations([]);
      setIsSelectionMode(false);
      
      Alert.alert('Éxito', `${selectedConversations.length} conversaciones eliminadas`);
      await loadConversations();
    } catch (error) {
      console.error('❌ Error deleting multiple conversations:', error);
      Alert.alert('Error', 'No se pudieron eliminar todas las conversaciones');
    }
  };

  const confirmDeleteMultiple = () => {
    Alert.alert(
      'Eliminar Conversaciones',
      `¿Estás seguro de que quieres eliminar ${selectedConversations.length} conversaciones?`,
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Sí, eliminar todas', 
          style: 'destructive',
          onPress: deleteMultipleConversations
        }
      ]
    );
  };

  const toggleConversationSelection = (conversationId) => {
    setSelectedConversations(prev => {
      if (prev.includes(conversationId)) {
        return prev.filter(id => id !== conversationId);
      } else {
        return [...prev, conversationId];
      }
    });
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    setSelectedConversations([]);
  };

  const renderConversationItem = ({ item }) => (
    <View style={styles.conversationItemContainer}>
      {isSelectionMode && (
        <TouchableOpacity
          style={styles.selectionCheckbox}
          onPress={() => toggleConversationSelection(item.id)}
        >
          <Ionicons 
            name={selectedConversations.includes(item.id) ? "checkbox" : "square-outline"} 
            size={24} 
            color={selectedConversations.includes(item.id) ? "#4A90E2" : "#6C757D"} 
          />
        </TouchableOpacity>
      )}
      <TouchableOpacity
        style={[styles.conversationItem, isSelectionMode && styles.conversationItemSelection]}
        onPress={() => {
          if (isSelectionMode) {
            toggleConversationSelection(item.id);
          } else {
            selectConversation(item);
          }
        }}
      >
        <View style={styles.conversationHeader}>
          <Ionicons 
            name={item.type === 'wellness' ? 'fitness' : item.type === 'emotional_support' ? 'heart' : 'chatbubble'} 
            size={24} 
            color="#4A90E2" 
          />
          <Text style={styles.conversationTitle}>
            {item.title || `Conversación ${item.type}`}
          </Text>
        </View>
        <Text style={styles.conversationDate}>
          {new Date(item.updated_at).toLocaleDateString('es-ES')}
        </Text>
      </TouchableOpacity>
      {!isSelectionMode && (
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            console.log('🗑️ Delete button pressed for conversation:', item.id);
            confirmDeleteConversation(item);
          }}
        >
          <Ionicons name="trash-outline" size={20} color="#DC3545" />
        </TouchableOpacity>
      )}
    </View>
  );

  if (loading) {
    return <LoadingSpinner message="Cargando conversaciones..." />;
  }

  if (showConversationList) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Mis Conversaciones</Text>
        </View>

        <View style={styles.newConversationSection}>
          <Text style={styles.sectionTitle}>Iniciar nueva conversación</Text>
          <View style={styles.conversationTypes}>
            <TouchableOpacity
              style={styles.typeButton}
              onPress={() => startNewConversation('general')}
              disabled={loading}
            >
              <Ionicons name="chatbubble" size={30} color="white" />
              <Text style={styles.typeButtonText}>General</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, { backgroundColor: '#28A745' }]}
              onPress={() => startNewConversation('wellness')}
              disabled={loading}
            >
              <Ionicons name="fitness" size={30} color="white" />
              <Text style={styles.typeButtonText}>Bienestar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.typeButton, { backgroundColor: '#DC3545' }]}
              onPress={() => startNewConversation('emotional_support')}
              disabled={loading}
            >
              <Ionicons name="heart" size={30} color="white" />
              <Text style={styles.typeButtonText}>Apoyo</Text>
            </TouchableOpacity>
          </View>
        </View>

        {conversations.length > 0 && (
          <View style={styles.conversationsList}>
            <Text style={styles.sectionTitle}>Conversaciones anteriores</Text>
            <FlatList
              data={conversations}
              renderItem={renderConversationItem}
              keyExtractor={(item) => item.id.toString()}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.chatHeader}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => setShowConversationList(true)}
        >
          <Ionicons name="arrow-back" size={24} color="#4A90E2" />
        </TouchableOpacity>
        <Text style={styles.chatTitle}>
          {currentConversation?.title || 'Conversación'}
        </Text>
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id.toString()}
        style={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
      />

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          value={inputMessage}
          onChangeText={setInputMessage}
          placeholder="Escribe tu mensaje..."
          placeholderTextColor="#999"
          multiline
          maxLength={1000}
        />
        <voiceChat.VoiceButton />
        <TouchableOpacity
          style={[styles.sendButton, (!inputMessage.trim() || loading) && styles.disabledButton]}
          onPress={sendMessage}
          disabled={!inputMessage.trim() || loading}
        >
          <Ionicons name="send" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  newConversationSection: {
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  conversationTypes: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  typeButton: {
    backgroundColor: '#4A90E2',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    minWidth: 100,
  },
  typeButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
  },
  conversationsList: {
    flex: 1,
    padding: 20,
    backgroundColor: 'white',
    marginTop: 10,
  },
  conversationItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 15,
    marginVertical: 5,
  },
  conversationItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#fff',
    padding: 10,
    marginLeft: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DC3545',
  },
  conversationListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    flex: 1,
  },
  conversationTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  conversationDate: {
    fontSize: 12,
    color: '#666',
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E1E5E9',
  },
  backButton: {
    padding: 5,
    marginRight: 10,
  },
  chatTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  messagesList: {
    flex: 1,
    padding: 15,
  },
  messageContainer: {
    marginVertical: 5,
  },
  userMessage: {
    alignItems: 'flex-end',
  },
  aiMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 15,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: '#4A90E2',
    borderBottomRightRadius: 5,
  },
  aiBubble: {
    backgroundColor: 'white',
    borderBottomLeftRadius: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'white',
  },
  aiMessageText: {
    color: '#333',
  },
  messageTime: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#E1E5E9',
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E1E5E9',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 10,
  },
  messageContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  speakButtonInMessage: {
    marginLeft: 8,
    marginTop: 2,
  },
  sendButton: {
    backgroundColor: '#4A90E2',
    padding: 15,
    borderRadius: 25,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#B0B0B0',
  },
});
