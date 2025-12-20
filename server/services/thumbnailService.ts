import sharp from 'sharp';
import { objectStorageClient, ObjectStorageService } from '../objectStorage';
import { setObjectAclPolicy } from '../objectAcl';
import { randomUUID } from 'crypto';

interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
}

const DEFAULT_THUMBNAIL_OPTIONS: ThumbnailOptions = {
  width: 400,
  height: 300,
  quality: 80,
};

export class ThumbnailService {
  private objectStorageService: ObjectStorageService;

  constructor() {
    this.objectStorageService = new ObjectStorageService();
  }

  /**
   * Gera thumbnail de uma imagem a partir de sua URL
   * @param imageUrl URL da imagem original (pode ser URL completa ou path /objects/...)
   * @param options Opções de redimensionamento
   * @returns URL da thumbnail gerada
   */
  async generateThumbnail(
    imageUrl: string,
    options: ThumbnailOptions = DEFAULT_THUMBNAIL_OPTIONS
  ): Promise<string> {
    try {
      const { width, height, quality } = { ...DEFAULT_THUMBNAIL_OPTIONS, ...options };

      // Baixar a imagem original
      const imageBuffer = await this.downloadImage(imageUrl);

      // Gerar thumbnail com Sharp
      const thumbnailBuffer = await sharp(imageBuffer)
        .resize(width, height, {
          fit: 'cover',
          position: 'center',
        })
        .jpeg({ quality: quality || 80 })
        .toBuffer();

      // Fazer upload da thumbnail
      const thumbnailUrl = await this.uploadThumbnail(thumbnailBuffer, imageUrl);

      return thumbnailUrl;
    } catch (error) {
      console.error('Erro ao gerar thumbnail:', error);
      throw error;
    }
  }

  /**
   * Baixa uma imagem a partir de sua URL
   */
  private async downloadImage(imageUrl: string): Promise<Buffer> {
    // Se for path interno do Object Storage (/objects/...)
    if (imageUrl.startsWith('/objects/')) {
      const objectFile = await this.objectStorageService.getObjectEntityFile(imageUrl);
      const [buffer] = await objectFile.download();
      return buffer;
    }

    // Se for URL completa do Google Cloud Storage
    if (imageUrl.includes('storage.googleapis.com')) {
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/').filter(p => p);
      const bucketName = pathParts[0];
      const objectName = pathParts.slice(1).join('/');
      
      const bucket = objectStorageClient.bucket(bucketName);
      const file = bucket.file(objectName);
      const [buffer] = await file.download();
      return buffer;
    }

    // Se for URL externa, fazer fetch
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Erro ao baixar imagem: ${response.status}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  /**
   * Faz upload da thumbnail para o Object Storage
   * Usa o mesmo diretório de uploads que as imagens originais
   */
  private async uploadThumbnail(buffer: Buffer, originalUrl: string): Promise<string> {
    let privateObjectDir = this.objectStorageService.getPrivateObjectDir();
    
    // Garantir que não termina com /
    if (privateObjectDir.endsWith('/')) {
      privateObjectDir = privateObjectDir.slice(0, -1);
    }
    
    // Gerar nome único para a thumbnail (uploads/thumb_xxx para manter consistência)
    const thumbnailId = `thumb_${randomUUID()}`;
    const fullPath = `${privateObjectDir}/uploads/${thumbnailId}.jpg`;

    // Parse do path para obter bucket e object name
    const pathWithSlash = fullPath.startsWith('/') ? fullPath : `/${fullPath}`;
    const pathParts = pathWithSlash.split('/').filter(p => p);
    const bucketName = pathParts[0];
    const objectName = pathParts.slice(1).join('/');

    // Upload para o bucket
    const bucket = objectStorageClient.bucket(bucketName);
    const file = bucket.file(objectName);

    await file.save(buffer, {
      contentType: 'image/jpeg',
      metadata: {
        originalUrl: originalUrl,
      },
    });

    // Configurar como público usando mesma política que imagens normais
    await setObjectAclPolicy(file, {
      owner: 'admin-karooma',
      visibility: 'public',
    });

    // Retornar path normalizado (consistente com getObjectEntityFile)
    // O path deve corresponder ao que getObjectEntityFile espera: /objects/{entityId}
    // onde entityId = uploads/thumb_xxx.jpg
    return `/objects/uploads/${thumbnailId}.jpg`;
  }

  /**
   * Gera URL da thumbnail a partir da URL original
   * Se a thumbnail já existir, retorna a URL existente
   * Se não existir, retorna null
   */
  async getThumbnailUrl(originalUrl: string): Promise<string | null> {
    // Implementação futura para cache de thumbnails
    return null;
  }

  /**
   * Gera thumbnail e retorna tanto a URL original quanto a thumbnail
   */
  async processImage(
    imageUrl: string,
    options?: ThumbnailOptions
  ): Promise<{ original: string; thumbnail: string }> {
    const thumbnailUrl = await this.generateThumbnail(imageUrl, options);
    return {
      original: imageUrl,
      thumbnail: thumbnailUrl,
    };
  }
}

export const thumbnailService = new ThumbnailService();
