import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { PageEditor } from "@/components/page-builder/PageEditor";
import { PageData } from "@/types/page-builder";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

export function PageBuilder() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isEditing = id !== undefined && id !== "new";

  const { data: pageData, isLoading } = useQuery<PageData>({
    queryKey: [`/api/pages/${id}`],
    enabled: isEditing,
  });

  const createPageMutation = useMutation({
    mutationFn: async (data: PageData) => {
      const response = await fetch('/api/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to create page');
      return response.json() as Promise<PageData>;
    },
    onSuccess: (newPage: PageData) => {
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      toast({
        title: "Página Criada!",
        description: "A página foi criada com sucesso."
      });
      setLocation(`/admin/pages/${newPage.id}/edit`);
    },
    onError: (error: any) => {
      console.error("Error creating page:", error);
      toast({
        title: "Erro ao Criar Página",
        description: error.message || "Não foi possível criar a página.",
        variant: "destructive"
      });
    }
  });

  const updatePageMutation = useMutation({
    mutationFn: async (data: PageData) => {
      const response = await fetch(`/api/pages/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error('Failed to update page');
      return response.json() as Promise<PageData>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/pages/${id}`] });
      queryClient.invalidateQueries({ queryKey: ['/api/pages'] });
      toast({
        title: "Página Salva!",
        description: "As alterações foram salvas com sucesso."
      });
    },
    onError: (error: any) => {
      console.error("Error updating page:", error);
      toast({
        title: "Erro ao Salvar",
        description: error.message || "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    }
  });

  const handleSave = async (data: PageData) => {
    if (isEditing) {
      await updatePageMutation.mutateAsync(data);
    } else {
      await createPageMutation.mutateAsync(data);
    }
  };

  const handleBack = () => {
    setLocation('/admin/pages');
  };

  if (isEditing && isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-700">
            Carregando Editor...
          </h2>
          <p className="text-gray-500">
            Preparando o ambiente de edição visual
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <PageEditor
        pageData={isEditing ? pageData : undefined}
        onSave={handleSave}
        onBack={handleBack}
      />
    </motion.div>
  );
}