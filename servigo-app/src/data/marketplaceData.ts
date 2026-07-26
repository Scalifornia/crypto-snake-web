import type { Category, Locale, ProviderType, ServiceListing, TrustProfile } from '../types/servigo';
import { distanceKm, getLocation, locationAreas } from './locationData';

type RawServiceListing = Omit<
  ServiceListing,
  'baseLocationId' | 'coveredLocationIds' | 'serviceRadiusKm' | 'remoteAvailable' | 'trust'
> &
  Partial<Pick<ServiceListing, 'baseLocationId' | 'coveredLocationIds' | 'serviceRadiusKm' | 'remoteAvailable' | 'trust'>>;

const defaultTrust: TrustProfile = {
  trustLevel: 'standard',
  incidentCount: 0,
  responseReliability: 92,
  cancellationReliability: 94,
  verificationBadge: true
};

const locationIdByLegacyArea: Record<string, string> = {
  Luxembourg: 'lu-luxembourg',
  Strassen: 'lu-luxembourg',
  Bertrange: 'lu-luxembourg',
  Hesperange: 'lu-luxembourg',
  'Esch-sur-Alzette': 'lu-esch-sur-alzette',
  Differdange: 'lu-differdange',
  Dudelange: 'lu-dudelange',
  Mersch: 'lu-luxembourg',
  Junglinster: 'lu-luxembourg',
  Ettelbruck: 'lu-luxembourg'
};

function locationIdForArea(area: string) {
  return locationIdByLegacyArea[area] ?? 'lu-luxembourg';
}

