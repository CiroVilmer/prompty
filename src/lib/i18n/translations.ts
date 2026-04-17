export type Lang = 'en' | 'es'

export interface Translations {
  nav: {
    howItWorks: string
    about: string
    tryDemo: string
    mobileHowItWorks: string
    mobileBeforeAfter: string
    mobileWhyPrompty: string
    mobileTryDemo: string
    mobileHowItWorksAria: string
    mobileBeforeAfterAria: string
    mobileWhyPromptyAria: string
    mobileTryDemoAria: string
    toggleLang: string
  }
  hero: {
    badge: string
    titlePre: string
    titleHighlight: string
    titleMid: string
    titleUnderline: string
    subtitle: string
    ctaPrimary: string
    ctaSecondary: string
  }
  problem: {
    label: string
    title: string
    bodyPre: string
    bodyHighlight1: string
    bodyMid1: string
    bodyHighlight2: string
    bodyMid2: string
    bodyHighlight3: string
    untilNow: string
    solutionLabel: string
    solutionBody: string
    solutionBodyBrand: string
    solutionBodyMid: string
    solutionBodyScore: string
    solutionBodyMid2: string
    solutionBodyBestSellers: string
    solutionBodyEnd: string
    ctaHowItWorks: string
    ctaWhatsDifferent: string
    painLabels: string[]
  }
  beforeAfter: {
    badge: string
    title: string
    subtitle: string
    labelBefore: string
    labelAfter: string
    footer: string
  }
  why: {
    label: string
    title: string
    subtitle: string
    cards: Array<{ title: string; body: string }>
  }
  footer: {
    rights: string
    builtWith: string
  }
  dashboard: {
    overview: {
      title: string
      subtitle: string
      stats: Array<{ label: string; sub: string }>
      tools: {
        title: string
        cards: Array<{
          title: string
          description: string
          badge?: string
          comingSoon?: string
          stayTuned?: string
        }>
      }
    }
  }
  newProduct: {
    pageTitle: string
    pageSubtitle: string
    placeholder: string
    submitButton: string
    suggestions: string[]
    waitMessages: string[]
    aiSteps: Array<{ content: string }>
    thinkingTitle: string
    thinkingSubtitle: string
    previewTitle: string
    whatsNewButton: string
    backToPreview: string
    publishButton: string
    publishSteps: string[]
    publishedTitle: string
    publishedSubtitle: string
    generatingTitle: string
    generatingSubtitle: string
    severity: {
      critical: string
      high: string
      medium: string
    }
    whatsNew: {
      panelTitle: string
      titleCard: string
      descCard: string
      attributesCard: string
      keywordsCard: string
      auditCard: string
      beforeLabel: string
      afterLabel: string
      foundIssues: string
      noIssues: string
      noAttributes: string
      noKeywords: string
      noAudit: string
    }
    categories: {
      laptop: string
      sneakers: string
      default: string
    }
    explanations: {
      title: string
      description: string
      attributes: string
      keywords: string
    }
    listingPreview: {
      condition: string
      noRatings: string
      noSales: string
      freeShipping: string
      buyNow: string
      addToCart: string
      mainFeatures: string
      seePayment: string
      arrives: string
      soldBy: string
      interestFree: string
    }
  }
}

