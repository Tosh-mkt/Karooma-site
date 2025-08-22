import { useState, useRef } from "react";
import { motion, Reorder } from "framer-motion";
import { Plus, Settings, Trash2, Eye, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { PageData, PageSection } from "@/types/page-builder";
import { sectionTypes, pageTemplates } from "@/lib/page-templates";
import { SectionRenderer } from "./SectionRenderer";
import { SectionEditor } from "./SectionEditor";

interface PageEditorProps {
  pageData?: PageData;
  onSave: (pageData: PageData) => Promise<void>;
  onBack: () => void;
}

export function PageEditor({ pageData, onSave, onBack }: PageEditorProps) {
  const [currentPage, setCurrentPage] = useState<PageData>(
    pageData || {
      slug: "",
      title: "",
      metaDescription: "",
      layout: "default",
      sections: [],
      isPublished: false
    }
  );
  const [isPreview, setIsPreview] = useState(false);
  const [editingSection, setEditingSection] = useState<PageSection | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const dragConstraintsRef = useRef(null);

  const handleAddSection = (sectionTypeId: string) => {
    const sectionType = sectionTypes.find(s => s.id === sectionTypeId);
    if (!sectionType) return;

    const newSection: PageSection = {
      id: Date.now().toString(),
      type: sectionTypeId,
      name: sectionType.name,
      data: { ...sectionType.defaultData },
      position: currentPage.sections.length
    };

    setCurrentPage(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    
    toast({
      title: "Seção Adicionada",
      description: `${sectionType.name} foi adicionada à página.`
    });
  };

  const handleEditSection = (section: PageSection) => {
    setEditingSection(section);
  };

  const handleUpdateSection = (updatedSection: PageSection) => {
    setCurrentPage(prev => ({
      ...prev,
      sections: prev.sections.map(s => 
        s.id === updatedSection.id ? updatedSection : s
      )
    }));
    setEditingSection(null);
  };

  const handleDeleteSection = (sectionId: string) => {
    setCurrentPage(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
        .map((section, index) => ({ ...section, position: index }))
    }));
    
    toast({
      title: "Seção Removida",
      description: "A seção foi removida da página."
    });
  };

  const handleReorderSections = (newSections: PageSection[]) => {
    const sectionsWithPosition = newSections.map((section, index) => ({
      ...section,
      position: index
    }));
    
    setCurrentPage(prev => ({
      ...prev,
      sections: sectionsWithPosition
    }));
  };

  const handleSave = async () => {
    if (!currentPage.title || !currentPage.slug) {
      toast({
        title: "Erro de Validação",
        description: "Título e URL da página são obrigatórios.",
        variant: "destructive"
      });
      return;
    }

    setIsSaving(true);
    try {
      await onSave(currentPage);
      toast({
        title: "Página Salva!",
        description: "As alterações foram salvas com sucesso."
      });
    } catch (error) {
      toast({
        title: "Erro ao Salvar",
        description: "Não foi possível salvar as alterações.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadTemplate = (templateId: string) => {
    const template = pageTemplates.find(t => t.id === templateId);
    if (!template) return;

    setCurrentPage(prev => ({
      ...prev,
      sections: template.sections.map(section => ({
        ...section,
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
      }))
    }));
    
    toast({
      title: "Template Carregado",
      description: `Template "${template.name}" foi aplicado à página.`
    });
  };

  if (isPreview) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Preview Header */}
        <div className="bg-white shadow-sm border-b sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsPreview(false)}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar para Edição
              </Button>
              <div>
                <h1 className="font-semibold text-lg">{currentPage.title}</h1>
                <p className="text-sm text-gray-500">Visualização da Página</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Preview Content */}
        <div className="bg-white">
          {currentPage.sections.map((section) => (
            <SectionRenderer
              key={section.id}
              section={section}
              isEditing={false}
            />
          ))}
          
          {currentPage.sections.length === 0 && (
            <div className="py-20 text-center">
              <p className="text-gray-500">Adicione seções para visualizar a página</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Editor Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="sm" onClick={onBack}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
              <div>
                <h1 className="font-semibold text-lg">
                  {pageData ? 'Editar Página' : 'Nova Página'}
                </h1>
                <p className="text-sm text-gray-500">
                  {currentPage.slug ? `/${currentPage.slug}` : 'Configure a URL da página'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsPreview(true)}
              >
                <Eye className="w-4 h-4 mr-2" />
                Visualizar
              </Button>
              <Button 
                size="sm" 
                onClick={handleSave}
                disabled={isSaving}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Page Settings & Sections */}
          <div className="lg:col-span-1 space-y-4">
            {/* Page Settings */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Configurações da Página</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="title">Título</Label>
                  <Input
                    id="title"
                    value={currentPage.title}
                    onChange={(e) => setCurrentPage(prev => ({ 
                      ...prev, 
                      title: e.target.value 
                    }))}
                    placeholder="Ex: Página Inicial"
                  />
                </div>
                
                <div>
                  <Label htmlFor="slug">URL (Slug)</Label>
                  <Input
                    id="slug"
                    value={currentPage.slug}
                    onChange={(e) => setCurrentPage(prev => ({ 
                      ...prev, 
                      slug: e.target.value.replace(/[^a-z0-9-]/g, '') 
                    }))}
                    placeholder="ex: pagina-inicial"
                  />
                </div>
                
                <div>
                  <Label htmlFor="meta">Meta Descrição</Label>
                  <Input
                    id="meta"
                    value={currentPage.metaDescription || ''}
                    onChange={(e) => setCurrentPage(prev => ({ 
                      ...prev, 
                      metaDescription: e.target.value 
                    }))}
                    placeholder="Descrição para SEO"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Add Section */}
            <Card>
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Adicionar Seção</CardTitle>
                  
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">Templates</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl">
                      <DialogHeader>
                        <DialogTitle>Aplicar Template</DialogTitle>
                      </DialogHeader>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pageTemplates.map((template) => (
                          <Card 
                            key={template.id} 
                            className="cursor-pointer hover:shadow-md transition-shadow"
                            onClick={() => handleLoadTemplate(template.id)}
                          >
                            <CardContent className="p-4">
                              <h3 className="font-semibold mb-2">{template.name}</h3>
                              <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                              <div className="flex items-center justify-between">
                                <Badge variant="outline">
                                  {template.sections.length} seções
                                </Badge>
                                <Button size="sm">Aplicar</Button>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {sectionTypes.map((sectionType) => (
                    <Button
                      key={sectionType.id}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleAddSection(sectionType.id)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {sectionType.name}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Editor Area */}
          <div className="lg:col-span-3">
            <Card className="min-h-96">
              <CardHeader className="border-b">
                <CardTitle className="text-base">Editor de Página</CardTitle>
                <p className="text-sm text-gray-500">
                  Arraste as seções para reorganizar
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <div ref={dragConstraintsRef} className="min-h-96">
                  {currentPage.sections.length === 0 ? (
                    <div className="flex items-center justify-center py-20">
                      <div className="text-center">
                        <Plus className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <h3 className="font-semibold text-gray-600 mb-2">
                          Página Vazia
                        </h3>
                        <p className="text-gray-500">
                          Adicione seções para começar a construir sua página
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Reorder.Group
                      axis="y"
                      values={currentPage.sections}
                      onReorder={handleReorderSections}
                      className="space-y-4"
                    >
                      {currentPage.sections.map((section) => (
                        <Reorder.Item
                          key={section.id}
                          value={section}
                          className="relative group"
                        >
                          <motion.div
                            className="border-2 border-dashed border-transparent group-hover:border-purple-300 rounded-lg overflow-hidden"
                            whileHover={{ scale: 1.01 }}
                          >
                            {/* Section Controls */}
                            <div className="absolute top-2 right-2 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleEditSection(section)}
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteSection(section.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                            
                            <div className="pointer-events-none">
                              <SectionRenderer 
                                section={section} 
                                isEditing={true}
                              />
                            </div>
                          </motion.div>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Section Editor Modal */}
      {editingSection && (
        <SectionEditor
          section={editingSection}
          onSave={handleUpdateSection}
          onClose={() => setEditingSection(null)}
        />
      )}
    </div>
  );
}