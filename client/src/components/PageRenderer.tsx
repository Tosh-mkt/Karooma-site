import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { Page } from "@shared/schema";
import { SectionRenderer } from "./page-builder/SectionRenderer";
import { PageSection } from "@/types/page-builder";
import { TaxonomyFilters } from "./filters/TaxonomyFilters";
import NotFound from "../pages/not-found";


export function PageRenderer() {
  const [match, params] = useRoute("/:slug");
  const slug = params?.slug;
  const [selectedTaxonomies, setSelectedTaxonomies] = useState<string[]>([]);
  
  // Verifica se é a página "facilita-a-vida"
  const isFacilitaAVidaPage = slug === "facilita-a-vida";

  const { data: page, isLoading, error } = useQuery<Page>({
    queryKey: [`/api/pages/${slug}`],
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-4 border-purple-200 border-t-purple-600 rounded-full"
        />
      </div>
    );
  }

  if (error || !page) {
    return <NotFound />;
  }

  if (!page.isPublished) {
    return <NotFound />;
  }

  let sections: PageSection[] = [];
  try {
    sections = typeof page.sections === 'string' 
      ? JSON.parse(page.sections) 
      : page.sections || [];
  } catch (e) {
    console.error('Error parsing page sections:', e);
  }

  return (
    <div className="pt-20">
      {/* SEO Meta Tags */}
      <title>{page.title}</title>
      {page.metaDescription && (
        <meta name="description" content={page.metaDescription} />
      )}
      
      {/* Filtros de Taxonomia apenas para página facilita-a-vida */}
      {isFacilitaAVidaPage && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-b border-purple-100">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <TaxonomyFilters
              selected={selectedTaxonomies}
              onChange={setSelectedTaxonomies}
              defaultExpanded={['saude-e-seguranca', 'comer-e-preparar']}
              className="bg-white rounded-lg shadow-sm p-4"
            />
            {selectedTaxonomies.length > 0 && (
              <div className="mt-4 text-sm text-purple-700" data-testid="filter-status">
                🔍 Mostrando produtos de: <strong>{selectedTaxonomies.length} {selectedTaxonomies.length === 1 ? 'categoria selecionada' : 'categorias selecionadas'}</strong>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Render Page Sections using SectionRenderer */}
      {sections.map((section) => (
        <SectionRenderer 
          key={section.id} 
          section={section} 
          isEditing={false}
          // Passar taxonomias selecionadas para seções que mostram produtos
          selectedTaxonomies={isFacilitaAVidaPage ? selectedTaxonomies : undefined}
        />
      ))}
    </div>
  );
}