export const translations: Record<Lang, Translations> = {
  en: {
    nav: {
      howItWorks: 'How it works',
      about: 'About',
      tryDemo: 'Try demo',
      mobileHowItWorks: 'How it works',
      mobileBeforeAfter: 'Before & After',
      mobileWhyPrompty: 'Why Prompty',
      mobileTryDemo: 'Try demo',
      mobileHowItWorksAria: 'Go to how it works section',
      mobileBeforeAfterAria: 'See before and after examples',
      mobileWhyPromptyAria: 'Why use Prompty',
      mobileTryDemoAria: 'Try the demo on the dashboard',
      toggleLang: 'ES',
    },
    hero: {
      badge: 'Powered by',
      titlePre: 'Listings ',
      titleHighlight: 'optimized',
      titleMid: ' with AI and ',
      titleUnderline: 'real data',
      subtitle: 'Faster, better, and completely optimized listings.',
      ctaPrimary: 'Try the demo',
      ctaSecondary: 'How it works',
    },
    problem: {
      label: '/ the problem',
      title: "Publishing well shouldn't be this hard",
      bodyPre: 'Millions of sellers lose sales every day because of ',
      bodyHighlight1: 'mediocre listings',
      bodyMid1: '. The algorithm ',
      bodyHighlight2: 'buries them',
      bodyMid2: " and buyers never see them. The problem isn't lack of effort — it's ",
      bodyHighlight3: 'lack of tools',
      untilNow: 'Until now.',
      solutionLabel: '/ the solution',
      solutionBody: '',
      solutionBodyBrand: 'Meet Prompty',
      solutionBodyMid: ' — Search, optimize, and boost your listings to ',
      solutionBodyScore: '100%',
      solutionBodyMid2: ', powered by data from the ',
      solutionBodyBestSellers: 'top sellers',
      solutionBodyEnd: ' in your category.',
      ctaHowItWorks: 'How Prompty works →',
      ctaWhatsDifferent: 'What makes us different',
      painLabels: [
        'Incomplete titles',
        'Empty attributes',
        'Generic descriptions',
        'Poor photos',
        'Missing keywords',
        'No description',
        'Low conversion',
        'Bad SEO',
      ],
    },
    beforeAfter: {
      badge: 'Before & after',
      title: 'Same product, different result',
      subtitle: 'The difference between a listing that sells and one that goes unnoticed',
      labelBefore: 'Without Prompty',
      labelAfter: 'With Prompty',
      footer: 'Optimization trained on real category best sellers · DSPy MIPROv2',
    },
    why: {
      label: '/ why us',
      title: 'Not just a title improver',
      subtitle: 'Four reasons Prompty is different from every other listing tool.',
      cards: [
        {
          title: 'Based on real data',
          body: "Every optimization is fueled by the top-ranked products in your category. We don't guess — we consult the market.",
        },
        {
          title: 'End-to-end',
          body: 'Text, attributes, keywords, and images. You enter with a mediocre listing and leave with a complete publication ready to compete.',
        },
        {
          title: 'Measurable improvement',
          body: 'We show you the score before and after. You know exactly how much your listing improved and in which dimensions.',
        },
        {
          title: 'Any category',
          body: 'Sneakers, electronics, apparel — the pipeline auto-calibrates with data from each vertical.',
        },
      ],
    },
    footer: {
      rights: 'All rights reserved.',
      builtWith: 'Built with Next.js 16',
    },
    dashboard: {
      overview: {
        title: 'Welcome back 👋',
        subtitle: "Here's what's happening with your listings.",
        stats: [
          { label: 'Products trained on', sub: 'Real MELI listings' },
          { label: 'Published products', sub: 'MELI implementation soon' },
          { label: 'Avg. SEO score', sub: 'Across optimized listings' },
        ],
        tools: {
          title: 'Tools',
          cards: [
            {
              title: 'DEMO: Create Laptop Listing',
              description: 'Generate a fully optimized Mercado Libre laptop listing using AI.',
            },
            {
              title: 'Create a Listing',
              description: 'Generate a fully optimized Mercado Libre listing using AI.',
              badge: 'Coming soon',
            },
            {
              title: 'More tools coming',
              description: 'Stay tuned for more AI-powered tools to supercharge your listings.',
              stayTuned: 'Stay tuned',
            },
          ],
        },
      },
    },
    newProduct: {
      pageTitle: 'New listing',
      pageSubtitle: 'Describe your product and Prompty will generate an optimized Mercado Libre listing.',
      placeholder: "What are you selling? Describe your product as you would to a friend — brand, model, condition, features...\n\nExample: I have a used MacBook Air M2 13\", 8GB RAM, 256GB SSD, space gray, bought in 2023, in excellent condition, no scratches, original charger included.",
      submitButton: 'Optimize listing',
      suggestions: [
        'MacBook Air M2 13" 8GB 256GB used perfect condition',
        'Nike Air Max 90 white size 42 brand new box',
        'iPhone 15 Pro 256GB natural titanium unlocked',
      ],
      waitMessages: [
        'Analyzing your product…',
        'Consulting top sellers in your category…',
        'Extracting high-impact keywords…',
        'Drafting the optimized title…',
        'Building the complete listing…',
        'Running quality checks…',
        'Almost there…',
      ],
      aiSteps: [
        { content: 'Reading your product description…' },
        { content: 'Auditing listing quality and gaps…' },
        { content: 'Fetching top-seller data from Mercado Libre…' },
        { content: 'Extracting trending keywords for your category…' },
        { content: 'Generating optimized title, description & attributes…' },
        { content: 'Finalizing your listing…' },
      ],
      thinkingTitle: 'Generating your listing…',
      thinkingSubtitle: 'This usually takes 10–20 seconds.',
      previewTitle: 'Your optimized listing',
      whatsNewButton: "What's new",
      backToPreview: 'Back to preview',
      publishButton: 'Publish to Mercado Libre',
      publishSteps: [
        'Validating listing data…',
        'Connecting to Mercado Libre API…',
        'Uploading listing details…',
        'Configuring pricing & shipping…',
        'Publishing listing…',
      ],
      publishedTitle: 'Published successfully!',
      publishedSubtitle: 'Your listing is now live on Mercado Libre.',
      generatingTitle: 'Generating preview…',
      generatingSubtitle: 'Your optimized listing will appear here shortly.',
      severity: {
        critical: 'Critical',
        high: 'High impact',
        medium: 'Improvement',
      },
      whatsNew: {
        panelTitle: "What's new in your listing",
        titleCard: 'Optimized Title',
        descCard: 'Improved Description',
        attributesCard: 'Added Attributes',
        keywordsCard: 'Trending Keywords',
        auditCard: 'Issues Fixed',
        beforeLabel: 'Before',
        afterLabel: 'After',
        foundIssues: 'issues found and addressed',
        noIssues: 'No audit issues found',
        noAttributes: 'No attributes generated',
        noKeywords: 'No keywords found',
        noAudit: 'No audit data available',
      },
      categories: {
        laptop: 'laptop',
        sneakers: 'sneakers',
        default: 'product',
      },
      explanations: {
        title: 'Keyword-rich title optimized for MELI search algorithm',
        description: 'Structured description with specs, benefits, and buyer FAQs',
        attributes: 'Complete technical specifications for better categorization',
        keywords: 'High-traffic search terms extracted from top-seller listings',
      },
      listingPreview: {
        condition: 'Condition not specified',
        noRatings: 'No ratings',
        noSales: 'No sales yet',
        freeShipping: 'Free shipping',
        buyNow: 'Buy now',
        addToCart: 'Add to cart',
        mainFeatures: 'Main features',
        seePayment: 'See payment methods',
        arrives: 'Estimated delivery: 3–5 business days',
        soldBy: 'Sold by',
        interestFree: 'interest-free installments',
      },
    },
  },

  es: {
    nav: {
      howItWorks: 'Cómo funciona',
      about: 'Acerca de',
      tryDemo: 'Probar demo',
      mobileHowItWorks: 'Cómo funciona',
      mobileBeforeAfter: 'Antes y después',
      mobileWhyPrompty: 'Por qué Prompty',
      mobileTryDemo: 'Probar demo',
      mobileHowItWorksAria: 'Ir a la sección cómo funciona',
      mobileBeforeAfterAria: 'Ver ejemplos de antes y después',
      mobileWhyPromptyAria: 'Por qué usar Prompty',
      mobileTryDemoAria: 'Probar el demo en el dashboard',
      toggleLang: 'EN',
    },
    hero: {
      badge: 'Impulsado por',
      titlePre: 'Publicaciones ',
      titleHighlight: 'optimizadas',
      titleMid: ' con IA y ',
      titleUnderline: 'datos reales',
      subtitle: 'Publicaciones más rápidas, mejores y completamente optimizadas.',
      ctaPrimary: 'Probar el demo',
      ctaSecondary: 'Cómo funciona',
    },
    problem: {
      label: '/ el problema',
      title: 'Publicar bien no debería ser tan difícil',
      bodyPre: 'Millones de vendedores pierden ventas cada día por culpa de ',
      bodyHighlight1: 'publicaciones mediocres',
      bodyMid1: '. El algoritmo ',
      bodyHighlight2: 'las entierra',
      bodyMid2: ' y los compradores nunca las ven. El problema no es falta de esfuerzo — es ',
      bodyHighlight3: 'falta de herramientas',
      untilNow: 'Hasta ahora.',
      solutionLabel: '/ la solución',
      solutionBody: '',
      solutionBodyBrand: 'Conocé Prompty',
      solutionBodyMid: ' — Buscá, optimizá y llevá tus publicaciones al ',
      solutionBodyScore: '100%',
      solutionBodyMid2: ', impulsado por datos de los ',
      solutionBodyBestSellers: 'mejores vendedores',
      solutionBodyEnd: ' de tu categoría.',
      ctaHowItWorks: 'Cómo funciona Prompty →',
      ctaWhatsDifferent: 'Qué nos hace diferentes',
      painLabels: [
        'Títulos incompletos',
        'Atributos vacíos',
        'Descripciones genéricas',
        'Fotos de mala calidad',
        'Palabras clave faltantes',
        'Sin descripción',
        'Baja conversión',
        'Mal SEO',
      ],
    },
    beforeAfter: {
      badge: 'Antes y después',
      title: 'El mismo producto, resultado diferente',
      subtitle: 'La diferencia entre una publicación que vende y una que pasa desapercibida',
      labelBefore: 'Sin Prompty',
      labelAfter: 'Con Prompty',
      footer: 'Optimización entrenada con los mejores vendedores reales de la categoría · DSPy MIPROv2',
    },
    why: {
      label: '/ por qué nosotros',
      title: 'No solo mejoramos el título',
      subtitle: 'Cuatro razones por las que Prompty es diferente a cualquier otra herramienta.',
      cards: [
        {
          title: 'Basado en datos reales',
          body: 'Cada optimización se nutre de los productos mejor posicionados en tu categoría. No adivinamos — consultamos el mercado.',
        },
        {
          title: 'De punta a punta',
          body: 'Texto, atributos, palabras clave e imágenes. Entrás con una publicación mediocre y salís con una publicación completa lista para competir.',
        },
        {
          title: 'Mejora medible',
          body: 'Te mostramos el puntaje antes y después. Sabés exactamente cuánto mejoró tu publicación y en qué dimensiones.',
        },
        {
          title: 'Cualquier categoría',
          body: 'Zapatillas, electrónica, indumentaria — el pipeline se auto-calibra con datos de cada vertical.',
        },
      ],
    },
    footer: {
      rights: 'Todos los derechos reservados.',
      builtWith: 'Construido con Next.js 16',
    },
    dashboard: {
      overview: {
        title: 'Bienvenido de nuevo 👋',
        subtitle: 'Esto es lo que está pasando con tus publicaciones.',
        stats: [
          { label: 'Productos entrenados', sub: 'Publicaciones reales de MELI' },
          { label: 'Productos publicados', sub: 'Integración MELI próximamente' },
          { label: 'Puntaje SEO promedio', sub: 'En publicaciones optimizadas' },
        ],
        tools: {
          title: 'Herramientas',
          cards: [
            {
              title: 'DEMO: Crear Publicación de Laptop',
              description: 'Generá una publicación de Mercado Libre completamente optimizada con IA.',
            },
            {
              title: 'Crear una Publicación',
              description: 'Generá una publicación de Mercado Libre completamente optimizada con IA.',
              badge: 'Próximamente',
            },
            {
              title: 'Más herramientas en camino',
              description: 'Seguí de cerca para descubrir más herramientas impulsadas por IA.',
              stayTuned: 'Próximamente',
            },
          ],
        },
      },
    },
    newProduct: {
      pageTitle: 'Nueva publicación',
      pageSubtitle: 'Describí tu producto y Prompty generará una publicación optimizada para Mercado Libre.',
      placeholder: "¿Qué estás vendiendo? Describí tu producto como se lo contarías a un amigo — marca, modelo, estado, características...\n\nEjemplo: Tengo una MacBook Air M2 13\" usada, 8GB RAM, 256GB SSD, gris espacial, comprada en 2023, en excelente estado, sin rayones, cargador original incluido.",
      submitButton: 'Optimizar publicación',
      suggestions: [
        'MacBook Air M2 13" 8GB 256GB usada perfectas condiciones',
        'Nike Air Max 90 blancas talle 42 nuevas en caja',
        'iPhone 15 Pro 256GB titanio natural liberado',
      ],
      waitMessages: [
        'Analizando tu producto…',
        'Consultando los mejores vendedores de tu categoría…',
        'Extrayendo palabras clave de alto impacto…',
        'Redactando el título optimizado…',
        'Construyendo la publicación completa…',
        'Ejecutando controles de calidad…',
        'Ya casi…',
      ],
      aiSteps: [
        { content: 'Leyendo tu descripción del producto…' },
        { content: 'Auditando la calidad y los puntos débiles de la publicación…' },
        { content: 'Obteniendo datos de los mejores vendedores de Mercado Libre…' },
        { content: 'Extrayendo palabras clave en tendencia para tu categoría…' },
        { content: 'Generando título, descripción y atributos optimizados…' },
        { content: 'Finalizando tu publicación…' },
      ],
      thinkingTitle: 'Generando tu publicación…',
      thinkingSubtitle: 'Esto suele tardar entre 10 y 20 segundos.',
      previewTitle: 'Tu publicación optimizada',
      whatsNewButton: 'Qué hay de nuevo',
      backToPreview: 'Volver a la vista previa',
      publishButton: 'Publicar en Mercado Libre',
      publishSteps: [
        'Validando datos de la publicación…',
        'Conectando con la API de Mercado Libre…',
        'Subiendo detalles de la publicación…',
        'Configurando precio y envío…',
        'Publicando…',
      ],
      publishedTitle: '¡Publicado con éxito!',
      publishedSubtitle: 'Tu publicación ya está activa en Mercado Libre.',
      generatingTitle: 'Generando vista previa…',
      generatingSubtitle: 'Tu publicación optimizada aparecerá aquí en breve.',
      severity: {
        critical: 'Crítico',
        high: 'Alto impacto',
        medium: 'Mejora',
      },
      whatsNew: {
        panelTitle: 'Qué mejoró en tu publicación',
        titleCard: 'Título Optimizado',
        descCard: 'Descripción Mejorada',
        attributesCard: 'Atributos Agregados',
        keywordsCard: 'Palabras Clave en Tendencia',
        auditCard: 'Problemas Resueltos',
        beforeLabel: 'Antes',
        afterLabel: 'Después',
        foundIssues: 'problemas encontrados y resueltos',
        noIssues: 'No se encontraron problemas en la auditoría',
        noAttributes: 'No se generaron atributos',
        noKeywords: 'No se encontraron palabras clave',
        noAudit: 'No hay datos de auditoría disponibles',
      },
      categories: {
        laptop: 'laptop',
        sneakers: 'zapatillas',
        default: 'producto',
      },
      explanations: {
        title: 'Título enriquecido con palabras clave optimizado para el algoritmo de MELI',
        description: 'Descripción estructurada con especificaciones, beneficios y preguntas frecuentes',
        attributes: 'Especificaciones técnicas completas para una mejor categorización',
        keywords: 'Términos de búsqueda de alto tráfico extraídos de las publicaciones más vendidas',
      },
      listingPreview: {
        condition: 'Estado no especificado',
        noRatings: 'Sin calificaciones',
        noSales: 'Sin ventas aún',
        freeShipping: 'Envío gratis',
        buyNow: 'Comprar ahora',
        addToCart: 'Agregar al carrito',
        mainFeatures: 'Características principales',
        seePayment: 'Ver métodos de pago',
        arrives: 'Entrega estimada: 3–5 días hábiles',
        soldBy: 'Vendido por',
        interestFree: 'cuotas sin interés',
      },
    },
  },
}
