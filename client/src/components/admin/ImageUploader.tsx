import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface ImageUploaderProps {
  onImageInserted: (markdown: string) => void;
  className?: string;
}

/**
 * Componente para upload de imagens que serão inseridas no editor de markdown.
 * Permite fazer upload de imagens do computador e insere automaticamente o markdown da imagem.
 */
export function ImageUploader({ onImageInserted, className }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validações
    if (file.size > 5 * 1024 * 1024) { // 5MB
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 5MB.",
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

      // Fazer upload direto para o storage
      const uploadResult = await fetch(uploadURL, {
        method: "PUT",
        body: file,
        headers: {
          'Content-Type': file.type,
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

      // Criar markdown da imagem usando a URL normalizada
      const imageMarkdown = `![${file.name}](${aclData.objectPath})`;
      
      // Inserir no editor
      onImageInserted(imageMarkdown);
      
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
        {isUploading ? "Enviando..." : "Inserir Imagem"}
      </Button>
    </>
  );
}