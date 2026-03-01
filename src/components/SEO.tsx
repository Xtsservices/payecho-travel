import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  ogType?: string;
  ogImage?: string;
  canonicalUrl?: string;
  schema?: object;
}

export default function SEO({
  title,
  description,
  keywords = 'motel booking, hotel reservation, cheap motels, accommodation, travel, lodging',
  ogType = 'website',
  ogImage = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&h=630&fit=crop',
  canonicalUrl,
  schema
}: SEOProps) {
  useEffect(() => {
    // Update document title
    document.title = title;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (element) {
        element.content = content;
      } else {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        element.content = content;
        document.head.appendChild(element);
      }
    };

    // Update or create link tags
    const updateLinkTag = (rel: string, href: string, type?: string) => {
      let element = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
      
      if (element) {
        element.href = href;
        if (type) element.type = type;
      } else {
        element = document.createElement('link');
        element.rel = rel;
        element.href = href;
        if (type) element.type = type;
        document.head.appendChild(element);
      }
    };

    // Favicon links
    updateLinkTag('icon', '/favicon.ico');
    updateLinkTag('icon', '/favicon.svg', 'image/svg+xml');
    updateLinkTag('apple-touch-icon', '/favicon.svg');

    // Basic meta tags
    updateMetaTag('description', description);
    updateMetaTag('keywords', keywords);
    
    // Open Graph tags
    updateMetaTag('og:title', title, true);
    updateMetaTag('og:description', description, true);
    updateMetaTag('og:type', ogType, true);
    updateMetaTag('og:image', ogImage, true);
    updateMetaTag('og:site_name', 'MOTELTRIPS.COM', true);
    
    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', title);
    updateMetaTag('twitter:description', description);
    updateMetaTag('twitter:image', ogImage);
    
    // Additional SEO tags
    updateMetaTag('robots', 'index, follow');
    updateMetaTag('author', 'MOTELTRIPS.COM');
    updateMetaTag('viewport', 'width=device-width, initial-scale=1.0');

    // Canonical URL
    if (canonicalUrl) {
      let linkElement = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
      if (linkElement) {
        linkElement.href = canonicalUrl;
      } else {
        linkElement = document.createElement('link');
        linkElement.rel = 'canonical';
        linkElement.href = canonicalUrl;
        document.head.appendChild(linkElement);
      }
    }

    // Structured Data (Schema.org)
    if (schema) {
      let scriptElement = document.querySelector('script[type="application/ld+json"]');
      if (scriptElement) {
        scriptElement.textContent = JSON.stringify(schema);
      } else {
        scriptElement = document.createElement('script');
        scriptElement.type = 'application/ld+json';
        scriptElement.textContent = JSON.stringify(schema);
        document.head.appendChild(scriptElement);
      }
    }
  }, [title, description, keywords, ogType, ogImage, canonicalUrl, schema]);

  return null;
}