const baseMarketplaceCategories: Category[] = [
  {
    slug: 'home-repairs',
    icon: 'tools',
    labels: { fr: 'Maison et réparations', pt: 'Casa e reparações', en: 'Home and repairs' },
    description: {
      fr: 'Petites réparations, plomberie, électricité, peinture et interventions à domicile.',
      pt: 'Pequenas reparações, canalização, eletricidade, pintura e intervenções em casa.',
      en: 'Small repairs, plumbing, electricity, painting, and home interventions.'
    },
    subcategories: [
      {
        slug: 'plumbing',
        labels: { fr: 'Plomberie', pt: 'Canalização', en: 'Plumbing' },
        description: {
          fr: 'Fuites, robinets, WC, évacuations et petits dépannages.',
          pt: 'Fugas, torneiras, WC, esgotos e pequenas reparações.',
          en: 'Leaks, taps, toilets, drains, and small repairs.'
        },
        specialties: [
          { slug: 'leak-repair', labels: { fr: 'Réparation de fuite', pt: 'Reparação de fuga', en: 'Leak repair' } },
          { slug: 'tap-sink', labels: { fr: 'Robinet et évier', pt: 'Torneira e lava-loiça', en: 'Tap and sink' } },
          { slug: 'toilet-repair', labels: { fr: 'WC et chasse d’eau', pt: 'WC e autoclismo', en: 'Toilet repair' } }
        ]
      },
      {
        slug: 'electricity',
        labels: { fr: 'Électricité', pt: 'Eletricidade', en: 'Electricity' },
        description: {
          fr: 'Prises, éclairage, tableaux électriques et urgences simples.',
          pt: 'Tomadas, iluminação, quadros elétricos e urgências simples.',
          en: 'Sockets, lighting, electrical panels, and simple urgent issues.'
        },
        specialties: [
          { slug: 'lighting', labels: { fr: 'Éclairage', pt: 'Iluminação', en: 'Lighting' } },
          { slug: 'socket-installation', labels: { fr: 'Prises électriques', pt: 'Tomadas elétricas', en: 'Socket installation' } },
          { slug: 'electrical-urgent', labels: { fr: 'Dépannage urgent', pt: 'Reparação urgente', en: 'Urgent electrical repair' } }
        ]
      },
      {
        slug: 'painting',
        labels: { fr: 'Peinture', pt: 'Pintura', en: 'Painting' },
        description: {
          fr: 'Peinture intérieure, retouches, murs, plafonds et petites finitions.',
          pt: 'Pintura interior, retoques, paredes, tetos e pequenos acabamentos.',
          en: 'Interior painting, touch-ups, walls, ceilings, and small finishes.'
        },
        specialties: [
          { slug: 'interior-painting', labels: { fr: 'Peinture intérieure', pt: 'Pintura interior', en: 'Interior painting' } },
          { slug: 'walls-ceilings', labels: { fr: 'Murs et plafonds', pt: 'Paredes e tetos', en: 'Walls and ceilings' } },
          { slug: 'small-touchups', labels: { fr: 'Retouches peinture', pt: 'Pequenos retoques', en: 'Small paint touch-ups' } },
          { slug: 'exterior-painting', labels: { fr: 'Peinture extérieure', pt: 'Pintura exterior', en: 'Exterior painting' } }
        ]
      },
      {
        slug: 'handyman',
        labels: { fr: 'Bricolage', pt: 'Bricolage', en: 'Handyman' },
        description: {
          fr: 'Montage, fixation, petits travaux et réparations du quotidien.',
          pt: 'Montagem, fixações, pequenos trabalhos e reparações do dia a dia.',
          en: 'Assembly, fixing, small jobs, and everyday repairs.'
        },
        specialties: [
          { slug: 'furniture-assembly', labels: { fr: 'Montage de meubles', pt: 'Montagem de móveis', en: 'Furniture assembly' } },
          { slug: 'wall-fixing', labels: { fr: 'Fixation murale', pt: 'Fixação na parede', en: 'Wall fixing' } },
          { slug: 'small-repairs', labels: { fr: 'Petites réparations', pt: 'Pequenas reparações', en: 'Small repairs' } }
        ]
      }
    ]
  },
  {
    slug: 'cleaning-facility',
    icon: 'clean',
    labels: { fr: 'Nettoyage et facility', pt: 'Limpeza e facility', en: 'Cleaning and facility' },
    description: {
      fr: 'Ménage, fin de bail, nettoyage de bureaux et remise en état.',
      pt: 'Limpeza doméstica, fim de arrendamento, escritórios e limpeza profunda.',
      en: 'Home cleaning, end of tenancy, office cleaning, and deep cleaning.'
    },
    subcategories: [
      {
        slug: 'home-cleaning',
        labels: { fr: 'Nettoyage maison', pt: 'Limpeza doméstica', en: 'Home cleaning' },
        description: {
          fr: 'Nettoyage régulier ou ponctuel pour appartements et maisons.',
          pt: 'Limpeza regular ou pontual para apartamentos e casas.',
          en: 'Regular or one-off cleaning for apartments and houses.'
        },
        specialties: [
          { slug: 'regular-cleaning', labels: { fr: 'Ménage régulier', pt: 'Limpeza regular', en: 'Regular cleaning' } },
          { slug: 'deep-cleaning', labels: { fr: 'Nettoyage en profondeur', pt: 'Limpeza profunda', en: 'Deep cleaning' } },
          { slug: 'window-cleaning', labels: { fr: 'Vitres', pt: 'Janelas', en: 'Window cleaning' } }
        ]
      },
      {
        slug: 'end-of-tenancy',
        labels: { fr: 'Fin de bail', pt: 'Fim de arrendamento', en: 'End of tenancy' },
        description: {
          fr: 'Nettoyage avant état des lieux, appartement vide ou partiellement vide.',
          pt: 'Limpeza antes da vistoria, apartamento vazio ou parcialmente vazio.',
          en: 'Cleaning before handover, empty or partially empty property.'
        },
        specialties: [
          { slug: 'apartment-handover', labels: { fr: 'Appartement avant état des lieux', pt: 'Apartamento antes da vistoria', en: 'Apartment handover' } },
          { slug: 'kitchen-bathroom', labels: { fr: 'Cuisine et salle de bain', pt: 'Cozinha e casa de banho', en: 'Kitchen and bathroom' } }
        ]
      },
      {
        slug: 'office-cleaning',
        labels: { fr: 'Nettoyage bureaux', pt: 'Limpeza de escritórios', en: 'Office cleaning' },
        description: {
          fr: 'Interventions récurrentes pour bureaux, commerces et locaux professionnels.',
          pt: 'Intervenções recorrentes para escritórios, lojas e espaços profissionais.',
          en: 'Recurring work for offices, shops, and professional premises.'
        },
        specialties: [
          { slug: 'weekly-office', labels: { fr: 'Bureaux hebdomadaires', pt: 'Escritórios semanais', en: 'Weekly office cleaning' } },
          { slug: 'commercial-premises', labels: { fr: 'Local commercial', pt: 'Espaço comercial', en: 'Commercial premises' } }
        ]
      }
    ]
  },
  {
    slug: 'automotive-mechanics',
    icon: 'auto',
    labels: { fr: 'Automobile et mécanique', pt: 'Automóvel e mecânica', en: 'Automotive and mechanics' },
    description: {
      fr: 'Entretien auto, pneus, diagnostic, nettoyage véhicule et petits dépannages.',
      pt: 'Manutenção automóvel, pneus, diagnóstico, limpeza e pequenas reparações.',
      en: 'Car maintenance, tyres, diagnostics, vehicle cleaning, and small repairs.'
    },
    subcategories: [
      {
        slug: 'car-maintenance',
        labels: { fr: 'Entretien véhicule', pt: 'Manutenção do veículo', en: 'Vehicle maintenance' },
        description: {
          fr: 'Vidange, filtres, contrôle simple et préparation technique.',
          pt: 'Mudança de óleo, filtros, controlo simples e preparação técnica.',
          en: 'Oil changes, filters, simple checks, and inspection preparation.'
        },
        specialties: [
          { slug: 'oil-service', labels: { fr: 'Vidange et filtres', pt: 'Óleo e filtros', en: 'Oil and filters' } },
          { slug: 'basic-diagnostic', labels: { fr: 'Diagnostic simple', pt: 'Diagnóstico simples', en: 'Basic diagnostic' } },
          { slug: 'inspection-prep', labels: { fr: 'Pré-contrôle technique', pt: 'Pré-inspeção', en: 'Inspection preparation' } }
        ]
      },
      {
        slug: 'tyres',
        labels: { fr: 'Pneus', pt: 'Pneus', en: 'Tyres' },
        description: {
          fr: 'Montage, permutation, pression et conseils saisonniers.',
          pt: 'Montagem, troca, pressão e aconselhamento sazonal.',
          en: 'Fitting, rotation, pressure checks, and seasonal advice.'
        },
        specialties: [
          { slug: 'tyre-change', labels: { fr: 'Changement de pneus', pt: 'Troca de pneus', en: 'Tyre change' } },
          { slug: 'wheel-balancing', labels: { fr: 'Équilibrage', pt: 'Equilibragem', en: 'Wheel balancing' } }
        ]
      },
      {
        slug: 'vehicle-cleaning',
        labels: { fr: 'Nettoyage véhicule', pt: 'Limpeza automóvel', en: 'Vehicle cleaning' },
        description: {
          fr: 'Lavage intérieur, extérieur, détailing léger et remise propre.',
          pt: 'Limpeza interior, exterior, detalhe leve e preparação.',
          en: 'Interior wash, exterior wash, light detailing, and refresh.'
        },
        specialties: [
          { slug: 'interior-cleaning', labels: { fr: 'Intérieur véhicule', pt: 'Interior do veículo', en: 'Vehicle interior' } },
          { slug: 'full-car-cleaning', labels: { fr: 'Nettoyage complet', pt: 'Limpeza completa', en: 'Full car cleaning' } }
        ]
      }
    ]
  },
  {
    slug: 'garden-outdoor',
    icon: 'leaf',
    labels: { fr: 'Jardin et extérieur', pt: 'Jardim e exterior', en: 'Garden and outdoor' },
    description: {
      fr: 'Pelouse, haies, plantations, terrasse et petits travaux extérieurs.',
      pt: 'Relva, sebes, plantações, terraço e pequenos trabalhos exteriores.',
      en: 'Lawn, hedges, planting, terrace, and small outdoor jobs.'
    },
    subcategories: [
      {
        slug: 'garden-maintenance',
        labels: { fr: 'Entretien jardin', pt: 'Manutenção de jardim', en: 'Garden maintenance' },
        description: {
          fr: 'Tonte, taille, désherbage et évacuation des déchets verts.',
          pt: 'Corte, poda, limpeza e remoção de resíduos verdes.',
          en: 'Mowing, trimming, weeding, and green waste removal.'
        },
        specialties: [
          { slug: 'lawn-mowing', labels: { fr: 'Tonte de pelouse', pt: 'Corte de relva', en: 'Lawn mowing' } },
          { slug: 'hedge-trimming', labels: { fr: 'Taille de haie', pt: 'Poda de sebes', en: 'Hedge trimming' } },
          { slug: 'green-waste', labels: { fr: 'Déchets verts', pt: 'Resíduos verdes', en: 'Green waste' } }
        ]
      },
      {
        slug: 'outdoor-small-jobs',
        labels: { fr: 'Petits travaux extérieurs', pt: 'Pequenos trabalhos exteriores', en: 'Small outdoor jobs' },
        description: {
          fr: 'Terrasses, clôtures simples, nettoyage extérieur et rangement.',
          pt: 'Terraços, vedações simples, limpeza exterior e arrumação.',
          en: 'Terraces, simple fences, outdoor cleaning, and tidy-up work.'
        },
        specialties: [
          { slug: 'terrace-cleaning', labels: { fr: 'Nettoyage terrasse', pt: 'Limpeza de terraço', en: 'Terrace cleaning' } },
          { slug: 'fence-repair', labels: { fr: 'Réparation clôture', pt: 'Reparação de vedação', en: 'Fence repair' } }
        ]
      }
    ]
  },
  {
    slug: 'moving-transport',
    icon: 'move',
    labels: { fr: 'Déménagement et transport', pt: 'Mudanças e transporte', en: 'Moving and transport' },
    description: {
      fr: 'Aide au déménagement, transport local, livraison et manutention.',
      pt: 'Ajuda em mudanças, transporte local, entregas e manuseamento.',
      en: 'Moving help, local transport, delivery, and handling.'
    },
    subcategories: [
      {
        slug: 'moving-help',
        labels: { fr: 'Aide au déménagement', pt: 'Ajuda em mudança', en: 'Moving help' },
        description: {
          fr: 'Chargement, déchargement, petit camion et aide ponctuelle.',
          pt: 'Carga, descarga, carrinha pequena e ajuda pontual.',
          en: 'Loading, unloading, small van, and one-off help.'
        },
        specialties: [
          { slug: 'small-move', labels: { fr: 'Petit déménagement', pt: 'Mudança pequena', en: 'Small move' } },
          { slug: 'heavy-items', labels: { fr: 'Objets lourds', pt: 'Objetos pesados', en: 'Heavy items' } }
        ]
      },
      {
        slug: 'local-delivery',
        labels: { fr: 'Livraison locale', pt: 'Entrega local', en: 'Local delivery' },
        description: {
          fr: 'Transport de meubles, électroménager, cartons et petits lots.',
          pt: 'Transporte de móveis, eletrodomésticos, caixas e pequenos lotes.',
          en: 'Transport for furniture, appliances, boxes, and small batches.'
        },
        specialties: [
          { slug: 'furniture-delivery', labels: { fr: 'Livraison meubles', pt: 'Entrega de móveis', en: 'Furniture delivery' } },
          { slug: 'appliance-delivery', labels: { fr: 'Électroménager', pt: 'Eletrodomésticos', en: 'Appliance delivery' } }
        ]
      }
    ]
  },
  {
    slug: 'personal-help',
    icon: 'care',
    labels: { fr: 'Aide personnelle', pt: 'Ajuda pessoal', en: 'Personal help' },
    description: {
      fr: 'Aide à domicile non médicale, courses, assistance et petits services.',
      pt: 'Ajuda domiciliária não médica, compras, assistência e pequenos serviços.',
      en: 'Non-medical home help, errands, assistance, and small services.'
    },
    subcategories: [
      {
        slug: 'errands',
        labels: { fr: 'Courses et démarches', pt: 'Compras e tarefas', en: 'Errands' },
        description: {
          fr: 'Courses, collecte, livraison et accompagnement simple.',
          pt: 'Compras, recolha, entrega e acompanhamento simples.',
          en: 'Shopping, pickup, delivery, and simple assistance.'
        },
        specialties: [
          { slug: 'grocery-help', labels: { fr: 'Aide aux courses', pt: 'Ajuda com compras', en: 'Grocery help' } },
          { slug: 'pickup-dropoff', labels: { fr: 'Collecte et dépôt', pt: 'Recolha e entrega', en: 'Pickup and drop-off' } }
        ]
      },
      {
        slug: 'home-help',
        labels: { fr: 'Aide à domicile', pt: 'Ajuda em casa', en: 'Home help' },
        description: {
          fr: 'Présence, rangement léger, aide ponctuelle et organisation.',
          pt: 'Presença, arrumação leve, ajuda pontual e organização.',
          en: 'Presence, light tidying, occasional help, and organization.'
        },
        specialties: [
          { slug: 'light-home-help', labels: { fr: 'Aide légère', pt: 'Ajuda leve', en: 'Light home help' } },
          { slug: 'home-organization', labels: { fr: 'Organisation maison', pt: 'Organização da casa', en: 'Home organization' } }
        ]
      }
    ]
  },
  {
    slug: 'digital-admin',
    icon: 'digital',
    labels: { fr: 'Digital et administratif', pt: 'Digital e administrativo', en: 'Digital and admin' },
    description: {
      fr: 'Aide informatique, configuration, documents et petits services administratifs.',
      pt: 'Ajuda informática, configuração, documentos e pequenos serviços administrativos.',
      en: 'IT help, setup, documents, and small administrative services.'
    },
    subcategories: [
      {
        slug: 'it-help',
        labels: { fr: 'Aide informatique', pt: 'Ajuda informática', en: 'IT help' },
        description: {
          fr: 'Ordinateurs, téléphone, imprimante, Wi-Fi et configuration.',
          pt: 'Computadores, telemóvel, impressora, Wi-Fi e configuração.',
          en: 'Computers, phones, printers, Wi-Fi, and setup.'
        },
        specialties: [
          { slug: 'wifi-setup', labels: { fr: 'Configuration Wi-Fi', pt: 'Configuração Wi-Fi', en: 'Wi-Fi setup' } },
          { slug: 'computer-help', labels: { fr: 'Aide ordinateur', pt: 'Ajuda com computador', en: 'Computer help' } }
        ]
      },
      {
        slug: 'documents-admin',
        labels: { fr: 'Documents et admin', pt: 'Documentos e administração', en: 'Documents and admin' },
        description: {
          fr: 'Mise en page, formulaires, scans et organisation de documents.',
          pt: 'Formatação, formulários, digitalizações e organização de documentos.',
          en: 'Formatting, forms, scans, and document organization.'
        },
        specialties: [
          { slug: 'document-formatting', labels: { fr: 'Mise en page documents', pt: 'Formatação de documentos', en: 'Document formatting' } },
          { slug: 'form-help', labels: { fr: 'Aide formulaires', pt: 'Ajuda com formulários', en: 'Form help' } }
        ]
      }
    ]
  },
  {
    slug: 'education-tutoring',
    icon: 'education',
    labels: { fr: 'Cours et enseignement', pt: 'Ensino e explicações', en: 'Education and tutoring' },
    description: {
      fr: 'Soutien scolaire, langues, musique, préparation d’examens et cours privés.',
      pt: 'Explicações, idiomas, música, preparação de exames e aulas privadas.',
      en: 'School support, languages, music, exam preparation, and private lessons.'
    },
    subcategories: [
      {
        slug: 'school-support',
        labels: { fr: 'Soutien scolaire', pt: 'Explicações escolares', en: 'School tutoring' },
        description: {
          fr: 'Aide aux devoirs, mathématiques, sciences, lecture et préparation de tests.',
          pt: 'Ajuda com trabalhos de casa, matemática, ciências, leitura e testes.',
          en: 'Homework help, maths, sciences, reading, and test preparation.'
        },
        specialties: [
          { slug: 'math-tutoring', labels: { fr: 'Mathématiques', pt: 'Matemática', en: 'Math tutoring' } },
          { slug: 'science-tutoring', labels: { fr: 'Sciences', pt: 'Ciências', en: 'Science tutoring' } },
          { slug: 'homework-help', labels: { fr: 'Aide aux devoirs', pt: 'Ajuda nos trabalhos de casa', en: 'Homework help' } },
          { slug: 'exam-prep', labels: { fr: 'Préparation examens', pt: 'Preparação para exames', en: 'Exam preparation' } }
        ]
      },
      {
        slug: 'language-lessons',
        labels: { fr: 'Cours de langues', pt: 'Aulas de línguas', en: 'Language lessons' },
        description: {
          fr: 'Cours particuliers de français, luxembourgeois, anglais, portugais et autres langues.',
          pt: 'Aulas privadas de francês, luxemburguês, inglês, português e outras línguas.',
          en: 'Private French, Luxembourgish, English, Portuguese, and other language lessons.'
        },
        specialties: [
          { slug: 'french-lessons', labels: { fr: 'Français', pt: 'Francês', en: 'French lessons' } },
          { slug: 'luxembourgish-lessons', labels: { fr: 'Luxembourgeois', pt: 'Luxemburguês', en: 'Luxembourgish lessons' } },
          { slug: 'english-lessons', labels: { fr: 'Anglais', pt: 'Inglês', en: 'English lessons' } },
          { slug: 'portuguese-lessons', labels: { fr: 'Portugais', pt: 'Português', en: 'Portuguese lessons' } }
        ]
      },
      {
        slug: 'music-lessons',
        labels: { fr: 'Musique', pt: 'Música', en: 'Music' },
        description: {
          fr: 'Cours privés d’instrument, chant, solfège et initiation musicale.',
          pt: 'Aulas privadas de instrumento, canto, teoria e iniciação musical.',
          en: 'Private instrument, singing, music theory, and beginner music lessons.'
        },
        specialties: [
          { slug: 'piano-lessons', labels: { fr: 'Piano', pt: 'Piano', en: 'Piano lessons' } },
          { slug: 'guitar-lessons', labels: { fr: 'Guitare', pt: 'Guitarra', en: 'Guitar lessons' } },
          { slug: 'singing-lessons', labels: { fr: 'Chant', pt: 'Canto', en: 'Singing lessons' } }
        ]
      }
    ]
  },
  {
    slug: 'sport-coaching',
    icon: 'fitness',
    labels: { fr: 'Sport et coaching', pt: 'Desporto e personal trainer', en: 'Sport and coaching' },
    description: {
      fr: 'Personal trainer, remise en forme, yoga, pilates et coaching sportif local.',
      pt: 'Personal trainer, fitness, yoga, pilates e acompanhamento desportivo local.',
      en: 'Personal training, fitness, yoga, pilates, and local sports coaching.'
    },
    subcategories: [
      {
        slug: 'personal-training',
        labels: { fr: 'Personal trainer', pt: 'Personal trainer', en: 'Personal training' },
        description: {
          fr: 'Coaching individuel à domicile, en salle, dehors ou à distance.',
          pt: 'Treino individual em casa, ginásio, exterior ou à distância.',
          en: 'One-to-one coaching at home, gym, outdoors, or remotely.'
        },
        specialties: [
          { slug: 'fitness-program', labels: { fr: 'Programme fitness', pt: 'Programa fitness', en: 'Fitness program' } },
          { slug: 'strength-training', labels: { fr: 'Renforcement musculaire', pt: 'Treino de força', en: 'Strength training' } },
          { slug: 'weight-loss', labels: { fr: 'Perte de poids', pt: 'Perda de peso', en: 'Weight loss' } }
        ]
      },
      {
        slug: 'yoga-pilates',
        labels: { fr: 'Yoga et pilates', pt: 'Yoga e pilates', en: 'Yoga and pilates' },
        description: {
          fr: 'Cours privés ou petits groupes pour mobilité, posture et respiration.',
          pt: 'Aulas privadas ou pequenos grupos para mobilidade, postura e respiração.',
          en: 'Private or small group lessons for mobility, posture, and breathing.'
        },
        specialties: [
          { slug: 'yoga-private', labels: { fr: 'Yoga privé', pt: 'Yoga privado', en: 'Private yoga' } },
          { slug: 'pilates-private', labels: { fr: 'Pilates privé', pt: 'Pilates privado', en: 'Private pilates' } },
          { slug: 'mobility-session', labels: { fr: 'Mobilité', pt: 'Mobilidade', en: 'Mobility session' } }
        ]
      },
      {
        slug: 'outdoor-sports',
        labels: { fr: 'Sports extérieurs', pt: 'Desporto exterior', en: 'Outdoor sports' },
        description: {
          fr: 'Course à pied, vélo, préparation physique et accompagnement sportif.',
          pt: 'Corrida, ciclismo, preparação física e acompanhamento desportivo.',
          en: 'Running, cycling, physical preparation, and sports support.'
        },
        specialties: [
          { slug: 'running-coach', labels: { fr: 'Coach course à pied', pt: 'Treinador de corrida', en: 'Running coach' } },
          { slug: 'cycling-coach', labels: { fr: 'Coach vélo', pt: 'Treinador de ciclismo', en: 'Cycling coach' } }
        ]
      }
    ]
  },
  {
    slug: 'music-audio',
    icon: 'music',
    labels: { fr: 'Musique', pt: 'Música', en: 'Music' },
    description: {
      fr: 'Cours de musique, musiciens pour événements, production audio et services liés aux instruments.',
      pt: 'Aulas de música, músicos para eventos, produção de áudio e serviços ligados a instrumentos.',
      en: 'Music lessons, musicians for events, audio production, and instrument-related services.'
    },
    subcategories: [
      {
        slug: 'music-lessons',
        labels: { fr: 'Cours de musique', pt: 'Aulas de música', en: 'Music lessons' },
        description: {
          fr: 'Cours particuliers d’instrument, chant, solfège et initiation musicale.',
          pt: 'Aulas particulares de instrumento, canto, teoria musical e iniciação musical.',
          en: 'Private instrument, singing, music theory, and beginner music lessons.'
        },
        specialties: [
          { slug: 'piano-lessons', labels: { fr: 'Piano', pt: 'Piano', en: 'Piano lessons' } },
          { slug: 'guitar-lessons', labels: { fr: 'Guitare', pt: 'Guitarra', en: 'Guitar lessons' } },
          { slug: 'singing-lessons', labels: { fr: 'Chant', pt: 'Canto', en: 'Singing lessons' } },
          { slug: 'drum-lessons', labels: { fr: 'Batterie', pt: 'Bateria', en: 'Drum lessons' } },
          { slug: 'music-theory', labels: { fr: 'Solfège', pt: 'Teoria musical', en: 'Music theory' } }
        ]
      },
      {
        slug: 'musicians-events',
        labels: { fr: 'Musiciens pour événements', pt: 'Músicos para eventos', en: 'Musicians for events' },
        description: {
          fr: 'DJ, chanteurs, groupes, musiciens solo et animation musicale.',
          pt: 'DJ, cantores, bandas, músicos solo e animação musical.',
          en: 'DJs, singers, bands, solo musicians, and music entertainment.'
        },
        specialties: [
          { slug: 'dj-service', labels: { fr: 'DJ', pt: 'DJ', en: 'DJ' } },
          { slug: 'singer', labels: { fr: 'Chanteur', pt: 'Cantor', en: 'Singer' } },
          { slug: 'live-band', labels: { fr: 'Groupe live', pt: 'Banda ao vivo', en: 'Live band' } },
          { slug: 'solo-musician', labels: { fr: 'Musicien solo', pt: 'Músico solo', en: 'Solo musician' } }
        ]
      },
      {
        slug: 'audio-production',
        labels: { fr: 'Production audio', pt: 'Produção de áudio', en: 'Audio production' },
        description: {
          fr: 'Enregistrement, mixage, mastering, podcast et accompagnement studio.',
          pt: 'Gravação, mistura, masterização, podcast e apoio em estúdio.',
          en: 'Recording, mixing, mastering, podcast, and studio support.'
        },
        specialties: [
          { slug: 'recording', labels: { fr: 'Enregistrement', pt: 'Gravação', en: 'Recording' } },
          { slug: 'mixing-mastering', labels: { fr: 'Mixage et mastering', pt: 'Mistura e masterização', en: 'Mixing and mastering' } },
          { slug: 'podcast-audio', labels: { fr: 'Audio podcast', pt: 'Áudio para podcast', en: 'Podcast audio' } }
        ]
      },
      {
        slug: 'instruments-services',
        labels: { fr: 'Instruments et matériel', pt: 'Instrumentos e material', en: 'Instruments and gear' },
        description: {
          fr: 'Accordage, petites réparations, installation et location de matériel musical.',
          pt: 'Afinação, pequenas reparações, instalação e aluguer de material musical.',
          en: 'Tuning, small repairs, setup, and rental of music equipment.'
        },
        specialties: [
          { slug: 'piano-tuning', labels: { fr: 'Accordage piano', pt: 'Afinação de piano', en: 'Piano tuning' } },
          { slug: 'instrument-repair', labels: { fr: 'Réparation instrument', pt: 'Reparação de instrumento', en: 'Instrument repair' } },
          { slug: 'sound-equipment-rental', labels: { fr: 'Location sonorisation', pt: 'Aluguer de som', en: 'Sound equipment rental' } }
        ]
      }
    ]
  },
  {
    slug: 'beauty-wellness',
    icon: 'beauty',
    labels: { fr: 'Beauté et bien-être', pt: 'Beleza e bem-estar', en: 'Beauty and wellness' },
    description: {
      fr: 'Coiffure, esthétique, maquillage, massage bien-être et soins à domicile.',
      pt: 'Cabeleireiro, estética, maquilhagem, massagem de bem-estar e cuidados ao domicílio.',
      en: 'Hair, beauty, makeup, wellness massage, and at-home care.'
    },
    subcategories: [
      {
        slug: 'hair-barber',
        labels: { fr: 'Coiffure et barbe', pt: 'Cabelo e barba', en: 'Hair and barber' },
        description: {
          fr: 'Coupe, brushing, coloration simple, barbe et coiffure événement.',
          pt: 'Corte, brushing, coloração simples, barba e penteados para eventos.',
          en: 'Haircut, blow-dry, simple color, beard, and event styling.'
        },
        specialties: [
          { slug: 'haircut-home', labels: { fr: 'Coupe à domicile', pt: 'Corte ao domicílio', en: 'At-home haircut' } },
          { slug: 'barber-home', labels: { fr: 'Barbier', pt: 'Barbeiro', en: 'Barber' } },
          { slug: 'event-hair', labels: { fr: 'Coiffure événement', pt: 'Penteado para evento', en: 'Event hair' } }
        ]
      },
      {
        slug: 'nails-makeup',
        labels: { fr: 'Ongles et maquillage', pt: 'Unhas e maquilhagem', en: 'Nails and makeup' },
        description: {
          fr: 'Manucure, pédicure, maquillage naturel ou événementiel.',
          pt: 'Manicure, pedicure, maquilhagem natural ou para eventos.',
          en: 'Manicure, pedicure, natural makeup, or event makeup.'
        },
        specialties: [
          { slug: 'manicure', labels: { fr: 'Manucure', pt: 'Manicure', en: 'Manicure' } },
          { slug: 'pedicure', labels: { fr: 'Pédicure', pt: 'Pedicure', en: 'Pedicure' } },
          { slug: 'makeup-event', labels: { fr: 'Maquillage événement', pt: 'Maquilhagem para evento', en: 'Event makeup' } }
        ]
      },
      {
        slug: 'wellness-massage',
        labels: { fr: 'Massage bien-être', pt: 'Massagem de bem-estar', en: 'Wellness massage' },
        description: {
          fr: 'Massages non médicaux, relaxation et récupération légère.',
          pt: 'Massagens não médicas, relaxamento e recuperação leve.',
          en: 'Non-medical massage, relaxation, and light recovery.'
        },
        specialties: [
          { slug: 'relaxation-massage', labels: { fr: 'Massage relaxation', pt: 'Massagem de relaxamento', en: 'Relaxation massage' } },
          { slug: 'sports-recovery', labels: { fr: 'Récupération sportive', pt: 'Recuperação desportiva', en: 'Sports recovery' } }
        ]
      }
    ]
  },
  {
    slug: 'pet-services',
    icon: 'pets',
    labels: { fr: 'Animaux', pt: 'Animais', en: 'Pets' },
    description: {
      fr: 'Promenade, garde, visite à domicile, transport et toilettage simple.',
      pt: 'Passeio, petsitting, visitas ao domicílio, transporte e grooming simples.',
      en: 'Walking, pet sitting, home visits, transport, and simple grooming.'
    },
    subcategories: [
      {
        slug: 'dog-walking',
        labels: { fr: 'Promenade chien', pt: 'Passeio de cães', en: 'Dog walking' },
        description: {
          fr: 'Promenades régulières ou ponctuelles, petits et grands chiens.',
          pt: 'Passeios regulares ou pontuais, cães pequenos e grandes.',
          en: 'Regular or one-off walks for small and large dogs.'
        },
        specialties: [
          { slug: 'regular-dog-walk', labels: { fr: 'Promenade régulière', pt: 'Passeio regular', en: 'Regular dog walk' } },
          { slug: 'urgent-dog-walk', labels: { fr: 'Promenade urgente', pt: 'Passeio urgente', en: 'Urgent dog walk' } }
        ]
      },
      {
        slug: 'pet-sitting',
        labels: { fr: 'Garde animaux', pt: 'Petsitting', en: 'Pet sitting' },
        description: {
          fr: 'Visite à domicile, nourriture, présence et soins simples.',
          pt: 'Visita ao domicílio, alimentação, presença e cuidados simples.',
          en: 'Home visits, feeding, presence, and simple care.'
        },
        specialties: [
          { slug: 'cat-visit', labels: { fr: 'Visite chat', pt: 'Visita para gato', en: 'Cat visit' } },
          { slug: 'home-pet-sitting', labels: { fr: 'Garde à domicile', pt: 'Guarda ao domicílio', en: 'At-home pet sitting' } },
          { slug: 'pet-transport', labels: { fr: 'Transport animal', pt: 'Transporte de animal', en: 'Pet transport' } }
        ]
      },
      {
        slug: 'pet-grooming',
        labels: { fr: 'Toilettage simple', pt: 'Grooming simples', en: 'Simple grooming' },
        description: {
          fr: 'Brossage, bain, coupe simple et entretien courant.',
          pt: 'Escovagem, banho, corte simples e cuidado regular.',
          en: 'Brushing, washing, simple trimming, and regular care.'
        },
        specialties: [
          { slug: 'dog-wash', labels: { fr: 'Bain chien', pt: 'Banho de cão', en: 'Dog wash' } },
          { slug: 'brushing', labels: { fr: 'Brossage', pt: 'Escovagem', en: 'Brushing' } }
        ]
      }
    ]
  },
  {
    slug: 'childcare-family',
    icon: 'childcare',
    labels: { fr: 'Enfants et famille', pt: 'Crianças e família', en: 'Children and family' },
    description: {
      fr: 'Babysitting, sortie d’école, aide familiale et activités pour enfants.',
      pt: 'Babysitting, saída da escola, ajuda familiar e atividades para crianças.',
      en: 'Babysitting, school pickup, family help, and activities for children.'
    },
    subcategories: [
      {
        slug: 'babysitting',
        labels: { fr: 'Babysitting', pt: 'Babysitting', en: 'Babysitting' },
        description: {
          fr: 'Garde ponctuelle, soirées, week-ends et aide après l’école.',
          pt: 'Guarda pontual, noites, fins de semana e apoio depois da escola.',
          en: 'One-off care, evenings, weekends, and after-school support.'
        },
        specialties: [
          { slug: 'evening-babysitting', labels: { fr: 'Soirée', pt: 'Noite', en: 'Evening babysitting' } },
          { slug: 'weekend-babysitting', labels: { fr: 'Week-end', pt: 'Fim de semana', en: 'Weekend babysitting' } },
          { slug: 'after-school-care', labels: { fr: 'Après l’école', pt: 'Depois da escola', en: 'After-school care' } }
        ]
      },
      {
        slug: 'school-pickup',
        labels: { fr: 'Sortie d’école', pt: 'Recolha na escola', en: 'School pickup' },
        description: {
          fr: 'Accompagnement école, activités, maison et aide de transition.',
          pt: 'Acompanhamento escola, atividades, casa e ajuda de transição.',
          en: 'School, activity, home, and transition support.'
        },
        specialties: [
          { slug: 'pickup-school', labels: { fr: 'Récupération école', pt: 'Recolha escolar', en: 'School pickup' } },
          { slug: 'activity-dropoff', labels: { fr: 'Activités enfants', pt: 'Atividades das crianças', en: 'Children activities' } }
        ]
      }
    ]
  },
  {
    slug: 'renovation-construction',
    icon: 'construction',
    labels: { fr: 'Travaux et rénovation', pt: 'Obras e renovação', en: 'Works and renovation' },
    description: {
      fr: 'Carrelage, sols, menuiserie, maçonnerie légère et petits chantiers.',
      pt: 'Azulejos, pavimentos, carpintaria, pequena alvenaria e pequenas obras.',
      en: 'Tiling, flooring, carpentry, light masonry, and small works.'
    },
    subcategories: [
      {
        slug: 'tiling-flooring',
        labels: { fr: 'Carrelage et sols', pt: 'Azulejos e pavimentos', en: 'Tiling and flooring' },
        description: {
          fr: 'Pose, réparation, joints, parquet, vinyle et petites surfaces.',
          pt: 'Instalação, reparação, juntas, parquet, vinil e pequenas áreas.',
          en: 'Installation, repair, joints, parquet, vinyl, and small surfaces.'
        },
        specialties: [
          { slug: 'tile-repair', labels: { fr: 'Réparation carrelage', pt: 'Reparação de azulejo', en: 'Tile repair' } },
          { slug: 'floor-installation', labels: { fr: 'Pose de sol', pt: 'Instalação de pavimento', en: 'Floor installation' } },
          { slug: 'grout-silicone', labels: { fr: 'Joints et silicone', pt: 'Juntas e silicone', en: 'Grout and silicone' } }
        ]
      },
      {
        slug: 'carpentry',
        labels: { fr: 'Menuiserie', pt: 'Carpintaria', en: 'Carpentry' },
        description: {
          fr: 'Portes, étagères, ajustements bois et petites créations sur mesure.',
          pt: 'Portas, prateleiras, ajustes em madeira e pequenas criações à medida.',
          en: 'Doors, shelves, wood adjustments, and small custom work.'
        },
        specialties: [
          { slug: 'door-adjustment', labels: { fr: 'Ajustement porte', pt: 'Ajuste de porta', en: 'Door adjustment' } },
          { slug: 'shelves-custom', labels: { fr: 'Étagères sur mesure', pt: 'Prateleiras à medida', en: 'Custom shelves' } }
        ]
      },
      {
        slug: 'light-masonry',
        labels: { fr: 'Maçonnerie légère', pt: 'Alvenaria ligeira', en: 'Light masonry' },
        description: {
          fr: 'Petits murs, trous, reprises simples et travaux de finition.',
          pt: 'Pequenas paredes, buracos, reparações simples e acabamentos.',
          en: 'Small walls, holes, simple repairs, and finishing work.'
        },
        specialties: [
          { slug: 'wall-repair', labels: { fr: 'Réparation mur', pt: 'Reparação de parede', en: 'Wall repair' } },
          { slug: 'small-masonry', labels: { fr: 'Petite maçonnerie', pt: 'Pequena alvenaria', en: 'Small masonry' } }
        ]
      }
    ]
  },
  {
    slug: 'appliances-electronics',
    icon: 'electronics',
    labels: { fr: 'Électroménager et électronique', pt: 'Eletrodomésticos e eletrónica', en: 'Appliances and electronics' },
    description: {
      fr: 'Réparation, installation, configuration et diagnostic d’appareils domestiques.',
      pt: 'Reparação, instalação, configuração e diagnóstico de aparelhos domésticos.',
      en: 'Repair, installation, setup, and diagnostics for home devices.'
    },
    subcategories: [
      {
        slug: 'appliance-repair',
        labels: { fr: 'Réparation électroménager', pt: 'Reparação de eletrodomésticos', en: 'Appliance repair' },
        description: {
          fr: 'Lave-linge, lave-vaisselle, sèche-linge, four et petits diagnostics.',
          pt: 'Máquina de lavar, loiça, secador, forno e pequenos diagnósticos.',
          en: 'Washing machine, dishwasher, dryer, oven, and simple diagnostics.'
        },
        specialties: [
          { slug: 'washing-machine', labels: { fr: 'Machine à laver', pt: 'Máquina de lavar roupa', en: 'Washing machine' } },
          { slug: 'dishwasher', labels: { fr: 'Lave-vaisselle', pt: 'Máquina de lavar loiça', en: 'Dishwasher' } },
          { slug: 'oven-hob', labels: { fr: 'Four et plaque', pt: 'Forno e placa', en: 'Oven and hob' } }
        ]
      },
      {
        slug: 'device-repair',
        labels: { fr: 'Téléphone et ordinateur', pt: 'Telemóvel e computador', en: 'Phone and computer' },
        description: {
          fr: 'Diagnostic, configuration, transfert de données et petites réparations.',
          pt: 'Diagnóstico, configuração, transferência de dados e pequenas reparações.',
          en: 'Diagnostics, setup, data transfer, and small repairs.'
        },
        specialties: [
          { slug: 'phone-help', labels: { fr: 'Aide téléphone', pt: 'Ajuda com telemóvel', en: 'Phone help' } },
          { slug: 'laptop-help', labels: { fr: 'Aide ordinateur portable', pt: 'Ajuda com portátil', en: 'Laptop help' } },
          { slug: 'data-transfer', labels: { fr: 'Transfert données', pt: 'Transferência de dados', en: 'Data transfer' } }
        ]
      },
      {
        slug: 'tv-audio-installation',
        labels: { fr: 'TV et audio', pt: 'TV e áudio', en: 'TV and audio' },
        description: {
          fr: 'Fixation TV, son, box internet, câbles et configuration simple.',
          pt: 'Fixação de TV, som, box internet, cabos e configuração simples.',
          en: 'TV mounting, sound, internet box, cables, and simple setup.'
        },
        specialties: [
          { slug: 'tv-wall-mount', labels: { fr: 'Fixation TV murale', pt: 'Fixação TV na parede', en: 'TV wall mount' } },
          { slug: 'audio-setup', labels: { fr: 'Configuration audio', pt: 'Configuração áudio', en: 'Audio setup' } }
        ]
      }
    ]
  },
  {
    slug: 'creative-media',
    icon: 'creative',
    labels: { fr: 'Photo, vidéo et création', pt: 'Foto, vídeo e criação', en: 'Photo, video and creative' },
    description: {
      fr: 'Photographie, vidéo, retouche, design simple et contenu local.',
      pt: 'Fotografia, vídeo, edição, design simples e conteúdo local.',
      en: 'Photography, video, editing, simple design, and local content.'
    },
    subcategories: [
      {
        slug: 'photography',
        labels: { fr: 'Photographie', pt: 'Fotografia', en: 'Photography' },
        description: {
          fr: 'Portraits, immobilier, produits, événements et photos professionnelles.',
          pt: 'Retratos, imobiliário, produtos, eventos e fotos profissionais.',
          en: 'Portraits, real estate, products, events, and professional photos.'
        },
        specialties: [
          { slug: 'portrait-photo', labels: { fr: 'Portrait', pt: 'Retrato', en: 'Portrait photo' } },
          { slug: 'real-estate-photo', labels: { fr: 'Photo immobilier', pt: 'Fotografia imobiliária', en: 'Real estate photo' } },
          { slug: 'event-photo', labels: { fr: 'Photo événement', pt: 'Fotografia de evento', en: 'Event photo' } }
        ]
      },
      {
        slug: 'video-content',
        labels: { fr: 'Vidéo et contenu', pt: 'Vídeo e conteúdo', en: 'Video and content' },
        description: {
          fr: 'Captation simple, montage court, réseaux sociaux et contenu business.',
          pt: 'Captação simples, edição curta, redes sociais e conteúdo empresarial.',
          en: 'Simple filming, short edits, social media, and business content.'
        },
        specialties: [
          { slug: 'short-video', labels: { fr: 'Vidéo courte', pt: 'Vídeo curto', en: 'Short video' } },
          { slug: 'social-content', labels: { fr: 'Contenu réseaux sociaux', pt: 'Conteúdo para redes sociais', en: 'Social content' } }
        ]
      },
      {
        slug: 'graphic-design',
        labels: { fr: 'Design graphique', pt: 'Design gráfico', en: 'Graphic design' },
        description: {
          fr: 'Flyer, carte, mise en page, visuels simples et retouches.',
          pt: 'Flyer, cartão, paginação, visuais simples e retoques.',
          en: 'Flyer, card, layout, simple visuals, and retouching.'
        },
        specialties: [
          { slug: 'flyer-design', labels: { fr: 'Flyer', pt: 'Flyer', en: 'Flyer design' } },
          { slug: 'basic-branding', labels: { fr: 'Identité simple', pt: 'Identidade simples', en: 'Basic branding' } }
        ]
      }
    ]
  },
  {
    slug: 'food-catering',
    icon: 'food',
    labels: { fr: 'Cuisine et catering', pt: 'Cozinha e catering', en: 'Food and catering' },
    description: {
      fr: 'Chef à domicile, repas, catering, pâtisserie et aide cuisine événement.',
      pt: 'Chef ao domicílio, refeições, catering, pastelaria e ajuda em cozinha para eventos.',
      en: 'Private cook, meals, catering, cakes, and event kitchen help.'
    },
    subcategories: [
      {
        slug: 'private-cook',
        labels: { fr: 'Chef à domicile', pt: 'Chef ao domicílio', en: 'Private cook' },
        description: {
          fr: 'Repas familial, dîner privé, préparation hebdomadaire et cuisine simple.',
          pt: 'Refeição familiar, jantar privado, preparação semanal e cozinha simples.',
          en: 'Family meal, private dinner, weekly prep, and simple cooking.'
        },
        specialties: [
          { slug: 'home-meal', labels: { fr: 'Repas à domicile', pt: 'Refeição em casa', en: 'Home meal' } },
          { slug: 'meal-prep', labels: { fr: 'Préparation repas', pt: 'Meal prep', en: 'Meal prep' } },
          { slug: 'private-dinner', labels: { fr: 'Dîner privé', pt: 'Jantar privado', en: 'Private dinner' } }
        ]
      },
      {
        slug: 'catering-party',
        labels: { fr: 'Catering et fête', pt: 'Catering e festa', en: 'Catering and party' },
        description: {
          fr: 'Buffet, petites réceptions, service, boissons et aide événementielle.',
          pt: 'Buffet, pequenas receções, serviço, bebidas e ajuda em eventos.',
          en: 'Buffet, small receptions, service, drinks, and event help.'
        },
        specialties: [
          { slug: 'small-catering', labels: { fr: 'Petit catering', pt: 'Pequeno catering', en: 'Small catering' } },
          { slug: 'birthday-cake', labels: { fr: 'Gâteau anniversaire', pt: 'Bolo de aniversário', en: 'Birthday cake' } },
          { slug: 'event-service', labels: { fr: 'Service événement', pt: 'Serviço de evento', en: 'Event service' } }
        ]
      }
    ]
  },
  {
    slug: 'security-access',
    icon: 'security',
    labels: { fr: 'Sécurité et accès', pt: 'Segurança e acessos', en: 'Security and access' },
    description: {
      fr: 'Serrurerie, alarmes, contrôle d’accès, caméras et petits dépannages.',
      pt: 'Serralharia, alarmes, controlo de acesso, câmaras e pequenas reparações.',
      en: 'Locksmith, alarms, access control, cameras, and small repairs.'
    },
    subcategories: [
      {
        slug: 'locksmith',
        labels: { fr: 'Serrurerie', pt: 'Serralharia', en: 'Locksmith' },
        description: {
          fr: 'Serrures, clés, cylindres, portes bloquées et dépannage simple.',
          pt: 'Fechaduras, chaves, cilindros, portas bloqueadas e reparação simples.',
          en: 'Locks, keys, cylinders, blocked doors, and simple repair.'
        },
        specialties: [
          { slug: 'lock-change', labels: { fr: 'Changement serrure', pt: 'Troca de fechadura', en: 'Lock change' } },
          { slug: 'blocked-door', labels: { fr: 'Porte bloquée', pt: 'Porta bloqueada', en: 'Blocked door' } },
          { slug: 'key-copy', labels: { fr: 'Copie clé', pt: 'Cópia de chave', en: 'Key copy' } }
        ]
      },
      {
        slug: 'alarm-camera',
        labels: { fr: 'Alarmes et caméras', pt: 'Alarmes e câmaras', en: 'Alarms and cameras' },
        description: {
          fr: 'Installation simple, configuration, Wi-Fi et conseils sécurité.',
          pt: 'Instalação simples, configuração, Wi-Fi e aconselhamento de segurança.',
          en: 'Simple installation, setup, Wi-Fi, and security advice.'
        },
        specialties: [
          { slug: 'camera-installation', labels: { fr: 'Installation caméra', pt: 'Instalação de câmara', en: 'Camera installation' } },
          { slug: 'alarm-setup', labels: { fr: 'Configuration alarme', pt: 'Configuração de alarme', en: 'Alarm setup' } }
        ]
      }
    ]
  },
  {
    slug: 'textile-laundry',
    icon: 'textile',
    labels: { fr: 'Textile et lavage', pt: 'Têxtil e lavandaria', en: 'Textile and laundry' },
    description: {
      fr: 'Repassage, couture, retouches, lavage, collecte et livraison de linge.',
      pt: 'Engomadoria, costura, arranjos, lavagem, recolha e entrega de roupa.',
      en: 'Ironing, sewing, alterations, washing, pickup, and laundry delivery.'
    },
    subcategories: [
      {
        slug: 'ironing-laundry',
        labels: { fr: 'Repassage et linge', pt: 'Engomadoria e roupa', en: 'Ironing and laundry' },
        description: {
          fr: 'Repassage régulier, paniers de linge, chemises et draps.',
          pt: 'Engomadoria regular, cestos de roupa, camisas e lençóis.',
          en: 'Regular ironing, laundry baskets, shirts, and sheets.'
        },
        specialties: [
          { slug: 'ironing', labels: { fr: 'Repassage', pt: 'Engomadoria', en: 'Ironing' } },
          { slug: 'laundry-pickup', labels: { fr: 'Collecte linge', pt: 'Recolha de roupa', en: 'Laundry pickup' } },
          { slug: 'shirt-service', labels: { fr: 'Chemises', pt: 'Camisas', en: 'Shirt service' } }
        ]
      },
      {
        slug: 'sewing-alterations',
        labels: { fr: 'Couture et retouches', pt: 'Costura e arranjos', en: 'Sewing and alterations' },
        description: {
          fr: 'Ourlets, fermetures, petites réparations textile et ajustements.',
          pt: 'Bainhas, fechos, pequenas reparações têxteis e ajustes.',
          en: 'Hems, zips, small textile repairs, and adjustments.'
        },
        specialties: [
          { slug: 'hem-alteration', labels: { fr: 'Ourlet', pt: 'Bainha', en: 'Hem alteration' } },
          { slug: 'zip-repair', labels: { fr: 'Fermeture éclair', pt: 'Fecho éclair', en: 'Zip repair' } },
          { slug: 'clothing-adjustment', labels: { fr: 'Ajustement vêtement', pt: 'Ajuste de roupa', en: 'Clothing adjustment' } }
        ]
      }
    ]
  },
  {
    slug: 'events',
    icon: 'events',
    labels: { fr: 'Événements', pt: 'Eventos', en: 'Events' },
    description: {
      fr: 'Aide événementielle, installation, accueil, service et petites animations.',
      pt: 'Ajuda em eventos, montagem, receção, serviço e pequenas animações.',
      en: 'Event help, setup, welcome desk, service, and small activities.'
    },
    subcategories: [
      {
        slug: 'event-help',
        labels: { fr: 'Aide événementielle', pt: 'Ajuda em eventos', en: 'Event help' },
        description: {
          fr: 'Renfort ponctuel pour organiser, installer ou gérer un événement.',
          pt: 'Reforço pontual para organizar, montar ou gerir um evento.',
          en: 'One-off support to organize, set up, or run an event.'
        },
        specialties: [
          { slug: 'event-staff', labels: { fr: 'Personnel événementiel', pt: 'Pessoal de eventos', en: 'Event staff' } },
          { slug: 'setup-cleanup', labels: { fr: 'Installation et rangement', pt: 'Montagem e arrumação', en: 'Setup and cleanup' } }
        ]
      },
      {
        slug: 'party-services',
        labels: { fr: 'Services fête', pt: 'Serviços para festas', en: 'Party services' },
        description: {
          fr: 'Petits services pour anniversaires, soirées et événements privés.',
          pt: 'Pequenos serviços para aniversários, festas e eventos privados.',
          en: 'Small services for birthdays, parties, and private events.'
        },
        specialties: [
          { slug: 'party-helper', labels: { fr: 'Aide soirée', pt: 'Ajuda em festa', en: 'Party helper' } },
          { slug: 'basic-animation', labels: { fr: 'Animation simple', pt: 'Animação simples', en: 'Basic entertainment' } }
        ]
      }
    ]
  },
  {
    slug: 'business-services',
    icon: 'business',
    labels: { fr: 'Business', pt: 'Negócios', en: 'Business' },
    description: {
      fr: 'Support administratif, opérations, documents, assistance aux petites entreprises.',
      pt: 'Apoio administrativo, operações, documentos e assistência a pequenas empresas.',
      en: 'Admin support, operations, documents, and small business assistance.'
    },
    subcategories: [
      {
        slug: 'admin-support',
        labels: { fr: 'Support administratif', pt: 'Apoio administrativo', en: 'Admin support' },
        description: {
          fr: 'Documents, formulaires, organisation et suivi opérationnel.',
          pt: 'Documentos, formulários, organização e acompanhamento operacional.',
          en: 'Documents, forms, organization, and operational follow-up.'
        },
        specialties: [
          { slug: 'document-admin', labels: { fr: 'Documents administratifs', pt: 'Documentos administrativos', en: 'Admin documents' } },
          { slug: 'small-business-ops', labels: { fr: 'Opérations petite entreprise', pt: 'Operações de pequena empresa', en: 'Small business operations' } }
        ]
      },
      {
        slug: 'local-marketing',
        labels: { fr: 'Marketing local', pt: 'Marketing local', en: 'Local marketing' },
        description: {
          fr: 'Aide simple pour fiches, photos, textes et présence locale.',
          pt: 'Ajuda simples com perfis, fotos, textos e presença local.',
          en: 'Simple help with profiles, photos, copy, and local presence.'
        },
        specialties: [
          { slug: 'business-profile', labels: { fr: 'Fiche entreprise', pt: 'Perfil de empresa', en: 'Business profile' } },
          { slug: 'local-content', labels: { fr: 'Contenu local', pt: 'Conteúdo local', en: 'Local content' } }
        ]
      }
    ]
  },
  {
    slug: 'shopping-delivery',
    icon: 'move',
    labels: { fr: 'Courses et livraison', pt: 'Compras e entregas', en: 'Shopping and delivery' },
    description: {
      fr: 'Courses, collecte, livraison locale, files d’attente et petits trajets utiles.',
      pt: 'Compras, recolhas, entregas locais, filas de espera e pequenas deslocações úteis.',
      en: 'Shopping, pickups, local deliveries, queueing, and small useful errands.'
    },
    subcategories: [
      {
        slug: 'personal-shopping',
        labels: { fr: 'Courses personnelles', pt: 'Compras pessoais', en: 'Personal shopping' },
        description: {
          fr: 'Courses alimentaires, pharmacie, achats ponctuels et petites commissions.',
          pt: 'Compras de supermercado, farmácia, compras pontuais e pequenos recados.',
          en: 'Groceries, pharmacy, one-off purchases, and small errands.'
        },
        specialties: [
          { slug: 'grocery-run', labels: { fr: 'Courses alimentaires', pt: 'Compras de supermercado', en: 'Grocery run' } },
          { slug: 'pharmacy-pickup', labels: { fr: 'Pharmacie', pt: 'Recolha em farmácia', en: 'Pharmacy pickup' } },
          { slug: 'queue-service', labels: { fr: 'File d’attente', pt: 'Serviço de fila', en: 'Queue service' } }
        ]
      },
      {
        slug: 'small-deliveries',
        labels: { fr: 'Petites livraisons', pt: 'Pequenas entregas', en: 'Small deliveries' },
        description: {
          fr: 'Documents, colis, clés, objets légers et trajets locaux rapides.',
          pt: 'Documentos, encomendas, chaves, objetos leves e trajetos locais rápidos.',
          en: 'Documents, parcels, keys, light items, and quick local routes.'
        },
        specialties: [
          { slug: 'document-delivery', labels: { fr: 'Documents', pt: 'Documentos', en: 'Document delivery' } },
          { slug: 'parcel-pickup', labels: { fr: 'Colis', pt: 'Recolha de encomendas', en: 'Parcel pickup' } }
        ]
      }
    ]
  },
  {
    slug: 'home-sitting-care',
    icon: 'care',
    labels: { fr: 'Surveillance maison', pt: 'Vigilância de casa', en: 'Home sitting' },
    description: {
      fr: 'Présence à domicile, arrosage, courrier, contrôle visuel et aide pendant absences.',
      pt: 'Presença em casa, rega, correio, verificação visual e apoio durante ausências.',
      en: 'Home presence, watering, mail, visual checks, and support while away.'
    },
    subcategories: [
      {
        slug: 'home-checks',
        labels: { fr: 'Contrôle domicile', pt: 'Verificação da casa', en: 'Home checks' },
        description: {
          fr: 'Passages réguliers, photos, courrier, volets, chauffage et signalement.',
          pt: 'Passagens regulares, fotos, correio, estores, aquecimento e alertas.',
          en: 'Regular visits, photos, mail, shutters, heating, and alerts.'
        },
        specialties: [
          { slug: 'holiday-home-check', labels: { fr: 'Absence vacances', pt: 'Ausência de férias', en: 'Holiday home check' } },
          { slug: 'mail-plants', labels: { fr: 'Courrier et plantes', pt: 'Correio e plantas', en: 'Mail and plants' } }
        ]
      },
      {
        slug: 'key-presence',
        labels: { fr: 'Présence et clés', pt: 'Presença e chaves', en: 'Presence and keys' },
        description: {
          fr: 'Ouverture porte, accueil technicien, remise de clés et présence ponctuelle.',
          pt: 'Abrir porta, receber técnico, entrega de chaves e presença pontual.',
          en: 'Door opening, technician access, key handover, and one-off presence.'
        },
        specialties: [
          { slug: 'technician-access', labels: { fr: 'Accès technicien', pt: 'Acesso para técnico', en: 'Technician access' } },
          { slug: 'key-handover-home', labels: { fr: 'Remise de clés', pt: 'Entrega de chaves', en: 'Key handover' } }
        ]
      }
    ]
  },
  {
    slug: 'software-ai',
    icon: 'digital',
    labels: { fr: 'Software et IA', pt: 'Software e IA', en: 'Software and AI' },
    description: {
      fr: 'Automatisation simple, outils IA, tableurs, sites, formulaires et petits workflows.',
      pt: 'Automação simples, ferramentas IA, folhas de cálculo, sites, formulários e pequenos workflows.',
      en: 'Simple automation, AI tools, spreadsheets, websites, forms, and small workflows.'
    },
    subcategories: [
      {
        slug: 'automation-ai',
        labels: { fr: 'Automatisation et IA', pt: 'Automação e IA', en: 'Automation and AI' },
        description: {
          fr: 'Aide à créer des prompts, automatiser une tâche ou organiser un flux de travail.',
          pt: 'Ajuda para criar prompts, automatizar uma tarefa ou organizar um fluxo de trabalho.',
          en: 'Help creating prompts, automating a task, or organizing a workflow.'
        },
        specialties: [
          { slug: 'ai-setup', labels: { fr: 'Mise en place IA', pt: 'Configuração IA', en: 'AI setup' } },
          { slug: 'spreadsheet-automation', labels: { fr: 'Automatisation tableur', pt: 'Automação de folhas', en: 'Spreadsheet automation' } }
        ]
      },
      {
        slug: 'small-web-tools',
        labels: { fr: 'Petits outils web', pt: 'Pequenas ferramentas web', en: 'Small web tools' },
        description: {
          fr: 'Landing page, formulaire, mini dashboard, correction de site et intégrations simples.',
          pt: 'Landing page, formulário, mini dashboard, correção de site e integrações simples.',
          en: 'Landing page, form, mini dashboard, website fix, and simple integrations.'
        },
        specialties: [
          { slug: 'website-fix', labels: { fr: 'Correction site', pt: 'Correção de site', en: 'Website fix' } },
          { slug: 'simple-form', labels: { fr: 'Formulaire simple', pt: 'Formulário simples', en: 'Simple form' } }
        ]
      }
    ]
  },
  {
    slug: 'fashion-styling',
    icon: 'beauty',
    labels: { fr: 'Mode et styling', pt: 'Moda e styling', en: 'Fashion and styling' },
    description: {
      fr: 'Conseil vestimentaire, tri dressing, shopping, retouches et préparation événement.',
      pt: 'Consultoria de roupa, organização de roupeiro, compras, ajustes e preparação para eventos.',
      en: 'Wardrobe advice, closet sorting, shopping, alterations, and event preparation.'
    },
    subcategories: [
      {
        slug: 'wardrobe-styling',
        labels: { fr: 'Conseil style', pt: 'Consultoria de estilo', en: 'Style advice' },
        description: {
          fr: 'Tenues, tri dressing, associations, shopping list et préparation entretien.',
          pt: 'Looks, organização de roupeiro, combinações, lista de compras e preparação.',
          en: 'Outfits, closet sorting, combinations, shopping list, and preparation.'
        },
        specialties: [
          { slug: 'closet-sort', labels: { fr: 'Tri dressing', pt: 'Organizar roupeiro', en: 'Closet sort' } },
          { slug: 'event-outfit', labels: { fr: 'Tenue événement', pt: 'Look para evento', en: 'Event outfit' } }
        ]
      },
      {
        slug: 'alterations-fashion',
        labels: { fr: 'Retouches mode', pt: 'Ajustes de roupa', en: 'Fashion alterations' },
        description: {
          fr: 'Ajustements simples, ourlets, boutons, fermetures et conseils retouche.',
          pt: 'Ajustes simples, bainhas, botões, fechos e aconselhamento de costura.',
          en: 'Simple adjustments, hems, buttons, zips, and alteration advice.'
        },
        specialties: [
          { slug: 'quick-alteration', labels: { fr: 'Retouche rapide', pt: 'Ajuste rápido', en: 'Quick alteration' } },
          { slug: 'event-alteration', labels: { fr: 'Retouche événement', pt: 'Ajuste para evento', en: 'Event alteration' } }
        ]
      }
    ]
  }
];

