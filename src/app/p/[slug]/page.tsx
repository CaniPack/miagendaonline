import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import LandingPageClient from './LandingPageClient';

interface Props {
  params: {
    slug: string;
  };
}

// Función para obtener datos de la landing page (server-side)
async function getLandingPageData(slug: string) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001';
  
  try {
    const response = await fetch(`${baseUrl}/api/public/landing/${slug}`, {
      cache: 'no-store' // Para desarrollo, en producción puedes usar cache
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching landing page:', error);
    return null;
  }
}

// Generar metadata dinámico para SEO
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const landingPage = await getLandingPageData(params.slug);
  
  if (!landingPage) {
    return {
      title: 'Página no encontrada',
      description: 'La página que buscas no existe.',
    };
  }

  const title = landingPage.metaTitle || 
    `${landingPage.professionalName} - ${landingPage.title}`;
  
  const description = landingPage.metaDescription || 
    `${landingPage.tagline}. ${landingPage.description.substring(0, 120)}...`;

  const keywords = landingPage.seoKeywords || 
    `${landingPage.title}, ${landingPage.professionalName}, ${landingPage.serviceArea || ''}`;

  const canonicalUrl = landingPage.canonicalUrl || 
    `${process.env.NEXT_PUBLIC_BASE_URL}/p/${params.slug}`;

  // Generar structured data para FAQs
  const faqs = landingPage.faqs ? JSON.parse(landingPage.faqs) : [];
  const faqStructuredData = faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq: any) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  // Generar structured data principal (Professional/Business)
  const services = landingPage.services ? JSON.parse(landingPage.services) : [];
  const businessStructuredData = {
    "@context": "https://schema.org",
    "@type": landingPage.businessType || "ProfessionalService",
    "name": landingPage.professionalName,
    "description": landingPage.description,
    "url": canonicalUrl,
    "telephone": landingPage.whatsapp ? `+56${landingPage.whatsapp}` : undefined,
    "email": landingPage.contactEmail,
    "areaServed": landingPage.serviceArea,
    "priceRange": services.length > 0 ? `${Math.min(...services.map((s: any) => parseInt(s.price.replace(/[^0-9]/g, '') || '0')))} - ${Math.max(...services.map((s: any) => parseInt(s.price.replace(/[^0-9]/g, '') || '0')))} CLP` : undefined,
    "hasOfferCatalog": services.length > 0 ? {
      "@type": "OfferCatalog",
      "name": "Servicios",
      "itemListElement": services.map((service: any, index: number) => ({
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": service.name,
          "description": service.description
        },
        "price": service.price?.replace(/[^0-9]/g, ''),
        "priceCurrency": "CLP",
        "position": index + 1
      }))
    } : undefined,
    "sameAs": [
      landingPage.instagram ? `https://instagram.com/${landingPage.instagram.replace('@', '')}` : null,
    ].filter(Boolean)
  };

     // Combinar structured data
   const structuredData: any[] = [businessStructuredData];
   if (faqStructuredData) {
     structuredData.push(faqStructuredData);
   }

  // Custom schema.org si está definido
  if (landingPage.customSchema) {
    try {
      const customSchema = JSON.parse(landingPage.customSchema);
      structuredData.push(customSchema);
    } catch (e) {
      console.error('Error parsing custom schema:', e);
    }
  }

  return {
    title,
    description,
         keywords: keywords.split(',').map((k: string) => k.trim()),
    authors: [{ name: landingPage.professionalName }],
    robots: landingPage.robotsDirective || 'index,follow',
    alternates: {
      canonical: canonicalUrl
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'website',
      images: landingPage.profileImage ? [
        {
          url: landingPage.profileImage,
          width: 400,
          height: 400,
          alt: landingPage.professionalName
        }
      ] : [],
      siteName: 'MiAgendaOnline'
    },
    twitter: {
      card: 'summary',
      title,
      description,
      images: landingPage.profileImage ? [landingPage.profileImage] : []
    },
    verification: {
      google: landingPage.googleSiteVerification,
      other: landingPage.bingSiteVerification ? {
        'msvalidate.01': landingPage.bingSiteVerification
      } : undefined
    },
    other: {
      'structured-data': JSON.stringify(structuredData)
    }
  };
}

