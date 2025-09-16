// Script para ejecutar todas las pruebas de AURA
const { testApiHealth } = require('./api-health.test.js');
const { runConversationDeletionTest } = require('./conversation-deletion.test.js');
const { runDiaryTest } = require('./diary-entries.test.js');

async function runAllTests() {
  console.log('🧪 EJECUTANDO TODAS LAS PRUEBAS DE AURA');
  console.log('=' .repeat(60));
  
  try {
    // Prueba 1: Salud de la API
    console.log('\n1️⃣ PRUEBA DE SALUD DE LA API');
    console.log('-' .repeat(30));
    const apiHealthy = await testApiHealth();
    
    if (!apiHealthy) {
      console.log('❌ La API no está funcionando. Deteniendo pruebas.');
      return;
    }
    
    // Prueba 2: Funcionalidad del diario
    console.log('\n2️⃣ PRUEBA DE FUNCIONALIDAD DEL DIARIO');
    console.log('-' .repeat(30));
    await runDiaryTest();
    
    // Prueba 3: Eliminación de conversaciones
    console.log('\n3️⃣ PRUEBA DE ELIMINACIÓN DE CONVERSACIONES');
    console.log('-' .repeat(30));
    await runConversationDeletionTest();
    
    console.log('\n' + '=' .repeat(60));
    console.log('✅ TODAS LAS PRUEBAS COMPLETADAS');
    
  } catch (error) {
    console.error('❌ Error ejecutando pruebas:', error.message);
  }
}

if (require.main === module) {
  runAllTests();
}

module.exports = { runAllTests };