const additionalMarketplaceCategories: Category[] = [
  {
    slug: 'accounting-tax',
    icon: 'business',
    labels: { fr: 'Comptabilité et fiscalité', pt: 'Contabilidade e fiscalidade', en: 'Accounting and tax' },
    description: {
      fr: 'Aide comptable, déclarations, facturation et organisation financière.',
      pt: 'Apoio contabilístico, declarações, faturação e organização financeira.',
      en: 'Accounting help, declarations, invoicing, and financial organization.'
    },
    subcategories: [
      {
        slug: 'bookkeeping',
        labels: { fr: 'Tenue comptable', pt: 'Organização contabilística', en: 'Bookkeeping' },
        description: {
          fr: 'Classement, factures, reçus, tableaux simples et suivi mensuel.',
          pt: 'Organização, faturas, recibos, mapas simples e acompanhamento mensal.',
          en: 'Filing, invoices, receipts, simple sheets, and monthly follow-up.'
        },
        specialties: [
          { slug: 'invoice-organization', labels: { fr: 'Organisation factures', pt: 'Organização de faturas', en: 'Invoice organization' } },
          { slug: 'monthly-bookkeeping', labels: { fr: 'Suivi mensuel', pt: 'Acompanhamento mensal', en: 'Monthly bookkeeping' } }
        ]
      },
      {
        slug: 'tax-support',
        labels: { fr: 'Fiscalité', pt: 'Fiscalidade', en: 'Tax support' },
        description: {
          fr: 'Aide préparatoire pour déclarations et documents fiscaux.',
          pt: 'Apoio preparatório para declarações e documentos fiscais.',
          en: 'Preparatory support for tax declarations and documents.'
        },
        specialties: [
          { slug: 'tax-documents', labels: { fr: 'Documents fiscaux', pt: 'Documentos fiscais', en: 'Tax documents' } },
          { slug: 'vat-support', labels: { fr: 'TVA', pt: 'IVA', en: 'VAT support' } }
        ]
      }
    ]
  },
  {
    slug: 'agriculture-rural',
    icon: 'leaf',
    labels: { fr: 'Agriculture et rural', pt: 'Agricultura e rural', en: 'Agriculture and rural' },
    description: {
      fr: 'Aide rurale, entretien de terrain, animaux de ferme et petits travaux agricoles.',
      pt: 'Apoio rural, manutenção de terrenos, animais de quinta e pequenos trabalhos agrícolas.',
      en: 'Rural help, land maintenance, farm animals, and small agricultural jobs.'
    },
    subcategories: [
      {
        slug: 'land-maintenance',
        labels: { fr: 'Entretien terrain', pt: 'Manutenção de terreno', en: 'Land maintenance' },
        description: {
          fr: 'Débroussaillage, clôtures, petites parcelles et nettoyage de terrain.',
          pt: 'Limpeza de mato, vedações, pequenas parcelas e limpeza de terreno.',
          en: 'Brush clearing, fences, small plots, and land cleanup.'
        },
        specialties: [
          { slug: 'brush-clearing', labels: { fr: 'Débroussaillage', pt: 'Limpeza de mato', en: 'Brush clearing' } },
          { slug: 'field-fence', labels: { fr: 'Clôture terrain', pt: 'Vedação de terreno', en: 'Field fence' } }
        ]
      },
      {
        slug: 'farm-help',
        labels: { fr: 'Aide agricole', pt: 'Ajuda agrícola', en: 'Farm help' },
        description: {
          fr: 'Aide ponctuelle pour tâches saisonnières et petites exploitations.',
          pt: 'Ajuda pontual para tarefas sazonais e pequenas explorações.',
          en: 'Occasional help for seasonal tasks and small farms.'
        },
        specialties: [
          { slug: 'seasonal-help', labels: { fr: 'Renfort saisonnier', pt: 'Reforço sazonal', en: 'Seasonal help' } },
          { slug: 'small-farm-care', labels: { fr: 'Petite ferme', pt: 'Pequena quinta', en: 'Small farm care' } }
        ]
      }
    ]
  },
  {
    slug: 'architecture-interior',
    icon: 'creative',
    labels: { fr: 'Architecture et intérieur', pt: 'Arquitetura e interiores', en: 'Architecture and interiors' },
    description: {
      fr: 'Conseil intérieur, plans simples, décoration et optimisation d’espace.',
      pt: 'Consultoria de interiores, plantas simples, decoração e otimização de espaço.',
      en: 'Interior advice, simple plans, decoration, and space optimization.'
    },
    subcategories: [
      {
        slug: 'interior-design',
        labels: { fr: 'Décoration intérieure', pt: 'Decoração de interiores', en: 'Interior design' },
        description: {
          fr: 'Ambiance, mobilier, couleurs, agencement et shopping list.',
          pt: 'Ambiente, mobiliário, cores, organização e lista de compras.',
          en: 'Mood, furniture, colors, layout, and shopping list.'
        },
        specialties: [
          { slug: 'room-layout', labels: { fr: 'Agencement pièce', pt: 'Layout de divisão', en: 'Room layout' } },
          { slug: 'home-staging', labels: { fr: 'Home staging', pt: 'Home staging', en: 'Home staging' } }
        ]
      },
      {
        slug: 'simple-plans',
        labels: { fr: 'Plans simples', pt: 'Plantas simples', en: 'Simple plans' },
        description: {
          fr: 'Relevés, croquis, plans 2D simples et préparation de projet.',
          pt: 'Medições, esboços, plantas 2D simples e preparação de projeto.',
          en: 'Measurements, sketches, simple 2D plans, and project preparation.'
        },
        specialties: [
          { slug: '2d-plan', labels: { fr: 'Plan 2D', pt: 'Planta 2D', en: '2D plan' } },
          { slug: 'space-measurement', labels: { fr: 'Relevé mesures', pt: 'Levantamento de medidas', en: 'Space measurement' } }
        ]
      }
    ]
  },
  {
    slug: 'art-craft',
    icon: 'creative',
    labels: { fr: 'Artisanat et art', pt: 'Artesanato e arte', en: 'Crafts and art' },
    description: {
      fr: 'Créations artisanales, réparations décoratives, cadres, objets et ateliers.',
      pt: 'Criações artesanais, reparações decorativas, molduras, objetos e workshops.',
      en: 'Craft creations, decorative repairs, frames, objects, and workshops.'
    },
    subcategories: [
      {
        slug: 'custom-craft',
        labels: { fr: 'Création sur mesure', pt: 'Criação à medida', en: 'Custom craft' },
        description: {
          fr: 'Objets, cadeaux, décoration personnalisée et petites créations.',
          pt: 'Objetos, presentes, decoração personalizada e pequenas criações.',
          en: 'Objects, gifts, personalized decoration, and small creations.'
        },
        specialties: [
          { slug: 'custom-gift', labels: { fr: 'Cadeau personnalisé', pt: 'Presente personalizado', en: 'Custom gift' } },
          { slug: 'decorative-object', labels: { fr: 'Objet décoratif', pt: 'Objeto decorativo', en: 'Decorative object' } }
        ]
      },
      {
        slug: 'craft-repair',
        labels: { fr: 'Réparation artisanale', pt: 'Reparação artesanal', en: 'Craft repair' },
        description: {
          fr: 'Petites réparations d’objets, cadres, décorations et accessoires.',
          pt: 'Pequenas reparações de objetos, molduras, decorações e acessórios.',
          en: 'Small repairs for objects, frames, decorations, and accessories.'
        },
        specialties: [
          { slug: 'frame-repair', labels: { fr: 'Réparation cadre', pt: 'Reparação de moldura', en: 'Frame repair' } },
          { slug: 'object-restoration', labels: { fr: 'Restauration objet', pt: 'Restauro de objeto', en: 'Object restoration' } }
        ]
      }
    ]
  },
  {
    slug: 'bicycle-micromobility',
    icon: 'auto',
    labels: { fr: 'Vélo et micromobilité', pt: 'Bicicletas e micromobilidade', en: 'Bikes and micromobility' },
    description: {
      fr: 'Réparation vélo, trottinettes, entretien, réglages et accessoires.',
      pt: 'Reparação de bicicletas, trotinetes, manutenção, ajustes e acessórios.',
      en: 'Bike repair, scooters, maintenance, adjustments, and accessories.'
    },
    subcategories: [
      {
        slug: 'bike-repair',
        labels: { fr: 'Réparation vélo', pt: 'Reparação de bicicleta', en: 'Bike repair' },
        description: {
          fr: 'Freins, pneus, chaîne, vitesses, réglages et entretien courant.',
          pt: 'Travões, pneus, corrente, mudanças, ajustes e manutenção regular.',
          en: 'Brakes, tyres, chain, gears, adjustments, and regular maintenance.'
        },
        specialties: [
          { slug: 'bike-tyre', labels: { fr: 'Pneu vélo', pt: 'Pneu de bicicleta', en: 'Bike tyre' } },
          { slug: 'bike-brakes', labels: { fr: 'Freins vélo', pt: 'Travões de bicicleta', en: 'Bike brakes' } }
        ]
      },
      {
        slug: 'scooter-repair',
        labels: { fr: 'Trottinette', pt: 'Trotinete', en: 'Scooter' },
        description: {
          fr: 'Réglages, pneus, diagnostic simple et conseils d’entretien.',
          pt: 'Ajustes, pneus, diagnóstico simples e conselhos de manutenção.',
          en: 'Adjustments, tyres, simple diagnostics, and maintenance advice.'
        },
        specialties: [
          { slug: 'scooter-tyre', labels: { fr: 'Pneu trottinette', pt: 'Pneu de trotinete', en: 'Scooter tyre' } },
          { slug: 'scooter-diagnostic', labels: { fr: 'Diagnostic trottinette', pt: 'Diagnóstico de trotinete', en: 'Scooter diagnostic' } }
        ]
      }
    ]
  },
  {
    slug: 'climate-energy',
    icon: 'power',
    labels: { fr: 'Climatisation et énergie', pt: 'Climatização e energia', en: 'Climate and energy' },
    description: {
      fr: 'Chauffage, climatisation, ventilation, économies d’énergie et petits diagnostics.',
      pt: 'Aquecimento, ar condicionado, ventilação, poupança de energia e diagnósticos simples.',
      en: 'Heating, air conditioning, ventilation, energy savings, and simple diagnostics.'
    },
    subcategories: [
      {
        slug: 'heating-cooling',
        labels: { fr: 'Chauffage et froid', pt: 'Aquecimento e frio', en: 'Heating and cooling' },
        description: {
          fr: 'Contrôles simples, entretien léger, réglages et conseils.',
          pt: 'Verificações simples, manutenção leve, ajustes e aconselhamento.',
          en: 'Simple checks, light maintenance, settings, and advice.'
        },
        specialties: [
          { slug: 'heater-check', labels: { fr: 'Contrôle chauffage', pt: 'Verificação de aquecimento', en: 'Heating check' } },
          { slug: 'ac-cleaning', labels: { fr: 'Nettoyage climatisation', pt: 'Limpeza de ar condicionado', en: 'AC cleaning' } }
        ]
      },
      {
        slug: 'energy-advice',
        labels: { fr: 'Conseil énergie', pt: 'Conselhos de energia', en: 'Energy advice' },
        description: {
          fr: 'Aide à réduire la consommation, isolation simple et usages.',
          pt: 'Ajuda para reduzir consumo, isolamento simples e hábitos.',
          en: 'Help reducing consumption, simple insulation, and habits.'
        },
        specialties: [
          { slug: 'consumption-check', labels: { fr: 'Analyse consommation', pt: 'Análise de consumo', en: 'Consumption check' } },
          { slug: 'basic-insulation', labels: { fr: 'Isolation simple', pt: 'Isolamento simples', en: 'Basic insulation' } }
        ]
      }
    ]
  },
  {
    slug: 'consulting-coaching',
    icon: 'business',
    labels: { fr: 'Conseil et coaching', pt: 'Consultoria e coaching', en: 'Consulting and coaching' },
    description: {
      fr: 'Coaching professionnel, organisation, productivité et accompagnement de projet.',
      pt: 'Coaching profissional, organização, produtividade e acompanhamento de projetos.',
      en: 'Professional coaching, organization, productivity, and project support.'
    },
    subcategories: [
      {
        slug: 'career-coaching',
        labels: { fr: 'Coaching carrière', pt: 'Coaching de carreira', en: 'Career coaching' },
        description: {
          fr: 'CV, entretiens, orientation, recherche d’emploi et confiance professionnelle.',
          pt: 'CV, entrevistas, orientação, procura de emprego e confiança profissional.',
          en: 'CV, interviews, orientation, job search, and professional confidence.'
        },
        specialties: [
          { slug: 'cv-review', labels: { fr: 'Revue CV', pt: 'Revisão de CV', en: 'CV review' } },
          { slug: 'interview-prep', labels: { fr: 'Préparation entretien', pt: 'Preparação de entrevista', en: 'Interview prep' } }
        ]
      },
      {
        slug: 'project-support',
        labels: { fr: 'Accompagnement projet', pt: 'Apoio a projetos', en: 'Project support' },
        description: {
          fr: 'Organisation, priorités, suivi, lancement et cadrage.',
          pt: 'Organização, prioridades, acompanhamento, lançamento e enquadramento.',
          en: 'Organization, priorities, follow-up, launch, and framing.'
        },
        specialties: [
          { slug: 'project-planning', labels: { fr: 'Planification projet', pt: 'Planeamento de projeto', en: 'Project planning' } },
          { slug: 'productivity-coaching', labels: { fr: 'Productivité', pt: 'Produtividade', en: 'Productivity coaching' } }
        ]
      }
    ]
  },
  {
    slug: 'finance-insurance',
    icon: 'business',
    labels: { fr: 'Finance et assurance', pt: 'Finanças e seguros', en: 'Finance and insurance' },
    description: {
      fr: 'Aide à comparer, organiser et préparer des dossiers financiers ou assurances.',
      pt: 'Ajuda para comparar, organizar e preparar dossiers financeiros ou seguros.',
      en: 'Help comparing, organizing, and preparing finance or insurance files.'
    },
    subcategories: [
      {
        slug: 'budget-help',
        labels: { fr: 'Budget personnel', pt: 'Orçamento pessoal', en: 'Personal budget' },
        description: {
          fr: 'Organisation budget, suivi dépenses et planification simple.',
          pt: 'Organização de orçamento, acompanhamento de despesas e planeamento simples.',
          en: 'Budget organization, expense tracking, and simple planning.'
        },
        specialties: [
          { slug: 'budget-setup', labels: { fr: 'Mise en place budget', pt: 'Criação de orçamento', en: 'Budget setup' } },
          { slug: 'expense-tracking', labels: { fr: 'Suivi dépenses', pt: 'Controlo de despesas', en: 'Expense tracking' } }
        ]
      },
      {
        slug: 'insurance-files',
        labels: { fr: 'Dossiers assurance', pt: 'Dossiers de seguro', en: 'Insurance files' },
        description: {
          fr: 'Classement, comparaison et préparation de documents.',
          pt: 'Organização, comparação e preparação de documentos.',
          en: 'Filing, comparison, and document preparation.'
        },
        specialties: [
          { slug: 'claim-documents', labels: { fr: 'Documents sinistre', pt: 'Documentos de sinistro', en: 'Claim documents' } },
          { slug: 'policy-comparison', labels: { fr: 'Comparaison contrats', pt: 'Comparação de apólices', en: 'Policy comparison' } }
        ]
      }
    ]
  },
  {
    slug: 'health-therapy',
    icon: 'care',
    labels: { fr: 'Santé et thérapies', pt: 'Saúde e terapias', en: 'Health and therapies' },
    description: {
      fr: 'Services de bien-être ou soins réglementés par professionnels autorisés.',
      pt: 'Serviços de bem-estar ou cuidados regulados por profissionais autorizados.',
      en: 'Wellness services or regulated care by authorized professionals.'
    },
    subcategories: [
      {
        slug: 'therapy-wellbeing',
        labels: { fr: 'Thérapies bien-être', pt: 'Terapias de bem-estar', en: 'Wellbeing therapies' },
        description: {
          fr: 'Relaxation, accompagnement non urgent et séances de bien-être.',
          pt: 'Relaxamento, acompanhamento não urgente e sessões de bem-estar.',
          en: 'Relaxation, non-urgent support, and wellbeing sessions.'
        },
        specialties: [
          { slug: 'stress-support', labels: { fr: 'Gestion stress', pt: 'Gestão de stress', en: 'Stress support' } },
          { slug: 'wellbeing-session', labels: { fr: 'Séance bien-être', pt: 'Sessão de bem-estar', en: 'Wellbeing session' } }
        ]
      },
      {
        slug: 'regulated-care',
        labels: { fr: 'Soins réglementés', pt: 'Cuidados regulados', en: 'Regulated care' },
        description: {
          fr: 'Prestations uniquement pour professionnels qualifiés et autorisés.',
          pt: 'Serviços apenas para profissionais qualificados e autorizados.',
          en: 'Services only for qualified and authorized professionals.'
        },
        specialties: [
          { slug: 'physio-support', labels: { fr: 'Kinésithérapie', pt: 'Fisioterapia', en: 'Physiotherapy' } },
          { slug: 'nursing-support', labels: { fr: 'Soins infirmiers', pt: 'Enfermagem', en: 'Nursing support' } }
        ]
      }
    ]
  },
  {
    slug: 'legal-mediation',
    icon: 'business',
    labels: { fr: 'Juridique et médiation', pt: 'Jurídico e mediação', en: 'Legal and mediation' },
    description: {
      fr: 'Aide documentaire, médiation et services juridiques par professionnels autorisés.',
      pt: 'Apoio documental, mediação e serviços jurídicos por profissionais autorizados.',
      en: 'Document help, mediation, and legal services by authorized professionals.'
    },
    subcategories: [
      {
        slug: 'legal-documents',
        labels: { fr: 'Documents juridiques', pt: 'Documentos jurídicos', en: 'Legal documents' },
        description: {
          fr: 'Préparation, lecture et organisation de documents non contentieux.',
          pt: 'Preparação, leitura e organização de documentos não litigiosos.',
          en: 'Preparation, review, and organization of non-contentious documents.'
        },
        specialties: [
          { slug: 'contract-review', labels: { fr: 'Relecture contrat', pt: 'Revisão de contrato', en: 'Contract review' } },
          { slug: 'document-prep', labels: { fr: 'Préparation dossier', pt: 'Preparação de dossier', en: 'Document prep' } }
        ]
      },
      {
        slug: 'mediation',
        labels: { fr: 'Médiation', pt: 'Mediação', en: 'Mediation' },
        description: {
          fr: 'Médiation familiale, voisinage, travail ou petites situations civiles.',
          pt: 'Mediação familiar, vizinhança, trabalho ou pequenas situações civis.',
          en: 'Family, neighbour, work, or small civil mediation.'
        },
        specialties: [
          { slug: 'neighbour-mediation', labels: { fr: 'Voisinage', pt: 'Vizinhança', en: 'Neighbour mediation' } },
          { slug: 'family-mediation', labels: { fr: 'Famille', pt: 'Família', en: 'Family mediation' } }
        ]
      }
    ]
  },
  {
    slug: 'pool-spa',
    icon: 'water',
    labels: { fr: 'Piscine et spa', pt: 'Piscina e spa', en: 'Pool and spa' },
    description: {
      fr: 'Entretien piscine, spa, nettoyage, contrôle eau et petits dépannages.',
      pt: 'Manutenção de piscina, spa, limpeza, controlo da água e pequenas reparações.',
      en: 'Pool and spa maintenance, cleaning, water checks, and small repairs.'
    },
    subcategories: [
      {
        slug: 'pool-maintenance',
        labels: { fr: 'Entretien piscine', pt: 'Manutenção de piscina', en: 'Pool maintenance' },
        description: {
          fr: 'Nettoyage, contrôle eau, hivernage et remise en route.',
          pt: 'Limpeza, controlo da água, inverno e arranque de época.',
          en: 'Cleaning, water checks, winterizing, and restart.'
        },
        specialties: [
          { slug: 'water-check', labels: { fr: 'Contrôle eau', pt: 'Controlo da água', en: 'Water check' } },
          { slug: 'pool-cleaning', labels: { fr: 'Nettoyage piscine', pt: 'Limpeza de piscina', en: 'Pool cleaning' } }
        ]
      },
      {
        slug: 'spa-maintenance',
        labels: { fr: 'Spa et jacuzzi', pt: 'Spa e jacuzzi', en: 'Spa and jacuzzi' },
        description: {
          fr: 'Nettoyage, filtres, entretien simple et conseils.',
          pt: 'Limpeza, filtros, manutenção simples e aconselhamento.',
          en: 'Cleaning, filters, simple maintenance, and advice.'
        },
        specialties: [
          { slug: 'spa-cleaning', labels: { fr: 'Nettoyage spa', pt: 'Limpeza de spa', en: 'Spa cleaning' } },
          { slug: 'filter-care', labels: { fr: 'Entretien filtres', pt: 'Manutenção de filtros', en: 'Filter care' } }
        ]
      }
    ]
  },
  {
    slug: 'printing-signage',
    icon: 'digital',
    labels: { fr: 'Impression et signalétique', pt: 'Impressão e sinalética', en: 'Printing and signage' },
    description: {
      fr: 'Impression locale, supports visuels, panneaux, autocollants et signalétique.',
      pt: 'Impressão local, suportes visuais, placas, autocolantes e sinalética.',
      en: 'Local printing, visual supports, signs, stickers, and signage.'
    },
    subcategories: [
      {
        slug: 'print-materials',
        labels: { fr: 'Supports imprimés', pt: 'Materiais impressos', en: 'Printed materials' },
        description: {
          fr: 'Flyers, cartes, menus, affiches et documents simples.',
          pt: 'Flyers, cartões, menus, cartazes e documentos simples.',
          en: 'Flyers, cards, menus, posters, and simple documents.'
        },
        specialties: [
          { slug: 'business-cards', labels: { fr: 'Cartes de visite', pt: 'Cartões de visita', en: 'Business cards' } },
          { slug: 'poster-print', labels: { fr: 'Affiches', pt: 'Cartazes', en: 'Poster print' } }
        ]
      },
      {
        slug: 'signage',
        labels: { fr: 'Signalétique', pt: 'Sinalética', en: 'Signage' },
        description: {
          fr: 'Panneaux, vitrines, autocollants et marquage simple.',
          pt: 'Placas, montras, autocolantes e marcação simples.',
          en: 'Signs, windows, stickers, and simple marking.'
        },
        specialties: [
          { slug: 'window-sticker', labels: { fr: 'Autocollant vitrine', pt: 'Autocolante de montra', en: 'Window sticker' } },
          { slug: 'shop-sign', labels: { fr: 'Panneau commerce', pt: 'Placa comercial', en: 'Shop sign' } }
        ]
      }
    ]
  },
  {
    slug: 'property-management',
    icon: 'business',
    labels: { fr: 'Immobilier et gestion', pt: 'Imobiliário e gestão', en: 'Property and management' },
    description: {
      fr: 'Gestion locative, visites, états des lieux, petites coordinations et suivi.',
      pt: 'Gestão de arrendamento, visitas, vistorias, coordenação simples e acompanhamento.',
      en: 'Rental management, viewings, inspections, simple coordination, and follow-up.'
    },
    subcategories: [
      {
        slug: 'rental-support',
        labels: { fr: 'Support locatif', pt: 'Apoio ao arrendamento', en: 'Rental support' },
        description: {
          fr: 'Visites, remise de clés, suivi locataire et coordination.',
          pt: 'Visitas, entrega de chaves, acompanhamento de inquilino e coordenação.',
          en: 'Viewings, key handover, tenant follow-up, and coordination.'
        },
        specialties: [
          { slug: 'key-handover', labels: { fr: 'Remise de clés', pt: 'Entrega de chaves', en: 'Key handover' } },
          { slug: 'tenant-visit', labels: { fr: 'Visite locataire', pt: 'Visita de inquilino', en: 'Tenant visit' } }
        ]
      },
      {
        slug: 'property-check',
        labels: { fr: 'Contrôle logement', pt: 'Verificação de imóvel', en: 'Property check' },
        description: {
          fr: 'Contrôle visuel, photos, signalement et coordination de travaux.',
          pt: 'Verificação visual, fotos, relatório e coordenação de trabalhos.',
          en: 'Visual check, photos, reporting, and work coordination.'
        },
        specialties: [
          { slug: 'condition-report', labels: { fr: 'Rapport état', pt: 'Relatório de estado', en: 'Condition report' } },
          { slug: 'work-coordination', labels: { fr: 'Coordination travaux', pt: 'Coordenação de trabalhos', en: 'Work coordination' } }
        ]
      }
    ]
  },
  {
    slug: 'recruitment-hr',
    icon: 'business',
    labels: { fr: 'Recrutement et RH', pt: 'Recrutamento e RH', en: 'Recruitment and HR' },
    description: {
      fr: 'Aide recrutement, annonces, tri de CV, onboarding et organisation RH.',
      pt: 'Apoio ao recrutamento, anúncios, triagem de CV, onboarding e organização RH.',
      en: 'Recruitment help, job ads, CV screening, onboarding, and HR organization.'
    },
    subcategories: [
      {
        slug: 'candidate-search',
        labels: { fr: 'Recherche candidats', pt: 'Pesquisa de candidatos', en: 'Candidate search' },
        description: {
          fr: 'Annonces, présélection, suivi et coordination des candidatures.',
          pt: 'Anúncios, pré-seleção, acompanhamento e coordenação de candidaturas.',
          en: 'Ads, preselection, follow-up, and candidate coordination.'
        },
        specialties: [
          { slug: 'job-ad', labels: { fr: 'Annonce emploi', pt: 'Anúncio de emprego', en: 'Job ad' } },
          { slug: 'cv-screening', labels: { fr: 'Tri CV', pt: 'Triagem de CV', en: 'CV screening' } }
        ]
      },
      {
        slug: 'hr-admin',
        labels: { fr: 'Admin RH', pt: 'Administração RH', en: 'HR admin' },
        description: {
          fr: 'Documents, onboarding, organisation et suivi des dossiers.',
          pt: 'Documentos, onboarding, organização e acompanhamento de dossiers.',
          en: 'Documents, onboarding, organization, and file follow-up.'
        },
        specialties: [
          { slug: 'onboarding', labels: { fr: 'Onboarding', pt: 'Onboarding', en: 'Onboarding' } },
          { slug: 'hr-files', labels: { fr: 'Dossiers RH', pt: 'Dossiers RH', en: 'HR files' } }
        ]
      }
    ]
  },
  {
    slug: 'rental-equipment',
    icon: 'tools',
    labels: { fr: 'Location de matériel', pt: 'Aluguer de equipamento', en: 'Equipment rental' },
    description: {
      fr: 'Location ponctuelle d’outils, machines, matériel événementiel ou transport.',
      pt: 'Aluguer pontual de ferramentas, máquinas, material de eventos ou transporte.',
      en: 'One-off rental of tools, machines, event gear, or transport equipment.'
    },
    subcategories: [
      {
        slug: 'tool-rental',
        labels: { fr: 'Outils', pt: 'Ferramentas', en: 'Tools' },
        description: {
          fr: 'Perceuses, nettoyeurs, échelles, matériel jardin et bricolage.',
          pt: 'Berbequins, máquinas de limpeza, escadas, jardim e bricolage.',
          en: 'Drills, cleaners, ladders, garden gear, and DIY tools.'
        },
        specialties: [
          { slug: 'power-tool', labels: { fr: 'Outil électrique', pt: 'Ferramenta elétrica', en: 'Power tool' } },
          { slug: 'ladder-rental', labels: { fr: 'Échelle', pt: 'Escada', en: 'Ladder rental' } }
        ]
      },
      {
        slug: 'event-equipment',
        labels: { fr: 'Matériel événement', pt: 'Material de evento', en: 'Event equipment' },
        description: {
          fr: 'Tables, chaises, tentes, son léger et accessoires.',
          pt: 'Mesas, cadeiras, tendas, som leve e acessórios.',
          en: 'Tables, chairs, tents, light sound, and accessories.'
        },
        specialties: [
          { slug: 'chair-table', labels: { fr: 'Tables et chaises', pt: 'Mesas e cadeiras', en: 'Tables and chairs' } },
          { slug: 'small-tent', labels: { fr: 'Tente simple', pt: 'Tenda simples', en: 'Small tent' } }
        ]
      }
    ]
  },
  {
    slug: 'repair-restoration',
    icon: 'tools',
    labels: { fr: 'Réparation et restauration', pt: 'Reparação e restauro', en: 'Repair and restoration' },
    description: {
      fr: 'Restauration d’objets, meubles, petits équipements et réparations spécialisées.',
      pt: 'Restauro de objetos, móveis, pequenos equipamentos e reparações especializadas.',
      en: 'Restoration of objects, furniture, small equipment, and specialist repairs.'
    },
    subcategories: [
      {
        slug: 'furniture-restoration',
        labels: { fr: 'Restauration meubles', pt: 'Restauro de móveis', en: 'Furniture restoration' },
        description: {
          fr: 'Petites réparations, ponçage, retouches et entretien de meubles.',
          pt: 'Pequenas reparações, lixagem, retoques e manutenção de móveis.',
          en: 'Small repairs, sanding, touch-ups, and furniture care.'
        },
        specialties: [
          { slug: 'wood-touchup', labels: { fr: 'Retouche bois', pt: 'Retoque de madeira', en: 'Wood touch-up' } },
          { slug: 'chair-repair', labels: { fr: 'Réparation chaise', pt: 'Reparação de cadeira', en: 'Chair repair' } }
        ]
      },
      {
        slug: 'object-repair',
        labels: { fr: 'Réparation objets', pt: 'Reparação de objetos', en: 'Object repair' },
        description: {
          fr: 'Valises, poussettes, petits mécanismes, accessoires et objets du quotidien.',
          pt: 'Malas, carrinhos, pequenos mecanismos, acessórios e objetos do dia a dia.',
          en: 'Suitcases, strollers, small mechanisms, accessories, and everyday objects.'
        },
        specialties: [
          { slug: 'suitcase-repair', labels: { fr: 'Réparation valise', pt: 'Reparação de mala', en: 'Suitcase repair' } },
          { slug: 'stroller-repair', labels: { fr: 'Réparation poussette', pt: 'Reparação de carrinho', en: 'Stroller repair' } }
        ]
      }
    ]
  },
  {
    slug: 'recycling-waste',
    icon: 'leaf',
    labels: { fr: 'Recyclage et déchets', pt: 'Reciclagem e resíduos', en: 'Recycling and waste' },
    description: {
      fr: 'Tri, évacuation, encombrants, recyclage et débarras responsable.',
      pt: 'Separação, remoção, monos, reciclagem e despejo responsável.',
      en: 'Sorting, removal, bulky waste, recycling, and responsible clearance.'
    },
    subcategories: [
      {
        slug: 'bulky-removal',
        labels: { fr: 'Encombrants', pt: 'Monos', en: 'Bulky removal' },
        description: {
          fr: 'Meubles, électroménager, caves, greniers et petits débarras.',
          pt: 'Móveis, eletrodomésticos, caves, sótãos e pequenas limpezas.',
          en: 'Furniture, appliances, cellars, attics, and small clearances.'
        },
        specialties: [
          { slug: 'furniture-disposal', labels: { fr: 'Évacuation meubles', pt: 'Remoção de móveis', en: 'Furniture disposal' } },
          { slug: 'cellar-clearance', labels: { fr: 'Débarras cave', pt: 'Limpeza de cave', en: 'Cellar clearance' } }
        ]
      },
      {
        slug: 'recycling-help',
        labels: { fr: 'Aide recyclage', pt: 'Ajuda reciclagem', en: 'Recycling help' },
        description: {
          fr: 'Tri, transport vers centre de recyclage et organisation.',
          pt: 'Separação, transporte para centro de reciclagem e organização.',
          en: 'Sorting, transport to recycling center, and organization.'
        },
        specialties: [
          { slug: 'sorting-help', labels: { fr: 'Aide au tri', pt: 'Ajuda na separação', en: 'Sorting help' } },
          { slug: 'recycling-run', labels: { fr: 'Trajet recyclage', pt: 'Ida à reciclagem', en: 'Recycling run' } }
        ]
      }
    ]
  },
  {
    slug: 'translation-interpretation',
    icon: 'digital',
    labels: { fr: 'Traduction et interprétation', pt: 'Tradução e interpretação', en: 'Translation and interpretation' },
    description: {
      fr: 'Traductions, relecture, interprétation locale et aide multilingue.',
      pt: 'Traduções, revisão, interpretação local e apoio multilingue.',
      en: 'Translations, proofreading, local interpretation, and multilingual help.'
    },
    subcategories: [
      {
        slug: 'translation',
        labels: { fr: 'Traduction', pt: 'Tradução', en: 'Translation' },
        description: {
          fr: 'Documents simples, sites, lettres, CV et communications.',
          pt: 'Documentos simples, sites, cartas, CV e comunicações.',
          en: 'Simple documents, websites, letters, CVs, and communications.'
        },
        specialties: [
          { slug: 'document-translation', labels: { fr: 'Document', pt: 'Documento', en: 'Document translation' } },
          { slug: 'website-translation', labels: { fr: 'Site web', pt: 'Site', en: 'Website translation' } }
        ]
      },
      {
        slug: 'interpretation',
        labels: { fr: 'Interprétation', pt: 'Interpretação', en: 'Interpretation' },
        description: {
          fr: 'Accompagnement rendez-vous, appels, visites et échanges simples.',
          pt: 'Acompanhamento em reuniões, chamadas, visitas e conversas simples.',
          en: 'Support for appointments, calls, visits, and simple conversations.'
        },
        specialties: [
          { slug: 'appointment-interpreter', labels: { fr: 'Rendez-vous', pt: 'Marcação', en: 'Appointment interpreter' } },
          { slug: 'phone-interpretation', labels: { fr: 'Appel téléphonique', pt: 'Chamada telefónica', en: 'Phone interpretation' } }
        ]
      }
    ]
  },
  {
    slug: 'travel-tourism',
    icon: 'events',
    labels: { fr: 'Voyage et tourisme', pt: 'Viagens e turismo', en: 'Travel and tourism' },
    description: {
      fr: 'Guides locaux, organisation de visites, accueil, itinéraires et assistance voyage.',
      pt: 'Guias locais, organização de visitas, receção, itinerários e assistência em viagem.',
      en: 'Local guides, visit planning, welcome support, itineraries, and travel assistance.'
    },
    subcategories: [
      {
        slug: 'local-guide',
        labels: { fr: 'Guide local', pt: 'Guia local', en: 'Local guide' },
        description: {
          fr: 'Découverte de ville, culture, gastronomie, nature et expériences locales.',
          pt: 'Descoberta da cidade, cultura, gastronomia, natureza e experiências locais.',
          en: 'City discovery, culture, food, nature, and local experiences.'
        },
        specialties: [
          { slug: 'city-tour', labels: { fr: 'Tour de ville', pt: 'Tour pela cidade', en: 'City tour' } },
          { slug: 'food-tour', labels: { fr: 'Tour gastronomie', pt: 'Tour gastronómico', en: 'Food tour' } }
        ]
      },
      {
        slug: 'travel-assistance',
        labels: { fr: 'Assistance voyage', pt: 'Assistência em viagem', en: 'Travel assistance' },
        description: {
          fr: 'Aide itinéraire, accueil, transport local et organisation.',
          pt: 'Ajuda com itinerário, receção, transporte local e organização.',
          en: 'Itinerary help, welcome support, local transport, and organization.'
        },
        specialties: [
          { slug: 'airport-assistance', labels: { fr: 'Aéroport', pt: 'Aeroporto', en: 'Airport assistance' } },
          { slug: 'trip-planning', labels: { fr: 'Plan voyage', pt: 'Planeamento de viagem', en: 'Trip planning' } }
        ]
      }
    ]
  },
  {
    slug: 'photography-video',
    icon: 'creative',
    labels: { fr: 'Photo et vidéo', pt: 'Fotografia e vídeo', en: 'Photography and video' },
    description: {
      fr: 'Photographie, vidéo, montage, portraits, contenus et petites productions.',
      pt: 'Fotografia, vídeo, edição, retratos, conteúdos e pequenas produções.',
      en: 'Photography, video, editing, portraits, content, and small productions.'
    },
    subcategories: [
      {
        slug: 'photo-services',
        labels: { fr: 'Photographie', pt: 'Fotografia', en: 'Photography' },
        description: {
          fr: 'Portraits, événements, produits, immobilier et photos professionnelles.',
          pt: 'Retratos, eventos, produtos, imobiliário e fotos profissionais.',
          en: 'Portraits, events, products, real estate, and professional photos.'
        },
        specialties: [
          { slug: 'portrait-photo', labels: { fr: 'Portrait', pt: 'Retrato', en: 'Portrait photo' } },
          { slug: 'real-estate-photo', labels: { fr: 'Photo immobilière', pt: 'Fotografia imobiliária', en: 'Real estate photo' } }
        ]
      },
      {
        slug: 'video-editing',
        labels: { fr: 'Vidéo et montage', pt: 'Vídeo e edição', en: 'Video and editing' },
        description: {
          fr: 'Captation simple, reels, montage court, sous-titres et formats sociaux.',
          pt: 'Captação simples, reels, edição curta, legendas e formatos sociais.',
          en: 'Simple shooting, reels, short edits, captions, and social formats.'
        },
        specialties: [
          { slug: 'short-video', labels: { fr: 'Vidéo courte', pt: 'Vídeo curto', en: 'Short video' } },
          { slug: 'video-subtitles', labels: { fr: 'Sous-titres', pt: 'Legendas', en: 'Video subtitles' } }
        ]
      }
    ]
  },
  {
    slug: 'laundry-ironing',
    icon: 'textile',
    labels: { fr: 'Laverie et repassage', pt: 'Lavandaria e engomadoria', en: 'Laundry and ironing' },
    description: {
      fr: 'Lavage, repassage, pliage, collecte, livraison et entretien textile.',
      pt: 'Lavagem, engomadoria, dobragem, recolha, entrega e cuidado têxtil.',
      en: 'Washing, ironing, folding, pickup, delivery, and textile care.'
    },
    subcategories: [
      {
        slug: 'laundry-service',
        labels: { fr: 'Lavage linge', pt: 'Lavagem de roupa', en: 'Laundry service' },
        description: {
          fr: 'Linge personnel, linge maison, collecte et livraison.',
          pt: 'Roupa pessoal, roupa de casa, recolha e entrega.',
          en: 'Personal laundry, household linen, pickup, and delivery.'
        },
        specialties: [
          { slug: 'home-linen', labels: { fr: 'Linge maison', pt: 'Roupa de casa', en: 'Home linen' } },
          { slug: 'pickup-delivery', labels: { fr: 'Collecte et livraison', pt: 'Recolha e entrega', en: 'Pickup and delivery' } }
        ]
      },
      {
        slug: 'ironing',
        labels: { fr: 'Repassage', pt: 'Engomadoria', en: 'Ironing' },
        description: {
          fr: 'Chemises, costumes, linge courant et pliage.',
          pt: 'Camisas, fatos, roupa corrente e dobragem.',
          en: 'Shirts, suits, everyday clothes, and folding.'
        },
        specialties: [
          { slug: 'shirt-ironing', labels: { fr: 'Chemises', pt: 'Camisas', en: 'Shirt ironing' } },
          { slug: 'weekly-ironing', labels: { fr: 'Repassage régulier', pt: 'Engomadoria regular', en: 'Weekly ironing' } }
        ]
      }
    ]
  },
  {
    slug: 'relocation-expats',
    icon: 'move',
    labels: { fr: 'Relocation et expatriés', pt: 'Relocation e expatriados', en: 'Relocation and expats' },
    description: {
      fr: 'Installation locale, démarches, repères pratiques et aide aux nouveaux arrivants.',
      pt: 'Instalação local, burocracias, orientação prática e apoio a recém-chegados.',
      en: 'Local settling-in, paperwork, practical orientation, and newcomer support.'
    },
    subcategories: [
      {
        slug: 'settling-in',
        labels: { fr: 'Installation', pt: 'Instalação', en: 'Settling in' },
        description: {
          fr: 'Aide logement, quartier, services, écoles et premiers repères.',
          pt: 'Apoio com casa, bairro, serviços, escolas e primeiros passos.',
          en: 'Help with housing, neighbourhood, services, schools, and first steps.'
        },
        specialties: [
          { slug: 'newcomer-orientation', labels: { fr: 'Orientation nouveaux arrivants', pt: 'Orientação para recém-chegados', en: 'Newcomer orientation' } },
          { slug: 'school-search', labels: { fr: 'Recherche école', pt: 'Pesquisa de escola', en: 'School search' } }
        ]
      },
      {
        slug: 'local-paperwork',
        labels: { fr: 'Démarches locales', pt: 'Burocracias locais', en: 'Local paperwork' },
        description: {
          fr: 'Inscriptions, rendez-vous, documents et accompagnement administratif.',
          pt: 'Inscrições, marcações, documentos e acompanhamento administrativo.',
          en: 'Registrations, appointments, documents, and admin support.'
        },
        specialties: [
          { slug: 'commune-registration', labels: { fr: 'Inscription commune', pt: 'Inscrição na comuna', en: 'Commune registration' } },
          { slug: 'appointment-support', labels: { fr: 'Accompagnement rendez-vous', pt: 'Acompanhamento a marcações', en: 'Appointment support' } }
        ]
      }
    ]
  },
  {
    slug: 'audiovisual-stage',
    icon: 'events',
    labels: { fr: 'Audiovisuel et scène', pt: 'Audiovisual e palco', en: 'Audiovisual and stage' },
    description: {
      fr: 'Son, lumière, projection, streaming simple et aide technique événementielle.',
      pt: 'Som, luz, projeção, streaming simples e apoio técnico em eventos.',
      en: 'Sound, lighting, projection, simple streaming, and technical event support.'
    },
    subcategories: [
      {
        slug: 'sound-light',
        labels: { fr: 'Son et lumière', pt: 'Som e luz', en: 'Sound and lighting' },
        description: {
          fr: 'Installation, réglage, micro, enceintes et lumière simple.',
          pt: 'Instalação, afinação, microfone, colunas e luz simples.',
          en: 'Setup, tuning, microphones, speakers, and simple lighting.'
        },
        specialties: [
          { slug: 'speaker-setup', labels: { fr: 'Installation enceintes', pt: 'Instalação de colunas', en: 'Speaker setup' } },
          { slug: 'microphone-setup', labels: { fr: 'Microphones', pt: 'Microfones', en: 'Microphone setup' } }
        ]
      },
      {
        slug: 'streaming-projection',
        labels: { fr: 'Streaming et projection', pt: 'Streaming e projeção', en: 'Streaming and projection' },
        description: {
          fr: 'Réunions, événements hybrides, projecteurs et captation simple.',
          pt: 'Reuniões, eventos híbridos, projetores e captação simples.',
          en: 'Meetings, hybrid events, projectors, and simple capture.'
        },
        specialties: [
          { slug: 'projector-setup', labels: { fr: 'Projecteur', pt: 'Projetor', en: 'Projector setup' } },
          { slug: 'simple-livestream', labels: { fr: 'Live simple', pt: 'Live simples', en: 'Simple livestream' } }
        ]
      }
    ]
  },
  {
    slug: 'baby-maternity',
    icon: 'childcare',
    labels: { fr: 'Bébé et maternité', pt: 'Bebé e maternidade', en: 'Baby and maternity' },
    description: {
      fr: 'Aide postnatale, préparation bébé, matériel, accompagnement familial non médical.',
      pt: 'Apoio pós-natal, preparação para bebé, material e apoio familiar não médico.',
      en: 'Postnatal help, baby preparation, gear, and non-medical family support.'
    },
    subcategories: [
      {
        slug: 'baby-preparation',
        labels: { fr: 'Préparation bébé', pt: 'Preparação para bebé', en: 'Baby preparation' },
        description: {
          fr: 'Chambre, matériel, organisation, liste d’achat et installation.',
          pt: 'Quarto, material, organização, lista de compras e instalação.',
          en: 'Room, gear, organization, shopping list, and setup.'
        },
        specialties: [
          { slug: 'nursery-setup', labels: { fr: 'Installation chambre bébé', pt: 'Montagem do quarto do bebé', en: 'Nursery setup' } },
          { slug: 'baby-gear-help', labels: { fr: 'Matériel bébé', pt: 'Material de bebé', en: 'Baby gear help' } }
        ]
      },
      {
        slug: 'postnatal-help',
        labels: { fr: 'Aide postnatale', pt: 'Apoio pós-natal', en: 'Postnatal help' },
        description: {
          fr: 'Aide pratique à domicile, organisation et soutien familial non médical.',
          pt: 'Ajuda prática em casa, organização e apoio familiar não médico.',
          en: 'Practical home help, organization, and non-medical family support.'
        },
        specialties: [
          { slug: 'newborn-home-help', labels: { fr: 'Aide maison nouveau-né', pt: 'Ajuda em casa com recém-nascido', en: 'Newborn home help' } },
          { slug: 'family-organization', labels: { fr: 'Organisation famille', pt: 'Organização familiar', en: 'Family organization' } }
        ]
      }
    ]
  },
  {
    slug: 'gaming-esports',
    icon: 'digital',
    labels: { fr: 'Gaming et e-sport', pt: 'Gaming e e-sports', en: 'Gaming and esports' },
    description: {
      fr: 'Coaching jeu, installation setup, tournois, streaming et configuration.',
      pt: 'Coaching de jogos, instalação de setup, torneios, streaming e configuração.',
      en: 'Game coaching, setup installation, tournaments, streaming, and configuration.'
    },
    subcategories: [
      {
        slug: 'gaming-setup',
        labels: { fr: 'Setup gaming', pt: 'Setup gaming', en: 'Gaming setup' },
        description: {
          fr: 'PC, console, écran, réseau, streaming et optimisation.',
          pt: 'PC, consola, ecrã, rede, streaming e otimização.',
          en: 'PC, console, screen, network, streaming, and optimization.'
        },
        specialties: [
          { slug: 'console-setup', labels: { fr: 'Console', pt: 'Consola', en: 'Console setup' } },
          { slug: 'streaming-setup', labels: { fr: 'Setup streaming', pt: 'Setup de streaming', en: 'Streaming setup' } }
        ]
      },
      {
        slug: 'game-coaching',
        labels: { fr: 'Coaching jeu', pt: 'Coaching de jogos', en: 'Game coaching' },
        description: {
          fr: 'Sessions d’apprentissage, stratégie, entraînement et préparation tournoi.',
          pt: 'Sessões de aprendizagem, estratégia, treino e preparação para torneio.',
          en: 'Learning sessions, strategy, training, and tournament preparation.'
        },
        specialties: [
          { slug: 'beginner-coaching', labels: { fr: 'Débutant', pt: 'Iniciante', en: 'Beginner coaching' } },
          { slug: 'team-training', labels: { fr: 'Entraînement équipe', pt: 'Treino de equipa', en: 'Team training' } }
        ]
      }
    ]
  },
  {
    slug: 'marine-nautical',
    icon: 'water',
    labels: { fr: 'Nautique et bateaux', pt: 'Náutica e barcos', en: 'Marine and boats' },
    description: {
      fr: 'Entretien bateau, nettoyage, petite réparation, transport et aide nautique.',
      pt: 'Manutenção de barco, limpeza, pequena reparação, transporte e apoio náutico.',
      en: 'Boat maintenance, cleaning, small repair, transport, and nautical help.'
    },
    subcategories: [
      {
        slug: 'boat-care',
        labels: { fr: 'Entretien bateau', pt: 'Manutenção de barco', en: 'Boat care' },
        description: {
          fr: 'Nettoyage, contrôle visuel, préparation saison et petites tâches.',
          pt: 'Limpeza, verificação visual, preparação de época e pequenas tarefas.',
          en: 'Cleaning, visual checks, seasonal preparation, and small tasks.'
        },
        specialties: [
          { slug: 'boat-cleaning', labels: { fr: 'Nettoyage bateau', pt: 'Limpeza de barco', en: 'Boat cleaning' } },
          { slug: 'season-prep', labels: { fr: 'Préparation saison', pt: 'Preparação de época', en: 'Season prep' } }
        ]
      },
      {
        slug: 'nautical-help',
        labels: { fr: 'Aide nautique', pt: 'Apoio náutico', en: 'Nautical help' },
        description: {
          fr: 'Transport, remorque, matériel, check-list et organisation.',
          pt: 'Transporte, reboque, material, check-list e organização.',
          en: 'Transport, trailer, gear, checklist, and organization.'
        },
        specialties: [
          { slug: 'boat-transport-help', labels: { fr: 'Aide transport bateau', pt: 'Ajuda no transporte de barco', en: 'Boat transport help' } },
          { slug: 'gear-setup', labels: { fr: 'Matériel nautique', pt: 'Material náutico', en: 'Nautical gear setup' } }
        ]
      }
    ]
  }
];