export default async function LandingPage({ params }: Props) {
  const landingPage = await getLandingPageData(params.slug);
  
  if (!landingPage) {
    notFound();
  }

  // Preparar structured data para el cliente
  const faqs = landingPage.faqs ? JSON.parse(landingPage.faqs) : [];
  const services = landingPage.services ? JSON.parse(landingPage.services) : [];

  return (
    <>
      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": landingPage.businessType || "ProfessionalService",
            "name": landingPage.professionalName,
            "description": landingPage.description,
            "url": `${process.env.NEXT_PUBLIC_BASE_URL}/p/${params.slug}`,
            "telephone": landingPage.whatsapp ? `+56${landingPage.whatsapp}` : undefined,
            "email": landingPage.contactEmail,
            "areaServed": landingPage.serviceArea,
            "hasOfferCatalog": services.length > 0 ? {
              "@type": "OfferCatalog",
              "name": "Servicios",
              "itemListElement": services.map((service: any, index: number) => ({
                "@type": "Offer",
                "itemOffered": {
                  "@type": "Service",
                  "name": service.name,
                  "description": service.description
                },
                "price": service.price?.replace(/[^0-9]/g, ''),
                "priceCurrency": "CLP",
                "position": index + 1
              }))
            } : undefined
          })
        }}
      />
      
      {/* FAQ Structured Data */}
      {faqs.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": faqs.map((faq: any) => ({
                "@type": "Question",
                "name": faq.question,
                "acceptedAnswer": {
                  "@type": "Answer",
                  "text": faq.answer
                }
              }))
            })
          }}
        />
      )}

      {/* Google Analytics */}
      {landingPage.googleAnalyticsId && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${landingPage.googleAnalyticsId}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${landingPage.googleAnalyticsId}');
              `
            }}
          />
        </>
      )}

      {/* Contenido principal de la página */}
      <LandingPageClient landingPage={landingPage} />
      
      {/* FAQ Section optimizada para AEO */}
      {faqs.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Preguntas Frecuentes
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Encuentra respuestas a las preguntas más comunes sobre los servicios de {landingPage.professionalName}
              </p>
            </div>
            
            <div className="space-y-8">
              {faqs.map((faq: any, index: number) => (
                <article key={index} className="bg-white rounded-xl shadow-sm p-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">
                    {faq.question}
                  </h3>
                  
                  <div className="prose prose-lg text-gray-700">
                    {/* Respuesta estructurada para IA */}
                    <div className="faq-answer">
                      {faq.answer.split('\n').map((paragraph: string, pIndex: number) => (
                        <p key={pIndex} className="mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                    
                    {/* Resumen para citación de IA */}
                    {faq.summary && (
                      <div className="mt-6 p-4 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                        <p className="text-sm font-medium text-blue-900 mb-1">Resumen:</p>
                        <p className="text-blue-800">{faq.summary}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Metadata para IA (oculto visualmente pero accesible) */}
                  {faq.keywords && faq.keywords.length > 0 && (
                    <div className="sr-only" aria-hidden="true">
                      Palabras clave: {faq.keywords.join(', ')}
                    </div>
                  )}
                </article>
              ))}
            </div>
            
            {/* Call to action después de FAQs */}
            <div className="text-center mt-12">
              <p className="text-gray-600 mb-6">
                ¿No encontraste la respuesta que buscabas?
              </p>
              <div className="space-y-4 sm:space-y-0 sm:space-x-4 sm:flex sm:justify-center">
                {landingPage.whatsapp && (
                  <a
                    href={`https://wa.me/${landingPage.whatsapp.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Pregúntame por WhatsApp
                  </a>
                )}
                {landingPage.contactEmail && (
                  <a
                    href={`mailto:${landingPage.contactEmail}`}
                    className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Enviar email
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
