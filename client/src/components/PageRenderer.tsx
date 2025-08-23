import { useQuery } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { motion } from "framer-motion";
import { Page } from "@shared/schema";
import NotFound from "../pages/not-found";

interface PageSection {
  id: string;
  type: string;
  data: any;
}

interface HeroSectionProps {
  data: {
    title: string;
    subtitle?: string;
    description?: string;
    ctaText?: string;
    ctaLink?: string;
    backgroundGradient?: string;
  };
}

function HeroSection({ data }: HeroSectionProps) {
  return (
    <section className="pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h2 
            className="font-outfit font-bold text-5xl md:text-7xl gradient-text mt-[54px] mb-[54px]"
            animate={{ y: [-5, 5, -5] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            {data.title}
          </motion.h2>
          
          {data.subtitle && (
            <p className="font-poppins text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed mb-6">
              {data.subtitle}
            </p>
          )}
          
          {data.description && (
            <p className="font-poppins text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-8">
              {data.description}
            </p>
          )}
          
          {data.ctaText && data.ctaLink && (
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <a href={data.ctaLink}>
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-4 px-8 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 flex items-center">
                  {data.ctaText}
                </button>
              </a>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}

interface CardsSectionProps {
  data: {
    title: string;
    subtitle?: string;
    cards: Array<{
      icon?: string;
      title: string;
      description: string;
      link?: string;
      gradient?: string;
    }>;
  };
}

function CardsSection({ data }: CardsSectionProps) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-outfit font-bold text-4xl md:text-5xl gradient-text mb-6">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="font-poppins text-xl text-gray-600 max-w-3xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group h-full"
            >
              <div className="glassmorphism p-8 rounded-3xl h-full hover:shadow-xl transition-all duration-300 border border-white/20">
                {card.icon && (
                  <div className="text-5xl mb-6">{card.icon}</div>
                )}
                <h3 className="font-outfit font-bold text-2xl text-gray-800 mb-4">
                  {card.title}
                </h3>
                <p className="font-poppins text-gray-600 leading-relaxed mb-6">
                  {card.description}
                </p>
                {card.link && (
                  <a
                    href={card.link}
                    className="inline-flex items-center font-poppins font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Saiba mais →
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface ContentSectionProps {
  data: {
    title: string;
    content: string;
  };
}

function ContentSection({ data }: ContentSectionProps) {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto"
        >
          <h2 className="font-outfit font-bold text-4xl md:text-5xl gradient-text text-center mb-12">
            {data.title}
          </h2>
          <div
            className="font-poppins text-lg text-gray-700 leading-relaxed prose prose-xl max-w-none"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </motion.div>
      </div>
    </section>
  );
}

interface CTASectionProps {
  data: {
    title: string;
    description: string;
    ctaText: string;
    ctaLink: string;
    backgroundGradient?: string;
  };
}

function CTASection({ data }: CTASectionProps) {
  return (
    <section className={`py-16 bg-gradient-to-r ${data.backgroundGradient || 'from-purple-600 to-pink-600'}`}>
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            {data.title}
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            {data.description}
          </p>
          <motion.a
            href={data.ctaLink}
            className="inline-block bg-white text-purple-600 px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {data.ctaText}
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}

function renderSection(section: PageSection) {
  switch (section.type) {
    case 'hero':
      return <HeroSection key={section.id} data={section.data} />;
    case 'cards':
      return <CardsSection key={section.id} data={section.data} />;
    case 'content':
      return <ContentSection key={section.id} data={section.data} />;
    case 'cta':
      return <CTASection key={section.id} data={section.data} />;
    case 'content-highlight':
      return (
        <section key={section.id} className="py-16 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
                {section.data.title}
              </h2>
              {section.data.subtitle && (
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                  {section.data.subtitle}
                </p>
              )}
            </div>
            <div className="text-center py-8">
              <p className="text-gray-500">
                Conteúdo em destaque será carregado aqui
              </p>
            </div>
          </div>
        </section>
      );
    default:
      return null;
  }
}

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
      
      {/* Render Page Sections */}
      {sections.map(renderSection)}
    </div>
  );
}