export const marketplaceCategories: Category[] = [...baseMarketplaceCategories, ...additionalMarketplaceCategories];

const rawServiceListings: RawServiceListing[] = [
  {
    id: 'listing-luxclean-handover',
    providerId: 'luxclean-pro',
    providerName: 'LuxClean Pro',
    providerType: 'professional',
    email: 'contact@luxclean.example',
    phone: '+352 621 100 201',
    mainCommune: 'Luxembourg',
    serviceArea: ['Luxembourg', 'Strassen', 'Bertrange', 'Hesperange', 'Esch-sur-Alzette'],
    categorySlug: 'cleaning-facility',
    subcategorySlug: 'end-of-tenancy',
    specialtySlug: 'apartment-handover',
    title: { fr: 'Nettoyage fin de bail avec vitres', pt: 'Limpeza fim de arrendamento com janelas', en: 'End-of-tenancy cleaning with windows' },
    shortDescription: {
      fr: 'Équipe professionnelle pour appartements vides, cuisine, salle de bain, vitres et balcon.',
      pt: 'Equipa profissional para apartamentos vazios, cozinha, casa de banho, janelas e varanda.',
      en: 'Professional team for empty apartments, kitchen, bathroom, windows, and balcony.'
    },
    priceModel: 'from_price',
    priceLabel: { fr: 'À partir de 240 EUR', pt: 'A partir de 240 EUR', en: 'From EUR 240' },
    availability: { weekdays: true, weekends: true, urgent: false },
    languages: ['fr', 'pt', 'en'],
    travelToClient: true,
    professionalRegistration: 'LU-CLEAN-2024',
    vatNumber: 'LU12345678',
    insurance: 'RC professionnelle',
    rating: 4.8,
    reviews: 126
  },
  {
    id: 'listing-plomberie-leak',
    providerId: 'plomberie-muller',
    providerName: 'Plomberie Muller',
    providerType: 'professional',
    email: 'muller.plomberie@example.lu',
    phone: '+352 621 100 202',
    mainCommune: 'Luxembourg',
    serviceArea: ['Luxembourg', 'Mersch', 'Ettelbruck', 'Junglinster'],
    categorySlug: 'home-repairs',
    subcategorySlug: 'plumbing',
    specialtySlug: 'leak-repair',
    title: { fr: 'Réparation de fuite cuisine ou salle de bain', pt: 'Reparação de fuga em cozinha ou casa de banho', en: 'Kitchen or bathroom leak repair' },
    shortDescription: {
      fr: 'Diagnostic, petite réparation et remplacement de joints ou flexibles courants.',
      pt: 'Diagnóstico, pequena reparação e substituição de juntas ou flexíveis comuns.',
      en: 'Diagnosis, small repair, and replacement of common seals or hoses.'
    },
    priceModel: 'hourly',
    priceLabel: { fr: '74 EUR / heure', pt: '74 EUR / hora', en: 'EUR 74 / hour' },
    availability: { weekdays: true, weekends: false, urgent: true },
    languages: ['fr', 'en'],
    travelToClient: true,
    professionalRegistration: 'LU-PLUMB-311',
    vatNumber: 'LU87654321',
    insurance: 'RC décennale',
    rating: 4.9,
    reviews: 74
  },
  {
    id: 'listing-auto-oil',
    providerId: 'garage-mobile-esch',
    providerName: 'Garage Mobile Esch',
    providerType: 'professional',
    email: 'garage.mobile@example.lu',
    phone: '+352 621 100 203',
    mainCommune: 'Esch-sur-Alzette',
    serviceArea: ['Esch-sur-Alzette', 'Differdange', 'Dudelange', 'Luxembourg'],
    categorySlug: 'automotive-mechanics',
    subcategorySlug: 'car-maintenance',
    specialtySlug: 'oil-service',
    title: { fr: 'Vidange et filtres à domicile', pt: 'Mudança de óleo e filtros ao domicílio', en: 'Oil and filters at your location' },
    shortDescription: {
      fr: 'Entretien courant pour véhicules particuliers, pièces à confirmer selon modèle.',
      pt: 'Manutenção corrente para veículos particulares, peças a confirmar conforme o modelo.',
      en: 'Routine maintenance for private vehicles, parts confirmed by model.'
    },
    priceModel: 'from_price',
    priceLabel: { fr: 'À partir de 95 EUR', pt: 'A partir de 95 EUR', en: 'From EUR 95' },
    availability: { weekdays: true, weekends: true, urgent: false },
    languages: ['fr', 'pt'],
    travelToClient: true,
    professionalRegistration: 'LU-AUTO-522',
    vatNumber: 'LU11223344',
    rating: 4.7,
    reviews: 52
  },
  {
    id: 'listing-tyres-weekend',
    providerId: 'pneus-rapides-sud',
    providerName: 'Pneus Rapides Sud',
    providerType: 'professional',
    email: 'pneus.sud@example.lu',
    phone: '+352 621 100 204',
    mainCommune: 'Dudelange',
    serviceArea: ['Dudelange', 'Esch-sur-Alzette', 'Differdange'],
    categorySlug: 'automotive-mechanics',
    subcategorySlug: 'tyres',
    specialtySlug: 'tyre-change',
    title: { fr: 'Changement de pneus week-end', pt: 'Troca de pneus ao fim de semana', en: 'Weekend tyre change' },
    shortDescription: {
      fr: 'Permutation pneus hiver/été, contrôle pression et montage sur rendez-vous.',
      pt: 'Troca pneus inverno/verão, controlo de pressão e montagem por marcação.',
      en: 'Winter/summer tyre swap, pressure check, and fitting by appointment.'
    },
    priceModel: 'fixed',
    priceLabel: { fr: 'Prix fixe 55 EUR', pt: 'Preço fixo 55 EUR', en: 'Fixed price EUR 55' },
    availability: { weekdays: false, weekends: true, urgent: false },
    languages: ['fr', 'pt'],
    travelToClient: false,
    professionalRegistration: 'LU-TYRE-218',
    vatNumber: 'LU44332211',
    rating: 4.6,
    reviews: 41
  },
  {
    id: 'listing-handyman-furniture',
    providerId: 'atelier-fix',
    providerName: 'Atelier Fix Luxembourg',
    providerType: 'professional',
    email: 'atelier.fix@example.lu',
    phone: '+352 621 100 205',
    mainCommune: 'Luxembourg',
    serviceArea: ['Luxembourg', 'Esch-sur-Alzette', 'Differdange', 'Dudelange'],
    categorySlug: 'home-repairs',
    subcategorySlug: 'handyman',
    specialtySlug: 'furniture-assembly',
    title: { fr: 'Montage de meubles et fixation murale', pt: 'Montagem de móveis e fixação na parede', en: 'Furniture assembly and wall fixing' },
    shortDescription: {
      fr: 'Montage IKEA et autres marques, étagères, tringles, cadres et petits ajustements.',
      pt: 'Montagem IKEA e outras marcas, prateleiras, varões, quadros e pequenos ajustes.',
      en: 'IKEA and other brands, shelves, rails, frames, and small adjustments.'
    },
    priceModel: 'hourly',
    priceLabel: { fr: '58 EUR / heure', pt: '58 EUR / hora', en: 'EUR 58 / hour' },
    availability: { weekdays: true, weekends: true, urgent: false },
    languages: ['fr', 'en'],
    travelToClient: true,
    professionalRegistration: 'LU-FIX-901',
    vatNumber: 'LU99887766',
    insurance: 'RC professionnelle',
    rating: 4.7,
    reviews: 89
  },
  {
    id: 'listing-painting-silva',
    providerId: 'pintura-silva',
    providerName: 'Pintura Silva',
    providerType: 'professional',
    email: 'pintura.silva@example.lu',
    phone: '+352 621 100 215',
    mainCommune: 'Luxembourg',
    serviceArea: ['Luxembourg', 'Strassen', 'Bertrange', 'Esch-sur-Alzette'],
    categorySlug: 'home-repairs',
    subcategorySlug: 'painting',
    specialtySlug: 'interior-painting',
    title: { fr: 'Peintre pour murs et plafonds', pt: 'Pintor para paredes e tetos', en: 'Painter for walls and ceilings' },
    shortDescription: {
      fr: 'Peinture intérieure, protection du mobilier, petites réparations avant finition.',
      pt: 'Pintura interior, proteção de móveis e pequenas reparações antes do acabamento.',
      en: 'Interior painting, furniture protection, and small repairs before finishing.'
    },
    priceModel: 'hourly',
    priceLabel: { fr: '62 EUR / heure', pt: '62 EUR / hora', en: 'EUR 62 / hour' },
    availability: { weekdays: true, weekends: true, urgent: false },
    languages: ['fr', 'pt'],
    travelToClient: true,
    professionalRegistration: 'LU-PAINT-420',
    vatNumber: 'LU55667788',
    insurance: 'RC professionnelle',
    rating: 4.8,
    reviews: 36
  },
  {
    id: 'listing-private-garden',
    providerId: 'tom-garden-help',
    providerName: 'Tom Garden Help',
    providerType: 'private',
    email: 'tom.garden@example.com',
    phone: '+352 691 100 206',
    mainCommune: 'Mersch',
    serviceArea: ['Mersch', 'Junglinster', 'Ettelbruck'],
    categorySlug: 'garden-outdoor',
    subcategorySlug: 'garden-maintenance',
    specialtySlug: 'lawn-mowing',
    title: { fr: 'Tonte de pelouse après le travail', pt: 'Corte de relva ao fim do dia', en: 'Lawn mowing after work' },
    shortDescription: {
      fr: 'Service privé flexible pour petites et moyennes pelouses, matériel inclus.',
      pt: 'Serviço privado flexível para relvados pequenos e médios, material incluído.',
      en: 'Flexible private service for small and medium lawns, equipment included.'
    },
    priceModel: 'from_price',
    priceLabel: { fr: 'À partir de 35 EUR', pt: 'A partir de 35 EUR', en: 'From EUR 35' },
    availability: { weekdays: true, weekends: true, urgent: false },
    languages: ['fr', 'en'],
    travelToClient: true,
    rating: 4.5,
    reviews: 18
  },
  {
    id: 'listing-moving-small',
    providerId: 'movelux-services',
    providerName: 'MoveLux Services',
    providerType: 'professional',
    email: 'contact@movelux.example',
    phone: '+352 621 100 207',
    mainCommune: 'Dudelange',
    serviceArea: ['Luxembourg', 'Esch-sur-Alzette', 'Differdange', 'Dudelange'],
    categorySlug: 'moving-transport',
    subcategorySlug: 'moving-help',
    specialtySlug: 'small-move',
    title: { fr: 'Petit déménagement avec deux personnes', pt: 'Mudança pequena com duas pessoas', en: 'Small move with two helpers' },
    shortDescription: {
      fr: 'Studio, cartons, petit mobilier, chargement et déchargement inclus.',
      pt: 'Estúdio, caixas, móveis pequenos, carga e descarga incluídas.',
      en: 'Studio, boxes, small furniture, loading and unloading included.'
    },
    priceModel: 'quote_only',
    priceLabel: { fr: 'Sur devis', pt: 'Sob orçamento', en: 'Quote only' },
    availability: { weekdays: true, weekends: true, urgent: true },
    languages: ['fr', 'pt', 'en'],
    travelToClient: true,
    professionalRegistration: 'LU-MOVE-402',
    vatNumber: 'LU66778899',
    insurance: 'Transport et manutention',
    rating: 4.5,
    reviews: 37
  },
  {
    id: 'listing-it-wifi',
    providerId: 'ana-digital-help',
    providerName: 'Ana Digital Help',
    providerType: 'private',
    email: 'ana.digital@example.com',
    phone: '+352 661 100 208',
    mainCommune: 'Luxembourg',
    serviceArea: ['Luxembourg', 'Strassen', 'Bertrange'],
    categorySlug: 'digital-admin',
    subcategorySlug: 'it-help',
    specialtySlug: 'wifi-setup',
    title: { fr: 'Configuration Wi-Fi et imprimante', pt: 'Configuração Wi-Fi e impressora', en: 'Wi-Fi and printer setup' },
    shortDescription: {
      fr: 'Aide simple pour box internet, Wi-Fi, imprimante et téléphone.',
      pt: 'Ajuda simples para router, Wi-Fi, impressora e telemóvel.',
      en: 'Simple help with internet router, Wi-Fi, printer, and phone.'
    },
    priceModel: 'fixed',
    priceLabel: { fr: 'Prix fixe 45 EUR', pt: 'Preço fixo 45 EUR', en: 'Fixed price EUR 45' },
    availability: { weekdays: true, weekends: false, urgent: false },
    languages: ['fr', 'pt', 'en'],
    travelToClient: true,
    rating: 4.9,
    reviews: 22
  },
  {
    id: 'listing-paris-electrician',
    providerId: 'paris-elec-minute',
    providerName: 'Paris Elec Minute',
    providerType: 'professional',
    email: 'contact@paris-elec.example',
    phone: '+33 6 10 20 30 40',
    mainCommune: 'Paris',
    serviceArea: ['Paris'],
    baseLocationId: 'fr-paris',
    coveredLocationIds: ['fr-paris'],
    serviceRadiusKm: 20,
    remoteAvailable: false,
    categorySlug: 'home-repairs',
    subcategorySlug: 'electricity',
    specialtySlug: 'socket-installation',
    title: { fr: 'Électricien prises et éclairage à Paris', pt: 'Eletricista para tomadas e luzes em Paris', en: 'Sockets and lighting electrician in Paris' },
    shortDescription: {
      fr: 'Petites interventions électriques, remplacement de prises, luminaires et diagnostic simple.',
      pt: 'Pequenas intervenções elétricas, troca de tomadas, luminárias e diagnóstico simples.',
      en: 'Small electrical jobs, socket replacement, lights, and simple diagnostics.'
    },
    priceModel: 'hourly',
    priceLabel: { fr: '65 EUR / heure', pt: '65 EUR / hora', en: 'EUR 65 / hour' },
    availability: { weekdays: true, weekends: true, urgent: true },
    languages: ['fr', 'en'],
    travelToClient: true,
    professionalRegistration: 'FR-ELEC-75',
    insurance: 'RC professionnelle',
    rating: 4.8,
    reviews: 64,
    trust: { ...defaultTrust, trustLevel: 'verified', responseReliability: 95 }
  },
  {
    id: 'listing-lyon-events',
    providerId: 'lyon-event-help',
    providerName: 'Lyon Event Help',
    providerType: 'private',
    email: 'hello@lyon-event.example',
    phone: '+33 6 11 22 33 44',
    mainCommune: 'Lyon',
    serviceArea: ['Lyon'],
    baseLocationId: 'fr-lyon',
    coveredLocationIds: ['fr-lyon'],
    serviceRadiusKm: 18,
    remoteAvailable: false,
    categorySlug: 'events',
    subcategorySlug: 'event-help',
    specialtySlug: 'event-staff',
    title: { fr: 'Aide événementielle pour petits événements', pt: 'Ajuda para pequenos eventos', en: 'Event help for small events' },
    shortDescription: {
      fr: 'Accueil, installation légère, rangement et assistance logistique.',
      pt: 'Receção, montagem leve, arrumação e apoio logístico.',
      en: 'Welcome desk, light setup, tidy-up, and logistics support.'
    },
    priceModel: 'hourly',
    priceLabel: { fr: '28 EUR / heure', pt: '28 EUR / hora', en: 'EUR 28 / hour' },
    availability: { weekdays: false, weekends: true, urgent: false },
    languages: ['fr', 'en'],
    travelToClient: true,
    rating: 4.6,
    reviews: 16,
    trust: { ...defaultTrust, trustLevel: 'standard', verificationBadge: false }
  },
  {
    id: 'listing-viseu-garden',
    providerId: 'viseu-jardins',
    providerName: 'Viseu Jardins',
    providerType: 'professional',
    email: 'contacto@viseujardins.example',
    phone: '+351 912 345 678',
    mainCommune: 'Viseu',
    serviceArea: ['Viseu'],
    baseLocationId: 'pt-viseu',
    coveredLocationIds: ['pt-viseu'],
    serviceRadiusKm: 30,
    remoteAvailable: false,
    categorySlug: 'garden-outdoor',
    subcategorySlug: 'garden-maintenance',
    specialtySlug: 'hedge-trimming',
    title: { fr: 'Taille de haies et entretien jardin à Viseu', pt: 'Poda de sebes e manutenção de jardim em Viseu', en: 'Hedge trimming and garden care in Viseu' },
    shortDescription: {
      fr: 'Entretien régulier ou ponctuel, taille, tonte et déchets verts.',
      pt: 'Manutenção regular ou pontual, poda, corte de relva e resíduos verdes.',
      en: 'Regular or one-off maintenance, trimming, mowing, and green waste.'
    },
    priceModel: 'from_price',
    priceLabel: { fr: 'À partir de 30 EUR', pt: 'A partir de 30 EUR', en: 'From EUR 30' },
    availability: { weekdays: true, weekends: true, urgent: false },
    languages: ['pt', 'fr'],
    travelToClient: true,
    professionalRegistration: 'PT-JARDIM-3500',
    rating: 4.9,
    reviews: 43,
    trust: { ...defaultTrust, trustLevel: 'trusted', responseReliability: 96 }
  },
  {
    id: 'listing-porto-mechanic',
    providerId: 'porto-mecanica-movel',
    providerName: 'Porto Mecânica Móvel',
    providerType: 'professional',
    email: 'porto.mecanica@example.pt',
    phone: '+351 913 222 111',
    mainCommune: 'Porto',
    serviceArea: ['Porto', 'Braga'],
    baseLocationId: 'pt-porto',
    coveredLocationIds: ['pt-porto', 'pt-braga'],
    serviceRadiusKm: 35,
    remoteAvailable: false,
    categorySlug: 'automotive-mechanics',
    subcategorySlug: 'car-maintenance',
    specialtySlug: 'basic-diagnostic',
    title: { fr: 'Diagnostic auto mobile Porto', pt: 'Diagnóstico automóvel móvel no Porto', en: 'Mobile car diagnostics in Porto' },
    shortDescription: {
      fr: 'Lecture défauts, contrôle batterie et diagnostic simple à domicile.',
      pt: 'Leitura de erros, controlo de bateria e diagnóstico simples ao domicílio.',
      en: 'Fault reading, battery check, and simple diagnostics at your location.'
    },
    priceModel: 'fixed',
    priceLabel: { fr: 'Prix fixe 45 EUR', pt: 'Preço fixo 45 EUR', en: 'Fixed price EUR 45' },
    availability: { weekdays: true, weekends: false, urgent: true },
    languages: ['pt', 'en'],
    travelToClient: true,
    professionalRegistration: 'PT-AUTO-4000',
    rating: 4.7,
    reviews: 31,
    trust: { ...defaultTrust, trustLevel: 'trusted' }
  },
  {
    id: 'listing-brussels-cleaning',
    providerId: 'brussels-clean-co',
    providerName: 'Brussels Clean Co',
    providerType: 'professional',
    email: 'hello@brusselsclean.example',
    phone: '+32 470 12 34 56',
    mainCommune: 'Brussels',
    serviceArea: ['Brussels'],
    baseLocationId: 'be-brussels',
    coveredLocationIds: ['be-brussels'],
    serviceRadiusKm: 22,
    remoteAvailable: false,
    categorySlug: 'cleaning-facility',
    subcategorySlug: 'home-cleaning',
    specialtySlug: 'regular-cleaning',
    title: { fr: 'Nettoyage régulier à Bruxelles', pt: 'Limpeza regular em Bruxelas', en: 'Regular cleaning in Brussels' },
    shortDescription: {
      fr: 'Ménage hebdomadaire ou bihebdomadaire pour appartements et maisons.',
      pt: 'Limpeza semanal ou quinzenal para apartamentos e casas.',
      en: 'Weekly or biweekly cleaning for apartments and houses.'
    },
    priceModel: 'hourly',
    priceLabel: { fr: '32 EUR / heure', pt: '32 EUR / hora', en: 'EUR 32 / hour' },
    availability: { weekdays: true, weekends: false, urgent: false },
    languages: ['fr', 'en'],
    travelToClient: true,
    professionalRegistration: 'BE-CLEAN-1000',
    rating: 4.8,
    reviews: 58,
    trust: { ...defaultTrust, trustLevel: 'verified' }
  },
  {
    id: 'listing-arlon-crossborder',
    providerId: 'arlon-home-fix',
    providerName: 'Arlon Home Fix',
    providerType: 'professional',
    email: 'arlon.fix@example.be',
    phone: '+32 470 98 76 54',
    mainCommune: 'Arlon',
    serviceArea: ['Arlon', 'Luxembourg'],
    baseLocationId: 'be-arlon',
    coveredLocationIds: ['be-arlon', 'lu-luxembourg'],
    serviceRadiusKm: 35,
    remoteAvailable: false,
    categorySlug: 'home-repairs',
    subcategorySlug: 'handyman',
    specialtySlug: 'small-repairs',
    title: { fr: 'Petites réparations Arlon et frontière', pt: 'Pequenas reparações em Arlon e fronteira', en: 'Small repairs around Arlon and border areas' },
    shortDescription: {
      fr: 'Interventions maison autour d’Arlon, Luxembourg et zones proches.',
      pt: 'Intervenções domésticas em Arlon, Luxemburgo e zonas próximas.',
      en: 'Home repair visits around Arlon, Luxembourg, and nearby areas.'
    },
    priceModel: 'hourly',
    priceLabel: { fr: '52 EUR / heure', pt: '52 EUR / hora', en: 'EUR 52 / hour' },
    availability: { weekdays: true, weekends: true, urgent: false },
    languages: ['fr', 'en'],
    travelToClient: true,
    professionalRegistration: 'BE-FIX-6700',
    rating: 4.6,
    reviews: 27,
    trust: { ...defaultTrust, trustLevel: 'trusted' }
  },
  {
    id: 'listing-remote-business-admin',
    providerId: 'remote-admin-eu',
    providerName: 'Remote Admin EU',
    providerType: 'professional',
    email: 'admin@remote-eu.example',
    phone: '+351 910 000 555',
    mainCommune: 'Lisbon',
    serviceArea: ['Lisbon', 'Paris', 'Brussels', 'Luxembourg'],
    baseLocationId: 'pt-lisbon',
    coveredLocationIds: ['pt-lisbon', 'fr-paris', 'be-brussels', 'lu-luxembourg'],
    serviceRadiusKm: 10,
    remoteAvailable: true,
    categorySlug: 'business-services',
    subcategorySlug: 'admin-support',
    specialtySlug: 'document-admin',
    title: { fr: 'Support administratif à distance', pt: 'Apoio administrativo remoto', en: 'Remote administrative support' },
    shortDescription: {
      fr: 'Aide documents, formulaires, organisation et suivi administratif en ligne.',
      pt: 'Ajuda com documentos, formulários, organização e acompanhamento administrativo online.',
      en: 'Help with documents, forms, organization, and online admin follow-up.'
    },
    priceModel: 'hourly',
    priceLabel: { fr: '38 EUR / heure', pt: '38 EUR / hora', en: 'EUR 38 / hour' },
    availability: { weekdays: true, weekends: false, urgent: false },
    languages: ['fr', 'pt', 'en'],
    travelToClient: false,
    professionalRegistration: 'EU-ADMIN-001',
    rating: 4.8,
    reviews: 44,
    trust: { ...defaultTrust, trustLevel: 'verified', responseReliability: 97 }
  }
];

