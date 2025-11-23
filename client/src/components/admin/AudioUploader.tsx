import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Music } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AudioUploaderProps {
  onAudioInserted: (url: string) => void;
  className?: string;
}

export function AudioUploader({ onAudioInserted, className }: AudioUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "O áudio deve ter no máximo 10MB.",
        variant: "destructive",
      });
      return;
    }

    if (!file.type.startsWith('audio/')) {
      toast({
        title: "Tipo de arquivo inválido",
        description: "Por favor, selecione apenas arquivos de áudio (MP3, WAV, OGG).",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
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

      const aclResponse = await fetch("/api/audio/upload", {
        method: "PUT",
        body: JSON.stringify({ audioURL: uploadURL }),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!aclResponse.ok) {
        throw new Error("Erro ao configurar áudio");
      }

      const aclData = await aclResponse.json();
      
      onAudioInserted(aclData.objectPath);
      
      toast({
        title: "Áudio enviado com sucesso!",
        description: "O áudio foi adicionado à missão.",
        variant: "default",
      });

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

    } catch (error) {
      console.error("Erro ao fazer upload:", error);
      toast({
        title: "Erro no upload",
        description: "Não foi possível enviar o áudio. Tente novamente.",
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
        accept="audio/*"
        onChange={handleFileSelect}
        className="hidden"
        data-testid="input-audio-upload"
      />
      
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className={className}
        data-testid="button-upload-audio"
      >
        <Music className="w-4 h-4 mr-2" />
        {isUploading ? "Enviando..." : "Inserir Áudio"}
      </Button>
    </>
  );
}
