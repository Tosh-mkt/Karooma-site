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
    <section className={`relative py-20 bg-gradient-to-br ${data.backgroundGradient || 'from-purple-100 via-pink-50 to-indigo-100'}`}>
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6">
            {data.title}
          </h1>
          {data.subtitle && (
            <h2 className="text-xl md:text-2xl text-gray-600 mb-4 font-medium">
              {data.subtitle}
            </h2>
          )}
          {data.description && (
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              {data.description}
            </p>
          )}
          {data.ctaText && data.ctaLink && (
            <motion.a
              href={data.ctaLink}
              className="inline-block bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {data.ctaText}
            </motion.a>
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
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            {data.title}
          </h2>
          {data.subtitle && (
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {data.subtitle}
            </p>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {data.cards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className={`h-full p-6 rounded-2xl bg-gradient-to-br ${card.gradient || 'from-gray-50 to-gray-100'} border border-gray-200 hover:shadow-lg transition-all`}>
                {card.icon && (
                  <div className="text-4xl mb-4">{card.icon}</div>
                )}
                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                  {card.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {card.description}
                </p>
                {card.link && (
                  <a
                    href={card.link}
                    className="inline-flex items-center text-purple-600 font-medium hover:text-purple-700 transition-colors"
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
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8 text-center">
            {data.title}
          </h2>
          <div
            className="prose prose-lg max-w-none text-gray-700"
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* SEO Meta Tags */}
      <title>{page.title}</title>
      {page.metaDescription && (
        <meta name="description" content={page.metaDescription} />
      )}
      
      {/* Render Page Sections */}
      {sections.map(renderSection)}
    </motion.div>
  );
}