export const serviceListings: ServiceListing[] = rawServiceListings.map((listing) => {
  const baseLocationId = listing.baseLocationId ?? locationIdForArea(listing.mainCommune);
  const coveredLocationIds =
    listing.coveredLocationIds ?? Array.from(new Set(listing.serviceArea.map((area) => locationIdForArea(area))));

  return {
    ...listing,
    baseLocationId,
    coveredLocationIds,
    serviceRadiusKm: listing.serviceRadiusKm ?? 25,
    remoteAvailable: listing.remoteAvailable ?? false,
    trust: listing.trust ?? defaultTrust
  };
});

export const providerTypes: ProviderType[] = ['professional', 'private'];

export const listingLanguages: Locale[] = ['fr', 'pt', 'en'];

export const marketplaceLocations = locationAreas;

const categorySearchAliases: Record<string, string[]> = {
  'home-repairs': [
    'bricolage',
    'reparation',
    'reparacao',
    'canalizacao',
    'plomberie',
    'electricidade',
    'electricien',
    'handyman',
    'peinture',
    'pintura',
    'pintor',
    'pintores',
    'pintre',
    'painter'
  ],
  'cleaning-facility': [
    'limpeza',
    'limpesa',
    'nettoyage',
    'menage',
    'ménage',
    'cleaning',
    'faxina',
    'fim de arrendamento',
    'fin de bail'
  ],
  'automotive-mechanics': [
    'auto',
    'automovel',
    'automóvel',
    'carro',
    'voiture',
    'mecanico',
    'mecânico',
    'mechanic',
    'pneus'
  ],
  'garden-outdoor': ['jardim', 'jardin', 'garden', 'relva', 'pelouse', 'sebes', 'haies'],
  'moving-transport': ['mudanca', 'mudança', 'demenagement', 'déménagement', 'moving', 'transport', 'carrinha'],
  'education-tutoring': ['aulas', 'explicacoes', 'explicações', 'cours', 'tutoring', 'ensino', 'professor'],
  'sport-coaching': ['personal trainer', 'treinador', 'coach', 'sport', 'fitness', 'desporto'],
  'music-audio': ['musica', 'música', 'music', 'audio', 'dj', 'piano', 'guitarra', 'chant'],
  'beauty-wellness': ['beleza', 'beauty', 'bien etre', 'bien-être', 'massagem', 'massage', 'cabeleireiro'],
  'pet-services': ['animais', 'animal', 'pets', 'cao', 'cão', 'chien', 'chat'],
  'digital-admin': ['informatica', 'informática', 'ordinateur', 'computer', 'wifi', 'admin', 'digital'],
  events: ['eventos', 'événements', 'events', 'festa', 'party', 'casamento'],
  'business-services': ['empresa', 'business', 'negocio', 'negócio', 'comptabilite', 'comptabilité', 'fiscalidade']
};

