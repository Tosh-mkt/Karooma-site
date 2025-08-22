import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Save, X, Image as ImageIcon } from "lucide-react";
import { PageSection, SectionField } from "@/types/page-builder";
import { getSectionType } from "@/lib/page-templates";
// Placeholder import for ObjectUploader - será implementado quando necessário
// import { ObjectUploader } from "@/components/ObjectUploader";

interface SectionEditorProps {
  section: PageSection;
  onSave: (section: PageSection) => void;
  onClose: () => void;
}

export function SectionEditor({ section, onSave, onClose }: SectionEditorProps) {
  const [isUploading, setIsUploading] = useState(false);
  const sectionType = getSectionType(section.type);

  // Criar schema de validação dinamicamente baseado nos campos
  const createValidationSchema = (fields: SectionField[]) => {
    const schemaFields: Record<string, any> = {};
    
    fields.forEach(field => {
      let fieldSchema;
      
      switch (field.type) {
        case 'text':
        case 'textarea':
        case 'image':
        case 'color':
        case 'select':
          fieldSchema = z.string();
          if (field.validation?.min) fieldSchema = fieldSchema.min(field.validation.min);
          if (field.validation?.max) fieldSchema = fieldSchema.max(field.validation.max);
          if (field.validation?.pattern) fieldSchema = fieldSchema.regex(new RegExp(field.validation.pattern));
          break;
        case 'number':
          fieldSchema = z.coerce.number();
          if (field.validation?.min) fieldSchema = fieldSchema.min(field.validation.min);
          if (field.validation?.max) fieldSchema = fieldSchema.max(field.validation.max);
          break;
        case 'boolean':
          fieldSchema = z.boolean();
          break;
        default:
          fieldSchema = z.string();
      }
      
      if (!field.required) {
        fieldSchema = fieldSchema.optional();
      }
      
      schemaFields[field.id] = fieldSchema;
    });
    
    return z.object(schemaFields);
  };

  const validationSchema = sectionType ? createValidationSchema(sectionType.fields) : z.object({});
  
  const form = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: section.data || {}
  });

  useEffect(() => {
    form.reset(section.data || {});
  }, [section, form]);

  const handleSave = (data: any) => {
    const updatedSection: PageSection = {
      ...section,
      data: data
    };
    onSave(updatedSection);
  };

  const handleImageUpload = async (fieldId: string) => {
    try {
      const response = await fetch('/api/objects/upload', {
        method: 'POST'
      });
      const { uploadURL } = await response.json();
      return { method: 'PUT' as const, url: uploadURL };
    } catch (error) {
      console.error('Erro ao obter URL de upload:', error);
      throw error;
    }
  };

  const handleUploadComplete = (fieldId: string, result: any) => {
    if (result.successful && result.successful.length > 0) {
      const uploadURL = result.successful[0].uploadURL;
      form.setValue(fieldId, uploadURL);
    }
    setIsUploading(false);
  };

  const renderField = (field: SectionField) => {
    switch (field.type) {
      case 'text':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input 
                    placeholder={field.placeholder}
                    {...formField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'textarea':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder={field.placeholder}
                    rows={4}
                    {...formField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'select':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <Select onValueChange={formField.onChange} value={formField.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={field.placeholder} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'number':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder={field.placeholder}
                    {...formField}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'boolean':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem className="flex items-center space-x-2">
                <FormControl>
                  <Switch
                    checked={formField.value}
                    onCheckedChange={formField.onChange}
                  />
                </FormControl>
                <FormLabel>{field.label}</FormLabel>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'image':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <div className="space-y-4">
                  <FormControl>
                    <Input 
                      placeholder="URL da imagem ou faça upload"
                      {...formField}
                    />
                  </FormControl>
                  
                  <div className="flex gap-2">
                    <Button 
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        const url = prompt('Insira a URL da imagem:');
                        if (url) form.setValue(field.id, url);
                      }}
                    >
                      <ImageIcon className="w-4 h-4 mr-2" />
                      Inserir URL
                    </Button>
                  </div>
                  
                  {formField.value && (
                    <div className="mt-2">
                      <img 
                        src={formField.value} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded border"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&w=400&h=200';
                        }}
                      />
                    </div>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      case 'color':
        return (
          <FormField
            key={field.id}
            control={form.control}
            name={field.name}
            render={({ field: formField }) => (
              <FormItem>
                <FormLabel>{field.label}</FormLabel>
                <div className="flex gap-2">
                  <FormControl>
                    <Input 
                      type="color"
                      className="w-16 h-10"
                      {...formField}
                    />
                  </FormControl>
                  <FormControl>
                    <Input 
                      placeholder="#000000"
                      className="flex-1"
                      {...formField}
                    />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        );

      default:
        return (
          <div key={field.id} className="p-4 bg-gray-100 rounded">
            <p className="text-sm text-gray-600">
              Tipo de campo não suportado: {field.type}
            </p>
          </div>
        );
    }
  };

  if (!sectionType) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Erro</DialogTitle>
          </DialogHeader>
          <p>Tipo de seção não encontrado: {section.type}</p>
          <Button onClick={onClose}>Fechar</Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Editar {sectionType.name}</DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                {sectionType.description}
              </p>
            </div>
            <Badge variant="outline">
              {sectionType.category}
            </Badge>
          </div>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
            <Tabs defaultValue="content" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="content">Conteúdo</TabsTrigger>
                <TabsTrigger value="settings">Configurações</TabsTrigger>
              </TabsList>
              
              <TabsContent value="content" className="space-y-4 mt-6">
                {sectionType.fields
                  .filter(field => ['text', 'textarea', 'image'].includes(field.type))
                  .map(renderField)}
              </TabsContent>
              
              <TabsContent value="settings" className="space-y-4 mt-6">
                {sectionType.fields
                  .filter(field => !['text', 'textarea', 'image'].includes(field.type))
                  .map(renderField)}
                
                {sectionType.fields
                  .filter(field => !['text', 'textarea', 'image'].includes(field.type))
                  .length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Esta seção não possui configurações adicionais
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button type="button" variant="outline" onClick={onClose}>
                <X className="w-4 h-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit">
                <Save className="w-4 h-4 mr-2" />
                Salvar Seção
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}