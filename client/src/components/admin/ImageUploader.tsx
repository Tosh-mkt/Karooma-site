import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import imageCompression from "browser-image-compression";

interface ImageUploaderProps {
  onImageInserted: (markdown: string) => void;
  className?: string;
}

/**
 * Componente para upload de imagens que serão inseridas no editor de markdown.
 * Permite fazer upload de imagens do computador e insere automaticamente o markdown da imagem.
 * Comprime automaticamente imagens grandes antes do upload.
 */
export function ImageUploader({ onImageInserted, className }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações
    if (file.size > 7.5 * 1024 * 1024) { // 7.5MB
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 7,5MB.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de imagem.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    
    let fileToUpload: File = file;
    const originalSize = file.size;
    
    // Comprimir imagem se for maior que 1MB
    if (file.size > 1 * 1024 * 1024) {
      try {
        setUploadStatus("Comprimindo...");
        
        const compressionOptions = {
          maxSizeMB: 1, // Máximo 1MB após compressão
          maxWidthOrHeight: 1920, // Máximo 1920px de largura ou altura
          useWebWorker: true,
          fileType: file.type as string,
        };
        
        fileToUpload = await imageCompression(file, compressionOptions);
        
        const savedPercent = Math.round((1 - fileToUpload.size / originalSize) * 100);
        console.log(`Imagem comprimida: ${(originalSize / 1024 / 1024).toFixed(2)}MB → ${(fileToUpload.size / 1024 / 1024).toFixed(2)}MB (${savedPercent}% reduzido)`);
        
      } catch (compressionError) {
        console.error("Erro na compressão, usando arquivo original:", compressionError);
        fileToUpload = file;
      }
    }
    
    setUploadStatus("Enviando...");

    try {
      // Obter URL de upload
      const uploadResponse = await fetch("/api/objects/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!uploadResponse.ok) {
        throw new Error("Erro ao obter URL de upload");
      }

      const uploadData = await uploadResponse.json();
      const uploadURL = uploadData.uploadURL;

      // Fazer upload direto para o storage (usando arquivo comprimido)
      const uploadResult = await fetch(uploadURL, {
        method: "PUT",
        body: fileToUpload,
        headers: {
          'Content-Type': fileToUpload.type,
        },
      });

      if (!uploadResult.ok) {
        throw new Error("Erro no upload");
      }

      // Configurar ACL da imagem como pública
      const aclResponse = await fetch("/api/images/upload", {
        method: "PUT",
        body: JSON.stringify({ imageURL: uploadURL }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!aclResponse.ok) {
        throw new Error("Erro ao configurar imagem");
      }

      const aclData = await aclResponse.json();

      // Retornar a URL completa para uso direto nos campos de imagem
      const imageUrl = `https://${window.location.hostname}${aclData.objectPath}`;
      
      // Inserir a URL diretamente (não markdown)
      onImageInserted(imageUrl);
      
      toast({
        title: "Imagem enviada com sucesso!",
        description: "A imagem foi adicionada ao seu post.",
        variant: "default",
      });

      // Limpar input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar a imagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadStatus("");
    }
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-file-upload"
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={className}
        data-testid="button-upload-image"
      >
        <ImageIcon className="w-4 h-4 mr-2" />
        {isUploading ? (uploadStatus || "Processando...") : "Inserir Imagem"}
      </Button>
    </>
  );
}