const serviceSearchAliases: Record<string, string[]> = {
  'home-repairs/plumbing': ['canalizador', 'canalizadores', 'plombier', 'fuite', 'fuga'],
  'home-repairs/electricity': ['eletricista', 'electricista', 'electricien', 'électricien', 'electrician'],
  'home-repairs/painting': ['pintor', 'pintores', 'pintura', 'peintre', 'peintres', 'peinture', 'painter', 'painters'],
  'home-repairs/painting/interior-painting': ['pintor interior', 'pintura interior', 'peinture intérieure', 'interior painter'],
  'home-repairs/painting/walls-ceilings': ['paredes', 'tetos', 'tectos', 'murs', 'plafonds', 'walls', 'ceilings'],
  'home-repairs/painting/small-touchups': ['retoques', 'retouches', 'acabamentos', 'touch ups', 'touch-ups'],
  'home-repairs/handyman': ['faz tudo', 'bricoleur', 'homem para reparacoes', 'homem para reparações'],
  'cleaning-facility/home-cleaning': [
    'limpeza',
    'limpesa',
    'faxina',
    'menage',
    'ménage',
    'femme de menage',
    'femme de ménage',
    'aide menage',
    'aide ménage',
    'menagere',
    'ménagère',
    'empregada domestica',
    'empregada doméstica',
    'cleaner',
    'cleaning',
    'cleaning lady',
    'housekeeper',
    'housekeeping'
  ],
  'cleaning-facility/end-of-tenancy': [
    'limpeza',
    'limpesa',
    'limpeza fim de arrendamento',
    'fim arrendamento',
    'fin de bail',
    'end tenancy',
    'end of tenancy'
  ],
  'cleaning-facility/office-cleaning': [
    'limpeza',
    'limpesa',
    'limpeza escritorio',
    'limpeza escritório',
    'nettoyage bureaux',
    'office cleaning'
  ],
  'automotive-mechanics/car-maintenance': ['mecanico', 'mecânico', 'mécanicien', 'mechanic', 'oleo', 'óleo', 'vidange'],
  'automotive-mechanics/tyres': ['pneu', 'pneus', 'tyres', 'tires'],
  'garden-outdoor/garden-maintenance': ['jardineiro', 'jardinier', 'gardener', 'relva', 'poda'],
  'education-tutoring/school-tutoring': ['professor', 'explicador', 'explicacoes', 'explicações', 'tutor'],
  'sport-coaching/personal-training': ['personal trainer', 'treinador', 'coach fitness'],
  'music-audio/music-lessons': ['professor musica', 'professor de musica', 'aulas musica', 'aulas de música']
};

