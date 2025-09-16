import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function RegisterScreen({ navigation }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
    birth_date: '',
    gender: '',
    activity_level: 'moderate',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const { register } = useAuth();

  // Generar arrays para el selector de fecha
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = [
    { value: '01', label: 'Enero' },
    { value: '02', label: 'Febrero' },
    { value: '03', label: 'Marzo' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Mayo' },
    { value: '06', label: 'Junio' },
    { value: '07', label: 'Julio' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Septiembre' },
    { value: '10', label: 'Octubre' },
    { value: '11', label: 'Noviembre' },
    { value: '12', label: 'Diciembre' },
  ];
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

  const formatDate = (day, month, year) => {
    if (day && month && year) {
      return `${year}-${month.padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    }
    return '';
  };

  const handleDateSelection = () => {
    if (selectedDay && selectedMonth && selectedYear) {
      const formattedDate = formatDate(selectedDay, selectedMonth, selectedYear);
      handleInputChange('birth_date', formattedDate);
      setShowDatePicker(false);
    } else {
      Alert.alert('Error', 'Por favor selecciona día, mes y año');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    console.log('🔍 Starting form validation...');
    console.log('📋 Current form data:', formData);

    // Validar campos básicos requeridos
    if (!formData.name?.trim()) {
      console.log('❌ Missing name');
      Alert.alert('Nombre requerido', 'Por favor, ingresa tu nombre completo');
      return false;
    }

    if (!formData.email?.trim()) {
      console.log('❌ Missing email');
      Alert.alert('Correo requerido', 'Por favor, ingresa tu correo electrónico');
      return false;
    }

    if (!formData.password?.trim()) {
      console.log('❌ Missing password');
      Alert.alert('Contraseña requerida', 'Por favor, ingresa una contraseña');
      return false;
    }

    if (formData.password !== formData.password_confirmation) {
      console.log('❌ Password mismatch');
      Alert.alert('Contraseñas no coinciden', 'Las contraseñas deben ser iguales');
      return false;
    }

    if (!formData.birth_date) {
      console.log('❌ Missing birth_date');
      Alert.alert('Fecha de nacimiento', 'Por favor, selecciona tu fecha de nacimiento');
      return false;
    }

    if (!formData.gender) {
      console.log('❌ Missing gender');
      Alert.alert('Género requerido', 'Por favor, selecciona tu género');
      return false;
    }

    if (!formData.emergency_contact_name) {
      console.log('❌ Missing emergency_contact_name');
      Alert.alert('Contacto de emergencia', 'Por favor, ingresa el nombre completo del contacto de emergencia');
      return false;
    }

    if (!formData.emergency_contact_phone) {
      console.log('❌ Missing emergency_contact_phone');
      Alert.alert('Teléfono de emergencia', 'Por favor, ingresa el número de teléfono del contacto de emergencia');
      return false;
    }

    // Validar formato del teléfono
    const phoneRegex = /^[\+]?[0-9\-\(\)\s]{7,}$/;
    if (!phoneRegex.test(formData.emergency_contact_phone)) {
      console.log('❌ Invalid phone format:', formData.emergency_contact_phone);
      Alert.alert('Teléfono inválido', `El número "${formData.emergency_contact_phone}" no tiene un formato válido.\n\nEjemplos válidos:\n• +1234567890\n• (123) 456-7890\n• 123-456-7890`);
      return false;
    }

    if (formData.password !== formData.password_confirmation) {
      console.log('❌ Passwords do not match');
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return false;
    }

    if (formData.password.length < 8) {
      console.log('❌ Password too short:', formData.password.length);
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return false;
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      console.log('❌ Invalid email format:', formData.email);
      Alert.alert('Email inválido', `El email "${formData.email}" no tiene un formato válido.\n\nEjemplo correcto: usuario@ejemplo.com`);
      return false;
    }

    // Validar contraseña segura
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!passwordRegex.test(formData.password)) {
      console.log('❌ Password does not meet complexity requirements:', formData.password);
      
      let errorMessage = 'La contraseña debe contener:\n';
      if (!/(?=.*[a-z])/.test(formData.password)) {
        errorMessage += '• Al menos una letra minúscula\n';
      }
      if (!/(?=.*[A-Z])/.test(formData.password)) {
        errorMessage += '• Al menos una letra mayúscula\n';
      }
      if (!/(?=.*\d)/.test(formData.password)) {
        errorMessage += '• Al menos un número\n';
      }
      
      Alert.alert('Contraseña inválida', errorMessage.trim());
      return false;
    }

    console.log('✅ Form validation passed!');
    return true;
  };

  const handleRegister = async () => {
    console.log('🔄 Register button pressed');
    console.log('📋 Form data:', formData);
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }

    console.log('✅ Form validation passed, attempting registration...');
    setLoading(true);
    
    try {
      const result = await register(formData);
      setLoading(false);
      
      console.log('📥 Registration result:', result);

      if (!result.success) {
        console.log('❌ Registration failed:', result.message);
        console.log('❌ Registration errors:', result.errors);
        
        // Show specific validation errors
        if (result.errors) {
          let errorMessage = 'Errores de validación:\n';
          Object.keys(result.errors).forEach(field => {
            const fieldErrors = result.errors[field];
            if (Array.isArray(fieldErrors)) {
              fieldErrors.forEach(error => {
                errorMessage += `• ${error}\n`;
              });
            }
          });
          Alert.alert('Error de validación', errorMessage);
        } else {
          Alert.alert('Error de registro', result.message || 'Error al crear la cuenta');
        }
      } else {
        console.log('✅ Registration successful!');
        setShowSuccessModal(true);
      }
    } catch (error) {
      setLoading(false);
      console.error('💥 Registration error:', error);
      Alert.alert('Error', 'Error al conectar con el servidor');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Ionicons name="person-add-circle" size={60} color="#4A90E2" />
          <Text style={styles.title}>Crear Cuenta</Text>
          <Text style={styles.subtitle}>Únete a la comunidad AURA</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Información Personal</Text>
          
          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(value) => handleInputChange('name', value)}
            placeholder="Tu nombre completo"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Correo electrónico *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(value) => handleInputChange('email', value)}
            placeholder="tu@email.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
          />

          <Text style={styles.label}>Fecha de nacimiento *</Text>
          <TouchableOpacity
            style={styles.datePickerButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.datePickerText, !formData.birth_date && styles.placeholderText]}>
              {formData.birth_date ? 
                new Date(formData.birth_date).toLocaleDateString('es-ES', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                }) : 
                'Seleccionar fecha de nacimiento'
              }
            </Text>
            <Ionicons name="calendar" size={24} color="#4A90E2" />
          </TouchableOpacity>

          <Text style={styles.label}>Género</Text>
          <View style={styles.buttonGroup}>
            {['male', 'female', 'other'].map((gender) => (
              <TouchableOpacity
                key={gender}
                style={[
                  styles.optionButton,
                  formData.gender === gender && styles.selectedOption
                ]}
                onPress={() => handleInputChange('gender', gender)}
              >
                <Text style={[
                  styles.optionText,
                  formData.gender === gender && styles.selectedOptionText
                ]}>
                  {gender === 'male' ? 'Masculino' : gender === 'female' ? 'Femenino' : 'Otro'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>Nivel de actividad</Text>
          <View style={styles.buttonGroup}>
            {['low', 'moderate', 'high'].map((level) => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.optionButton,
                  formData.activity_level === level && styles.selectedOption
                ]}
                onPress={() => handleInputChange('activity_level', level)}
              >
                <Text style={[
                  styles.optionText,
                  formData.activity_level === level && styles.selectedOptionText
                ]}>
                  {level === 'low' ? 'Bajo' : level === 'moderate' ? 'Moderado' : 'Alto'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Seguridad</Text>

          <Text style={styles.label}>Contraseña *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.password}
              onChangeText={(value) => handleInputChange('password', value)}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? 'eye-off' : 'eye'} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmar contraseña *</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={formData.password_confirmation}
              onChangeText={(value) => handleInputChange('password_confirmation', value)}
              placeholder="Repite tu contraseña"
              placeholderTextColor="#999"
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Ionicons 
                name={showConfirmPassword ? 'eye-off' : 'eye'} 
                size={24} 
                color="#666" 
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionTitle}>Contacto de Emergencia</Text>

          <Text style={styles.label}>Nombre del contacto</Text>
          <TextInput
            style={styles.input}
            value={formData.emergency_contact_name}
            onChangeText={(value) => handleInputChange('emergency_contact_name', value)}
            placeholder="Nombre de familiar o amigo"
            placeholderTextColor="#999"
          />

          <Text style={styles.label}>Teléfono del contacto</Text>
          <TextInput
            style={styles.input}
            value={formData.emergency_contact_phone}
            onChangeText={(value) => handleInputChange('emergency_contact_phone', value)}
            placeholder="Número de teléfono"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            onPress={() => {
              console.log('🔴 BUTTON PRESSED - Starting registration process');
              handleRegister();
            }}
            disabled={loading}
          >
            <Text style={styles.registerButtonText}>
              {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
            </Text>
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes una cuenta?</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Iniciar sesión</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Modal de Éxito */}
        <Modal
          animationType="fade"
          transparent={true}
          visible={showSuccessModal}
          onRequestClose={() => setShowSuccessModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.successModalContainer}>
              <View style={styles.successHeader}>
                <Text style={styles.successEmoji}>😊</Text>
                <Text style={styles.successTitle}>¡Registro Exitoso!</Text>
                <Text style={styles.successMessage}>
                  Tu cuenta ha sido creada correctamente.{'\n'}
                  Ahora puedes iniciar sesión.
                </Text>
              </View>
              
              <TouchableOpacity
                style={styles.successButton}
                onPress={() => {
                  setShowSuccessModal(false);
                  navigation.navigate('Login');
                }}
              >
                <Text style={styles.successButtonText}>Ir a Iniciar Sesión</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal del Selector de Fecha */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={showDatePicker}
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.dateModalContainer}>
              <View style={styles.dateModalHeader}>
                <Text style={styles.dateModalTitle}>Seleccionar Fecha de Nacimiento</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>

              <View style={styles.datePickerContainer}>
                <View style={styles.dateColumn}>
                  <Text style={styles.dateColumnTitle}>Día</Text>
                  <ScrollView style={styles.dateScrollView} showsVerticalScrollIndicator={false}>
                    {days.map((day) => (
                      <TouchableOpacity
                        key={day}
                        style={[
                          styles.dateOption,
                          selectedDay === day && styles.selectedDateOption
                        ]}
                        onPress={() => setSelectedDay(day)}
                      >
                        <Text style={[
                          styles.dateOptionText,
                          selectedDay === day && styles.selectedDateOptionText
                        ]}>
                          {day}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.dateColumn}>
                  <Text style={styles.dateColumnTitle}>Mes</Text>
                  <ScrollView style={styles.dateScrollView} showsVerticalScrollIndicator={false}>
                    {months.map((month) => (
                      <TouchableOpacity
                        key={month.value}
                        style={[
                          styles.dateOption,
                          selectedMonth === month.value && styles.selectedDateOption
                        ]}
                        onPress={() => setSelectedMonth(month.value)}
                      >
                        <Text style={[
                          styles.dateOptionText,
                          selectedMonth === month.value && styles.selectedDateOptionText
                        ]}>
                          {month.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.dateColumn}>
                  <Text style={styles.dateColumnTitle}>Año</Text>
                  <ScrollView style={styles.dateScrollView} showsVerticalScrollIndicator={false}>
                    {years.map((year) => (
                      <TouchableOpacity
                        key={year}
                        style={[
                          styles.dateOption,
                          selectedYear === year && styles.selectedDateOption
                        ]}
                        onPress={() => setSelectedYear(year)}
                      >
                        <Text style={[
                          styles.dateOptionText,
                          selectedYear === year && styles.selectedDateOptionText
                        ]}>
                          {year}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              </View>

              <View style={styles.dateModalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowDatePicker(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={handleDateSelection}
                >
                  <Text style={styles.confirmButtonText}>Confirmar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollContainer: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginTop: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  form: {
    backgroundColor: 'white',
    padding: 25,
    borderRadius: 15,
    boxShadow: '0px 2px 3.84px rgba(0, 0, 0, 0.1)',
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 15,
    marginTop: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    borderWidth: 2,
    borderColor: '#E1E5E9',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  optionButton: {
    borderWidth: 2,
    borderColor: '#E1E5E9',
    borderRadius: 10,
    padding: 12,
    marginRight: 10,
    marginBottom: 10,
    backgroundColor: '#F8F9FA',
  },
  selectedOption: {
    backgroundColor: '#4A90E2',
    borderColor: '#4A90E2',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  selectedOptionText: {
    color: 'white',
  },
  // Estilos del selector de fecha
  datePickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E1E5E9',
    borderRadius: 10,
    padding: 15,
    backgroundColor: '#F8F9FA',
  },
  datePickerText: {
    fontSize: 16,
    color: '#333',
  },
  placeholderText: {
    color: '#999',
  },
  // Estilos del modal de fecha
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dateModalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 20,
    maxHeight: '80%',
    width: '90%',
  },
  dateModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    height: 300,
  },
  dateColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  dateColumnTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4A90E2',
    textAlign: 'center',
    marginBottom: 10,
  },
  dateScrollView: {
    maxHeight: 250,
  },
  dateOption: {
    padding: 12,
    borderRadius: 8,
    marginVertical: 2,
    alignItems: 'center',
  },
  selectedDateOption: {
    backgroundColor: '#4A90E2',
  },
  dateOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedDateOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
  dateModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  cancelButton: {
    backgroundColor: '#E1E5E9',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E1E5E9',
    borderRadius: 10,
    backgroundColor: '#F8F9FA',
  },
  passwordInput: {
    flex: 1,
    padding: 15,
    fontSize: 16,
  },
  eyeButton: {
    padding: 15,
  },
  registerButton: {
    backgroundColor: '#4A90E2',
    padding: 18,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 25,
  },
  disabledButton: {
    backgroundColor: '#B0B0B0',
  },
  registerButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  loginText: {
    fontSize: 16,
    color: '#666',
    marginRight: 5,
  },
  loginLink: {
    color: '#4A90E2',
    fontWeight: 'bold',
    fontSize: 16,
  },
  
  // Success Modal Styles
  successModalContainer: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.25)',
    elevation: 5,
    minWidth: 320,
  },
  successHeader: {
    alignItems: 'center',
    marginBottom: 25,
  },
  successEmoji: {
    fontSize: 60,
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4A90E2',
    marginBottom: 10,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  successButton: {
    backgroundColor: '#4A90E2',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 25,
    minWidth: 200,
  },
  successButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
