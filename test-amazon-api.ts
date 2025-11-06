import { AmazonPAAPIService } from './server/services/amazonApi';

async function testAmazonAPI() {
  try {
    const service = new AmazonPAAPIService();
    console.log('🔍 Buscando produto B0DFQHY96K...\n');
    
    const result = await service.getProductByASIN('B0DFQHY96K');
    
    if (result.success && result.product) {
      const produto = result.product;
      console.log('✅ PRODUTO ENCONTRADO!\n');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📦 Título:', produto.title);
      console.log('💰 Preço Atual:', produto.currentPrice ? `R$ ${produto.currentPrice.toFixed(2)}` : 'Não disponível');
      console.log('🏷️  Preço Original:', produto.originalPrice ? `R$ ${produto.originalPrice.toFixed(2)}` : 'N/A');
      console.log('⭐ Rating:', produto.rating || 'N/A');
      console.log('📊 Reviews:', produto.reviewCount || 'N/A');
      console.log('📍 Disponível:', produto.availability);
      console.log('🎯 Prime:', produto.isPrime ? 'Sim' : 'Não');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔗 LINK DE AFILIADO:');
      console.log(produto.productUrl);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    } else {
      console.log('❌ Produto não encontrado ou ASIN inválido');
      console.log('Erro:', result.error);
    }
  } catch (error: any) {
    console.error('\n❌ ERRO ao buscar produto:');
    console.error(error.message);
    console.error('\nDetalhes:', error);
  }
}

testAmazonAPI();