export type ServiceSearchMatchLevel = 'subcategory' | 'specialty' | 'listing';

export interface ServiceSearchMatch {
  id: string;
  level: ServiceSearchMatchLevel;
  category: Category;
  subcategory?: Category['subcategories'][number];
  specialty?: Category['subcategories'][number]['specialties'][number];
  listing?: ServiceListing;
  score: number;
  listingCount: number;
  listings: ServiceListing[];
}

function getServiceAliasKey(categorySlug: string, subcategorySlug?: string, specialtySlug?: string) {
  return [categorySlug, subcategorySlug, specialtySlug].filter(Boolean).join('/');
}

function getServiceAliases(categorySlug: string, subcategorySlug?: string, specialtySlug?: string) {
  return [
    ...(serviceSearchAliases[getServiceAliasKey(categorySlug, subcategorySlug)] ?? []),
    ...(serviceSearchAliases[getServiceAliasKey(categorySlug, subcategorySlug, specialtySlug)] ?? [])
  ];
}

function scoreSearchText(searchText: string, mainLabel: string, query: string) {
  const normalizedQuery = normalizeSearch(query.trim());

  if (!normalizedQuery) {
    return 0;
  }

  const haystack = normalizeSearch(searchText);
  const label = normalizeSearch(mainLabel);
  const words = haystack.split(/[^a-z0-9]+/).filter(Boolean);
  let score = 0;

  for (const token of normalizedQuery.split(/\s+/).filter(Boolean)) {
    let tokenScore = 0;

    if (words.some((word) => word === token)) {
      tokenScore = 120 + token.length;
    } else if (words.some((word) => word.startsWith(token))) {
      tokenScore = 75 + token.length;
    } else if (token.length >= 2 && haystack.includes(token)) {
      tokenScore = 35 + token.length;
    }

    if (!tokenScore) {
      return 0;
    }

    score += tokenScore + (label.includes(token) ? 30 : 0);
  }

  return score;
}

