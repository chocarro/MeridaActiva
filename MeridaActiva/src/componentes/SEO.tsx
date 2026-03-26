// src/componentes/SEO.tsx — Componente SEO reutilizable con react-helmet-async
import { Helmet } from 'react-helmet-async';

const BASE_URL = 'https://meridaactiva.vercel.app';
const DEFAULT_IMAGE = `${BASE_URL}/og-default.png`;
const SITE_NAME = 'Mérida Activa';

interface SEOProps {
  titulo: string;
  descripcion: string;
  imagen?: string;
  url?: string;
  tipo?: 'website' | 'article';
}

const SEO: React.FC<SEOProps> = ({
  titulo,
  descripcion,
  imagen,
  url,
  tipo = 'website',
}) => {
  const fullTitle = `${titulo} | ${SITE_NAME}`;
  const resolvedImage = imagen
    ? imagen.startsWith('http')
      ? imagen
      : `${BASE_URL}${imagen}`
    : DEFAULT_IMAGE;
  const resolvedUrl = url ? `${BASE_URL}${url}` : BASE_URL;

  return (
    <Helmet>
      {/* ── Básico ─────────────────────────────────────── */}
      <title>{fullTitle}</title>
      <meta name="description" content={descripcion} />
      <meta
        name="keywords"
        content="turismo Mérida, eventos Mérida, Extremadura, Mérida Activa, Teatro Romano, monumentos romanos, agenda cultural Mérida, patrimonio UNESCO"
      />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={resolvedUrl} />

      {/* ── Open Graph ─────────────────────────────────── */}
      <meta property="og:type" content={tipo} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="es_ES" />
      <meta property="og:url" content={resolvedUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={descripcion} />
      <meta property="og:image" content={resolvedImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={fullTitle} />

      {/* ── Twitter / X Card ───────────────────────────── */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={descripcion} />
      <meta name="twitter:image" content={resolvedImage} />
    </Helmet>
  );
};

export default SEO;
