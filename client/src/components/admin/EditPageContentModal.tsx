import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";
import type { Content } from "@shared/schema";

const pageContentSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  description: z.string().min(1, "Descrição é obrigatória"),
  content: z.string().min(1, "Conteúdo é obrigatório"),
});

type PageContentForm = z.infer<typeof pageContentSchema>;

interface EditPageContentModalProps {
  pageContent: Content;
  trigger?: React.ReactNode;
}

export function EditPageContentModal({ pageContent, trigger }: EditPageContentModalProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<PageContentForm>({
    resolver: zodResolver(pageContentSchema),
    defaultValues: {
      title: pageContent.title || "",
      description: pageContent.description || "",
      content: pageContent.content || "",
    },
  });

  const updatePageMutation = useMutation({
    mutationFn: async (data: PageContentForm) => {
      const response = await fetch(`/api/content/${pageContent.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Falha ao atualizar conteúdo");
      }
      
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Conteúdo Atualizado!",
        description: "As alterações foram salvas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/content/page/${pageContent.category}`] });
      setOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar conteúdo",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PageContentForm) => {
    updatePageMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Editar Conteúdo da Página</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título Principal</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Você Não Está Sozinha" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subtítulo</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descrição que aparece logo abaixo do título..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Texto de Apoio</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Texto adicional que aparece antes dos botões..."
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={updatePageMutation.isPending}>
                {updatePageMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}