export function findCategory(categorySlug?: string) {
  return marketplaceCategories.find((category) => category.slug === categorySlug);
}

export function findSubcategory(categorySlug?: string, subcategorySlug?: string) {
  return findCategory(categorySlug)?.subcategories.find((subcategory) => subcategory.slug === subcategorySlug);
}

export function findSpecialty(categorySlug?: string, subcategorySlug?: string, specialtySlug?: string) {
  return findSubcategory(categorySlug, subcategorySlug)?.specialties.find((specialty) => specialty.slug === specialtySlug);
}

export function findListing(listingId?: string) {
  return serviceListings.find((listing) => listing.id === listingId);
}

export function getListingsFor(categorySlug?: string, subcategorySlug?: string, specialtySlug?: string) {
  return serviceListings.filter((listing) => {
    const categoryMatch = !categorySlug || listing.categorySlug === categorySlug;
    const subcategoryMatch = !subcategorySlug || listing.subcategorySlug === subcategorySlug;
    const specialtyMatch = !specialtySlug || listing.specialtySlug === specialtySlug;
    return categoryMatch && subcategoryMatch && specialtyMatch;
  });
}

interface ListingFilterInput {
  categorySlug?: string;
  subcategorySlug?: string;
  specialtySlug?: string;
  locationId?: string;
  searchQuery?: string;
  providerType?: ProviderType | 'all';
  urgentOnly?: boolean;
  priceShownOnly?: boolean;
  language?: Locale | 'all';
  minRating?: number;
}

export function filterListings(filters: ListingFilterInput) {
  return rankListings(
    getListingsFor(filters.categorySlug, filters.subcategorySlug, filters.specialtySlug).filter((listing) => {
      const locationMatch = !filters.locationId || listingMatchesLocation(listing, filters.locationId);
      const queryMatch = !filters.searchQuery || getSearchRelevance(listing, filters.searchQuery) > 0;
      const providerTypeMatch =
        !filters.providerType || filters.providerType === 'all' || listing.providerType === filters.providerType;
      const urgentMatch = !filters.urgentOnly || listing.availability.urgent;
      const priceMatch = !filters.priceShownOnly || listing.priceModel !== 'quote_only';
      const languageMatch = !filters.language || filters.language === 'all' || listing.languages.includes(filters.language);
      const ratingMatch = !filters.minRating || listing.rating >= filters.minRating;

      return locationMatch && queryMatch && providerTypeMatch && urgentMatch && priceMatch && languageMatch && ratingMatch;
    }),
    filters.locationId,
    filters.searchQuery
  );
}

export function getEligibleListingsForNotification(
  categorySlug: string,
  subcategorySlug: string,
  specialtySlug: string,
  locationId: string
) {
  return serviceListings.filter(
    (listing) =>
      listing.categorySlug === categorySlug &&
      listing.subcategorySlug === subcategorySlug &&
      listing.specialtySlug === specialtySlug &&
      listingMatchesLocation(listing, locationId)
  );
}

export function listingMatchesLocation(listing: ServiceListing, locationId: string) {
  const selectedLocation = getLocation(locationId);
  const baseLocation = getLocation(listing.baseLocationId);

  if (!selectedLocation || !baseLocation) {
    return true;
  }

  if (listing.coveredLocationIds.includes(locationId)) {
    return true;
  }

  const distance = distanceKm(baseLocation, selectedLocation);
  return distance <= listing.serviceRadiusKm || listing.remoteAvailable;
}

export function getLocationPriority(listing: ServiceListing, locationId?: string) {
  const selectedLocation = getLocation(locationId);
  const baseLocation = getLocation(listing.baseLocationId);

  if (!selectedLocation || !baseLocation) {
    return 6;
  }

  const coveredLocations = listing.coveredLocationIds.map((id) => getLocation(id)).filter(Boolean);

  if (listing.coveredLocationIds.includes(selectedLocation.id) || baseLocation.city === selectedLocation.city) {
    return 0;
  }

  if (coveredLocations.some((location) => location?.district === selectedLocation.district)) {
    return 1;
  }

  if (coveredLocations.some((location) => location?.region === selectedLocation.region)) {
    return 2;
  }

  if (coveredLocations.some((location) => location?.countryCode === selectedLocation.countryCode)) {
    return 3;
  }

  const distance = distanceKm(baseLocation, selectedLocation);
  if (distance <= Math.max(listing.serviceRadiusKm, selectedLocation.serviceRadiusKm, 80)) {
    return 4;
  }

  return listing.remoteAvailable ? 5 : 6;
}

function normalizeSearch(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function getCategorySearchText(category: Category) {
  const categoryListings = serviceListings.filter((listing) => listing.categorySlug === category.slug);

  return normalizeSearch(
    [
      ...Object.values(category.labels),
      ...Object.values(category.description),
      ...(categorySearchAliases[category.slug] ?? []),
      ...category.subcategories.flatMap((subcategory) => [
        ...Object.values(subcategory.labels),
        ...Object.values(subcategory.description),
        ...subcategory.specialties.flatMap((specialty) => Object.values(specialty.labels))
      ]),
      ...categoryListings.flatMap((listing) => [
        listing.providerName,
        ...Object.values(listing.title),
        ...Object.values(listing.shortDescription)
      ])
    ].join(' ')
  );
}

export function getCategorySearchRelevance(category: Category, query: string) {
  const normalizedQuery = normalizeSearch(query.trim());
  if (!normalizedQuery) {
    return 1;
  }

  const haystack = getCategorySearchText(category);
  return normalizedQuery
    .split(/\s+/)
    .filter(Boolean)
    .reduce((score, token) => {
      if (!haystack.includes(token)) {
        return score;
      }

      const categoryLabelMatch = Object.values(category.labels).some((label) =>
        normalizeSearch(label).includes(token)
      );

      return score + token.length + (categoryLabelMatch ? 8 : 0);
    }, 0);
}

export function getSearchRelevance(listing: ServiceListing, query: string) {
  const normalizedQuery = normalizeSearch(query.trim());
  if (!normalizedQuery) {
    return 1;
  }

  const category = findCategory(listing.categorySlug);
  const subcategory = findSubcategory(listing.categorySlug, listing.subcategorySlug);
  const specialty = findSpecialty(listing.categorySlug, listing.subcategorySlug, listing.specialtySlug);
  const haystack = normalizeSearch(
    [
      listing.providerName,
      ...Object.values(listing.title),
      ...Object.values(listing.shortDescription),
      ...(category ? Object.values(category.labels) : []),
      ...(subcategory ? Object.values(subcategory.labels) : []),
      ...(specialty ? Object.values(specialty.labels) : []),
      ...(category ? getServiceAliases(category.slug, subcategory?.slug, specialty?.slug) : [])
    ].join(' ')
  );

  return normalizedQuery
    .split(/\s+/)
    .filter(Boolean)
    .reduce((score, token) => score + (haystack.includes(token) ? token.length : 0), 0);
}

export function rankListings(listings: ServiceListing[], locationId?: string, query = '') {
  return [...listings].sort((first, second) => {
    const relevanceDelta = getSearchRelevance(second, query) - getSearchRelevance(first, query);
    if (relevanceDelta !== 0) {
      return relevanceDelta;
    }

    const locationDelta = getLocationPriority(first, locationId) - getLocationPriority(second, locationId);
    if (locationDelta !== 0) {
      return locationDelta;
    }

    return second.rating - first.rating;
  });
}

export function searchListings(query: string, locationId?: string) {
  return rankListings(
    serviceListings.filter((listing) => getSearchRelevance(listing, query) > 0),
    locationId,
    query
  );
}

function getListingsForServiceMatch(categorySlug: string, subcategorySlug?: string, specialtySlug?: string, locationId?: string) {
  return rankListings(
    serviceListings.filter((listing) => {
      const categoryMatch = listing.categorySlug === categorySlug;
      const subcategoryMatch = !subcategorySlug || listing.subcategorySlug === subcategorySlug;
      const specialtyMatch = !specialtySlug || listing.specialtySlug === specialtySlug;
      const locationMatch = !locationId || listingMatchesLocation(listing, locationId);
      return categoryMatch && subcategoryMatch && specialtyMatch && locationMatch;
    }),
    locationId
  );
}

export function searchServiceMatches(query: string, locationId?: string) {
  const normalizedQuery = normalizeSearch(query.trim());

  if (!normalizedQuery) {
    return [];
  }

  const matches: ServiceSearchMatch[] = [];

  for (const category of marketplaceCategories) {
    for (const subcategory of category.subcategories) {
      const subcategoryListings = getListingsForServiceMatch(category.slug, subcategory.slug, undefined, locationId);
      const subcategorySearchText = [
        ...Object.values(category.labels),
        ...Object.values(subcategory.labels),
        ...Object.values(subcategory.description),
        ...getServiceAliases(category.slug, subcategory.slug),
        ...subcategory.specialties.flatMap((specialty) => Object.values(specialty.labels)),
        ...subcategoryListings.flatMap((listing) => [
          listing.providerName,
          ...Object.values(listing.title),
          ...Object.values(listing.shortDescription)
        ])
      ].join(' ');
      const subcategoryLabel = subcategory.labels.pt ?? subcategory.labels.fr ?? subcategory.labels.en;
      const subcategoryScore = scoreSearchText(subcategorySearchText, subcategoryLabel, query);

      if (subcategoryScore > 0) {
        matches.push({
          id: `${category.slug}/${subcategory.slug}`,
          level: 'subcategory',
          category,
          subcategory,
          score: subcategoryScore + Math.min(subcategoryListings.length, 5),
          listingCount: subcategoryListings.length,
          listings: subcategoryListings.slice(0, 3)
        });
      }

      for (const specialty of subcategory.specialties) {
        const specialtyListings = getListingsForServiceMatch(category.slug, subcategory.slug, specialty.slug, locationId);
        const specialtySearchText = [
          ...Object.values(category.labels),
          ...Object.values(subcategory.labels),
          ...Object.values(specialty.labels),
          ...getServiceAliases(category.slug, subcategory.slug, specialty.slug),
          ...specialtyListings.flatMap((listing) => [
            listing.providerName,
            ...Object.values(listing.title),
            ...Object.values(listing.shortDescription)
          ])
        ].join(' ');
        const specialtyLabel = specialty.labels.pt ?? specialty.labels.fr ?? specialty.labels.en;
        const specialtyScore = scoreSearchText(specialtySearchText, specialtyLabel, query);

        if (specialtyScore > 0) {
          matches.push({
            id: `${category.slug}/${subcategory.slug}/${specialty.slug}`,
            level: 'specialty',
            category,
            subcategory,
            specialty,
            score: specialtyScore + 20 + Math.min(specialtyListings.length, 5),
            listingCount: specialtyListings.length,
            listings: specialtyListings.slice(0, 3)
          });
        }
      }
    }
  }

  for (const listing of serviceListings) {
    const category = findCategory(listing.categorySlug);
    const subcategory = findSubcategory(listing.categorySlug, listing.subcategorySlug);
    const specialty = findSpecialty(listing.categorySlug, listing.subcategorySlug, listing.specialtySlug);

    if (!category || !listingMatchesLocation(listing, locationId || listing.baseLocationId)) {
      continue;
    }

    const listingSearchText = [
      listing.providerName,
      ...Object.values(listing.title),
      ...Object.values(listing.shortDescription),
      ...(category ? Object.values(category.labels) : []),
      ...(subcategory ? Object.values(subcategory.labels) : []),
      ...(specialty ? Object.values(specialty.labels) : []),
      ...getServiceAliases(listing.categorySlug, listing.subcategorySlug, listing.specialtySlug)
    ].join(' ');
    const listingLabel = listing.title.pt ?? listing.title.fr ?? listing.title.en;
    const listingScore = scoreSearchText(listingSearchText, listingLabel, query);

    if (listingScore > 0) {
      matches.push({
        id: listing.id,
        level: 'listing',
        category,
        subcategory,
        specialty,
        listing,
        score: listingScore,
        listingCount: 1,
        listings: [listing]
      });
    }
  }

  return matches
    .sort((first, second) => {
      if (second.score !== first.score) {
        return second.score - first.score;
      }

      return second.listingCount - first.listingCount;
    })
    .slice(0, 8);
}

export function searchCategoryMatches(query: string, locationId?: string) {
  const normalizedQuery = normalizeSearch(query.trim());

  if (!normalizedQuery) {
    return [];
  }

  return marketplaceCategories
    .map((category) => {
      const score = getCategorySearchRelevance(category, query);
      const matchingListings = serviceListings.filter(
        (listing) =>
          listing.categorySlug === category.slug &&
          listingMatchesLocation(listing, locationId || listing.baseLocationId) &&
          (score > 0 || getSearchRelevance(listing, query) > 0)
      );

      return {
        category,
        score,
        listingCount: matchingListings.length,
        listings: rankListings(matchingListings, locationId, query).slice(0, 3)
      };
    })
    .filter((match) => match.score > 0 || match.listingCount > 0)
    .sort((first, second) => {
      if (second.score !== first.score) {
        return second.score - first.score;
      }

      return second.listingCount - first.listingCount;
    })
    .slice(0, 5);
}
