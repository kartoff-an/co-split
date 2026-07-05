import { useEffect } from 'react';

export interface DocumentMetadata {
  title?: string;
  description?: string;
  url?: string;
  image?: string;
}

export function useDocumentMetadata(metadata: DocumentMetadata) {
  useEffect(() => {
    const previousTitle = document.title;
    const previousDesc = getMetaTag('description', 'name');
    const previousOgTitle = getMetaTag('og:title', 'property');
    const previousOgDesc = getMetaTag('og:description', 'property');
    const previousOgUrl = getMetaTag('og:url', 'property');
    const previousOgImage = getMetaTag('og:image', 'property');

    if (metadata.title) {
      document.title = metadata.title;
      updateMetaTag('og:title', metadata.title, 'property');
    }
    if (metadata.description) {
      updateMetaTag('description', metadata.description, 'name');
      updateMetaTag('og:description', metadata.description, 'property');
    }
    if (metadata.url) {
      updateMetaTag('og:url', metadata.url, 'property');
    }
    if (metadata.image) {
      updateMetaTag('og:image', metadata.image, 'property');
    }

    return () => {
      document.title = previousTitle;
      restoreMetaTag('description', previousDesc, 'name');
      restoreMetaTag('og:title', previousOgTitle, 'property');
      restoreMetaTag('og:description', previousOgDesc, 'property');
      restoreMetaTag('og:url', previousOgUrl, 'property');
      restoreMetaTag('og:image', previousOgImage, 'property');
    };
  }, [metadata.title, metadata.description, metadata.url, metadata.image]);
}

function getMetaTag(nameOrProperty: string, attributeType: 'name' | 'property'): string | null {
  const element = document.querySelector(`meta[${attributeType}="${nameOrProperty}"]`);
  return element ? element.getAttribute('content') : null;
}

function updateMetaTag(
  nameOrProperty: string,
  content: string,
  attributeType: 'name' | 'property'
) {
  let element = document.querySelector(`meta[${attributeType}="${nameOrProperty}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeType, nameOrProperty);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}

function restoreMetaTag(
  nameOrProperty: string,
  content: string | null,
  attributeType: 'name' | 'property'
) {
  const element = document.querySelector(`meta[${attributeType}="${nameOrProperty}"]`);
  if (element) {
    if (content === null) {
      element.remove();
    } else {
      element.setAttribute('content', content);
    }
  } else if (content !== null) {
    updateMetaTag(nameOrProperty, content, attributeType);
  }
}
