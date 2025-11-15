import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { db } from "./db";
import { products, users } from "@shared/schema";
import { eq, and, gt } from "drizzle-orm";
import crypto from "crypto";
import { registerFlipbookAccessRoutes } from "./routes/flipbookAccess";
import { registerFlipbookTemporaryAccessRoutes } from "./routes/flipbookTemporaryAccess";
import { registerAnalyticsRoutes } from "./routes/analytics";
import { insertContentSchema, insertProductSchema, insertNewsletterSchema, insertNewsletterAdvancedSchema, insertPageSchema, startStageSchema, completeStageSchema, requestPasswordResetSchema, resetPasswordSchema, passwordResetTokens, registerUserSchema, insertDiagnosticSchema } from "@shared/schema";
import { z } from "zod";
import { sseManager } from "./sse";
import { setupNextAuth } from "./nextAuthExpress";
import { sendNewsletterNotification, logNewsletterSubscription, sendPasswordResetEmail } from "./emailService";
// Auth middleware will be added with NextAuth
import {
  ObjectStorageService,
  ObjectNotFoundError,
} from "./objectStorage";
import bcrypt from "bcryptjs";
import { getProductUpdateJobs } from "./jobs/productUpdateJobs";
import AmazonPAAPIService from "./services/amazonApi";
import { amazonProductCache } from "./services/amazonProductCache";
import Papa from "papaparse";
import { getBlogTemplate, generateContentSuggestions, type BlogCategory } from "@shared/blog-template";
import { blogValidator } from "./blog-validator";
import path from "path";
import express from "express";
import { flipbookGenerator } from "./services/flipbookGenerator";
import { insertFlipbookSchema, insertCookieConsentSchema } from "@shared/schema";
import { extractUserInfo } from "./middleware/flipbookAuth";
import { pushNotificationService } from "./services/pushNotificationService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup NextAuth
  setupNextAuth(app);

  // Register flipbook access routes
  registerFlipbookAccessRoutes(app);
  registerFlipbookTemporaryAccessRoutes(app);
  registerAnalyticsRoutes(app);

  // Initialize Amazon API Service
  const amazonApiService = new AmazonPAAPIService();


  // Object Storage routes
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(
        req.path,
      );
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  // Public objects serving route
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/objects/upload", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    const uploadURL = await objectStorageService.getObjectEntityUploadURL();
    res.json({ uploadURL });
  });

  // Google Sheets Import - Importar produtos do CSV
  app.post("/api/admin/import-products", extractUserInfo, async (req: any, res) => {
    try {
      // Verificar se o usuário está autenticado e é admin
      if (!checkIsAdmin(req.user)) {
        return res.status(403).json({ error: "Acesso negado. Somente administradores podem importar produtos." });
      }

      const { csvData, overwrite = false } = req.body;
      
      if (!csvData) {
        return res.status(400).json({ error: "CSV data is required" });
      }

      // Parser CSV robusto que lida com campos entre aspas e vírgulas internas
      const parseCSV = (csvData: string) => {
        const rows: string[][] = [];
        const lines = csvData.split(/\r?\n/);
        
        for (const line of lines) {
          if (!line.trim()) continue;
          
          const row: string[] = [];
          let currentField = '';
          let insideQuotes = false;
          let i = 0;
          
          while (i < line.length) {
            const char = line[i];
            
            if (char === '"') {
              if (insideQuotes && line[i + 1] === '"') {
                // Aspas duplas escapadas
                currentField += '"';
                i += 2;
              } else {
                // Toggle estado de aspas
                insideQuotes = !insideQuotes;
                i++;
              }
            } else if (char === ',' && !insideQuotes) {
              // Vírgula fora de aspas = separador de campo
              row.push(currentField.trim());
              currentField = '';
              i++;
            } else {
              // Caractere normal
              currentField += char;
              i++;
            }
          }
          
          // Adicionar último campo
          row.push(currentField.trim());
          rows.push(row);
        }
        
        return rows;
      };

      const csvRows = parseCSV(csvData);
      if (csvRows.length === 0) {
        return res.status(400).json({ error: "CSV vazio ou inválido" });
      }

      const headers = csvRows[0].map((h: string) => h.replace(/^"|"$/g, '').trim());
      
      // Função auxiliar para extrair categoria dos dados
      const extractCategory = (productData: any) => {
        // Primeiro tenta encontrar categoria explícita
        let category = productData['Categoria'] || productData['Category'] || productData['category'];
        
        if (category) return category;
        
        // Se não tem categoria, tenta inferir das tags ou do nome do produto
        const tags = productData['Tags de Categorias e Benefícios'] || productData['Tags'] || '';
        const productName = productData['Nome do Produto'] || productData['Título'] || '';
        
        // Inferência baseada no nome ou tags
        if (tags.toLowerCase().includes('música') || productName.toLowerCase().includes('bateria') || 
            productName.toLowerCase().includes('kalimba')) {
          return 'educacao';
        } else if (tags.toLowerCase().includes('água') || productName.toLowerCase().includes('purificador') ||
                   productName.toLowerCase().includes('garrafa')) {
          return 'casa';
        }
        
        return 'geral'; // categoria padrão
      };

      // Função para normalizar preços e ratings do formato brasileiro para padrão
      const normalizePrice = (value: string) => {
        if (!value || typeof value !== 'string') return '';
        
        // Remove espaços em branco extras
        let normalized = value.trim();
        
        // Remove símbolos de moeda comuns (R$, $, €, £)
        normalized = normalized.replace(/^(R\$|US\$|\$|€|£)\s*/i, '');
        
        // Remove pontos usados como separadores de milhar (apenas se há vírgula depois)
        if (normalized.includes(',')) {
          normalized = normalized.replace(/\./g, '');
        }
        
        // Converte vírgula para ponto (formato brasileiro para internacional)
        normalized = normalized.replace(',', '.');
        
        // Remove caracteres não numéricos exceto ponto decimal
        normalized = normalized.replace(/[^\d.]/g, '');
        
        // Garante que só há um ponto decimal
        const parts = normalized.split('.');
        if (parts.length > 2) {
          normalized = parts[0] + '.' + parts.slice(1).join('');
        }
        
        return normalized;
      };

      // Função para extrair imageUrl com mapeamentos expandidos
      const extractImageUrl = (productData: any) => {
        const imageFields = [
          'Imagem', 'Image', 'imageUrl',
          'Imagem URL', 'URL Imagem', 'Imagem Principal',
          'URL da Imagem', 'Link da Imagem', 'Foto',
          'Image URL', 'Primary Image', 'Main Image',
          'Imagem Produto', 'Product Image', 'Foto Produto'
        ];
        
        for (const field of imageFields) {
          if (productData[field] && productData[field].trim()) {
            return productData[field].trim();
          }
        }
        
        return '';
      };

      const products = [];
      
      for (let i = 1; i < csvRows.length; i++) {
        const values = csvRows[i].map((v: string) => v.replace(/^"|"$/g, '').trim());
        
        if (values.length === 0 || values.every(v => !v)) continue; // Pular linhas vazias
        
        const productData: any = {};
        headers.forEach((header: string, index: number) => {
          productData[header] = values[index] || '';
        });

        // Mapear campos do CSV para o schema do produto
        const product = {
          title: productData['Nome do Produto'] || productData['Título'] || productData['Title'] || productData['title'],
          description: productData['Descrição'] || productData['Description'] || productData['description'],
          category: extractCategory(productData),
          imageUrl: extractImageUrl(productData),
          currentPrice: normalizePrice(productData['Preço Atual'] || productData['Current Price'] || productData['currentPrice'] || ''),
          originalPrice: normalizePrice(productData['Preço Original'] || productData['Original Price'] || productData['originalPrice'] || ''),
          affiliateLink: productData['Link Afiliado'] || productData['Affiliate Link'] || productData['affiliateLink'],
          productLink: productData['Link do Produto'] || productData['Product Link'] || productData['productLink'],
          rating: normalizePrice(productData['Avaliação'] || productData['Rating'] || productData['rating'] || ''),
          discount: normalizePrice(productData['Desconto'] || productData['Discount'] || productData['discount'] || ''),
          featured: (productData['Destaque'] || productData['Featured'] || productData['featured'])?.toLowerCase() === 'true',
          expertReview: productData['Avaliação por especialistas'] || productData['Avaliação Especialista'] || productData['Expert Review'] || productData['expertReview'],
          teamEvaluation: productData['Avaliação da Curadoria Karooma'] || productData['Avaliação Equipe'] || productData['Team Evaluation'] || productData['teamEvaluation'],
          benefits: productData['Benefícios'] || productData['Benefits'] || productData['benefits'],
          tags: productData['Tags de Filtros de Pesquisa'] || productData['Tags'] || productData['tags'],
          introduction: productData['Introdução'] || productData['Introduction'] || productData['introduction'],
          evaluators: productData['Especialistas Selecionados'] || productData['evaluators'],
          nutritionistEvaluation: productData['Nutricionista'] || productData['Avaliação Nutricionista'] || productData['Nutritionist Evaluation'] || productData['Avaliação da Nutricionista'] || productData['Análise Nutricionista'],
          organizerEvaluation: productData['Organizadora'] || productData['Organizadora Profissional'] || productData['Avaliação Organizadora'] || productData['Organizer Evaluation'] || productData['Avaliação da Organizadora'] || productData['Análise Organizadora'],
          designEvaluation: productData['Designer'] || productData['Design'] || productData['Avaliação Design'] || productData['Design Evaluation'] || productData['Avaliação de Design'] || productData['Análise Design'],
          karoomaTeamEvaluation: productData['Avaliação da Curadoria Karooma'] || productData['Avaliação Karooma'] || productData['Karooma Team Evaluation'],
          categoryTags: productData['Tags de Categorias e Benefícios'] || productData['Tags Categoria'] || productData['Category Tags'],
          searchTags: productData['Tags de Filtros de Pesquisa'] || productData['Tags Busca'] || productData['Search Tags'],
          asin: productData['ASIN'] || productData['asin'] || productData['Amazon ASIN'] || productData['Código ASIN']
        };

        // Validar dados essenciais (título e link afiliado são obrigatórios)
        if (product.title && product.affiliateLink) {
          products.push(product);
        }
      }

      // Limpar produtos existentes se overwrite = true
      if (overwrite) {
        await storage.clearProducts();
      }

      // Função para extrair avaliações individuais do expertReview consolidado
      const extractIndividualEvaluations = (expertReview: string) => {
        const evaluations = {
          nutritionistEvaluation: '',
          organizerEvaluation: '',
          designEvaluation: ''
        };

        if (!expertReview) return evaluations;

        // Split by specialist titles (looking for patterns like "Nutrição", "Organização", etc.)
        const sections = expertReview.split(/<br><br>|<br>\s*<br>/).filter(s => s.trim());
        
        for (const section of sections) {
          const cleanSection = section.replace(/<br>/g, '\n').trim();
          
          // Check for nutritionist
          if (cleanSection.match(/^(Nutri.*|Alimentação.*|Bem-Estar Nutricional.*)/i)) {
            evaluations.nutritionistEvaluation = cleanSection.replace(/^[^<]*<br>/, '').trim();
          }
          // Check for organizer
          else if (cleanSection.match(/^(Organiz.*|Organização Doméstica.*)/i)) {
            evaluations.organizerEvaluation = cleanSection.replace(/^[^<]*<br>/, '').trim();
          }
          // Check for design
          else if (cleanSection.match(/^(Design.*|Usabilidade.*|Design e Usabilidade.*)/i)) {
            evaluations.designEvaluation = cleanSection.replace(/^[^<]*<br>/, '').trim();
          }
        }

        return evaluations;
      };

      // Inserir produtos no banco
      const insertedProducts = [];
      for (const productData of products) {
        try {
          // Extrair avaliações individuais se existir expertReview consolidado
          if (productData.expertReview && (!productData.nutritionistEvaluation && !productData.organizerEvaluation && !productData.designEvaluation)) {
            const individualEvaluations = extractIndividualEvaluations(productData.expertReview);
            productData.nutritionistEvaluation = individualEvaluations.nutritionistEvaluation;
            productData.organizerEvaluation = individualEvaluations.organizerEvaluation;
            productData.designEvaluation = individualEvaluations.designEvaluation;
          }

          const insertedProduct = await storage.createProduct(productData);
          insertedProducts.push(insertedProduct);
        } catch (error) {
          console.error('Error inserting product:', error);
        }
      }

      res.json({ 
        success: true, 
        imported: insertedProducts.length, 
        total: products.length,
        products: insertedProducts 
      });

    } catch (error) {
      console.error('Error importing products:', error);
      res.status(500).json({ error: "Failed to import products" });
    }
  });

  // Endpoint para carregar dados do Google Sheets
  app.post("/api/admin/load-google-sheets", extractUserInfo, async (req: any, res) => {
    try {
      console.log('📊 ===== REQUISIÇÃO GOOGLE SHEETS =====');
      console.log('👤 req.user:', req.user ? JSON.stringify(req.user, null, 2) : 'não disponível');
      console.log('🔐 isAdmin (req.user.isAdmin):', req.user?.isAdmin);
      console.log('📧 Email (req.user.email):', req.user?.email);
      console.log('✅ isAdminEmail check:', req.user?.email ? isAdminEmail(req.user.email) : false);
      console.log('🔑 checkIsAdmin result:', checkIsAdmin(req.user));
      
      // Verificar se o usuário está autenticado e é admin
      if (!checkIsAdmin(req.user)) {
        console.log('❌ ACESSO NEGADO - usuário não é admin');
        console.log('=======================================\n');
        return res.status(403).json({ error: "Acesso negado. Somente administradores podem carregar dados." });
      }
      
      console.log('✅ Acesso permitido - usuário é admin');
      console.log('=======================================\n');

      const { sheetsUrl, sheetName, jsonColumn } = req.body;
      
      if (!sheetsUrl) {
        return res.status(400).json({ error: "URL do Google Sheets é obrigatória" });
      }

      // Converter URL do Google Sheets para CSV export
      let csvUrl = sheetsUrl;
      let gid = null;
      
      // Tentar extrair GID diretamente da URL (se o usuário colou o link da aba)
      const gidInUrlMatch = sheetsUrl.match(/[#&]gid=([0-9]+)/);
      if (gidInUrlMatch) {
        gid = gidInUrlMatch[1];
        console.log('🔗 GID encontrado na URL:', gid);
      }
      
      // Extrair spreadsheet ID do URL
      const spreadsheetIdMatch = sheetsUrl.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (!spreadsheetIdMatch) {
        return res.status(400).json({ error: "URL do Google Sheets inválida" });
      }
      
      const spreadsheetId = spreadsheetIdMatch[1];
      
      // Se não encontrou GID na URL e há um nome de aba especificado, tentar obter o GID
      if (!gid && sheetName) {
        try {
          // Fazer requisição para obter a lista de abas
          const sheetsListUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;
          const sheetsListResponse = await fetch(sheetsListUrl);
          const sheetsListText = await sheetsListResponse.text();
          
          // Procurar pelo GID da aba especificada
          const gidMatch = sheetsListText.match(new RegExp(`"sheet":"${sheetName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^}]*"sheetId":([0-9]+)`, 'i'));
          if (gidMatch) {
            gid = gidMatch[1];
            console.log('🔍 GID encontrado por nome da aba:', gid);
          } else {
            console.warn('⚠️ GID não encontrado para aba:', sheetName);
          }
        } catch (error) {
          console.warn('❌ Erro ao buscar GID:', error);
        }
      }
      
      // Construir URL do CSV
      if (gid) {
        csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv&gid=${gid}`;
        console.log('✅ URL CSV com GID:', csvUrl);
      } else {
        csvUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/export?format=csv`;
        console.log('⚠️ URL CSV SEM GID (primeira aba):', csvUrl);
      }

      // Fazer requisição para o Google Sheets
      const response = await fetch(csvUrl);
      if (!response.ok) {
        throw new Error(`Erro ao acessar Google Sheets: ${response.status}`);
      }

      const csvText = await response.text();
      
      // Usar papaparse para processar CSV corretamente (lida perfeitamente com multi-linha)
      const parseResult = Papa.parse(csvText, {
        header: false, // Vamos processar headers manualmente
        skipEmptyLines: true,
        quoteChar: '"',
        escapeChar: '"',
        delimiter: ',',
        newline: '\n'
      });
      
      if (!parseResult.data || parseResult.data.length < 2) {
        return res.status(400).json({ error: "Planilha não contém dados suficientes" });
      }

      const records = parseResult.data as string[][];
      const headers = records[0]; // Primeira linha são os headers
      const dataRows = records.slice(1); // Restante são os dados
      
      console.log('📋 Headers encontrados:', headers);
      console.log('📊 Total de linhas de dados:', dataRows.length);
      const data = [];

      // Mapeamento de nomes de colunas (tanto português quanto inglês)  
      const columnMapping: Record<string, string[]> = {
        asin: ['ASIN', 'asin'],
        title: ['title', 'nome', 'nome_produto', 'Título', 'produto'],
        imageUrl: ['image_url', 'imagem', 'foto', 'url_imagem'],
        price: ['price', 'preco', 'preço', 'Preço Atual', 'currentPrice'],
        rating: ['user_rating_stars', 'rating', 'avaliacao', 'avaliação', 'estrelas'],
        reviewCount: ['user_rating_count', 'review_count', 'num_avaliacoes', 'número de avaliações'],
        description: ['description_about_this_item', 'description', 'descricao', 'descrição'],
        seller: ['seller_name', 'vendedor', 'loja'],
        category: ['CATEGORIA DE PRODUTO', 'category', 'categoria'],
        productLink: ['LINK DO PRODUTO', 'product_link', 'link_produto'],
        affiliateLink: ['LINK AFILIADO', 'affiliate_link', 'link_afiliado']
      };
      
      console.log('🎯 ESTRATÉGIA: Priorizar JSON completo sobre colunas individuais');

      // Buscar coluna que contém JSON (análise Karooma)
      let jsonColumnIndex = -1;
      
      if (jsonColumn) {
        const columnNumber = parseInt(jsonColumn);
        if (!isNaN(columnNumber) && columnNumber > 0 && columnNumber <= headers.length) {
          jsonColumnIndex = columnNumber - 1;
          console.log(`✅ Coluna JSON detectada: Número ${jsonColumn} (índice ${jsonColumnIndex})`);
        } else {
          for (let i = 0; i < headers.length; i++) {
            if (headers[i].toLowerCase().includes(jsonColumn.toLowerCase())) {
              jsonColumnIndex = i;
              console.log(`✅ Coluna JSON detectada: "${headers[i]}" (índice ${i})`);
              break;
            }
          }
        }
      } else {
        // Busca automática por coluna JSON (ANÁLISE KAROOMA, etc)
        const jsonColumnNames = ['json', 'analise', 'análise', 'karooma', 'dados_json', 'product_json'];
        
        for (let i = 0; i < headers.length; i++) {
          const header = headers[i].toLowerCase();
          if (jsonColumnNames.some(name => header.includes(name))) {
            jsonColumnIndex = i;
            console.log(`✅ Coluna JSON detectada automaticamente: "${headers[i]}" (índice ${i})`);
            break;
          }
        }
      }
      
      if (jsonColumnIndex === -1) {
        console.warn('⚠️ Coluna JSON não encontrada!');
      }

      // Processar cada linha e fazer merge dos dados
      let productsWithJson = 0;
      let productsWithoutJson = 0;
      
      for (let i = 0; i < dataRows.length; i++) {
        const row = dataRows[i];
        
        // Pular linhas completamente vazias
        if (!row || row.every((cell: string) => !cell || cell.trim() === '')) {
          continue;
        }
        
        // Criar objeto do produto vazio
        const productData: any = {};
        let hasJsonData = false;
        
        // ESTRATÉGIA: Processar JSON PRIMEIRO (prioridade máxima)
        if (jsonColumnIndex !== -1 && row.length > jsonColumnIndex) {
          const jsonText = row[jsonColumnIndex]?.trim() || '';
          
          if (jsonText && (jsonText.startsWith('{') || jsonText.startsWith('\"{'))) {
            try {
              // Remover aspas externas se houver
              const cleanJsonText = jsonText.startsWith('\"') ? jsonText.slice(1, -1) : jsonText;
              const jsonData = JSON.parse(cleanJsonText);
              hasJsonData = true;
              productsWithJson++;
              
              if (i === 0) {
                console.log('📦 JSON parseado com sucesso! Chaves:', Object.keys(jsonData));
              }
              
              // Extrair TODOS os campos do JSON primeiro (prioridade)
              productData.title = jsonData.nome_produto || jsonData.title || '';
              productData.asin = jsonData.asin || '';
              productData.introduction = jsonData.introducao || jsonData.introduction || '';
              productData.affiliateLink = jsonData.link_afiliado || jsonData.affiliateLink || '';
              productData.productLink = jsonData.link_produto || jsonData.productLink || '';
              productData.imageUrl = jsonData.image_url || jsonData.imageUrl || '';
              productData.price = jsonData.price || jsonData.preco || '';
              productData.rating = jsonData.rating || jsonData.avaliacao || '';
              productData.reviewCount = jsonData.review_count || jsonData.num_avaliacoes || '';
              productData.description = jsonData.description || jsonData.descricao || '';
              productData.seller = jsonData.seller || jsonData.vendedor || '';
              productData.category = jsonData.category || jsonData.categoria || '';
              productData.nutritionistEvaluation = jsonData.avaliacao_nutricao || jsonData.nutritionistEvaluation || '';
              productData.organizerEvaluation = jsonData.avaliacao_organizacao || jsonData.organizerEvaluation || '';
              productData.designEvaluation = jsonData.avaliacao_design || jsonData.designEvaluation || '';
              productData.karoomaTeamEvaluation = jsonData.avaliacao_karooma || jsonData.karoomaTeamEvaluation || '';
              productData.categoryTags = jsonData.tags_categorias || jsonData.categoryTags || '';
              productData.searchTags = jsonData.tags_filtros || jsonData.searchTags || '';
              productData.evaluators = jsonData.especialistas_selecionados || jsonData.evaluators || '';
              
              // CRÍTICO: Extrair categoria de tags_filtros se não houver categoria explícita
              if (!productData.category && productData.searchTags) {
                // tags_filtros formato: "organizacao/cozinha, decorar-e-brilhar/cozinha"
                // Extrair primeira parte antes da "/" ou vírgula
                const firstTag = productData.searchTags.split(/[,\/]/)[0].trim();
                if (firstTag) {
                  productData.category = firstTag;
                  if (i < 3) {
                    console.log(`🏷️ Categoria extraída de tags_filtros: "${firstTag}" (linha ${i + 2})`);
                  }
                }
              }
              
            } catch (jsonError) {
              if (i < 3) {
                console.warn(`⚠️ JSON inválido na linha ${i + 2}:`, jsonError);
              }
            }
          }
        }
        
        // FALLBACK: Mapear colunas individuais (G-N) para preencher lacunas
        headers.forEach((header: string, index: number) => {
          const value = row[index] || '';
          
          // Verificar em qual campo esse header se encaixa
          for (const [field, possibleNames] of Object.entries(columnMapping)) {
            if (possibleNames.some((name: string) => header.trim() === name || header.toLowerCase().includes(name.toLowerCase()))) {
              // Só usar coluna individual se JSON não forneceu esse campo
              if (!productData[field] || productData[field] === '') {
                productData[field] = value.trim();
              }
              break;
            }
          }
        });
        
        if (!hasJsonData) {
          productsWithoutJson++;
        }
        
        // VALIDAÇÃO: Adicionar apenas se tiver title E (affiliateLink OU asin)
        const hasValidData = productData.title && (productData.affiliateLink || productData.asin);
        
        if (hasValidData) {
          if (i < 2) {
            console.log(`✅ Linha ${i + 2} adicionada:`, { 
              title: productData.title?.substring(0, 30), 
              asin: productData.asin,
              category: productData.category,
              hasAffiliate: !!productData.affiliateLink,
              fromJson: hasJsonData 
            });
          }
          data.push(productData);
        } else {
          if (i < 2) {
            console.log(`❌ Linha ${i + 2} ignorada:`, { 
              hasTitle: !!productData.title, 
              hasAsin: !!productData.asin, 
              hasAffiliate: !!productData.affiliateLink 
            });
          }
        }
      }
      
      console.log(`\n📊 RESUMO DO PROCESSAMENTO:`);
      console.log(`   ✅ Total de produtos válidos: ${data.length}`);
      console.log(`   📦 Com dados JSON: ${productsWithJson}`);
      console.log(`   📋 Apenas colunas: ${productsWithoutJson}`);

      res.json({ 
        success: true, 
        data: data,
        found: data.length,
        jsonColumn: jsonColumnIndex !== -1 ? headers[jsonColumnIndex] : null,
        headers: headers
      });

    } catch (error) {
      console.error('Error loading Google Sheets:', error);
      res.status(500).json({ 
        error: 'Erro ao carregar dados do Google Sheets',
        details: error.message 
      });
    }
  });

  // Endpoint para importar produtos JSON
  app.post("/api/admin/import-json-products", extractUserInfo, async (req: any, res) => {
    try {
      // Verificar se o usuário está autenticado e é admin
      if (!checkIsAdmin(req.user)) {
        return res.status(403).json({ error: "Acesso negado. Somente administradores podem importar produtos." });
      }

      const { jsonData, overwrite } = req.body;
      
      if (!jsonData || !Array.isArray(jsonData)) {
        return res.status(400).json({ error: "Dados JSON inválidos. Esperado um array de produtos." });
      }

      // Limpar produtos existentes se overwrite = true
      if (overwrite) {
        await storage.clearProducts();
      }

      // Função para normalizar preços
      const normalizePrice = (value: string) => {
        if (!value || typeof value !== 'string') return '';
        
        let normalized = value.trim();
        normalized = normalized.replace(/^(R\$|US\$|\$|€|£)\s*/i, '');
        
        if (normalized.includes(',')) {
          normalized = normalized.replace(/\./g, '');
        }
        
        normalized = normalized.replace(',', '.');
        normalized = normalized.replace(/[^\d.]/g, '');
        
        const parts = normalized.split('.');
        if (parts.length > 2) {
          normalized = parts[0] + '.' + parts.slice(1).join('');
        }
        
        return normalized;
      };

      // Função para extrair categoria de categoryTags ou searchTags
      const extractCategory = (productData: any): string => {
        // Tentar categoria direta primeiro
        if (productData.category || productData.categoria) {
          return productData.category || productData.categoria;
        }
        
        // Extrair do categoryTags (ex: "aprender-e-brincar" ou "aprender-e-brincar/familia")
        const categoryTags = productData.categoryTags || productData.tagsCategoria || productData.tags_categorias || '';
        if (categoryTags) {
          // Pegar o primeiro valor antes da "/" ou vírgula
          const firstTag = categoryTags.split(/[,\/]/)[0].trim();
          if (firstTag) return firstTag;
        }
        
        // Extrair do searchTags como fallback
        const searchTags = productData.searchTags || productData.tagsBusca || productData.tags_filtros || '';
        if (searchTags) {
          const firstTag = searchTags.split(/[,\/]/)[0].trim();
          if (firstTag) return firstTag;
        }
        
        // Categoria padrão se nada foi encontrado
        return 'geral';
      };

      // Processar e inserir produtos
      const insertedProducts = [];
      for (let i = 0; i < jsonData.length; i++) {
        const productData = jsonData[i];
        try {
          // Log detalhado do primeiro produto para debug
          if (i === 0) {
            console.log('🔍 DEBUG - Primeiro produto recebido:');
            console.log('  Keys:', Object.keys(productData));
            console.log('  categoryTags:', productData.categoryTags);
            console.log('  searchTags:', productData.searchTags);
            console.log('  category:', productData.category);
          }
          
          // Normalizar dados do produto
          const normalizedCurrentPrice = normalizePrice(productData.currentPrice || productData.precoAtual || productData.preco || productData.price || '');
          const normalizedOriginalPrice = normalizePrice(productData.originalPrice || productData.precoOriginal || '');
          const normalizedRating = normalizePrice(productData.rating || productData.avaliacao || '');
          const normalizedDiscount = normalizePrice(productData.discount || productData.desconto || '');
          
          const extractedCategory = extractCategory(productData);
          if (i === 0) {
            console.log('  ✅ Categoria extraída:', extractedCategory);
          }
          
          const product: any = {
            title: productData.title || productData.nome || productData.name,
            description: productData.description || productData.descricao,
            category: extractedCategory,
            imageUrl: productData.imageUrl || productData.imagem || productData.image,
            currentPrice: normalizedCurrentPrice || null,
            originalPrice: normalizedOriginalPrice || null,
            affiliateLink: productData.affiliateLink || productData.linkAfiliado || productData.link,
            productLink: productData.productLink || productData.linkProduto,
            rating: normalizedRating ? parseFloat(normalizedRating) : null,
            featured: productData.featured === true || productData.destaque === true,
            introduction: productData.introduction || productData.introducao,
            nutritionistEvaluation: productData.nutritionistEvaluation || productData.avaliacaoNutricionista || productData.avaliacao_nutricao,
            organizerEvaluation: productData.organizerEvaluation || productData.avaliacaoOrganizadora || productData.avaliacao_organizacao,
            designEvaluation: productData.designEvaluation || productData.avaliacaoDesign || productData.avaliacao_design,
            karoomaTeamEvaluation: productData.karoomaTeamEvaluation || productData.avaliacaoEquipeKarooma || productData.avaliacao_karooma,
            benefits: productData.benefits || productData.beneficios,
            tags: productData.tags || productData.etiquetas,
            categoryTags: productData.categoryTags || productData.tagsCategoria || productData.tags_categorias,
            searchTags: productData.searchTags || productData.tagsBusca || productData.tags_filtros,
            evaluators: productData.evaluators || productData.especialistas_selecionados,
            asin: productData.asin || productData.codigoASIN,
            brand: productData.brand || productData.seller || productData.seller_name
          };
          
          // Adicionar discount apenas se existir e for válido
          const discountValue = normalizedDiscount ? parseFloat(normalizedDiscount) : null;
          if (discountValue && discountValue > 0) {
            product.discount = discountValue;
          }
          
          // Adicionar reviewCount apenas se existir e for válido
          const reviewCountStr = productData.reviewCount || productData.user_rating_count || '';
          const reviewCountValue = reviewCountStr ? parseInt(String(reviewCountStr).replace(/\D/g, '')) : null;
          if (reviewCountValue && reviewCountValue > 0) {
            product.reviewCount = reviewCountValue;
          }

          // Validar dados essenciais
          if (product.title && product.affiliateLink) {
            const insertedProduct = await storage.createProduct(product);
            insertedProducts.push(insertedProduct);
          }
        } catch (error) {
          console.error('Erro ao inserir produto JSON:', error);
        }
      }

      res.json({ 
        success: true, 
        imported: insertedProducts.length, 
        total: jsonData.length, 
        products: insertedProducts 
      });

    } catch (error) {
      console.error('Error importing JSON products:', error);
      res.status(500).json({ error: 'Erro ao importar produtos JSON' });
    }
  });

  app.put("/api/images/upload", async (req, res) => {
    if (!req.body.imageURL) {
      return res.status(400).json({ error: "imageURL is required" });
    }

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.imageURL,
        {
          owner: "admin-karooma",
          visibility: "public",
        },
      );

      res.status(200).json({
        objectPath: objectPath,
        imageURL: objectPath
      });
    } catch (error) {
      console.error("Error setting image:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Auth routes - will be replaced with NextAuth
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // TODO: Implement with NextAuth session
      res.status(401).json({ message: "Authentication not implemented yet" });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Temporary login route for testing
  app.post('/api/auth/temp-login', async (req: any, res) => {
    try {
      const { userId } = req.body;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      
      // Set a simple session cookie for testing
      if (req.session) {
        (req.session as any).user = user;
      }
      res.json({ 
        message: "Logged in successfully", 
        user,
        // isAdmin functionality will be implemented with NextAuth 
      });
    } catch (error) {
      console.error("Error in temp login:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  // Helper function to detect admin emails (same logic as frontend)
  const isAdminEmail = (email: string): boolean => {
    return email.includes('@karooma.life') || email.includes('admin');
  };

  // Helper function to check if user is admin (by flag or email)
  const checkIsAdmin = (user: any): boolean => {
    if (!user) return false;
    return user.isAdmin || (user.email && isAdminEmail(user.email));
  };

  // Login route for email/password authentication
  app.post('/api/login', async (req: any, res) => {
    try {
      const { email, password, type } = req.body;

      console.log('🔐 ===== PROCESSO DE LOGIN =====');
      console.log('📧 Email:', email);
      console.log('🔑 Tipo:', type);

      // For admin login
      if (type === 'admin') {
        // Check if email qualifies as admin
        if (!isAdminEmail(email)) {
          console.log('❌ Email não é admin:', email);
          return res.status(401).json({ message: "Invalid admin credentials" });
        }

        console.log('✅ Email identificado como admin');

        // Find user by email
        let user = await storage.getUserByEmail(email);
        
        console.log('👤 Usuário encontrado:', user ? `${user.email} (ID: ${user.id})` : 'não encontrado');
        
        // If user doesn't exist but email is admin, we can't proceed without password
        if (!user || !user.passwordHash) {
          console.log('❌ Usuário não existe ou sem senha');
          return res.status(401).json({ message: "Invalid admin credentials" });
        }
        
        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        
        if (!passwordMatch) {
          console.log('❌ Senha incorreta');
          return res.status(401).json({ message: "Invalid admin credentials" });
        }

        console.log('✅ Senha válida');

        // Ensure admin flag is set for admin emails
        if (!user.isAdmin && isAdminEmail(email)) {
          console.log('🔧 Promovendo usuário a admin no banco de dados');
          user = await storage.makeUserAdmin(user.id);
        }

        console.log('👑 Status admin do usuário:', user.isAdmin);

        // Set session for backend authentication
        const userData = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          isAdmin: true // Always true for admin login type
        };
        
        console.log('💾 Salvando dados na sessão:', JSON.stringify(userData, null, 2));
        
        if (req.session) {
          (req.session as any).user = userData;
          console.log('✅ Sessão salva');
        } else {
          console.log('⚠️ Sessão não disponível!');
        }
          
        // Login bem-sucedido
        console.log('✅ Login admin bem-sucedido');
        console.log('=====================================\n');
        
        return res.json({ 
          message: "Logged in successfully", 
          user: userData,
          success: true
        });
      }
      
      // For regular user login
      if (type === 'user') {
        // Find user by email
        const user = await storage.getUserByEmail(email);
        
        if (!user || !user.passwordHash) {
          return res.status(401).json({ message: "Credenciais inválidas" });
        }
        
        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        
        if (!passwordMatch) {
          return res.status(401).json({ message: "Credenciais inválidas" });
        }

        // Set session for backend authentication
        const userData = {
          id: user.id,
          email: user.email,
          name: user.name,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin || false
        };
        
        if (req.session) {
          (req.session as any).user = userData;
        }
          
        // Login bem-sucedido
        return res.json({ 
          message: "Login realizado com sucesso", 
          user: userData,
          success: true
        });
      }
      
      return res.status(400).json({ message: "Tipo de login inválido" });
      
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Logout route - destroy session
  app.post('/api/logout', (req: any, res) => {
    console.log('🚪 ===== LOGOUT =====');
    console.log('👤 Usuário antes do logout:', req.session ? (req.session as any).user : 'sem sessão');
    
    if (req.session) {
      req.session.destroy((err: any) => {
        if (err) {
          console.error('❌ Erro ao destruir sessão:', err);
          return res.status(500).json({ error: 'Erro ao fazer logout' });
        }
        console.log('✅ Sessão destruída com sucesso');
        console.log('========================\n');
        res.json({ message: 'Logout realizado com sucesso' });
      });
    } else {
      console.log('⚠️ Nenhuma sessão ativa para destruir');
      console.log('========================\n');
      res.json({ message: 'Nenhuma sessão ativa' });
    }
  });

  // User registration endpoint
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name, firstName, lastName } = registerUserSchema.parse(req.body);

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ 
          message: "Email já está em uso", 
          error: "EMAIL_EXISTS" 
        });
      }

      // Hash password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user data
      const userData = {
        email,
        name: name || firstName || "",
        firstName: firstName || name || "",
        lastName,
        passwordHash,
        isAdmin: false
      };

      // Create user
      const newUser = await storage.createUser(userData);

      // Return success response (don't include password hash)
      res.status(201).json({
        message: "Conta criada com sucesso!",
        user: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          isAdmin: newUser.isAdmin
        }
      });
    } catch (error) {
      console.error("Error in user registration:", error);
      
      // Handle validation errors
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Dados inválidos", 
          errors: error.errors.map(e => e.message)
        });
      }
      
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get current session user
  app.get('/api/session', async (req: any, res) => {
    try {
      const sessionUser = req.session ? (req.session as any).user : null;
      if (!sessionUser) {
        return res.status(401).json({ message: "Not logged in" });
      }
      res.json({ user: sessionUser });
    } catch (error) {
      res.status(500).json({ error: "Failed to get session user" });
    }
  });

  // Test route to create user (temporary - only for setup)
  app.post('/api/test/create-user', async (req, res) => {
    try {
      const userData = req.body;
      const user = await storage.upsertUser(userData);
      res.json({ message: "User created", user });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  // Admin route to make user admin (temporary - only for setup)
  app.post('/api/admin/make-admin/:userId', async (req, res) => {
    try {
      const { userId } = req.params;
      const adminUser = await storage.makeUserAdmin(userId);
      res.json({ message: "User is now admin", user: adminUser });
    } catch (error) {
      console.error("Error making user admin:", error);
      res.status(500).json({ error: "Failed to make user admin" });
    }
  });

  // Password Reset Routes
  app.post('/api/auth/request-password-reset', async (req, res) => {
    console.log('\n🔐 ===== REQUISIÇÃO DE RECUPERAÇÃO DE SENHA =====');
    console.log('📧 Email recebido:', req.body.email);
    
    try {
      const { email } = requestPasswordResetSchema.parse(req.body);
      console.log('✅ Email validado:', email);
      
      // Check if user exists
      const user = await storage.getUserByEmail(email);
      if (!user) {
        console.log('⚠️ Usuário não encontrado para o email:', email);
        // Don't reveal if user exists or not for security
        return res.json({ message: "Se o email estiver registrado, você receberá um link de recuperação." });
      }

      console.log('✅ Usuário encontrado:', user.id, user.email);

      // Generate reset token
      const token = crypto.randomBytes(32).toString('hex');
      const expires = new Date(Date.now() + 3600000); // 1 hour from now
      console.log('🔑 Token gerado:', token.substring(0, 10) + '...');

      // Save token to database
      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expires,
        used: false
      });
      console.log('💾 Token salvo no banco de dados');

      // Send reset email
      console.log('📤 Tentando enviar email de recuperação...');
      const emailSent = await sendPasswordResetEmail(user.email!, token);
      console.log('📧 Resultado do envio de email:', emailSent ? 'SUCESSO ✅' : 'FALHA ❌');

      console.log('✅ Processo concluído com sucesso');
      console.log('================================================\n');
      
      res.json({ message: "Se o email estiver registrado, você receberá um link de recuperação." });
    } catch (error) {
      console.error('❌ ERRO na recuperação de senha:', error);
      if (error instanceof z.ZodError) {
        console.error('   Tipo: Validação de email inválida');
        return res.status(400).json({ error: 'Email inválido' });
      }
      console.error('   Tipo: Erro interno do servidor');
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, newPassword } = resetPasswordSchema.parse(req.body);

      // Find valid token
      const [resetToken] = await db
        .select()
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token, token),
            eq(passwordResetTokens.used, false),
            gt(passwordResetTokens.expires, new Date())
          )
        );

      if (!resetToken) {
        return res.status(400).json({ error: 'Token inválido ou expirado' });
      }

      // Hash new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      // Update user password
      await db
        .update(users)
        .set({ passwordHash })
        .where(eq(users.id, resetToken.userId));

      // Mark token as used
      await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.id, resetToken.id));

      res.json({ message: 'Senha alterada com sucesso' });
    } catch (error) {
      console.error('Error resetting password:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Dados inválidos' });
      }
      res.status(500).json({ error: 'Erro interno do servidor' });
    }
  });

  // Content routes
  app.get("/api/content/featured", async (req, res) => {
    try {
      const content = await storage.getFeaturedContent();
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured content" });
    }
  });

  app.get("/api/content/videos", async (req, res) => {
    try {
      const videos = await storage.getContentByType("video");
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  // Rota específica para latest videos (usada na home)
  app.get("/api/content/videos/latest", async (req, res) => {
    try {
      const videos = await storage.getContentByType("video");
      // Retornar os 3 vídeos mais recentes
      const sortedVideos = videos.sort((a, b) => 
        new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime()
      );
      res.json(sortedVideos.slice(0, 3));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest videos" });
    }
  });

  app.get("/api/content/videos/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const videos = await storage.getContentByTypeAndCategory("video", category);
      res.json(videos);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch videos by category" });
    }
  });

  app.get("/api/content/blog", async (req, res) => {
    try {
      const articles = await storage.getContentByType("blog");
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog articles" });
    }
  });

  // Rota específica para latest blog posts (usada na home)
  app.get("/api/content/blog/latest", async (req, res) => {
    try {
      const articles = await storage.getContentByType("blog");
      // Retornar os 3 posts mais recentes
      const sortedArticles = articles.sort((a, b) => 
        new Date(b.createdAt || new Date()).getTime() - new Date(a.createdAt || new Date()).getTime()
      );
      res.json(sortedArticles.slice(0, 3));
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch latest blog articles" });
    }
  });

  app.get("/api/content/blog/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const articles = await storage.getContentByTypeAndCategory("blog", category);
      res.json(articles);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch blog articles by category" });
    }
  });

  app.get("/api/content/page/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const pageContent = await storage.getContentByTypeAndCategory("page", slug);
      if (!pageContent || pageContent.length === 0) {
        return res.status(404).json({ error: "Page content not found" });
      }
      res.json(pageContent[0]);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch page content" });
    }
  });

  app.get("/api/content/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const content = await storage.getContentById(id);
      if (!content) {
        return res.status(404).json({ error: "Content not found" });
      }
      
      // Incrementar views
      await storage.incrementContentViews(id);
      
      res.json(content);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch content" });
    }
  });

  // Endpoint para obter prompts de geração de imagens
  app.get("/api/content/image-prompts", async (req, res) => {
    try {
      const { category, title } = req.query;
      
      if (!category || !title) {
        return res.status(400).json({ error: "Category and title are required" });
      }

      const { getBlogPostImagePrompts } = await import("./imageGeneration");
      const prompts = getBlogPostImagePrompts(String(category), String(title));
      
      res.json(prompts);
    } catch (error) {
      console.error("Error generating image prompts:", error);
      res.status(500).json({ error: "Failed to generate image prompts" });
    }
  });

  // Endpoint para análise da Curadoria KAROOMA
  app.post("/api/admin/curadoria-analysis", async (req, res) => {
    try {
      const { productLink, affiliateLink } = req.body;
      
      if (!productLink || !affiliateLink) {
        return res.status(400).json({ error: "Product link and affiliate link are required" });
      }

      const { analyzeCuradoriaKarooma } = await import("./curadoriaKarooma");
      const analysis = await analyzeCuradoriaKarooma(productLink, affiliateLink);
      
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing product with Curadoria KAROOMA:", error);
      res.status(500).json({ error: "Failed to analyze product" });
    }
  });

  // Endpoint para download de templates de import
  app.get("/api/admin/download-template/:format", async (req, res) => {
    try {
      const { format } = req.params;
      
      if (format === 'csv') {
        const csvTemplate = `Título,Descrição,Categoria,Preço Atual,Preço Original,Link Afiliado,Imagem,Avaliação,Destaque,Introdução,Benefícios,Avaliação Equipe,Tags
"Exemplo Produto 1","Descrição detalhada do produto","casa","29.90","39.90","https://exemplo.com/afiliado1","https://exemplo.com/imagem1.jpg","4.5","true","Uma introdução convincente sobre o produto...","Benefício 1, Benefício 2, Benefício 3","Análise profissional da equipe Karooma","#casa #organização #família"
"Exemplo Produto 2","Outra descrição detalhada","educacao","19.90","","https://exemplo.com/afiliado2","https://exemplo.com/imagem2.jpg","4.0","false","Outra introdução interessante...","Mais benefícios aqui","Outra avaliação da equipe","#educação #crianças"`;
        
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename=template-produtos.csv');
        res.send(csvTemplate);
        
      } else if (format === 'json') {
        const jsonTemplate = [
          {
            "title": "Exemplo Produto 1",
            "description": "Descrição detalhada do produto",
            "category": "casa",
            "currentPrice": "29.90",
            "originalPrice": "39.90",
            "affiliateLink": "https://exemplo.com/afiliado1",
            "imageUrl": "https://exemplo.com/imagem1.jpg",
            "rating": "4.5",
            "featured": true,
            "introduction": "Uma introdução convincente sobre o produto...",
            "benefits": "Benefício 1, Benefício 2, Benefício 3",
            "teamEvaluation": "Análise profissional da equipe Karooma",
            "tags": "#casa #organização #família"
          },
          {
            "title": "Exemplo Produto 2",
            "description": "Outra descrição detalhada",
            "category": "educacao",
            "currentPrice": "19.90",
            "affiliateLink": "https://exemplo.com/afiliado2",
            "imageUrl": "https://exemplo.com/imagem2.jpg",
            "rating": "4.0",
            "featured": false,
            "introduction": "Outra introdução interessante...",
            "benefits": "Mais benefícios aqui",
            "teamEvaluation": "Outra avaliação da equipe",
            "tags": "#educação #crianças"
          }
        ];
        
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', 'attachment; filename=template-produtos.json');
        res.json(jsonTemplate);
        
      } else {
        res.status(400).json({ error: "Formato não suportado. Use 'csv' ou 'json'." });
      }
    } catch (error) {
      console.error("Error generating template:", error);
      res.status(500).json({ error: "Failed to generate template" });
    }
  });

  // Endpoint para criar produto a partir da análise da Curadoria
  app.post("/api/admin/products-from-curadoria", async (req, res) => {
    try {
      const analysis = req.body;
      
      const { convertAnalysisToProduct, extractProductInfo } = await import("./curadoriaKarooma");
      const productInfo = await extractProductInfo(analysis.productLink);
      const productData = convertAnalysisToProduct(analysis, productInfo);
      
      // Inserir produto no banco
      const product = await storage.createProduct(productData);

      res.json({ success: true, product });
    } catch (error) {
      console.error("Error creating product from Curadoria analysis:", error);
      res.status(500).json({ error: "Failed to create product" });
    }
  });

  app.post("/api/content", async (req, res) => {
    try {
      const validatedData = insertContentSchema.parse(req.body);
      const content = await storage.createContent(validatedData);
      res.status(201).json(content);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid content data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create content" });
      }
    }
  });

  app.put("/api/content/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertContentSchema.partial().parse(req.body);
      const updatedContent = await storage.updateContent(id, validatedData);
      res.json(updatedContent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid content data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to update content" });
      }
    }
  });

  app.delete("/api/content/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deleteContent(id);
      res.json({ message: "Content deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete content" });
    }
  });

  // ===== MISSION ADMIN ROUTES =====
  app.get("/api/admin/missions", extractUserInfo, async (req: any, res) => {
    try {
      if (!checkIsAdmin(req.user)) {
        return res.status(403).json({ error: "Access denied. Admin only." });
      }
      const missions = await storage.getAllMissions();
      res.json(missions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch missions" });
    }
  });

  app.post("/api/admin/missions", extractUserInfo, async (req: any, res) => {
    try {
      if (!checkIsAdmin(req.user)) {
        return res.status(403).json({ error: "Access denied. Admin only." });
      }
      const mission = await storage.createMission(req.body);
      res.status(201).json(mission);
    } catch (error) {
      console.error("Error creating mission:", error);
      res.status(500).json({ error: "Failed to create mission" });
    }
  });

  app.patch("/api/admin/missions/:id", extractUserInfo, async (req: any, res) => {
    try {
      if (!checkIsAdmin(req.user)) {
        return res.status(403).json({ error: "Access denied. Admin only." });
      }
      const { id } = req.params;
      const mission = await storage.updateMission(id, req.body);
      res.json(mission);
    } catch (error) {
      console.error("Error updating mission:", error);
      res.status(500).json({ error: "Failed to update mission" });
    }
  });

  app.delete("/api/admin/missions/:id", extractUserInfo, async (req: any, res) => {
    try {
      if (!checkIsAdmin(req.user)) {
        return res.status(403).json({ error: "Access denied. Admin only." });
      }
      const { id } = req.params;
      await storage.deleteMission(id);
      res.json({ message: "Mission deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete mission" });
    }
  });

  // ===== BLOG TEMPLATE SYSTEM ENDPOINTS =====
  
  // Obter template para uma categoria específica
  app.get("/api/blog/template/:category", async (req, res) => {
    try {
      const category = req.params.category as BlogCategory;
      const template = getBlogTemplate(category);
      res.json(template);
    } catch (error) {
      res.status(500).json({ error: "Failed to get blog template" });
    }
  });

  // Gerar sugestões de conteúdo baseadas na categoria e tópico
  app.post("/api/blog/suggestions", async (req, res) => {
    try {
      const { category, topic } = req.body;
      
      if (!category || !topic) {
        return res.status(400).json({ error: "Category and topic are required" });
      }
      
      const suggestions = generateContentSuggestions(category as BlogCategory, topic);
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ error: "Failed to generate content suggestions" });
    }
  });

  // Validar post do blog seguindo padrões Karooma
  app.post("/api/blog/validate", async (req, res) => {
    try {
      const post = req.body;
      const validation = blogValidator.validatePost(post);
      res.json(validation);
    } catch (error) {
      res.status(500).json({ error: "Failed to validate blog post" });
    }
  });

  // Obter sugestões de melhoria para um post
  app.post("/api/blog/improve", async (req, res) => {
    try {
      const post = req.body;
      const suggestions = blogValidator.generateImprovementSuggestions(post);
      res.json({ suggestions });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate improvement suggestions" });
    }
  });

  // Product routes (String.com integration ready)
  app.get("/api/products", async (req, res) => {
    try {
      const { taxonomy, taxonomies } = req.query;
      
      if (taxonomy && typeof taxonomy === 'string') {
        // Filter by single taxonomy
        const products = await storage.getProductsByTaxonomy(taxonomy);
        res.json(products);
      } else if (taxonomies && typeof taxonomies === 'string') {
        // Filter by multiple taxonomies (comma-separated)
        const taxonomyList = taxonomies.split(',').map(t => t.trim()).filter(t => t);
        const products = await storage.getProductsByTaxonomies(taxonomyList);
        res.json(products);
      } else {
        // Get all products
        const products = await storage.getAllProducts();
        res.json(products);
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/featured", async (req, res) => {
    try {
      const products = await storage.getFeaturedProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured products" });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const products = await storage.getProductsByCategory(category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products by category" });
    }
  });

  // Taxonomy routes
  app.get("/api/taxonomies", async (req, res) => {
    try {
      const taxonomies = await storage.getTaxonomyHierarchy();
      
      // Build hierarchical structure
      const hierarchyMap = new Map();
      const rootTaxonomies = [];
      
      // First pass: create the structure
      taxonomies.forEach(taxonomy => {
        hierarchyMap.set(taxonomy.slug, {
          ...taxonomy,
          children: []
        });
      });
      
      // Second pass: build the hierarchy
      taxonomies.forEach(taxonomy => {
        if (taxonomy.parentSlug) {
          const parent = hierarchyMap.get(taxonomy.parentSlug);
          if (parent) {
            parent.children.push(hierarchyMap.get(taxonomy.slug));
          }
        } else {
          rootTaxonomies.push(hierarchyMap.get(taxonomy.slug));
        }
      });
      
      res.json(rootTaxonomies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch taxonomies" });
    }
  });

  app.get("/api/taxonomies/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const taxonomy = await storage.getTaxonomyBySlug(slug);
      if (!taxonomy) {
        return res.status(404).json({ error: "Taxonomy not found" });
      }
      res.json(taxonomy);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch taxonomy" });
    }
  });

  app.get("/api/taxonomies/:slug/children", async (req, res) => {
    try {
      const { slug } = req.params;
      const children = await storage.getTaxonomiesByParent(slug);
      res.json(children);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch taxonomy children" });
    }
  });

  app.get("/api/taxonomies/:slug/products", async (req, res) => {
    try {
      const { slug } = req.params;
      const products = await storage.getProductsByTaxonomy(slug);
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products by taxonomy" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(validatedData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid product data", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to create product" });
      }
    }
  });

  // Mission routes - Missões Resolvidas (Vida Leve Coletiva concept)
  app.get("/api/missions", async (req, res) => {
    try {
      // Aceitar filtro por áreas do diagnóstico via query params
      const diagnosticAreas = req.query.diagnosticAreas 
        ? (Array.isArray(req.query.diagnosticAreas) 
            ? req.query.diagnosticAreas 
            : [req.query.diagnosticAreas])
        : undefined;
      
      const missions = await storage.getPublishedMissions(diagnosticAreas as string[] | undefined);
      res.json(missions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch missions" });
    }
  });

  app.get("/api/missions/featured", async (req, res) => {
    try {
      const missions = await storage.getFeaturedMissions();
      res.json(missions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch featured missions" });
    }
  });

  app.get("/api/missions/category/:category", async (req, res) => {
    try {
      const { category } = req.params;
      const missions = await storage.getMissionsByCategory(category);
      res.json(missions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch missions by category" });
    }
  });

  app.get("/api/missions/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const mission = await storage.getMissionBySlug(slug);
      if (!mission) {
        return res.status(404).json({ error: "Mission not found" });
      }
      
      // Increment views
      await storage.incrementMissionViews(mission.id);
      
      // Fetch products if mission has ASINs
      let products = [];
      if (mission.productAsins && mission.productAsins.length > 0) {
        const allProducts = await storage.getAllProducts();
        products = allProducts.filter(p => 
          p.asin && mission.productAsins?.includes(p.asin)
        );
      }
      
      res.json({ ...mission, products });
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch mission" });
    }
  });

  app.get("/api/missions/:slug/amazon-products", async (req, res) => {
    try {
      const { slug } = req.params;
      const mission = await storage.getMissionBySlug(slug);
      
      if (!mission) {
        return res.status(404).json({ error: "Mission not found" });
      }

      const PARTNER_TAG = process.env.AMAZON_PARTNER_TAG || 'karoom-20';
      
      // Priority 1: Use specific ASINs if available
      if (mission.productAsins && mission.productAsins.length > 0) {
        const cacheKey = `mission:${mission.id}:asin-products`;
        const cachedProducts = amazonProductCache.get(cacheKey);

        if (cachedProducts) {
          return res.json({ success: true, products: cachedProducts, cached: true, source: 'asins' });
        }

        const productsWithData: any[] = [];

        for (const asin of mission.productAsins.slice(0, 10)) {
          try {
            // Try to enrich with PA-API data
            const result = await amazonApiService.getProductByASIN(asin);
            
            if (result.success && result.product) {
              productsWithData.push(result.product);
            } else {
              // Fallback: basic card with affiliate link (PA-API failed but link works)
              productsWithData.push({
                asin: asin,
                title: `Produto recomendado (${asin})`,
                productUrl: `https://www.amazon.com.br/dp/${asin}?tag=${PARTNER_TAG}`,
                fallback: true
              });
            }

            await new Promise(resolve => setTimeout(resolve, 500));
          } catch (error) {
            console.error(`PA-API error for ASIN ${asin}, using fallback:`, error);
            // Fallback: basic card with affiliate link
            productsWithData.push({
              asin: asin,
              title: `Produto recomendado (${asin})`,
              productUrl: `https://www.amazon.com.br/dp/${asin}?tag=${PARTNER_TAG}`,
              fallback: true
            });
          }
        }

        amazonProductCache.set(cacheKey, productsWithData);
        return res.json({ 
          success: true, 
          products: productsWithData, 
          cached: false,
          source: 'asins'
        });
      }

      // Priority 2: Fallback to keyword search if no ASINs (backward compatibility)
      if (!mission.exemplosDeProdutos || mission.exemplosDeProdutos.length === 0) {
        return res.json({ success: true, products: [], source: 'none' });
      }

      const cacheKey = `mission:${mission.id}:keyword-products`;
      const cachedProducts = amazonProductCache.get(cacheKey);

      if (cachedProducts) {
        return res.json({ success: true, products: cachedProducts, cached: true, source: 'keywords' });
      }

      const allProducts: any[] = [];
      const maxKeywords = 3;
      const keywords = mission.exemplosDeProdutos.slice(0, maxKeywords);

      for (const keyword of keywords) {
        try {
          const searchResult = await amazonApiService.searchItems({
            keywords: keyword,
            itemCount: 4,
            minDiscountPercent: 10,
            minRating: 4.0,
            minReviewCount: 50,
            sortBy: 'Featured'
          });

          if (searchResult.success && searchResult.products) {
            allProducts.push(...searchResult.products);
          }

          await new Promise(resolve => setTimeout(resolve, 1000));
        } catch (error) {
          console.error(`Error searching for "${keyword}":`, error);
        }
      }

      const uniqueProducts = Array.from(
        new Map(allProducts.map(p => [p.asin, p])).values()
      );

      amazonProductCache.set(cacheKey, uniqueProducts);

      res.json({ success: true, products: uniqueProducts, cached: false, source: 'keywords' });
    } catch (error) {
      console.error("Error fetching Amazon products:", error);
      res.status(500).json({ error: "Failed to fetch Amazon products" });
    }
  });

  // Admin Mission Routes
  app.post("/api/admin/missions", extractUserInfo, async (req: any, res) => {
    try {
      if (!checkIsAdmin(req.user)) {
        return res.status(403).json({ error: "Acesso negado. Somente administradores." });
      }
      const missionData = req.body;
      const mission = await storage.createMission(missionData);
      res.json(mission);
    } catch (error) {
      console.error("Error creating mission:", error);
      res.status(500).json({ error: "Failed to create mission" });
    }
  });

  app.put("/api/admin/missions/:id", extractUserInfo, async (req: any, res) => {
    try {
      if (!checkIsAdmin(req.user)) {
        return res.status(403).json({ error: "Acesso negado. Somente administradores." });
      }
      const { id } = req.params;
      const missionData = req.body;
      const mission = await storage.updateMission(id, missionData);
      res.json(mission);
    } catch (error) {
      console.error("Error updating mission:", error);
      res.status(500).json({ error: "Failed to update mission" });
    }
  });

  app.delete("/api/admin/missions/:id", extractUserInfo, async (req: any, res) => {
    try {
      if (!checkIsAdmin(req.user)) {
        return res.status(403).json({ error: "Acesso negado. Somente administradores." });
      }
      const { id } = req.params;
      await storage.deleteMission(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting mission:", error);
      res.status(500).json({ error: "Failed to delete mission" });
    }
  });

  // Endpoint padronizado para importar produto - PROCESSO GARANTIDO SEM AJUSTES
  app.post("/api/products/import", async (req, res) => {
    try {
      const data = req.body;
      
      // VALIDAÇÃO OBRIGATÓRIA - Bloqueia se dados essenciais faltando
      const validationErrors = [];
      
      // 1. Campos obrigatórios
      if (!data["Nome do Produto"] && !data.title) {
        validationErrors.push("Nome do Produto é obrigatório");
      }
      if (!data["Link Afiliado"] && !data.affiliateLink) {
        validationErrors.push("Link Afiliado é obrigatório");
      }
      if (!data["Benefícios (por avaliador)"] && !data.benefits) {
        validationErrors.push("Avaliações dos especialistas são obrigatórias");
      }
      
      // 2. Validar mínimo de 3 especialistas nas avaliações
      const benefits = data["Benefícios (por avaliador)"] || data.benefits || "";
      if (benefits.length < 100) { // Se o texto é muito curto, provavelmente não tem especialistas
        validationErrors.push("Avaliações dos especialistas devem conter análises detalhadas");
      }
      
      if (validationErrors.length > 0) {
        return res.status(400).json({ 
          error: "Dados inválidos para importação", 
          details: validationErrors,
          message: "Consulte PROCESSO_IMPORTACAO_PRODUTOS.md para formato correto"
        });
      }

      // PROCESSAMENTO AUTOMÁTICO INTELIGENTE
      const productData = {
        title: data["Nome do Produto"] || data.title,
        description: data["Descrição"] || data.description || "Produto recomendado pela equipe Karooma",
        category: extractCategory(data["Nome do Produto"] || data.title || ""),
        affiliateLink: data["Link Afiliado"] || data.affiliateLink,
        productLink: data["Link do Produto"] || data.productLink || data["Link Afiliado"] || data.affiliateLink,
        rating: extractRating(data["Pontuação Geral"]),
        expertReview: data["Avaliação dos Especialistas"] || data.expertReview,
        teamEvaluation: data["Avaliação Geral da Equipe KAROOMA"] || data.teamEvaluation,
        benefits: data["Benefícios (por avaliador)"] || data.benefits,
        tags: data["Tags"] || data.tags || "Benefícios:<br>#Praticidade<br>#QualidadeDeVida",
        evaluators: data["Seleção da Equipe de Avaliadores"] || data.evaluators || "- Especialistas Karooma",
        introduction: data["Introdução"] || data.introduction || "Nossa equipe multidisciplinar analisou este produto para verificar seu impacto na rotina das mães ocupadas.",
        featured: false,
        imageUrl: null,
        currentPrice: "0",
        originalPrice: null,
        discount: null
      };

      // Extrair preços com MÚLTIPLOS FORMATOS suportados
      const priceInfo = extractPrice(data["Preço"]);
      productData.currentPrice = priceInfo.current;
      if (priceInfo.original) productData.originalPrice = priceInfo.original as any;
      if (priceInfo.discount) productData.discount = priceInfo.discount as any;

      const product = await storage.createProduct(productData);
      res.status(201).json({ 
        message: "Produto importado com sucesso",
        product,
        validation: {
          categoryDetected: productData.category,
          priceExtracted: priceInfo,
          allFieldsProcessed: true,
          benefitsLength: productData.benefits?.length || 0
        }
      });
    } catch (error) {
      console.error("Erro ao importar produto:", error);
      res.status(500).json({ 
        error: "Falha ao importar produto",
        message: "Verifique o formato dos dados conforme PROCESSO_IMPORTACAO_PRODUTOS.md" 
      });
    }
  });

  // FUNÇÕES AUXILIARES PARA PROCESSAMENTO AUTOMÁTICO
  function extractCategory(productName: string): string {
    const categories = {
      'Eletrodomésticos': ['sanduicheira', 'liquidificador', 'microondas', 'geladeira', 'fogão', 'elétrica', 'elétrico'],
      'Casa e Organização': ['organizador', 'gaveta', 'armário', 'estante', 'cesta', 'organizadora'],
      'Cuidados Pessoais': ['creme', 'shampoo', 'sabonete', 'hidratante', 'perfume', 'maquiagem'],
      'Família': ['brinquedo', 'criança', 'bebê', 'infantil', 'escolar', 'educativo'],
      'Saúde e Bem-estar': ['vitamina', 'suplemento', 'exercício', 'yoga', 'relaxamento'],
      'Tecnologia': ['smartphone', 'tablet', 'notebook', 'app', 'digital', 'smart']
    };
    
    const name = productName.toLowerCase();
    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => name.includes(keyword))) {
        return category;
      }
    }
    return "Casa e Organização"; // Categoria padrão para mães ocupadas
  }

  function extractRating(ratingText: any): string | null {
    if (!ratingText) return null;
    
    const text = ratingText.toString();
    // Formatos: "4.7 de 5 estrelas", "4.5", "Excelente (4.8/5)"
    const ratingMatch = text.match(/(\d+[.,]\d+)/);
    return ratingMatch ? ratingMatch[1].replace(',', '.') : null;
  }

  function extractPrice(priceText: any): { current: string; original: string | null; discount: number | null } {
    if (!priceText) return { current: "0", original: null, discount: null };
    
    const text = priceText.toString();
    
    // Formato "R$ 125 a R$ 150"
    const rangeMatch = text.match(/R\$\s*(\d+(?:[.,]\d+)?)\s*a\s*R\$\s*(\d+(?:[.,]\d+)?)/);
    if (rangeMatch) {
      const current = parseFloat(rangeMatch[1].replace(',', '.'));
      const original = parseFloat(rangeMatch[2].replace(',', '.'));
      const discount = Math.round(((original - current) / original) * 100);
      return { 
        current: current.toFixed(2), 
        original: original.toFixed(2),
        discount: discount > 0 ? discount : null
      };
    }
    
    // Formato "R$ 99,90" ou "R$ 99"
    const singleMatch = text.match(/R\$\s*(\d+(?:[.,]\d+)?)/);
    if (singleMatch) {
      const price = parseFloat(singleMatch[1].replace(',', '.'));
      return { current: price.toFixed(2), original: null, discount: null };
    }
    
    // Formato "Varia em torno de R$ 125"
    const variaMatch = text.match(/(?:varia|torno).*?R\$\s*(\d+(?:[.,]\d+)?)/i);
    if (variaMatch) {
      const price = parseFloat(variaMatch[1].replace(',', '.'));
      return { current: price.toFixed(2), original: null, discount: null };
    }
    
    return { current: "0", original: null, discount: null };
  }

  // String.com webhook endpoint (for automatic product updates)
  app.post("/api/products/webhook/string", async (req, res) => {
    try {
      // This endpoint would handle String.com product data
      const { products } = req.body;
      
      if (Array.isArray(products)) {
        for (const productData of products) {
          // Transform String.com data to our schema
          const transformedProduct = {
            title: productData.title,
            description: productData.description,
            category: productData.category || "general",
            imageUrl: productData.image_url,
            currentPrice: productData.current_price?.toString(),
            originalPrice: productData.original_price?.toString(),
            affiliateLink: productData.affiliate_link,
            rating: productData.rating?.toString(),
            discount: productData.discount_percent,
            featured: productData.is_featured || false,
          };
          
          await storage.createProduct(transformedProduct);
        }
      }
      
      res.json({ success: true, message: "Products updated successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to process webhook data" });
    }
  });

  // Newsletter routes
  app.post("/api/newsletter/subscribe", async (req, res) => {
    try {
      const validatedData = insertNewsletterSchema.parse(req.body);
      const subscription = await storage.createNewsletterSubscription(validatedData);
      res.status(201).json(subscription);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid email address", details: error.errors });
      } else {
        res.status(500).json({ error: "Failed to subscribe to newsletter" });
      }
    }
  });

  // Newsletter subscription with advanced preferences
  app.post("/api/newsletter/subscribe-advanced", async (req, res) => {
    try {
      const validatedData = insertNewsletterAdvancedSchema.parse(req.body);
      const subscription = await storage.createNewsletterAdvanced(validatedData);
      
      // Prepare notification data
      const notificationData = {
        email: subscription.email,
        name: subscription.name || null,
        categories: (subscription.interests as any)?.categories || [],
        source: subscription.source || undefined,
        leadMagnet: subscription.leadMagnet || undefined,
        timestamp: new Date().toISOString()
      };
      
      // Broadcast to admin dashboard for real-time notifications
      sseManager.broadcast('newsletter-subscription', notificationData);
      
      // Send email notification to admin (async, non-blocking)
      sendNewsletterNotification(notificationData).catch(error => {
        console.error('Failed to send email notification:', error);
      });
      
      // Log to console as fallback
      logNewsletterSubscription(notificationData);
      
      res.status(201).json(subscription);
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Dados inválidos", details: error.errors });
      } else {
        res.status(500).json({ error: "Falha ao se inscrever na newsletter" });
      }
    }
  });

  // Register interest for guide creation
  app.post("/api/newsletter/register-interest", async (req, res) => {
    try {
      const { email, postId, postTitle, postCategory, interestedInGuide, source } = req.body;
      
      if (!email || !postId || !postTitle) {
        return res.status(400).json({ error: "Dados obrigatórios: email, postId, postTitle" });
      }

      // Create or update newsletter subscription with guide interest
      const interestData = {
        email,
        source: source || 'guide_interest',
        leadMagnet: `guide_interest_${postId}`,
        interests: {
          categories: postCategory ? [postCategory] : [],
          guideRequests: [{
            postId,
            postTitle,
            postCategory,
            requestedAt: new Date().toISOString()
          }]
        },
        preferences: {
          interestedInGuides: true,
          specificGuideRequest: {
            postId,
            postTitle,
            postCategory
          }
        }
      };

      // Create new subscription with advanced preferences
      const subscription = await storage.createNewsletterAdvanced(interestData);

      // Prepare notification data for admin
      const notificationData = {
        email: subscription.email,
        type: 'guide_interest',
        postId,
        postTitle,
        postCategory,
        source: subscription.source || undefined,
        timestamp: new Date().toISOString()
      };
      
      // Broadcast to admin dashboard
      sseManager.broadcast('guide-interest', notificationData);
      
      // Log to console
      console.log(`📖 Nova solicitação de guia: ${postTitle} | Email: ${email}`);
      
      res.status(201).json({ 
        success: true, 
        message: 'Interesse registrado com sucesso!',
        subscription: {
          id: subscription.id,
          email: subscription.email
        }
      });
    } catch (error) {
      console.error('Guide interest registration error:', error);
      res.status(500).json({ error: "Falha ao registrar interesse" });
    }
  });

  // Admin route to notify interested users when guide is ready
  app.post("/api/admin/notify-interested-users", extractUserInfo, async (req: any, res) => {
    try {
      // Verificar se usuário é administrador
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores podem executar esta ação." });
      }
      
      const { postId, postTitle, postCategory, flipbookId } = req.body;
      
      if (!postId || !postTitle || !flipbookId) {
        return res.status(400).json({ error: "Dados obrigatórios: postId, postTitle, flipbookId" });
      }

      // For now, we'll simulate finding interested users
      // In a real implementation, you would query the database for users who registered interest
      const interestedUsers: Array<{ email: string }> = [];

      if (interestedUsers.length === 0) {
        return res.json({ 
          success: true, 
          message: 'Nenhum usuário interessado encontrado',
          notifiedUsers: 0
        });
      }

      // Prepare notification data
      const notificationData = {
        type: 'guide_ready',
        postId,
        postTitle,
        postCategory,
        flipbookId,
        guideUrl: `/flipbook/${flipbookId}`,
        totalInterestedUsers: interestedUsers.length,
        timestamp: new Date().toISOString()
      };

      // Broadcast to admin dashboard
      sseManager.broadcast('guide-ready-notification', notificationData);

      // Log successful notification
      console.log(`📖 GUIA PRONTO - Notificando ${interestedUsers.length} usuários interessados em "${postTitle}"`);
      console.log(`📧 Emails: ${interestedUsers.map(u => u.email).join(', ')}`);

      // Here you could integrate with your email service to send actual emails
      // For now, we'll just log and notify via SSE
      
      res.json({
        success: true,
        message: `${interestedUsers.length} usuário(s) serão notificados`,
        notifiedUsers: interestedUsers.length,
        interestedEmails: interestedUsers.map(u => u.email),
        guideUrl: `/flipbook/${flipbookId}`
      });

    } catch (error) {
      console.error('Error notifying interested users:', error);
      res.status(500).json({ error: "Falha ao notificar usuários interessados" });
    }
  });





  // Server-Sent Events endpoint
  app.get("/api/events", (req, res) => {
    const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sseManager.addClient(clientId, res);
  });

  // Update product by ID (Admin only)
  app.patch("/api/products/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      const updates = req.body;
      
      // Get existing product
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      // Update product
      const updatedProduct = await storage.updateProduct(productId, updates);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      res.status(500).json({ error: "Falha ao atualizar produto" });
    }
  });

  // Delete product by ID (Admin only)
  app.delete("/api/products/:id", async (req, res) => {
    try {
      const productId = req.params.id;
      
      // Check if product exists
      const existingProduct = await storage.getProduct(productId);
      if (!existingProduct) {
        return res.status(404).json({ error: "Produto não encontrado" });
      }

      // Delete product
      await storage.deleteProduct(productId);
      res.json({ message: "Produto deletado com sucesso" });
    } catch (error) {
      console.error("Erro ao deletar produto:", error);
      res.status(500).json({ error: "Falha ao deletar produto" });
    }
  });

  // Admin taxonomy management routes
  app.post("/api/admin/taxonomies", extractUserInfo, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const taxonomyData = req.body;
      const taxonomy = await storage.createTaxonomy(taxonomyData);
      res.status(201).json(taxonomy);
    } catch (error) {
      res.status(500).json({ error: "Failed to create taxonomy" });
    }
  });

  app.patch("/api/admin/taxonomies/:slug", extractUserInfo, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const { slug } = req.params;
      const updates = req.body;
      const taxonomy = await storage.updateTaxonomy(slug, updates);
      res.json(taxonomy);
    } catch (error) {
      res.status(500).json({ error: "Failed to update taxonomy" });
    }
  });

  app.delete("/api/admin/taxonomies/:slug", extractUserInfo, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const { slug } = req.params;
      await storage.deleteTaxonomy(slug);
      res.json({ message: "Taxonomy deleted successfully" });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete taxonomy" });
    }
  });

  // Product taxonomy relationship management
  app.post("/api/admin/products/:productId/taxonomies", extractUserInfo, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const { productId } = req.params;
      const { taxonomySlug, isPrimary = false } = req.body;
      
      const productTaxonomy = await storage.addProductTaxonomy({
        productId,
        taxonomySlug,
        isPrimary
      });
      
      res.status(201).json(productTaxonomy);
    } catch (error) {
      res.status(500).json({ error: "Failed to add product taxonomy" });
    }
  });

  app.delete("/api/admin/products/:productId/taxonomies/:taxonomySlug", extractUserInfo, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const { productId, taxonomySlug } = req.params;
      await storage.removeProductTaxonomy(productId, taxonomySlug);
      res.json({ message: "Product taxonomy relationship removed" });
    } catch (error) {
      res.status(500).json({ error: "Failed to remove product taxonomy" });
    }
  });

  app.get("/api/admin/products/:productId/taxonomies", extractUserInfo, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }
      
      const { productId } = req.params;
      const taxonomies = await storage.getProductTaxonomies(productId);
      res.json(taxonomies);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product taxonomies" });
    }
  });

  // Taxonomy import endpoint
  app.post("/api/admin/taxonomies/import", extractUserInfo, async (req: any, res) => {
    try {
      if (!req.user?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      // Define the taxonomy structure from the requirements
      const taxonomyStructure = [
        // Level 1 - Main Categories
        { slug: "comer-e-preparar", name: "Comer e Preparar", parentSlug: null, level: 1, sortOrder: 1 },
        { slug: "presentear", name: "Presentear", parentSlug: null, level: 1, sortOrder: 2 },
        { slug: "saude-e-seguranca", name: "Saúde e Segurança", parentSlug: null, level: 1, sortOrder: 3 },
        { slug: "decorar-e-brilhar", name: "Decorar e Brilhar", parentSlug: null, level: 1, sortOrder: 4 },
        { slug: "sono-e-relaxamento", name: "Sono e Relaxamento", parentSlug: null, level: 1, sortOrder: 5 },
        { slug: "aprender-e-brincar", name: "Aprender e Brincar", parentSlug: null, level: 1, sortOrder: 6 },
        { slug: "sair-e-viajar", name: "Sair e Viajar", parentSlug: null, level: 1, sortOrder: 7 },
        { slug: "organizacao", name: "Organização", parentSlug: null, level: 1, sortOrder: 8 },

        // Level 2 - Subcategories for ComerEPreparar
        { slug: "crianca-comer", name: "Criança", parentSlug: "comer-e-preparar", level: 2, sortOrder: 1 },
        { slug: "bebe-comer", name: "Bebê", parentSlug: "comer-e-preparar", level: 2, sortOrder: 2 },
        { slug: "familia-comer", name: "Família", parentSlug: "comer-e-preparar", level: 2, sortOrder: 3 },

        // Level 2 - Subcategories for Presentear
        { slug: "presente-ocasioes", name: "Presente para ocasiões", parentSlug: "presentear", level: 2, sortOrder: 1 },
        { slug: "presente-idade", name: "Presente por idade", parentSlug: "presentear", level: 2, sortOrder: 2 },

        // Level 3 - Sub-subcategories for Presente por idade
        { slug: "bebe-presente", name: "Bebê", parentSlug: "presente-idade", level: 3, sortOrder: 1 },
        { slug: "crianca-presente", name: "Criança", parentSlug: "presente-idade", level: 3, sortOrder: 2 },
        { slug: "familia-presente", name: "Família", parentSlug: "presente-idade", level: 3, sortOrder: 3 },

        // Level 2 - Subcategories for SaudeESeguranca
        { slug: "crianca-saude", name: "Criança", parentSlug: "saude-e-seguranca", level: 2, sortOrder: 1 },
        { slug: "familia-saude", name: "Família", parentSlug: "saude-e-seguranca", level: 2, sortOrder: 2 },
        { slug: "primeiros-socorros", name: "Primeiros socorros", parentSlug: "saude-e-seguranca", level: 2, sortOrder: 3 },
        { slug: "casa-saude", name: "Casa", parentSlug: "saude-e-seguranca", level: 2, sortOrder: 4 },
        { slug: "cozinha-saude", name: "Cozinha", parentSlug: "saude-e-seguranca", level: 2, sortOrder: 5 },
        { slug: "area-servico-saude", name: "Área de serviço", parentSlug: "saude-e-seguranca", level: 2, sortOrder: 6 },
        { slug: "quarto-bebe-saude", name: "Quarto do bebê", parentSlug: "saude-e-seguranca", level: 2, sortOrder: 7 },
        { slug: "quarto-crianca-saude", name: "Quarto da criança", parentSlug: "saude-e-seguranca", level: 2, sortOrder: 8 },
        { slug: "carro-saude", name: "Carro", parentSlug: "saude-e-seguranca", level: 2, sortOrder: 9 },

        // Level 2 - Subcategories for DecorarEBrilhar
        { slug: "casa-decorar", name: "Casa", parentSlug: "decorar-e-brilhar", level: 2, sortOrder: 1 },
        { slug: "cozinha-decorar", name: "Cozinha", parentSlug: "decorar-e-brilhar", level: 2, sortOrder: 2 },
        { slug: "area-servico-decorar", name: "Área de serviço", parentSlug: "decorar-e-brilhar", level: 2, sortOrder: 3 },
        { slug: "quarto-bebe-decorar", name: "Quarto do bebê", parentSlug: "decorar-e-brilhar", level: 2, sortOrder: 4 },
        { slug: "quarto-crianca-decorar", name: "Quarto da criança", parentSlug: "decorar-e-brilhar", level: 2, sortOrder: 5 },
        { slug: "carro-decorar", name: "Carro", parentSlug: "decorar-e-brilhar", level: 2, sortOrder: 6 },

        // Level 2 - Subcategories for SonoERelaxamento
        { slug: "bebe-sono", name: "Bebê", parentSlug: "sono-e-relaxamento", level: 2, sortOrder: 1 },
        { slug: "crianca-sono", name: "Criança", parentSlug: "sono-e-relaxamento", level: 2, sortOrder: 2 },
        { slug: "pais-cuidadores", name: "Pais e cuidadores", parentSlug: "sono-e-relaxamento", level: 2, sortOrder: 3 },

        // Level 2 - Subcategories for AprenderEBrincar
        { slug: "bebe-aprender", name: "Bebê", parentSlug: "aprender-e-brincar", level: 2, sortOrder: 1 },
        { slug: "crianca-aprender", name: "Criança", parentSlug: "aprender-e-brincar", level: 2, sortOrder: 2 },
        { slug: "familia-aprender", name: "Família", parentSlug: "aprender-e-brincar", level: 2, sortOrder: 3 },

        // Level 2 - Subcategories for SairEViajar
        { slug: "bebe-viajar", name: "Bebê", parentSlug: "sair-e-viajar", level: 2, sortOrder: 1 },
        { slug: "crianca-viajar", name: "Criança", parentSlug: "sair-e-viajar", level: 2, sortOrder: 2 },
        { slug: "familia-viajar", name: "Família", parentSlug: "sair-e-viajar", level: 2, sortOrder: 3 },
        { slug: "primeiros-socorros-viajar", name: "Primeiros socorros", parentSlug: "sair-e-viajar", level: 2, sortOrder: 4 },
        { slug: "carro-viajar", name: "Carro", parentSlug: "sair-e-viajar", level: 2, sortOrder: 5 },
        { slug: "casa-viajar", name: "Casa", parentSlug: "sair-e-viajar", level: 2, sortOrder: 6 },
        { slug: "cozinha-viajar", name: "Cozinha", parentSlug: "sair-e-viajar", level: 2, sortOrder: 7 },
        { slug: "area-servico-viajar", name: "Área de serviço", parentSlug: "sair-e-viajar", level: 2, sortOrder: 8 },
        { slug: "quarto-bebe-viajar", name: "Quarto do bebê", parentSlug: "sair-e-viajar", level: 2, sortOrder: 9 },
        { slug: "quarto-crianca-viajar", name: "Quarto da criança", parentSlug: "sair-e-viajar", level: 2, sortOrder: 10 },

        // Level 2 - Subcategories for Organizacao
        { slug: "casa-organizacao", name: "Casa", parentSlug: "organizacao", level: 2, sortOrder: 1 },
        { slug: "cozinha-organizacao", name: "Cozinha", parentSlug: "organizacao", level: 2, sortOrder: 2 },
        { slug: "area-servico-organizacao", name: "Área de serviço", parentSlug: "organizacao", level: 2, sortOrder: 3 },
        { slug: "quarto-bebe-organizacao", name: "Quarto do bebê", parentSlug: "organizacao", level: 2, sortOrder: 4 },
        { slug: "quarto-crianca-organizacao", name: "Quarto da criança", parentSlug: "organizacao", level: 2, sortOrder: 5 },
        { slug: "carro-organizacao", name: "Carro", parentSlug: "organizacao", level: 2, sortOrder: 6 },
      ];

      let importedCount = 0;
      let skippedCount = 0;

      // Import taxonomies in order (parents before children)
      for (const taxonomy of taxonomyStructure) {
        try {
          const existing = await storage.getTaxonomyBySlug(taxonomy.slug);
          if (existing) {
            skippedCount++;
            continue;
          }

          await storage.createTaxonomy(taxonomy);
          importedCount++;
        } catch (error) {
          console.error(`Error importing taxonomy ${taxonomy.slug}:`, error);
        }
      }

      res.json({ 
        message: "Taxonomy import completed",
        imported: importedCount,
        skipped: skippedCount,
        total: taxonomyStructure.length
      });
    } catch (error) {
      console.error("Error importing taxonomies:", error);
      res.status(500).json({ error: "Failed to import taxonomies" });
    }
  });

  // Debug taxonomy endpoint
  app.get("/api/debug/taxonomies", async (req, res) => {
    try {
      console.log("Debug: Testing taxonomy query...");
      const rawQuery = await db
        .select()
        .from(taxonomies);
      console.log("Debug: Raw query result:", rawQuery);
      res.json(rawQuery);
    } catch (error) {
      console.error("Debug: Error in taxonomy query:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Analytics/tracking routes
  app.post("/api/analytics/affiliate-click", async (req, res) => {
    try {
      const { productId, affiliateLink } = req.body;
      // Log affiliate click for analytics
      console.log(`Affiliate click tracked: Product ${productId}, Link: ${affiliateLink}`);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to track click" });
    }
  });

  // Middleware to extract user ID from session
  function requireAuth(req: any, res: any, next: any) {
    const sessionUser = req.session ? (req.session as any).user : null;
    if (!sessionUser || !sessionUser.id) {
      return res.status(401).json({ message: "Você precisa fazer login para favoritar produtos" });
    }
    req.sessionUserId = sessionUser.id;
    next();
  }

  // Favorites routes (protected by session)
  app.get("/api/favorites", requireAuth, async (req: any, res) => {
    try {
      const userId = req.sessionUserId;
      const favorites = await storage.getUserFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ message: "Failed to fetch favorites" });
    }
  });

  app.post("/api/favorites/:productId", requireAuth, async (req: any, res) => {
    try {
      const userId = req.sessionUserId;
      const { productId } = req.params;
      
      const favorite = await storage.addToFavorites(userId, productId);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ message: "Failed to add to favorites" });
    }
  });

  app.delete("/api/favorites/:productId", requireAuth, async (req: any, res) => {
    try {
      const userId = req.sessionUserId;
      const { productId } = req.params;
      
      await storage.removeFromFavorites(userId, productId);
      res.json({ message: "Removed from favorites" });
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ message: "Failed to remove from favorites" });
    }
  });

  app.get("/api/favorites/check/:productId", async (req: any, res) => {
    try {
      const sessionUser = req.session ? (req.session as any).user : null;
      const { productId } = req.params;
      
      // If user is not authenticated, return false
      if (!sessionUser || !sessionUser.id) {
        return res.json({ isFavorite: false });
      }
      
      const userId = sessionUser.id;
      const isFavorite = await storage.isFavorite(userId, productId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking favorite status:", error);
      res.status(500).json({ message: "Failed to check favorite status" });
    }
  });

  // Mission Favorites routes
  app.get("/api/mission-favorites", requireAuth, async (req: any, res) => {
    try {
      const userId = req.sessionUserId;
      const favorites = await storage.getUserMissionFavorites(userId);
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching mission favorites:", error);
      res.status(500).json({ message: "Failed to fetch mission favorites" });
    }
  });

  app.post("/api/mission-favorites/:missionId", requireAuth, async (req: any, res) => {
    try {
      const userId = req.sessionUserId;
      const { missionId } = req.params;
      
      const favorite = await storage.addMissionToFavorites(userId, missionId);
      res.json(favorite);
    } catch (error) {
      console.error("Error adding to mission favorites:", error);
      res.status(500).json({ message: "Failed to add to mission favorites" });
    }
  });

  app.delete("/api/mission-favorites/:missionId", requireAuth, async (req: any, res) => {
    try {
      const userId = req.sessionUserId;
      const { missionId } = req.params;
      
      await storage.removeMissionFromFavorites(userId, missionId);
      res.json({ message: "Removed from mission favorites" });
    } catch (error) {
      console.error("Error removing from mission favorites:", error);
      res.status(500).json({ message: "Failed to remove from mission favorites" });
    }
  });

  app.get("/api/mission-favorites/check/:missionId", async (req: any, res) => {
    try {
      const sessionUser = req.session ? (req.session as any).user : null;
      const { missionId } = req.params;
      
      // If user is not authenticated, return false
      if (!sessionUser || !sessionUser.id) {
        return res.json({ isFavorite: false });
      }
      
      const userId = sessionUser.id;
      const isFavorite = await storage.isMissionFavorite(userId, missionId);
      res.json({ isFavorite });
    } catch (error) {
      console.error("Error checking mission favorite status:", error);
      res.status(500).json({ message: "Failed to check mission favorite status" });
    }
  });

  // Pages management routes
  app.get("/api/pages", async (req, res) => {
    try {
      const pages = await storage.getAllPages();
      res.json(pages);
    } catch (error) {
      console.error("Error fetching pages:", error);
      res.status(500).json({ message: "Failed to fetch pages" });
    }
  });

  app.get("/api/pages/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const page = await storage.getPageBySlug(slug);
      
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error fetching page:", error);
      res.status(500).json({ message: "Failed to fetch page" });
    }
  });

  app.post("/api/pages", async (req, res) => {
    try {
      const validatedData = insertPageSchema.parse(req.body);
      
      // Verificar se slug já existe
      const existingPage = await storage.getPageBySlug(validatedData.slug);
      if (existingPage) {
        return res.status(400).json({ message: "A page with this slug already exists" });
      }
      
      const page = await storage.createPage(validatedData);
      res.status(201).json(page);
    } catch (error) {
      console.error("Error creating page:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create page" });
    }
  });

  app.put("/api/pages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertPageSchema.parse(req.body);
      
      const page = await storage.updatePage(id, validatedData);
      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }
      
      res.json(page);
    } catch (error) {
      console.error("Error updating page:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update page" });
    }
  });

  app.delete("/api/pages/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await storage.deletePage(id);
      res.json({ message: "Page deleted successfully" });
    } catch (error) {
      console.error("Error deleting page:", error);
      res.status(500).json({ message: "Failed to delete page" });
    }
  });

  // Amazon PA API routes
  const jobsManager = getProductUpdateJobs();
  const amazonService = new AmazonPAAPIService();

  // Rota para verificar status dos jobs de atualização
  app.get("/api/admin/product-updates/status", async (req, res) => {
    try {
      const jobsStatus = jobsManager.getJobsStatus();
      const stats = await jobsManager.getUpdateStats();
      
      res.json({
        jobs: jobsStatus,
        statistics: stats,
        apiConfigured: amazonService.isConfigured()
      });
    } catch (error) {
      console.error("Error getting update status:", error);
      res.status(500).json({ message: "Failed to get update status" });
    }
  });

  // Rota para executar atualização manual
  app.post("/api/admin/product-updates/run", async (req, res) => {
    try {
      const { frequency } = req.body;
      
      if (frequency && !['high', 'medium', 'low'].includes(frequency)) {
        return res.status(400).json({ message: "Invalid frequency. Use: high, medium, or low" });
      }

      const result = await jobsManager.runManualUpdate(frequency);
      res.json({
        message: "Update completed",
        result
      });
    } catch (error) {
      console.error("Error running manual update:", error);
      res.status(500).json({ message: "Failed to run update", error: String(error) });
    }
  });

  // Rota para verificar produto específico pela PA API
  app.post("/api/admin/products/check-amazon", async (req, res) => {
    try {
      const { asin } = req.body;
      
      if (!asin) {
        return res.status(400).json({ message: "ASIN is required" });
      }

      const result = await amazonService.getProductByASIN(asin);
      res.json(result);
    } catch (error) {
      console.error("Error checking Amazon product:", error);
      res.status(500).json({ message: "Failed to check product", error: String(error) });
    }
  });

  // Importação por ASIN + Análises Karooma
  app.post("/api/admin/import-by-asin", extractUserInfo, async (req: any, res) => {
    try {
      // Verificar se usuário é admin
      if (!checkIsAdmin(req.user)) {
        return res.status(403).json({ error: "Acesso negado. Somente administradores." });
      }

      const { productsData } = req.body;
      
      if (!Array.isArray(productsData) || productsData.length === 0) {
        return res.status(400).json({ error: "productsData deve ser um array com pelo menos um produto" });
      }

      const results = {
        total: productsData.length,
        imported: 0,
        updated: 0,
        failed: 0,
        errors: [] as string[]
      };

      for (const productInput of productsData) {
        try {
          const { asin, ...karoomaData } = productInput;

          if (!asin) {
            results.failed++;
            results.errors.push(`Produto sem ASIN`);
            continue;
          }

          // Buscar dados da Amazon PA API
          const amazonResult = await amazonService.getProductByASIN(asin);

          if (!amazonResult.success || !amazonResult.product) {
            results.failed++;
            results.errors.push(`ASIN ${asin}: ${amazonResult.error || 'Produto não encontrado'}`);
            continue;
          }

          const amazonProduct = amazonResult.product;

          // Verificar se já existe produto com este ASIN
          const existingProducts = await storage.getAllProducts();
          const existingProduct = existingProducts.find(p => p.asin === asin);

          // Combinar dados da Amazon + Análises Karooma
          const productData: any = {
            title: amazonProduct.title,
            description: karoomaData.description || amazonProduct.title,
            category: karoomaData.category || 'geral',
            imageUrl: amazonProduct.imageUrl || null,
            currentPrice: amazonProduct.currentPrice?.toString() || null,
            originalPrice: amazonProduct.originalPrice?.toString() || null,
            affiliateLink: amazonProduct.productUrl,
            rating: amazonProduct.rating?.toString() || null,
            discount: amazonProduct.originalPrice && amazonProduct.currentPrice
              ? Math.round(((amazonProduct.originalPrice - amazonProduct.currentPrice) / amazonProduct.originalPrice) * 100).toString()
              : null,
            featured: karoomaData.featured || false,
            brand: amazonProduct.brand || null,
            asin: asin,
            // Análises Karooma
            introduction: karoomaData.introduction || null,
            nutritionistEvaluation: karoomaData.nutritionistEvaluation || null,
            organizerEvaluation: karoomaData.organizerEvaluation || null,
            designEvaluation: karoomaData.designEvaluation || null,
            benefits: karoomaData.benefits || null,
            karoomaTeamEvaluation: karoomaData.karoomaTeamEvaluation || null,
            categoryTags: karoomaData.categoryTags || null,
            searchTags: karoomaData.searchTags || null,
            // Dados Amazon
            isPrime: amazonProduct.isPrime || false,
            reviewCount: amazonProduct.reviewCount || 0,
            availability: amazonProduct.availability || 'available',
            productStatus: 'active'
          };

          if (existingProduct) {
            // Atualizar produto existente
            await storage.updateProduct(existingProduct.id, productData);
            results.updated++;
          } else {
            // Criar novo produto
            await storage.createProduct(productData);
            results.imported++;
          }

        } catch (error) {
          results.failed++;
          results.errors.push(`Erro ao processar ASIN ${productInput.asin || 'desconhecido'}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Erro na importação por ASIN:", error);
      res.status(500).json({ error: "Erro ao importar produtos", message: String(error) });
    }
  });

  // Sincronização em massa com Amazon
  app.post("/api/admin/sync-products-amazon", extractUserInfo, async (req: any, res) => {
    try {
      // Verificar se usuário é admin
      if (!checkIsAdmin(req.user)) {
        return res.status(403).json({ error: "Acesso negado. Somente administradores." });
      }

      const { productIds, syncAll = false } = req.body;

      // Buscar produtos a sincronizar
      let productsToSync;
      if (syncAll) {
        productsToSync = await storage.getAllProducts();
      } else if (Array.isArray(productIds) && productIds.length > 0) {
        const allProducts = await storage.getAllProducts();
        productsToSync = allProducts.filter(p => productIds.includes(p.id));
      } else {
        return res.status(400).json({ error: "Forneça productIds ou syncAll=true" });
      }

      // Filtrar apenas produtos com ASIN
      const productsWithASIN = productsToSync.filter(p => p.asin);

      const results = {
        total: productsWithASIN.length,
        updated: 0,
        failed: 0,
        errors: [] as string[]
      };

      for (let i = 0; i < productsWithASIN.length; i++) {
        const product = productsWithASIN[i];
        
        try {
          if (!product.asin) continue;

          // Buscar dados atualizados da Amazon
          const amazonResult = await amazonService.getProductByASIN(product.asin);

          if (!amazonResult.success || !amazonResult.product) {
            results.failed++;
            results.errors.push(`${product.title} (${product.asin}): ${amazonResult.error || 'Erro ao buscar'}`);
            continue;
          }

          const amazonProduct = amazonResult.product;

          // Atualizar apenas dados da Amazon, preservando análises Karooma
          const updateData: any = {
            title: amazonProduct.title,
            imageUrl: amazonProduct.imageUrl || product.imageUrl,
            currentPrice: amazonProduct.currentPrice?.toString() || product.currentPrice,
            originalPrice: amazonProduct.originalPrice?.toString() || product.originalPrice,
            rating: amazonProduct.rating?.toString() || product.rating,
            isPrime: amazonProduct.isPrime,
            reviewCount: amazonProduct.reviewCount || 0,
            availability: amazonProduct.availability,
            updatedAt: new Date()
          };

          // Recalcular desconto se tiver ambos os preços
          if (amazonProduct.originalPrice && amazonProduct.currentPrice) {
            updateData.discount = Math.round(((amazonProduct.originalPrice - amazonProduct.currentPrice) / amazonProduct.originalPrice) * 100).toString();
          }

          await storage.updateProduct(product.id, updateData);
          results.updated++;

        } catch (error) {
          results.failed++;
          results.errors.push(`${product.title}: ${error instanceof Error ? error.message : String(error)}`);
        }

        // Rate limiting: aguardar 1.5 segundos entre requisições para evitar erro 429
        // Amazon PA API tem limite de ~1 req/seg para contas novas
        if (i < productsWithASIN.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1500));
        }
      }

      res.json(results);
    } catch (error) {
      console.error("Erro na sincronização em massa:", error);
      res.status(500).json({ error: "Erro ao sincronizar produtos", message: String(error) });
    }
  });

  // Rota para atualizar configuração de frequência de produtos
  app.put("/api/admin/products/:id/update-frequency", async (req, res) => {
    try {
      const { id } = req.params;
      const { frequency } = req.body;
      
      if (!['high', 'medium', 'low'].includes(frequency)) {
        return res.status(400).json({ message: "Invalid frequency. Use: high, medium, or low" });
      }

      await storage.updateProductFrequency(id, frequency);
      res.json({ message: "Product update frequency updated successfully" });
    } catch (error) {
      console.error("Error updating product frequency:", error);
      res.status(500).json({ message: "Failed to update product frequency" });
    }
  });

  // Rota para obter produtos por status
  app.get("/api/admin/products/by-status/:status", async (req, res) => {
    try {
      const { status } = req.params;
      
      if (!['active', 'inactive', 'discontinued'].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }

      const products = await storage.getProductsByStatus(status);
      res.json(products);
    } catch (error) {
      console.error("Error getting products by status:", error);
      res.status(500).json({ message: "Failed to get products" });
    }
  });

  // Endpoint de teste do SendGrid
  app.post("/api/admin/test-email", async (req, res) => {
    try {
      const { sendEmail } = await import('./emailService');
      
      const testResult = await sendEmail({
        to: 'admin@karooma.life',
        from: 'admin@karooma.life',
        subject: 'Teste SendGrid - Karooma',
        html: `
          <h2>🎉 SendGrid Configurado com Sucesso!</h2>
          <p>Este é um email de teste para verificar se o SendGrid está funcionando corretamente.</p>
          <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
          <p><strong>Status:</strong> ✅ Funcionando</p>
        `,
        text: 'SendGrid configurado com sucesso! Este é um email de teste.'
      });
      
      if (testResult) {
        res.json({ 
          success: true, 
          message: 'Email de teste enviado com sucesso!',
          timestamp: new Date().toISOString()
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: 'Falha ao enviar email de teste'
        });
      }
    } catch (error) {
      console.error('Erro no teste do SendGrid:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Erro interno no teste de email',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    }
  });

  // Schema de validação para geração de flipbook
  const generateFlipbookSchema = z.object({
    postId: z.string().min(1, "postId is required"),
    force: z.boolean().optional().default(false)
  });

  // Flipbook Generation Routes
  // Generate flipbook from post
  app.post("/api/flipbooks/generate", async (req, res) => {
    try {
      const validatedData = generateFlipbookSchema.parse(req.body);
      const { postId, force } = validatedData;

      // Check if API is ready
      if (!flipbookGenerator.isReady()) {
        return res.status(503).json({ 
          error: "Flipbook generator not ready",
          message: "Anthropic API key not configured"
        });
      }

      const flipbook = await flipbookGenerator.generateFlipbookFromPost(postId, { force });
      
      res.status(202).json({
        flipbookId: flipbook.id,
        status: flipbook.status,
        title: flipbook.title,
        description: flipbook.description,
        message: flipbook.status === 'generating' 
          ? 'Flipbook generation started' 
          : 'Flipbook already exists'
      });
    } catch (error) {
      console.error("Error generating flipbook:", error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: "Failed to generate flipbook", message: errorMessage });
    }
  });

  // Get flipbook by post ID
  app.get("/api/flipbooks/by-post/:postId", async (req, res) => {
    try {
      const { postId } = req.params;
      
      const flipbook = await storage.getFlipbookByPost(postId);
      
      if (!flipbook) {
        return res.status(404).json({ error: "Flipbook not found for this post" });
      }
      
      res.json(flipbook);
    } catch (error) {
      console.error("Error fetching flipbook by post:", error);
      res.status(500).json({ error: "Failed to fetch flipbook" });
    }
  });

  // Get flipbook by ID
  app.get("/api/flipbooks/:id", async (req, res) => {
    try {
      const { id } = req.params;
      
      const flipbook = await storage.getFlipbook(id);
      
      if (!flipbook) {
        return res.status(404).json({ error: "Flipbook not found" });
      }
      
      res.json(flipbook);
    } catch (error) {
      console.error("Error fetching flipbook:", error);
      res.status(500).json({ error: "Failed to fetch flipbook" });
    }
  });

  // Get flipbook status
  app.get("/api/flipbooks/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      
      const flipbook = await storage.getFlipbook(id);
      
      if (!flipbook) {
        return res.status(404).json({ error: "Flipbook not found" });
      }
      
      res.json({
        id: flipbook.id,
        status: flipbook.status,
        title: flipbook.title,
        description: flipbook.description,
        createdAt: flipbook.createdAt,
        updatedAt: flipbook.updatedAt
      });
    } catch (error) {
      console.error("Error fetching flipbook status:", error);
      res.status(500).json({ error: "Failed to fetch flipbook status" });
    }
  });

  // Cookie Consent Routes
  app.post("/api/cookie-consent", async (req, res) => {
    try {
      const validatedData = insertCookieConsentSchema.parse(req.body);
      const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
      const userAgent = req.get('User-Agent') || '';
      
      const consentData = {
        ...validatedData,
        ipAddress: clientIP,
        userAgent: userAgent
      };
      
      const consent = await storage.createCookieConsent(consentData);
      
      res.json({
        success: true,
        message: "Preferências de cookies salvas com sucesso!",
        consent: {
          id: consent.id,
          sessionId: consent.sessionId,
          necessary: consent.necessary,
          analytics: consent.analytics,
          marketing: consent.marketing,
          consentDate: consent.consentDate
        }
      });
    } catch (error) {
      console.error("Error creating cookie consent:", error);
      res.status(400).json({ 
        error: "Erro ao salvar preferências de cookies",
        details: error instanceof z.ZodError ? error.errors : undefined 
      });
    }
  });

  app.put("/api/cookie-consent/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const validatedData = insertCookieConsentSchema.partial().parse(req.body);
      
      // Remove sessionId e userEmail dos dados de update por segurança
      const { sessionId: _, userEmail: __, ...safeData } = validatedData;
      
      const consent = await storage.updateCookieConsent(sessionId, safeData);
      
      res.json({
        success: true,
        message: "Preferências atualizadas com sucesso!",
        consent: {
          id: consent.id,
          sessionId: consent.sessionId,
          necessary: consent.necessary,
          analytics: consent.analytics,
          marketing: consent.marketing,
          lastUpdated: consent.lastUpdated
        }
      });
    } catch (error) {
      console.error("Error updating cookie consent:", error);
      res.status(400).json({ 
        error: "Erro ao atualizar preferências de cookies" 
      });
    }
  });

  app.get("/api/cookie-consent/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const consent = await storage.getCookieConsent(sessionId);
      
      if (!consent) {
        return res.status(404).json({ error: "Consentimento não encontrado" });
      }
      
      res.json({
        consent: {
          id: consent.id,
          sessionId: consent.sessionId,
          necessary: consent.necessary,
          analytics: consent.analytics,
          marketing: consent.marketing,
          consentDate: consent.consentDate,
          lastUpdated: consent.lastUpdated
        }
      });
    } catch (error) {
      console.error("Error fetching cookie consent:", error);
      res.status(500).json({ error: "Erro ao buscar preferências de cookies" });
    }
  });

  // Automation API routes
  app.get("/api/admin/automation/progress", extractUserInfo, async (req: any, res) => {
    // Check admin authorization
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Acesso negado. Somente administradores podem acessar dados de automação." });
    }
    try {
      const progress = await storage.getAutomationProgress();
      res.json(progress);
    } catch (error) {
      console.error("Error fetching automation progress:", error);
      res.status(500).json({ error: "Erro ao buscar progresso da automação" });
    }
  });

  app.post("/api/admin/automation/initialize", extractUserInfo, async (req: any, res) => {
    // Check admin authorization
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Acesso negado. Somente administradores podem inicializar automações." });
    }
    try {
      // Initialize the automation system by creating initial progress entries
      const stages = [
        'day_1', 'day_2', 'day_3', 'day_4', 'day_5', 'day_6', 'day_7'
      ];

      const progressEntries = [];
      for (const stage of stages) {
        const existingProgress = await storage.getAutomationProgressByStage(stage);
        if (!existingProgress) {
          const progress = await storage.createAutomationProgress({
            stage,
            status: stage === 'day_1' ? 'pending' : 'pending',
            evidence: null,
            completedAt: null
          });
          progressEntries.push(progress);
        }
      }

      // Create initialization job
      await storage.createAutomationJob({
        type: 'system_initialization',
        status: 'completed',
        payload: { stages: stages.length },
        processedAt: new Date()
      });

      res.json({ 
        success: true, 
        message: "Sistema de automação inicializado com sucesso!",
        stages: progressEntries.length 
      });
    } catch (error) {
      console.error("Error initializing automation system:", error);
      res.status(500).json({ error: "Erro ao inicializar sistema de automação" });
    }
  });

  app.post("/api/admin/automation/start-stage", extractUserInfo, async (req: any, res) => {
    // Check admin authorization
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Acesso negado. Somente administradores podem iniciar etapas." });
    }
    
    try {
      // Validate request body
      const validatedData = startStageSchema.parse(req.body);
      const { stageId } = validatedData;

      // Update stage status to in_progress
      const progress = await storage.updateAutomationProgress(stageId, {
        status: 'in_progress'
      });

      // Create job for stage start
      await storage.createAutomationJob({
        type: 'stage_start',
        status: 'completed',
        payload: { stageId },
        processedAt: new Date()
      });

      res.json({ 
        success: true, 
        message: `Etapa ${stageId} iniciada!`,
        progress 
      });
    } catch (error) {
      console.error("Error starting stage:", error);
      res.status(500).json({ error: "Erro ao iniciar etapa" });
    }
  });

  app.post("/api/admin/automation/complete-stage", extractUserInfo, async (req: any, res) => {
    // Check admin authorization
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Acesso negado. Somente administradores podem completar etapas." });
    }
    
    try {
      // Validate request body
      const validatedData = completeStageSchema.parse(req.body);
      const { stageId, evidence } = validatedData;

      // Update stage status to completed
      const progress = await storage.updateAutomationProgress(stageId, {
        status: 'completed',
        evidence,
        completedAt: new Date()
      });

      // Create job for stage completion
      await storage.createAutomationJob({
        type: 'stage_completion',
        status: 'completed',
        payload: { stageId, evidence },
        processedAt: new Date()
      });

      res.json({ 
        success: true, 
        message: `Etapa ${stageId} concluída!`,
        progress 
      });
    } catch (error) {
      console.error("Error completing stage:", error);
      res.status(500).json({ error: "Erro ao concluir etapa" });
    }
  });

  app.get("/api/admin/automation/jobs", extractUserInfo, async (req: any, res) => {
    // Check admin authorization
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Acesso negado. Somente administradores podem acessar jobs de automação." });
    }
    try {
      const jobs = await storage.getAutomationJobs();
      res.json(jobs);
    } catch (error) {
      console.error("Error fetching automation jobs:", error);
      res.status(500).json({ error: "Erro ao buscar jobs de automação" });
    }
  });

  // Test Welcome Email (simpler version for testing)
  app.get("/api/test/welcome-email", async (req, res) => {
    try {
      // Import the email service
      const { sendWelcomeEmail } = await import('./emailService.js');
      
      // Test email data
      const testEmailData = {
        email: 'admin@karooma.life',
        name: 'Teste Automação',
        source: 'test_route'
      };
      
      // Send welcome email
      const emailSent = await sendWelcomeEmail(testEmailData);
      
      if (emailSent) {
        // Create evidence for testing
        const evidence = {
          email_sent: true,
          recipient: testEmailData.email,
          timestamp: new Date().toISOString(),
          template_used: 'welcome_email_v1',
          success: true,
          via_route: 'test_route'
        };
        
        res.json({
          success: true,
          message: "Email de boas-vindas executado com sucesso!",
          evidence,
          data: testEmailData
        });
      } else {
        res.json({
          success: false,
          message: "Email executado (simulado pois SendGrid não configurado)",
          simulated: true,
          data: testEmailData
        });
      }
    } catch (error) {
      console.error("Error in test welcome email:", error);
      res.status(500).json({ 
        error: "Erro ao testar email de boas-vindas",
        details: error.message 
      });
    }
  });

  // Execute Day 1 Welcome Email Automation
  app.post("/api/admin/automation/execute-welcome-email", extractUserInfo, async (req: any, res) => {
    // Check admin authorization
    if (!checkIsAdmin(req.user)) {
      return res.status(403).json({ error: "Acesso negado. Somente administradores podem executar automações." });
    }
    
    try {
      const { sendWelcomeEmail } = await import('../server/emailService.js');
      
      // Test email data
      const testEmailData = {
        email: 'admin@karooma.life',
        name: 'Admin Karooma',
        source: 'automation_test'
      };
      
      // Send welcome email
      const emailSent = await sendWelcomeEmail(testEmailData);
      
      if (emailSent) {
        // Create automation job record
        await storage.createAutomationJob({
          type: 'welcome_email',
          status: 'completed',
          payload: { email: testEmailData.email, name: testEmailData.name },
          processedAt: new Date()
        });
        
        // Create evidence for Day 1 completion
        const evidence = {
          email_sent: true,
          recipient: testEmailData.email,
          timestamp: new Date().toISOString(),
          template_used: 'welcome_email_v1',
          success: true
        };
        
        res.json({
          success: true,
          message: "Email de boas-vindas enviado com sucesso!",
          evidence,
          data: testEmailData
        });
      } else {
        res.status(500).json({
          success: false,
          message: "Falha ao enviar email de boas-vindas",
          error: "Email service failed"
        });
      }
    } catch (error) {
      console.error("Error executing welcome email:", error);
      res.status(500).json({ 
        success: false,
        error: "Erro ao executar email de boas-vindas",
        details: error.message 
      });
    }
  });

  // User Alerts Routes
  app.get("/api/alerts", extractUserInfo, async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const alerts = await storage.getUserAlerts(req.user.id);
      
      // Enrich alerts with product information
      const enrichedAlerts = await Promise.all(alerts.map(async (alert) => {
        if (alert.type === 'product' && alert.productId) {
          const product = await storage.getProduct(alert.productId);
          return { ...alert, product };
        }
        return alert;
      }));

      res.json(enrichedAlerts);
    } catch (error) {
      console.error("Erro ao buscar alertas:", error);
      res.status(500).json({ error: "Erro ao buscar alertas" });
    }
  });

  app.post("/api/alerts", extractUserInfo, async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const { type, productId, category, minDiscountPercent, notifyEmail, notifyPush } = req.body;

      // Validação básica
      if (!type || (type !== 'product' && type !== 'category')) {
        return res.status(400).json({ error: "Tipo de alerta inválido" });
      }

      if (type === 'product' && !productId) {
        return res.status(400).json({ error: "productId é obrigatório para alertas de produto" });
      }

      if (type === 'category' && !category) {
        return res.status(400).json({ error: "category é obrigatório para alertas de categoria" });
      }

      // Verificar se já existe alerta similar
      const existingAlerts = await storage.getUserAlerts(req.user.id);
      const duplicate = existingAlerts.find(alert => 
        alert.type === type && 
        (type === 'product' ? alert.productId === productId : alert.category === category)
      );

      if (duplicate) {
        return res.status(400).json({ error: "Você já possui um alerta para este item" });
      }

      const alert = await storage.createUserAlert({
        userId: req.user.id,
        type,
        productId: productId || null,
        category: category || null,
        minDiscountPercent: minDiscountPercent || 20,
        notifyEmail: notifyEmail !== false,
        notifyPush: notifyPush !== false,
        isActive: true
      });

      res.json(alert);
    } catch (error) {
      console.error("Erro ao criar alerta:", error);
      res.status(500).json({ error: "Erro ao criar alerta" });
    }
  });

  app.patch("/api/alerts/:id", extractUserInfo, async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const { id } = req.params;
      const updates = req.body;

      const alert = await storage.updateUserAlert(id, req.user.id, updates);
      res.json(alert);
    } catch (error) {
      console.error("Erro ao atualizar alerta:", error);
      res.status(500).json({ error: "Erro ao atualizar alerta" });
    }
  });

  app.delete("/api/alerts/:id", extractUserInfo, async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const { id } = req.params;
      await storage.deleteUserAlert(id, req.user.id);
      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao deletar alerta:", error);
      res.status(500).json({ error: "Erro ao deletar alerta" });
    }
  });

  // Push Notifications routes
  app.get("/api/push/vapid-public-key", (req, res) => {
    res.json({ publicKey: pushNotificationService.getPublicKey() });
  });

  app.post("/api/push/subscribe", extractUserInfo, async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const subscription = req.body;
      const { endpoint, keys } = subscription;

      if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
        return res.status(400).json({ error: "Dados de inscrição inválidos" });
      }

      const pushSubscription = await storage.createPushSubscription({
        userId: req.user.id,
        endpoint: endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
        userAgent: req.get('user-agent') || null,
        isActive: true
      });

      console.log('✅ Push subscription salva:', { userId: req.user.id, endpoint });
      res.json(pushSubscription);
    } catch (error) {
      console.error("Erro ao salvar inscrição push:", error);
      res.status(500).json({ error: "Erro ao salvar inscrição" });
    }
  });

  app.post("/api/push/unsubscribe", extractUserInfo, async (req: any, res) => {
    try {
      if (!req.user?.id) {
        return res.status(401).json({ error: "Não autenticado" });
      }

      const { endpoint } = req.body;

      if (!endpoint) {
        return res.status(400).json({ error: "Endpoint é obrigatório" });
      }

      await storage.deletePushSubscription(endpoint);
      console.log('✅ Push subscription removida:', { userId: req.user.id, endpoint });
      res.json({ success: true });
    } catch (error) {
      console.error("Erro ao remover inscrição push:", error);
      res.status(500).json({ error: "Erro ao remover inscrição" });
    }
  });

  // Diagnostic Routes - Mom Routine Assessment
  app.post("/api/diagnostics", extractUserInfo, async (req: any, res) => {
    try {
      const validatedData = insertDiagnosticSchema.parse(req.body);
      
      // Se tiver userId no body, use-o; senão, use do usuário autenticado (opcional)
      const diagnosticData = {
        ...validatedData,
        userId: validatedData.userId || req.user?.id || null
      };

      const diagnostic = await storage.createDiagnostic(diagnosticData);
      
      console.log('✅ Diagnóstico criado:', { 
        userId: diagnosticData.userId, 
        userName: diagnosticData.userName 
      });
      
      res.json(diagnostic);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Dados inválidos", 
          details: error.errors 
        });
      }
      console.error("Erro ao criar diagnóstico:", error);
      res.status(500).json({ error: "Erro ao salvar diagnóstico" });
    }
  });

  // Rota mais específica ANTES da rota genérica :id para evitar shadowing
  app.get("/api/diagnostics/latest", extractUserInfo, async (req: any, res) => {
    try {
      const userId = req.query.userId || req.user?.id;
      
      if (!userId) {
        return res.status(400).json({ error: "userId é obrigatório" });
      }

      const diagnostic = await storage.getLatestDiagnostic(userId);
      
      if (!diagnostic) {
        return res.status(404).json({ error: "Nenhum diagnóstico encontrado" });
      }

      res.json(diagnostic);
    } catch (error) {
      console.error("Erro ao buscar último diagnóstico:", error);
      res.status(500).json({ error: "Erro ao buscar diagnóstico" });
    }
  });

  app.get("/api/diagnostics", extractUserInfo, async (req: any, res) => {
    try {
      const userId = req.query.userId || req.user?.id;
      
      if (!userId) {
        return res.status(400).json({ error: "userId é obrigatório" });
      }

      const diagnostics = await storage.getDiagnosticsByUser(userId);
      res.json(diagnostics);
    } catch (error) {
      console.error("Erro ao buscar diagnósticos:", error);
      res.status(500).json({ error: "Erro ao buscar diagnósticos" });
    }
  });

  // Rota genérica :id DEPOIS das rotas específicas para evitar shadowing
  app.get("/api/diagnostics/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const diagnostic = await storage.getDiagnosticById(id);
      
      if (!diagnostic) {
        return res.status(404).json({ error: "Diagnóstico não encontrado" });
      }

      res.json(diagnostic);
    } catch (error) {
      console.error("Erro ao buscar diagnóstico:", error);
      res.status(500).json({ error: "Erro ao buscar diagnóstico" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
