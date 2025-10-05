import { getUncachableGoogleSheetClient, extractSpreadsheetId } from './server/google-sheets-client';

async function testImport() {
  try {
    const sheetsUrl = 'https://docs.google.com/spreadsheets/d/1iWudG0vwVr2EcWmV-oNEUHu8rQ-9GClXL-AFYs5XQKs/edit?usp=drivesdk';
    
    console.log('🔍 Extraindo ID da planilha...');
    const spreadsheetId = extractSpreadsheetId(sheetsUrl);
    console.log('✅ Spreadsheet ID:', spreadsheetId);
    
    console.log('\n🔑 Obtendo cliente autenticado...');
    const sheets = await getUncachableGoogleSheetClient();
    
    console.log('\n📋 Listando abas disponíveis...');
    const metadata = await sheets.spreadsheets.get({
      spreadsheetId: spreadsheetId!,
    });
    
    console.log(`\n✅ Planilha encontrada: "${metadata.data.properties?.title}"`);
    console.log('\n📑 Abas disponíveis:');
    metadata.data.sheets?.forEach((sheet, index) => {
      console.log(`  ${index + 1}. "${sheet.properties?.title}"`);
    });
    
    // Tentar carregar dados da primeira aba
    const firstSheetName = metadata.data.sheets?.[0]?.properties?.title;
    if (firstSheetName) {
      console.log(`\n📊 Carregando dados da aba "${firstSheetName}"...`);
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId: spreadsheetId!,
        range: `${firstSheetName}!A:Z`,
      });
      
      const rows = response.data.values;
      
      if (!rows || rows.length === 0) {
        console.log('⚠️ Nenhum dado encontrado na aba');
        return;
      }
      
      console.log(`✅ ${rows.length} linhas carregadas!`);
      console.log('\n📋 Headers:', rows[0]);
      console.log(`\n📦 Amostra (primeiras 3 linhas de dados):`);
      
      for (let i = 1; i <= Math.min(3, rows.length - 1); i++) {
        console.log(`\nLinha ${i}:`, rows[i].slice(0, 5), '...');
      }
      
      // Buscar coluna JSON
      const headers = rows[0];
      let jsonColumnIndex = -1;
      const jsonColumnNames = ['json', 'analise', 'análise', 'karooma', 'dados_json', 'product_json'];
      
      for (let i = 0; i < headers.length; i++) {
        const header = headers[i].toLowerCase();
        if (jsonColumnNames.some(name => header.includes(name))) {
          jsonColumnIndex = i;
          break;
        }
      }
      
      if (jsonColumnIndex !== -1) {
        console.log(`\n🎯 Coluna JSON encontrada: "${headers[jsonColumnIndex]}" (índice ${jsonColumnIndex})`);
        console.log('📝 Exemplo de JSON (primeira linha):');
        console.log(rows[1][jsonColumnIndex]?.substring(0, 200) + '...');
      } else {
        console.log('\n⚠️ Coluna JSON não encontrada automaticamente');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro:', error);
    if (error instanceof Error) {
      console.error('Mensagem:', error.message);
      console.error('Stack:', error.stack);
    }
  }
}

testImport();
