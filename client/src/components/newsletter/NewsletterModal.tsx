import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, X, ChevronRight, ChevronLeft, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import {
  PRODUCT_CATEGORIES,
  TARGET_AUDIENCE,
  ENVIRONMENTS,
  SPECIAL_OCCASIONS,
  getCategoriesArray,
  getAvailableAudienceForCategory,
  getAvailableEnvironmentsForCategory,
  getAvailableOccasionsForCategory,
} from "@shared/categories";

interface NewsletterModalProps {
  isOpen: boolean;
  onClose: () => void;
  source?: string;
  leadMagnet?: string;
}

interface NewsletterPreferences {
  email: string;
  name?: string;
  interests: {
    categories: string[];
    audience: string[];
    environments: string[];
    occasions: string[];
  };
  keywords: string[];
  frequency: string;
  contentTypes: string[];
  source?: string;
  leadMagnet?: string;
}

export function NewsletterModal({ isOpen, onClose, source = "modal", leadMagnet = "newsletter-signup" }: NewsletterModalProps) {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<NewsletterPreferences>({
    email: "",
    name: "",
    interests: {
      categories: [],
      audience: [],
      environments: [],
      occasions: [],
    },
    keywords: [],
    frequency: "weekly",
    contentTypes: [],
    source,
    leadMagnet,
  });

  const { toast } = useToast();

  const subscribeMutation = useMutation({
    mutationFn: (data: NewsletterPreferences) => 
      apiRequest("POST", "/api/newsletter/subscribe-advanced", data),
    onSuccess: () => {
      toast({
        title: "🎉 Inscrição realizada com sucesso!",
        description: "Você receberá conteúdo personalizado baseado em suas preferências.",
      });
      onClose();
      setStep(1);
      setPreferences({
        email: "",
        name: "",
        interests: { categories: [], audience: [], environments: [], occasions: [] },
        keywords: [],
        frequency: "weekly",
        contentTypes: [],
        source,
        leadMagnet,
      });
    },
    onError: () => {
      toast({
        title: "Erro na inscrição",
        description: "Tente novamente em alguns minutos.",
        variant: "destructive",
      });
    },
  });

  const handleCategoryToggle = (categoryId: string) => {
    setPreferences(prev => {
      const categories = prev.interests.categories.includes(categoryId)
        ? prev.interests.categories.filter(id => id !== categoryId)
        : [...prev.interests.categories, categoryId];

      // Limpar subcategorias quando categoria é removida
      if (!categories.includes(categoryId)) {
        return {
          ...prev,
          interests: {
            ...prev.interests,
            categories,
            audience: prev.interests.audience.filter(a => {
              const category = PRODUCT_CATEGORIES[categoryId];
              return !category?.allowedAudience?.includes(a);
            }),
            environments: prev.interests.environments.filter(e => {
              const category = PRODUCT_CATEGORIES[categoryId];
              return !category?.allowedEnvironments?.includes(e);
            }),
            occasions: prev.interests.occasions.filter(o => {
              const category = PRODUCT_CATEGORIES[categoryId];
              return !category?.allowedOccasions?.includes(o);
            }),
          }
        };
      }

      return { ...prev, interests: { ...prev.interests, categories } };
    });
  };

  const handleSubcategoryToggle = (type: 'audience' | 'environments' | 'occasions', value: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: {
        ...prev.interests,
        [type]: prev.interests[type].includes(value)
          ? prev.interests[type].filter(item => item !== value)
          : [...prev.interests[type], value]
      }
    }));
  };

  const handleContentTypeToggle = (type: string) => {
    setPreferences(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(type)
        ? prev.contentTypes.filter(t => t !== type)
        : [...prev.contentTypes, type]
    }));
  };

  const getAvailableSubcategories = () => {
    const availableAudience = new Set<string>();
    const availableEnvironments = new Set<string>();
    const availableOccasions = new Set<string>();

    preferences.interests.categories.forEach(categoryId => {
      const category = PRODUCT_CATEGORIES[categoryId];
      category?.allowedAudience?.forEach(a => availableAudience.add(a));
      category?.allowedEnvironments?.forEach(e => availableEnvironments.add(e));
      category?.allowedOccasions?.forEach(o => availableOccasions.add(o));
    });

    return {
      audience: TARGET_AUDIENCE.filter(item => availableAudience.has(item.id)),
      environments: ENVIRONMENTS.filter(item => availableEnvironments.has(item.id)),
      occasions: SPECIAL_OCCASIONS.filter(item => availableOccasions.has(item.id)),
    };
  };

  const handleSubmit = () => {
    if (!preferences.email) {
      toast({
        title: "Email obrigatório",
        description: "Por favor, insira seu email para continuar.",
        variant: "destructive",
      });
      return;
    }

    subscribeMutation.mutate(preferences);
  };

  const canProceedToStep2 = preferences.email.length > 0;
  const canProceedToStep3 = preferences.interests.categories.length > 0;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white relative">
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-fredoka">Personalize sua Experiência</h2>
                <p className="text-white/90 font-poppins">Conte-nos seus interesses para conteúdo sob medida</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="flex gap-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`flex-1 h-2 rounded-full ${i <= step ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 overflow-y-auto min-h-0">
            <AnimatePresence mode="wait">
              {/* Step 1: Informações Básicas */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <Mail className="w-16 h-16 mx-auto mb-4 text-purple-600" />
                    <h3 className="text-2xl font-bold font-fredoka text-gray-800 mb-2">Vamos começar!</h3>
                    <p className="text-gray-600 font-poppins">Primeiro, precisamos do seu email para enviar o conteúdo personalizado</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="seu@email.com"
                        value={preferences.email}
                        onChange={(e) => setPreferences(prev => ({ ...prev, email: e.target.value }))}
                        className="mt-1"
                        data-testid="input-email-newsletter"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium text-gray-700">Nome (opcional)</Label>
                      <Input
                        id="name"
                        placeholder="Como posso te chamar?"
                        value={preferences.name}
                        onChange={(e) => setPreferences(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1"
                        data-testid="input-name-newsletter"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Interesses */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold font-fredoka text-gray-800 mb-2">Quais são seus interesses?</h3>
                    <p className="text-gray-600 font-poppins">Selecione as categorias que mais despertam sua curiosidade</p>
                  </div>

                  {/* Categorias Principais */}
                  <div className="space-y-4">
                    <h4 className="font-semibold text-gray-800">Categorias de Interesse:</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {getCategoriesArray().map(category => (
                        <Card
                          key={category.id}
                          className={`cursor-pointer transition-all ${
                            preferences.interests.categories.includes(category.id)
                              ? 'ring-2 ring-purple-500 bg-purple-50'
                              : 'hover:shadow-md'
                          }`}
                          onClick={() => handleCategoryToggle(category.id)}
                          data-testid={`category-${category.id}`}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="text-2xl mb-2">{category.emoji}</div>
                            <div className="font-medium text-sm">{category.label}</div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>

                    {/* Subcategorias dinâmicas */}
                    {preferences.interests.categories.length > 0 && (
                      <div className="space-y-4 mt-6">
                        {getAvailableSubcategories().audience.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Para quem:</h4>
                            <div className="flex flex-wrap gap-2">
                              {getAvailableSubcategories().audience.map(item => (
                                <Badge
                                  key={item.id}
                                  variant={preferences.interests.audience.includes(item.id) ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => handleSubcategoryToggle('audience', item.id)}
                                  data-testid={`audience-${item.id}`}
                                >
                                  {item.icon} {item.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}

                        {getAvailableSubcategories().environments.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-2">Ambiente:</h4>
                            <div className="flex flex-wrap gap-2">
                              {getAvailableSubcategories().environments.map(item => (
                                <Badge
                                  key={item.id}
                                  variant={preferences.interests.environments.includes(item.id) ? "default" : "outline"}
                                  className="cursor-pointer"
                                  onClick={() => handleSubcategoryToggle('environments', item.id)}
                                  data-testid={`environment-${item.id}`}
                                >
                                  {item.icon} {item.label}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Palavras-chave específicas */}
                    <div>
                      <Label htmlFor="keywords" className="text-sm font-medium text-gray-700">Termos específicos de interesse (opcional)</Label>
                      <Textarea
                        id="keywords"
                        placeholder="Ex: Montessori, organização infantil, receitas práticas..."
                        value={preferences.keywords.join(', ')}
                        onChange={(e) => setPreferences(prev => ({
                          ...prev,
                          keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                        }))}
                        className="mt-1"
                        data-testid="textarea-keywords"
                      />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Preferências */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold font-fredoka text-gray-800 mb-2">Últimos ajustes</h3>
                    <p className="text-gray-600 font-poppins">Como você prefere receber nosso conteúdo?</p>
                  </div>

                  <div className="space-y-6">
                    {/* Frequência */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">Frequência de envio:</Label>
                      <RadioGroup
                        value={preferences.frequency}
                        onValueChange={(value) => setPreferences(prev => ({ ...prev, frequency: value }))}
                        data-testid="radio-frequency"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="daily" id="daily" />
                          <Label htmlFor="daily">📅 Diário - Dicas rápidas</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="weekly" id="weekly" />
                          <Label htmlFor="weekly">📬 Semanal - Newsletter completa</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="monthly" id="monthly" />
                          <Label htmlFor="monthly">📖 Mensal - Resumos e novidades</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    {/* Tipos de conteúdo */}
                    <div>
                      <Label className="text-sm font-medium text-gray-700 mb-3 block">Tipo de conteúdo preferido:</Label>
                      <div className="space-y-2">
                        {[
                          { id: 'dicas-rapidas', label: '💡 Dicas rápidas e práticas' },
                          { id: 'analises-produtos', label: '🔍 Análises detalhadas de produtos' },
                          { id: 'ofertas-especiais', label: '💰 Ofertas e promoções exclusivas' },
                          { id: 'conteudo-educativo', label: '📚 Artigos educativos' }
                        ].map(type => (
                          <div key={type.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={type.id}
                              checked={preferences.contentTypes.includes(type.id)}
                              onCheckedChange={() => handleContentTypeToggle(type.id)}
                              data-testid={`checkbox-content-${type.id}`}
                            />
                            <Label htmlFor={type.id}>{type.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex-shrink-0 p-4 sm:p-6 border-t bg-gray-50">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600 order-2 sm:order-1">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Seus dados estão seguros</span>
                <span className="sm:hidden">Dados seguros</span>
              </div>

              <div className="flex gap-2 sm:gap-3 order-1 sm:order-2 w-full sm:w-auto justify-center sm:justify-end">
                {step > 1 && (
                  <Button
                    variant="outline"
                    onClick={() => setStep(step - 1)}
                    className="flex items-center gap-2 px-4 py-2 text-sm"
                    data-testid="button-previous"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Voltar</span>
                    <span className="sm:hidden">Anterior</span>
                  </Button>
                )}
                
                {step < 3 ? (
                  <Button
                    onClick={() => setStep(step + 1)}
                    disabled={step === 1 ? !canProceedToStep2 : !canProceedToStep3}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 text-sm min-w-0"
                    data-testid="button-next"
                  >
                    Próximo
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={subscribeMutation.isPending}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 text-sm min-w-0"
                    data-testid="button-submit"
                  >
                    {subscribeMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="hidden sm:inline">Inscrevendo...</span>
                        <span className="sm:hidden">...</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4" />
                        <span className="hidden sm:inline">Finalizar Inscrição</span>
                        <span className="sm:hidden">Finalizar</span>
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}