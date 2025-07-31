"""
Script de Automação String.com para Karooma
Use este template no String.com para extrair dados reais da Amazon
"""

import requests
import json
from datetime import datetime

# Configuração do Karooma
KAROOMA_API_BASE = "https://seu-projeto.replit.app"  # Substitua pela URL do seu Replit
KAROOMA_API_TOKEN = "seu_token_aqui"  # Token de autenticação (opcional)

class KaroomaProductSync:
    def __init__(self):
        self.api_base = KAROOMA_API_BASE
        self.headers = {
            "Content-Type": "application/json",
            "User-Agent": "KaroomaBot/1.0"
        }
        
    def extract_amazon_data(self, amazon_url):
        """
        String.com irá preencher esta função automaticamente
        com dados extraídos da Amazon via API oficial
        """
        # Exemplo de dados que o String.com extrairá:
        return {
            "title": "Produto extraído pelo String.com",
            "description": "Descrição real do produto da Amazon",
            "currentPrice": 199.90,
            "originalPrice": 249.90,
            "discount": 20,
            "rating": 4.5,
            "reviewCount": 1250,
            "imageUrl": "https://m.media-amazon.com/images/I/exemplo.jpg",
            "category": "Electronics",  # String.com detectará automaticamente
            "inStock": True,
            "specifications": [
                "Especificação 1 real",
                "Especificação 2 real"
            ]
        }
    
    def map_category(self, amazon_category):
        """Mapeia categorias da Amazon para categorias do Karooma"""
        category_mapping = {
            'Home & Kitchen': 'casa',
            'Kitchen & Dining': 'casa',
            'Beauty & Personal Care': 'autocuidado',
            'Health & Personal Care': 'autocuidado',
            'Baby': 'familia',
            'Toys & Games': 'familia',
            'Sports & Outdoors': 'familia',
            'Health & Household': 'saude',
            'Vitamins & Dietary Supplements': 'saude',
            'Electronics': 'tecnologia',
            'Computers & Accessories': 'tecnologia',
            'Cell Phones & Accessories': 'tecnologia'
        }
        return category_mapping.get(amazon_category, 'casa')
    
    def calculate_discount(self, current_price, original_price):
        """Calcula porcentagem de desconto"""
        if not original_price or original_price <= current_price:
            return None
        return round(((original_price - current_price) / original_price) * 100)
    
    def format_for_karooma(self, raw_data, affiliate_link):
        """Formata dados extraídos para o padrão Karooma"""
        discount = self.calculate_discount(
            raw_data.get("currentPrice", 0),
            raw_data.get("originalPrice", 0)
        )
        
        return {
            "title": raw_data["title"][:255],  # Limitar título
            "description": raw_data.get("description", "")[:500],  # Limitar descrição
            "category": self.map_category(raw_data.get("category", "")),
            "imageUrl": raw_data.get("imageUrl"),
            "currentPrice": str(raw_data["currentPrice"]),
            "originalPrice": str(raw_data["originalPrice"]) if raw_data.get("originalPrice") else None,
            "discount": discount,
            "rating": str(raw_data.get("rating", "")),
            "affiliateLink": affiliate_link,
            "featured": raw_data.get("rating", 0) >= 4.5,  # Featured se rating >= 4.5
            "inStock": raw_data.get("inStock", True)
        }
    
    def sync_to_karooma(self, product_data):
        """Envia produto para API do Karooma"""
        try:
            response = requests.post(
                f"{self.api_base}/api/automation/products/sync",
                json=product_data,
                headers=self.headers,
                timeout=30
            )
            
            if response.status_code == 200:
                return response.json()
            else:
                print(f"Erro HTTP {response.status_code}: {response.text}")
                return None
                
        except requests.RequestException as e:
            print(f"Erro na requisição: {e}")
            return None

def main():
    """Função principal - String.com executará automaticamente"""
    sync = KaroomaProductSync()
    
    # URLs dos produtos para monitorar
    # String.com permitirá configurar esta lista via interface
    amazon_urls = [
        "https://amzn.to/44TPsu4",  # Balance Bike Nathor
        # Adicione mais URLs aqui conforme necessário
    ]
    
    results = []
    
    for url in amazon_urls:
        try:
            print(f"Processando: {url}")
            
            # String.com extrairá dados reais da Amazon
            raw_data = sync.extract_amazon_data(url)
            
            # Formatar para padrão Karooma
            formatted_data = sync.format_for_karooma(raw_data, url)
            
            # Sincronizar com Karooma
            result = sync.sync_to_karooma(formatted_data)
            
            if result:
                print(f"✅ Sucesso: {formatted_data['title']}")
                results.append({
                    "status": "success",
                    "product": formatted_data['title'],
                    "url": url
                })
            else:
                print(f"❌ Falha: Não foi possível sincronizar")
                results.append({
                    "status": "error",
                    "url": url
                })
                
        except Exception as e:
            print(f"❌ Erro ao processar {url}: {e}")
            results.append({
                "status": "error",
                "url": url,
                "error": str(e)
            })
    
    # Relatório final
    success_count = sum(1 for r in results if r["status"] == "success")
    total_count = len(results)
    
    print(f"\n📊 Relatório Final:")
    print(f"Total de produtos: {total_count}")
    print(f"Sucessos: {success_count}")
    print(f"Falhas: {total_count - success_count}")
    print(f"Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    return results

# String.com executará esta função automaticamente
if __name__ == "__main__":
    main()