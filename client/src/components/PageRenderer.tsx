import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { Page } from "@shared/schema";
import { SectionRenderer } from "./page-builder/SectionRenderer";
import { PageSection } from "@/types/page-builder";
import NotFound from "../pages/not-found";


export function PageRenderer() {
  const [match, params] = useRoute("/:slug");
  const slug = params?.slug;

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
      
      {/* Render Page Sections using SectionRenderer */}
      {sections.map((section) => (
        <SectionRenderer 
          key={section.id} 
          section={section} 
          isEditing={false} 
        />
      ))}
    </div>
  );
}