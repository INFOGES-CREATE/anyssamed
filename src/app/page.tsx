"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";
import { LogIn } from "lucide-react";

import {
  Users,
  Calendar,
  FileText,
  Shield,
  Award,
  Star,
  Check,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Sparkles,
  Activity,
  Stethoscope,
  ClipboardCheck,
  Brain,
  BarChart3,
  Lock,
  Globe,
  HeartPulse,
  Clock,
  CheckCircle2,
  X,
  ChevronDown,
  Menu,
  Moon,
  Sun,
  Send,
  Zap,
  TrendingUp,
  Target,
  Briefcase,
  MessageSquare,
  PlayCircle,
  Download,
  Share2,
  Bookmark,
  Eye,
  Settings,
  Bell,
  Search,
  Filter,
  ChevronRight,
  ExternalLink,
  Code,
  Cpu,
  Database,
  Cloud,
  Layers,
  Package,
  GitBranch,
  Smartphone,
  HelpCircle,
} from "lucide-react";

// ==================== SISTEMA DE INTERNACIONALIZACIÓN ====================
type Language = "es" | "en" | "fr" | "de" | "pt";

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

const translations: Translations = {
  // Navigation
  navFeatures: {
    es: "Características",
    en: "Features",
    fr: "Caractéristiques",
    de: "Funktionen",
    pt: "Características",
  },
  navSolutions: {
    es: "Soluciones",
    en: "Solutions",
    fr: "Solutions",
    de: "Lösungen",
    pt: "Soluções",
  },
  navPricing: {
    es: "Precios",
    en: "Pricing",
    fr: "Tarifs",
    de: "Preise",
    pt: "Preços",
  },
  navTestimonials: {
    es: "Testimonios",
    en: "Testimonials",
    fr: "Témoignages",
    de: "Referenzen",
    pt: "Depoimentos",
  },
  navContact: {
    es: "Contacto",
    en: "Contact",
    fr: "Contact",
    de: "Kontakt",
    pt: "Contato",
  },
  navLogin: {
    es: "Ingresar",
    en: "Login",
    fr: "Connexion",
    de: "Anmelden",
    pt: "Entrar",
  },

  // Hero Section
  heroBadge: {
    es: "Líder en Gestión Médica en Chile",
    en: "Leading Medical Management in Chile",
    fr: "Leader en Gestion Médicale au Chili",
    de: "Führend im Medizinmanagement in Chile",
    pt: "Líder em Gestão Médica no Chile",
  },
  heroTitle1: {
    es: "Excelencia en",
    en: "Excellence in",
    fr: "Excellence en",
    de: "Exzellenz in",
    pt: "Excelência em",
  },
  heroTitle2: {
    es: "Gestión Médica",
    en: "Medical Management",
    fr: "Gestion Médicale",
    de: "Medizinmanagement",
    pt: "Gestão Médica",
  },
  heroDescription: {
    es: "Plataforma integral para centros de salud que combina tecnología de vanguardia con estándares médicos de clase mundial. Optimice su operación y eleve la calidad de atención.",
    en: "Comprehensive platform for healthcare centers combining cutting-edge technology with world-class medical standards. Optimize your operations and elevate care quality.",
    fr: "Plateforme complète pour centres de santé combinant technologie de pointe et normes médicales de classe mondiale. Optimisez vos opérations et améliorez la qualité des soins.",
    de: "Umfassende Plattform für Gesundheitszentren, die modernste Technologie mit weltklasse medizinischen Standards kombiniert. Optimieren Sie Ihre Abläufe und verbessern Sie die Pflegequalität.",
    pt: "Plataforma abrangente para centros de saúde que combina tecnologia de ponta com padrões médicos de classe mundial. Otimize suas operações e eleve a qualidade do atendimento.",
  },
  heroCtaDemo: {
    es: "Agendar Demostración",
    en: "Schedule Demo",
    fr: "Planifier une Démo",
    de: "Demo vereinbaren",
    pt: "Agendar Demonstração",
  },
  heroCtaCases: {
    es: "Ver Casos de Éxito",
    en: "View Success Stories",
    fr: "Voir les Cas de Succès",
    de: "Erfolgsgeschichten ansehen",
    pt: "Ver Casos de Sucesso",
  },
  heroTrustRating: {
    es: "de 2,400+ profesionales médicos",
    en: "from 2,400+ medical professionals",
    fr: "de 2 400+ professionnels médicaux",
    de: "von 2.400+ medizinischen Fachkräften",
    pt: "de 2.400+ profissionais médicos",
  },

  // Stats
  statProfessionals: {
    es: "Profesionales de la Salud",
    en: "Healthcare Professionals",
    fr: "Professionnels de Santé",
    de: "Gesundheitsfachkräfte",
    pt: "Profissionais de Saúde",
  },
  statPatients: {
    es: "Pacientes Atendidos",
    en: "Patients Served",
    fr: "Patients Traités",
    de: "Behandelte Patienten",
    pt: "Pacientes Atendidos",
  },
  statUptime: {
    es: "Disponibilidad del Sistema",
    en: "System Uptime",
    fr: "Disponibilité du Système",
    de: "Systemverfügbarkeit",
    pt: "Disponibilidade do Sistema",
  },
  statSupport: {
    es: "Soporte Especializado",
    en: "Specialized Support",
    fr: "Support Spécialisé",
    de: "Spezialisierter Support",
    pt: "Suporte Especializado",
  },

  // Features Section
  featuresBadge: {
    es: "Tecnología de Vanguardia",
    en: "Cutting-Edge Technology",
    fr: "Technologie de Pointe",
    de: "Spitzentechnologie",
    pt: "Tecnologia de Ponta",
  },
  featuresTitle1: {
    es: "Características de",
    en: "Features at",
    fr: "Caractéristiques de",
    de: "Funktionen auf",
    pt: "Características de",
  },
  featuresTitle2: {
    es: "Nivel Empresarial",
    en: "Enterprise Level",
    fr: "Niveau Entreprise",
    de: "Enterprise-Niveau",
    pt: "Nível Empresarial",
  },
  featuresDescription: {
    es: "Plataforma integral que integra todas las necesidades de gestión médica moderna con los más altos estándares de calidad y seguridad",
    en: "Comprehensive platform integrating all modern medical management needs with the highest quality and security standards",
    fr: "Plateforme complète intégrant tous les besoins de gestion médicale moderne avec les plus hauts standards de qualité et de sécurité",
    de: "Umfassende Plattform, die alle modernen Anforderungen an das Medizinmanagement mit höchsten Qualitäts- und Sicherheitsstandards integriert",
    pt: "Plataforma abrangente que integra todas as necessidades de gestão médica moderna com os mais altos padrões de qualidade e segurança",
  },

  // Feature Cards
  featureScheduling: {
    es: "Sistema de Agendamiento Médico",
    en: "Medical Scheduling System",
    fr: "Système de Planification Médicale",
    de: "Medizinisches Planungssystem",
    pt: "Sistema de Agendamento Médico",
  },
  featureSchedulingDesc: {
    es: "Gestión profesional de citas con sincronización automática, recordatorios inteligentes y optimización de recursos médicos.",
    en: "Professional appointment management with automatic synchronization, intelligent reminders and medical resource optimization.",
    fr: "Gestion professionnelle des rendez-vous avec synchronisation automatique, rappels intelligents et optimisation des ressources médicales.",
    de: "Professionelles Terminmanagement mit automatischer Synchronisierung, intelligenten Erinnerungen und Optimierung medizinischer Ressourcen.",
    pt: "Gestão profissional de consultas com sincronização automática, lembretes inteligentes e otimização de recursos médicos.",
  },
  featureEhr: {
    es: "Expediente Clínico Electrónico",
    en: "Electronic Health Record",
    fr: "Dossier Médical Électronique",
    de: "Elektronische Patientenakte",
    pt: "Prontuário Eletrônico",
  },
  featureEhrDesc: {
    es: "Historial médico completo con certificaciones digitales, recetas electrónicas y cumplimiento normativo GES.",
    en: "Complete medical history with digital certifications, electronic prescriptions and regulatory compliance.",
    fr: "Historique médical complet avec certifications numériques, ordonnances électroniques et conformité réglementaire.",
    de: "Vollständige Krankengeschichte mit digitalen Zertifizierungen, elektronischen Rezepten und regulatorischer Compliance.",
    pt: "Histórico médico completo com certificações digitais, receitas eletrônicas e conformidade regulatória.",
  },
  featureTelemedicine: {
    es: "Plataforma de Telemedicina",
    en: "Telemedicine Platform",
    fr: "Plateforme de Télémédecine",
    de: "Telemedizin-Plattform",
    pt: "Plataforma de Telemedicina",
  },
  featureTelemedicineDesc: {
    es: "Consultas virtuales de alta calidad con herramientas diagnósticas remotas y sala de espera digital.",
    en: "High-quality virtual consultations with remote diagnostic tools and digital waiting room.",
    fr: "Consultations virtuelles de haute qualité avec outils de diagnostic à distance et salle d'attente numérique.",
    de: "Hochwertige virtuelle Konsultationen mit Remote-Diagnosetools und digitalem Wartezimmer.",
    pt: "Consultas virtuais de alta qualidade com ferramentas de diagnóstico remoto e sala de espera digital.",
  },
  featureAI: {
    es: "Inteligencia Artificial Médica",
    en: "Medical Artificial Intelligence",
    fr: "Intelligence Artificielle Médicale",
    de: "Medizinische Künstliche Intelligenz",
    pt: "Inteligência Artificial Médica",
  },
  featureAIDesc: {
    es: "Asistencia diagnóstica avanzada con detección de interacciones y sugerencias basadas en evidencia.",
    en: "Advanced diagnostic assistance with interaction detection and evidence-based suggestions.",
    fr: "Assistance diagnostique avancée avec détection d'interactions et suggestions basées sur des preuves.",
    de: "Fortgeschrittene Diagnoseunterstützung mit Interaktionserkennung und evidenzbasierten Vorschlägen.",
    pt: "Assistência diagnóstica avançada com detecção de interações e sugestões baseadas em evidências.",
  },
  featureAnalytics: {
    es: "Analítica e Inteligencia de Negocio",
    en: "Analytics & Business Intelligence",
    fr: "Analytique et Intelligence d'Affaires",
    de: "Analytik & Business Intelligence",
    pt: "Análise e Inteligência de Negócios",
  },
  featureAnalyticsDesc: {
    es: "Dashboards ejecutivos con KPIs médicos, predicción de demanda y reportería automatizada.",
    en: "Executive dashboards with medical KPIs, demand forecasting and automated reporting.",
    fr: "Tableaux de bord exécutifs avec KPI médicaux, prévision de la demande et rapports automatisés.",
    de: "Executive Dashboards mit medizinischen KPIs, Nachfrageprognose und automatisierter Berichterstattung.",
    pt: "Dashboards executivos com KPIs médicos, previsão de demanda e relatórios automatizados.",
  },
  featureSecurity: {
    es: "Seguridad y Cumplimiento Total",
    en: "Complete Security & Compliance",
    fr: "Sécurité et Conformité Totale",
    de: "Vollständige Sicherheit & Compliance",
    pt: "Segurança e Conformidade Total",
  },
  featureSecurityDesc: {
    es: "Protección de nivel bancario con cumplimiento GDPR, cifrado de extremo a extremo y auditoría completa.",
    en: "Bank-level protection with GDPR compliance, end-to-end encryption and complete auditing.",
    fr: "Protection de niveau bancaire avec conformité GDPR, chiffrement de bout en bout et audit complet.",
    de: "Schutz auf Bankniveau mit GDPR-Konformität, End-to-End-Verschlüsselung und vollständigem Audit.",
    pt: "Proteção de nível bancário com conformidade GDPR, criptografia ponta a ponta e auditoria completa.",
  },

  // Pricing Section
  pricingBadge: {
    es: "Planes Empresariales",
    en: "Enterprise Plans",
    fr: "Plans Entreprise",
    de: "Unternehmenspläne",
    pt: "Planos Empresariais",
  },
  pricingTitle1: {
    es: "Soluciones para Cada",
    en: "Solutions for Every",
    fr: "Solutions pour Chaque",
    de: "Lösungen für Jeden",
    pt: "Soluções para Cada",
  },
  pricingTitle2: {
    es: "Necesidad Médica",
    en: "Medical Need",
    fr: "Besoin Médical",
    de: "Medizinischen Bedarf",
    pt: "Necessidade Médica",
  },
  pricingDescription: {
    es: "Inversión transparente con retorno garantizado. Sin costos ocultos.",
    en: "Transparent investment with guaranteed return. No hidden costs.",
    fr: "Investissement transparent avec retour garanti. Pas de coûts cachés.",
    de: "Transparente Investition mit garantierter Rendite. Keine versteckten Kosten.",
    pt: "Investimento transparente com retorno garantido. Sem custos ocultos.",
  },
  planProfessional: {
    es: "Profesional",
    en: "Professional",
    fr: "Professionnel",
    de: "Professionell",
    pt: "Profissional",
  },
  planClinic: {
    es: "Clínica",
    en: "Clinic",
    fr: "Clinique",
    de: "Klinik",
    pt: "Clínica",
  },
  planEnterprise: {
    es: "Enterprise",
    en: "Enterprise",
    fr: "Entreprise",
    de: "Unternehmen",
    pt: "Empresarial",
  },
  mostPopular: {
    es: "Más Popular",
    en: "Most Popular",
    fr: "Le Plus Populaire",
    de: "Am Beliebtesten",
    pt: "Mais Popular",
  },
  perMonth: {
    es: "/mes",
    en: "/month",
    fr: "/mois",
    de: "/Monat",
    pt: "/mês",
  },
  custom: {
    es: "Personalizado",
    en: "Custom",
    fr: "Personnalisé",
    de: "Individuell",
    pt: "Personalizado",
  },
  startTrial: {
    es: "Iniciar Prueba Gratuita",
    en: "Start Free Trial",
    fr: "Démarrer l'Essai Gratuit",
    de: "Kostenlose Testversion starten",
    pt: "Iniciar Teste Gratuito",
  },
  requestDemo: {
    es: "Solicitar Demostración",
    en: "Request Demo",
    fr: "Demander une Démo",
    de: "Demo anfordern",
    pt: "Solicitar Demonstração",
  },
  contactSales: {
    es: "Contactar Ventas",
    en: "Contact Sales",
    fr: "Contacter les Ventes",
    de: "Vertrieb kontaktieren",
    pt: "Contatar Vendas",
  },
  includedFeatures: {
    es: "Características Incluidas",
    en: "Included Features",
    fr: "Fonctionnalités Incluses",
    de: "Enthaltene Funktionen",
    pt: "Recursos Incluídos",
  },

  // Testimonials
  testimonialsBadge: {
    es: "Casos de Éxito",
    en: "Success Stories",
    fr: "Cas de Succès",
    de: "Erfolgsgeschichten",
    pt: "Casos de Sucesso",
  },
  testimonialsTitle1: {
    es: "Confianza de los",
    en: "Trusted by the",
    fr: "Confiance des",
    de: "Vertrauen der",
    pt: "Confiança dos",
  },
  testimonialsTitle2: {
    es: "Mejores Profesionales",
    en: "Best Professionals",
    fr: "Meilleurs Professionnels",
    de: "Besten Fachleute",
    pt: "Melhores Profissionais",
  },

  // CTA Section
  ctaBadge: {
    es: "Implementación Inmediata",
    en: "Immediate Implementation",
    fr: "Mise en Œuvre Immédiate",
    de: "Sofortige Implementierung",
    pt: "Implementação Imediata",
  },
  ctaTitle1: {
    es: "Eleve su Centro Médico",
    en: "Elevate Your Medical Center",
    fr: "Élevez Votre Centre Médical",
    de: "Erhöhen Sie Ihr Medizinisches Zentrum",
    pt: "Eleve Seu Centro Médico",
  },
  ctaTitle2: {
    es: "al Siguiente Nivel",
    en: "to the Next Level",
    fr: "au Niveau Supérieur",
    de: "auf die Nächste Ebene",
    pt: "ao Próximo Nível",
  },
  ctaDescription: {
    es: "Únase a más de 25,000 profesionales de la salud que confían en AnyssaMed para optimizar sus operaciones y mejorar la experiencia del paciente",
    en: "Join over 25,000 healthcare professionals who trust AnyssaMed to optimize their operations and improve patient experience",
    fr: "Rejoignez plus de 25 000 professionnels de santé qui font confiance à AnyssaMed pour optimiser leurs opérations et améliorer l'expérience patient",
    de: "Schließen Sie sich über 25.000 Gesundheitsfachkräften an, die AnyssaMed vertrauen, um ihre Abläufe zu optimieren und die Patientenerfahrung zu verbessern",
    pt: "Junte-se a mais de 25.000 profissionais de saúde que confiam na AnyssaMed para otimizar suas operações e melhorar a experiência do paciente",
  },
  ctaButton1: {
    es: "Agendar Consultoría Gratuita",
    en: "Schedule Free Consultation",
    fr: "Planifier Consultation Gratuite",
    de: "Kostenlose Beratung vereinbaren",
    pt: "Agendar Consulta Gratuita",
  },
  ctaButton2: {
    es: "Hablar con Especialista",
    en: "Talk to Specialist",
    fr: "Parler à un Spécialiste",
    de: "Mit Spezialist sprechen",
    pt: "Falar com Especialista",
  },

  // Footer
  footerDescription: {
    es: "Plataforma líder en gestión médica integral. Transformando la atención en salud con tecnología de vanguardia y estándares de clase mundial.",
    en: "Leading platform in comprehensive medical management. Transforming healthcare with cutting-edge technology and world-class standards.",
    fr: "Plateforme leader en gestion médicale complète. Transformer les soins de santé avec une technologie de pointe et des normes de classe mondiale.",
    de: "Führende Plattform im umfassenden Medizinmanagement. Transformation des Gesundheitswesens mit modernster Technologie und weltklasse Standards.",
    pt: "Plataforma líder em gestão médica abrangente. Transformando a assistência médica com tecnologia de ponta e padrões de classe mundial.",
  },
  footerProduct: {
    es: "Producto",
    en: "Product",
    fr: "Produit",
    de: "Produkt",
    pt: "Produto",
  },
  footerSolutions: {
    es: "Soluciones",
    en: "Solutions",
    fr: "Solutions",
    de: "Lösungen",
    pt: "Soluções",
  },
  footerResources: {
    es: "Recursos",
    en: "Resources",
    fr: "Ressources",
    de: "Ressourcen",
    pt: "Recursos",
  },
  footerCopyright: {
    es: "AnyssaMed. Todos los derechos reservados.",
    en: "AnyssaMed. All rights reserved.",
    fr: "AnyssaMed. Tous droits réservés.",
    de: "AnyssaMed. Alle Rechte vorbehalten.",
    pt: "AnyssaMed. Todos os direitos reservados.",
  },

  // Contact Modal
  contactTitle: {
    es: "Contáctenos",
    en: "Contact Us",
    fr: "Contactez-nous",
    de: "Kontaktieren Sie uns",
    pt: "Contate-nos",
  },
  contactName: {
    es: "Nombre Completo",
    en: "Full Name",
    fr: "Nom Complet",
    de: "Vollständiger Name",
    pt: "Nome Completo",
  },
  contactEmail: {
    es: "Correo Electrónico",
    en: "Email Address",
    fr: "Adresse Email",
    de: "E-Mail-Adresse",
    pt: "Endereço de Email",
  },
  contactPhone: {
    es: "Teléfono",
    en: "Phone",
    fr: "Téléphone",
    de: "Telefon",
    pt: "Telefone",
  },
  contactMessage: {
    es: "Mensaje",
    en: "Message",
    fr: "Message",
    de: "Nachricht",
    pt: "Mensagem",
  },
  contactSend: {
    es: "Enviar Mensaje",
    en: "Send Message",
    fr: "Envoyer le Message",
    de: "Nachricht senden",
    pt: "Enviar Mensagem",
  },
  contactSuccess: {
    es: "¡Mensaje enviado con éxito! Nos pondremos en contacto pronto.",
    en: "Message sent successfully! We'll contact you soon.",
    fr: "Message envoyé avec succès! Nous vous contacterons bientôt.",
    de: "Nachricht erfolgreich gesendet! Wir werden uns bald mit Ihnen in Verbindung setzen.",
    pt: "Mensagem enviada com sucesso! Entraremos em contato em breve.",
  },

  // Misc
  learnMore: {
    es: "Conocer más",
    en: "Learn more",
    fr: "En savoir plus",
    de: "Mehr erfahren",
    pt: "Saiba mais",
  },

  noCommitment: {
    es: "Sin compromiso",
    en: "No commitment",
    fr: "Sans engagement",
    de: "Keine Verpflichtung",
    pt: "Sem compromisso",
  },
  setup24h: {
    es: "Configuración en 24hrs",
    en: "Setup in 24hrs",
    fr: "Configuration en 24h",
    de: "Einrichtung in 24 Std",
    pt: "Configuração em 24h",
  },
  dedicatedSupport: {
    es: "Soporte dedicado",
    en: "Dedicated support",
    fr: "Support dédié",
    de: "Dedizierter Support",
    pt: "Suporte dedicado",
  },
};

// Hook para traducciones
const useTranslation = (lang: Language) => {
  const t = useCallback(
    (key: string): string => {
      return translations[key]?.[lang] || key;
    },
    [lang]
  );

  return { t };
};

// ==================== TIPOS Y INTERFACES ====================
interface Feature {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  titleKey: string;
  description: string;
  descKey: string;
  details: string[];
  color: string;
  gradient: string;
  href: string;
}

interface Plan {
  name: string;
  nameKey: string;
  subtitle: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  popular: boolean;
  cta: string;
  ctaKey: string;
  href: string;
}

interface Testimonial {
  name: string;
  role: string;
  institution: string;
  content: string;
  avatar: string;
  rating: number;
  stats: Record<string, string>;
}

interface Stat {
  number: string;
  label: string;
  labelKey: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface Certification {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

// ==================== COMPONENTE PRINCIPAL ====================
const AnyssaMedUltraPremium: React.FC = () => {
  // Estados principales
  const [language, setLanguage] = useState<Language>("es");
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [activeFeature, setActiveFeature] = useState<number | null>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({ show: false, message: "", type: "success" });

  // FAQ
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  // Estados del formulario
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [formLoading, setFormLoading] = useState(false);

  const { t } = useTranslation(language);

  // ==================== DATOS ====================
  const features: Feature[] = useMemo(
    () => [
      {
        icon: Calendar,
        title: t("featureScheduling"),
        titleKey: "featureScheduling",
        description: t("featureSchedulingDesc"),
        descKey: "featureSchedulingDesc",
        details: [
          "Calendario inteligente",
          "Confirmación automática",
          "Lista de espera",
          "Análisis de ocupación",
        ],
        color: "from-blue-600 to-blue-800",
        gradient: "from-blue-50 to-blue-100",
        href: "/soluciones/agenda",
      },
      {
        icon: FileText,
        title: t("featureEhr"),
        titleKey: "featureEhr",
        description: t("featureEhrDesc"),
        descKey: "featureEhrDesc",
        details: [
          "Firma electrónica avanzada",
          "Historial unificado",
          "Recetas digitales",
          "Cumplimiento normativo",
        ],
        color: "from-indigo-600 to-indigo-800",
        gradient: "from-indigo-50 to-indigo-100",
        href: "/soluciones/expediente",
      },
      {
        icon: Users,
        title: t("featureTelemedicine"),
        titleKey: "featureTelemedicine",
        description: t("featureTelemedicineDesc"),
        descKey: "featureTelemedicineDesc",
        details: [
          "Video HD seguro",
          "Diagnóstico remoto",
          "Prescripción digital",
          "Seguimiento post-consulta",
        ],
        color: "from-cyan-600 to-cyan-800",
        gradient: "from-cyan-50 to-cyan-100",
        href: "/soluciones/telemedicina",
      },
      {
        icon: Brain,
        title: t("featureAI"),
        titleKey: "featureAI",
        description: t("featureAIDesc"),
        descKey: "featureAIDesc",
        details: [
          "Alertas clínicas",
          "Análisis predictivo",
          "Interacciones medicamentosas",
          "Protocolos actualizados",
        ],
        color: "from-purple-600 to-purple-800",
        gradient: "from-purple-50 to-purple-100",
        href: "/soluciones/ia",
      },
      {
        icon: BarChart3,
        title: t("featureAnalytics"),
        titleKey: "featureAnalytics",
        description: t("featureAnalyticsDesc"),
        descKey: "featureAnalyticsDesc",
        details: [
          "Métricas en tiempo real",
          "Reportes personalizados",
          "Análisis financiero",
          "Proyecciones inteligentes",
        ],
        color: "from-emerald-600 to-emerald-800",
        gradient: "from-emerald-50 to-emerald-100",
        href: "/soluciones/analitica",
      },
      {
        icon: Shield,
        title: t("featureSecurity"),
        titleKey: "featureSecurity",
        description: t("featureSecurityDesc"),
        descKey: "featureSecurityDesc",
        details: [
          "Cifrado AES-256",
          "Autenticación 2FA",
          "Backups automáticos",
          "Cumplimiento ISO 27001",
        ],
        color: "from-rose-600 to-rose-800",
        gradient: "from-rose-50 to-rose-100",
        href: "/caracteristicas/seguridad",
      },
    ],
    [t]
  );

  const plans: Plan[] = useMemo(
    () => [
      {
        name: t("planProfessional"),
        nameKey: "planProfessional",
        subtitle: "Para consultas independientes",
        price: "69.990",
        period: t("perMonth"),
        description:
          "Solución completa para médicos independientes y consultas privadas",
        features: [
          "1 Profesional médico",
          "Hasta 100 pacientes activos",
          "Agenda médica profesional",
          "Ficha clínica electrónica",
          "Firma digital básica",
          "10 GB almacenamiento seguro",
          "Soporte técnico email",
          "Actualizaciones incluidas",
        ],
        popular: false,
        cta: t("startTrial"),
        ctaKey: "startTrial",
        href: "#contacto",
      },
      {
        name: t("planClinic"),
        nameKey: "planClinic",
        subtitle: "Para centros médicos",
        price: "249.990",
        period: t("perMonth"),
        description: "Plataforma integral para centros médicos en crecimiento",
        features: [
          "Hasta 10 profesionales",
          "Pacientes ilimitados",
          "Telemedicina HD incluida",
          "IA médica avanzada",
          "Integración FONASA/ISAPRE",
          "100 GB almacenamiento",
          "Reportería avanzada",
          "API de integración",
          "Soporte prioritario 24/7",
          "Capacitación online",
          "Actualizaciones premium",
        ],
        popular: true,
        cta: t("requestDemo"),
        ctaKey: "requestDemo",
        href: "#contacto",
      },
      {
        name: t("planEnterprise"),
        nameKey: "planEnterprise",
        subtitle: "Para grandes organizaciones",
        price: t("custom"),
        period: "",
        description:
          "Solución empresarial con personalización completa y soporte dedicado",
        features: [
          "Usuarios ilimitados",
          "Multi-centro / Multi-sede",
          "IA médica personalizada",
          "Integración IoT médico",
          "Analítica predictiva avanzada",
          "Almacenamiento ilimitado",
          "API personalizada completa",
          "Gerente de cuenta dedicado",
          "Implementación on-site",
          "Capacitación presencial",
          "SLA 99.99% garantizado",
          "Personalización completa",
        ],
        popular: false,
        cta: t("contactSales"),
        ctaKey: "contactSales",
        href: "#contacto",
      },
    ],
    [t]
  );

  const testimonials: Testimonial[] = [
    {
      name: "Dr. Carlos Mendoza Soto",
      role: "Director Médico",
      institution: "Clínica Santa María",
      content:
        "AnyssaMed ha revolucionado completamente nuestra gestión operativa. La eficiencia aumentó un 45% y la satisfacción de nuestros pacientes alcanzó niveles históricos. Una inversión que se paga sola.",
      avatar: "CM",
      rating: 5,
      stats: { efficiency: "+45%", satisfaction: "98%" },
    },
    {
      name: "Dra. Patricia González Ruiz",
      role: "Medicina Familiar",
      institution: "Centro Médico Integral",
      content:
        "La plataforma de telemedicina nos permitió expandir nuestro alcance durante momentos críticos. La calidad del sistema y el soporte técnico son excepcionales. Altamente recomendado.",
      avatar: "PG",
      rating: 5,
      stats: { reach: "+200%", quality: "5/5" },
    },
    {
      name: "Dr. Roberto Silva Campos",
      role: "Gerente General",
      institution: "Red de Salud Austral",
      content:
        "Implementamos AnyssaMed en 15 centros simultáneamente. La integración fue perfecta y ahora tenemos visibilidad total en tiempo real. El ROI superó nuestras expectativas.",
      avatar: "RS",
      rating: 5,
      stats: { centers: "15", roi: "+180%" },
    },
  ];

  const stats: Stat[] = useMemo(
    () => [
      {
        number: "25,000+",
        label: t("statProfessionals"),
        labelKey: "statProfessionals",
        icon: Users,
      },
      {
        number: "800,000+",
        label: t("statPatients"),
        labelKey: "statPatients",
        icon: HeartPulse,
      },
      {
        number: "99.95%",
        label: t("statUptime"),
        labelKey: "statUptime",
        icon: Activity,
      },
      {
        number: "24/7",
        label: t("statSupport"),
        labelKey: "statSupport",
        icon: Clock,
      },
    ],
    [t]
  );

  const certifications: Certification[] = [
    { name: "ISO 27001", icon: Shield },
    { name: "GDPR Compliant", icon: Lock },
    { name: "HIPAA Certified", icon: CheckCircle2 },
    { name: "SOC 2 Type II", icon: Award },
  ];

  const navItems = useMemo(
    () => [
      { label: t("navFeatures"), href: "#características" },
      { label: t("navSolutions"), href: "#soluciones" },
      { label: t("navPricing"), href: "#precios" },
      { label: t("navTestimonials"), href: "#testimonios" },
      { label: t("navContact"), href: "#contacto" },
    ],
    [t]
  );

  const faqs = useMemo(
    () => [
      {
        question: "¿Cuánto tarda la implementación de AnyssaMed en mi centro?",
        answer:
          "Dependiendo del tamaño del centro y la complejidad de la migración, usualmente entre 1 y 3 semanas. Para consultas independientes, podemos dejar todo operativo en menos de 48 horas.",
      },
      {
        question: "¿Pueden migrar mis datos desde otro sistema?",
        answer:
          "Sí. Contamos con un equipo especializado en migraciones desde sistemas previos (agenda, fichas, pacientes, prestaciones). Analizamos tu caso y definimos un plan de migración seguro y validado.",
      },
      {
        question:
          "¿Dónde se almacenan los datos y qué nivel de seguridad ofrecen?",
        answer:
          "Utilizamos infraestructura en la nube con estándares internacionales (ISO 27001, cifrado en tránsito y en reposo, backups automáticos y auditoría completa de accesos).",
      },
      {
        question:
          "¿Cómo apoyan al equipo médico y a las secretarias en el uso diario?",
        answer:
          "Incluimos capacitación inicial, materiales de entrenamiento, soporte 24/7 y sesiones de acompañamiento según el plan contratado. El objetivo es que el equipo adopte la plataforma de forma simple y sin fricciones.",
      },
    ],
    []
  );

  // ==================== EFECTOS ====================

  // Scroll tracking
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Visibility animation
  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Testimonials autoplay
  useEffect(() => {
    if (testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // ==================== THEME (CORREGIDO) ====================
  // Cargar tema desde localStorage SIN parpadeos y sin sobrescribir
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "light" | "dark" | null;

    const finalTheme = saved
      ? saved
      : window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

    setTheme(finalTheme);

    if (finalTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  // Guardar cambios de tema
  useEffect(() => {
    if (!theme) return;

    localStorage.setItem("theme", theme);

    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Cargar idioma desde localStorage
  useEffect(() => {
    const savedLang = localStorage.getItem("language") as Language | null;
    const allowed: Language[] = ["es", "en", "fr", "de", "pt"];

    if (savedLang && allowed.includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  // ==================== OTROS EFECTOS ====================

  // Cerrar mobile menu al cambiar tamaño
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setMobileMenuOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // ==================== HANDLERS ====================
  const showNotification = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setNotification({ show: true, message, type });
      setTimeout(() => {
        setNotification({ show: false, message: "", type: "success" });
      }, 3000);
    },
    []
  );

  const handleLanguageChange = useCallback(
    (lang: Language) => {
      setLanguage(lang);
      localStorage.setItem("language", lang);

      const messages = {
        es: "Idioma cambiado a Español",
        en: "Language changed to English",
        fr: "Langue changée en Français",
        de: "Sprache geändert auf Deutsch",
        pt: "Idioma alterado para Português",
      };
      showNotification(messages[lang], "success");
    },
    [showNotification]
  );

  const handleThemeToggle = useCallback(() => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  }, []);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    // Simulación de envío (aquí conectarías con tu API)
    setTimeout(() => {
      setFormLoading(false);
      showNotification(t("contactSuccess"), "success");
      setContactModalOpen(false);
      setFormData({ name: "", email: "", phone: "", message: "" });
    }, 1500);
  };

  const smoothScroll = useCallback((targetId: string) => {
    const element = document.querySelector(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
      setMobileMenuOpen(false);
    }
  }, []);

  // ==================== COMPONENTES AUXILIARES ====================
  // Partículas animadas de fondo
  const AnimatedBackground = React.memo(() => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute w-96 h-96 -top-48 -left-48 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute w-96 h-96 -bottom-48 -right-48 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse delay-1000" />
      <div className="absolute w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse delay-2000" />
    </div>
  ));
  AnimatedBackground.displayName = "AnimatedBackground";

  // Selector de idioma mejorado
  const LanguageSelector = React.memo(() => {
    const [open, setOpen] = useState(false);

    const languages = [
      { code: "es" as Language, name: "Español", flag: "🇪🇸" },
      { code: "en" as Language, name: "English", flag: "🇺🇸" },
      { code: "fr" as Language, name: "Français", flag: "🇫🇷" },
      { code: "de" as Language, name: "Deutsch", flag: "🇩🇪" },
      { code: "pt" as Language, name: "Português", flag: "🇵🇹" },
    ];

    const currentLang = languages.find((l) => l.code === language);

    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center space-x-2 px-3 sm:px-4 py-2.5 bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg border border-white/20 dark:border-gray-700 rounded-xl hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300 group"
          aria-label="Seleccionar idioma"
          aria-expanded={open}
        >
          <Globe className="w-4 h-4 text-gray-700 dark:text-gray-300 group-hover:rotate-12 transition-transform" />
          <span className="hidden sm:inline text-sm font-semibold text-gray-900 dark:text-white">
            {currentLang?.flag} {currentLang?.name}
          </span>
          <span className="sm:hidden text-lg">{currentLang?.flag}</span>
          <ChevronDown
            className={`w-4 h-4 text-gray-700 dark:text-gray-300 transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>

        {open && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setOpen(false)}
              aria-hidden="true"
            />
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 animate-fadeIn">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    handleLanguageChange(lang.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center space-x-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                    language === lang.code
                      ? "bg-blue-50 dark:bg-blue-900/20"
                      : ""
                  }`}
                >
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="flex-1 text-left font-medium text-gray-900 dark:text-white">
                    {lang.name}
                  </span>
                  {language === lang.code && (
                    <Check className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  });
  LanguageSelector.displayName = "LanguageSelector";

  // Modal de contacto
  const ContactModal = React.memo(() => {
    if (!contactModalOpen) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setContactModalOpen(false)}
          aria-hidden="true"
        />
        <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
          <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 sm:px-8 py-6 flex items-center justify-between rounded-t-3xl z-10">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  {t("contactTitle")}
                </h3>
                <p className="text-blue-100 text-xs sm:text-sm">
                  Responderemos en menos de 24 horas
                </p>
              </div>
            </div>
            <button
              onClick={() => setContactModalOpen(false)}
              className="w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Cerrar modal"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <form onSubmit={handleFormSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t("contactName")}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white"
                  placeholder="Juan Pérez"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {t("contactEmail")}
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white"
                  placeholder="juan@ejemplo.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t("contactPhone")}
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-gray-900 dark:text-white"
                placeholder="+56 9 1234 5678"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                {t("contactMessage")}
              </label>
              <textarea
                required
                value={formData.message}
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows={6}
                className="w-full px-4 py-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none text-gray-900 dark:text-white"
                placeholder="Cuéntanos sobre tu proyecto..."
              />
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-xl font-bold text-lg hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {formLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{t("contactSend")}</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  });
  ContactModal.displayName = "ContactModal";

  // Notificación toast
  const Notification = React.memo(() => {
    if (!notification.show) return null;

    return (
      <div className="fixed top-20 sm:top-24 right-4 z-50 animate-slideInRight max-w-[calc(100vw-2rem)]">
        <div
          className={`flex items-center space-x-3 px-4 sm:px-6 py-3 sm:py-4 rounded-2xl shadow-2xl backdrop-blur-lg border ${
            notification.type === "success"
              ? "bg-green-500/90 border-green-400"
              : "bg-red-500/90 border-red-400"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
          ) : (
            <X className="w-5 h-5 sm:w-6 sm:h-6 text-white flex-shrink-0" />
          )}
          <span className="text-white font-semibold text-sm sm:text-base">
            {notification.message}
          </span>
        </div>
      </div>
    );
  });
  Notification.displayName = "Notification";

  // ==================== RENDER PRINCIPAL ====================
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        theme === "dark" ? "dark bg-gray-900" : "bg-white"
      }`}
    >
      {/* Notificación */}
      <Notification />

      {/* Modal de contacto */}
      <ContactModal />

     {/* Header/Navbar ULTRA PREMIUM - 100% RESPONSIVE */}
<header
  className={`
    fixed top-0 left-0 right-0 z-40
    transition-all duration-500
    ${scrollY > 50
      ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-2xl shadow-xl border-b border-gray-200/50 dark:border-gray-800/50"
      : "bg-transparent"
    }
    ${scrollY > 120
      ? "-translate-y-full opacity-0 pointer-events-none"
      : "translate-y-0 opacity-100"
    }
  `}
>
  <nav className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
    <div className="flex items-center justify-between gap-2 sm:gap-4">
      {/* Logo */}
      <a
        href="#"
        className="flex items-center space-x-2 sm:space-x-3 group flex-shrink-0"
        onClick={(e) => {
          e.preventDefault();
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
          <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
            <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
        </div>
        <div className="flex flex-col">
          <span className="text-base sm:text-xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
            AnyssaMed
          </span>
          <span className="hidden xs:block text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 tracking-wider uppercase font-semibold">
            Medical Excellence
          </span>
        </div>
      </a>

      {/* Desktop Navigation */}
      <div className="hidden lg:flex items-center space-x-1">
        {navItems.map((item, idx) => (
          <a
            key={idx}
            href={item.href}
            onClick={(e) => {
              e.preventDefault();
              smoothScroll(item.href);
            }}
            className="px-4 xl:px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 relative group text-sm xl:text-base"
          >
            {item.label}
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-cyan-600 group-hover:w-full transition-all duration-300" />
          </a>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <LanguageSelector />

        <button
          onClick={handleThemeToggle}
          className="w-10 h-10 sm:w-11 sm:h-11 bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg border border-white/20 dark:border-gray-700 rounded-xl hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center group flex-shrink-0"
          aria-label="Cambiar tema"
        >
          {theme === "light" ? (
            <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700 dark:text-gray-300 group-hover:rotate-12 transition-transform" />
          ) : (
            <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:rotate-45 transition-transform" />
          )}
        </button>

        {/* Botón INGRESAR */}
        <button
          onClick={() => (window.location.href = "/login")}
          className="hidden md:flex items-center space-x-2 px-4 lg:px-5 py-2.5 
            bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 
            border border-blue-200 dark:border-blue-700 
            rounded-xl font-bold hover:shadow-lg hover:bg-blue-50 dark:hover:bg-gray-700 
            transform hover:-translate-y-1 transition-all duration-300 text-sm lg:text-base"
        >
          <LogIn className="w-4 h-4" />
          <span>{t("navLogin")}</span>
        </button>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden w-10 h-10 sm:w-11 sm:h-11 bg-white/10 dark:bg-gray-800/50 backdrop-blur-lg border border-white/20 dark:border-gray-700 rounded-xl hover:bg-white/20 dark:hover:bg-gray-700/50 transition-all duration-300 flex items-center justify-center flex-shrink-0"
          aria-label="Abrir menú"
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          ) : (
            <Menu className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          )}
        </button>
      </div>
    </div>

    {/* Mobile Menu */}
    {mobileMenuOpen && (
      <div className="lg:hidden mt-4 pb-4 animate-fadeIn">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-2xl rounded-2xl border border-gray-200 dark:border-gray-700 p-4 space-y-2 shadow-2xl">
          {navItems.map((item, idx) => (
            <a
              key={idx}
              href={item.href}
              onClick={(e) => {
                e.preventDefault();
                smoothScroll(item.href);
              }}
              className="block px-5 py-3 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-semibold rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
            >
              {item.label}
            </a>
          ))}

          <button
            onClick={() => {
              window.location.href = "/login";
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center justify-center space-x-2 px-5 py-3 
              bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 
              rounded-xl font-bold border border-blue-200 dark:border-blue-700 
              hover:bg-blue-50 dark:hover:bg-gray-600 transition-all duration-300"
          >
            <LogIn className="w-4 h-4" />
            <span>{t("navLogin")}</span>
          </button>
        </div>
      </div>
    )}
  </nav>
</header>

      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 md:pt-32 pb-12 sm:pb-16 md:pb-20 px-4 overflow-hidden">
        <AnimatedBackground />

        <div
          className="absolute inset-0 opacity-30 dark:opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, rgb(59 130 246 / 0.15) 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="max-w-7xl mx-auto relative">
          <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div
              className={`space-y-6 sm:space-y-8 transform transition-all duration-1000 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/10 to-cyan-600/10 dark:from-blue-400/20 dark:to-cyan-400/20 border border-blue-600/20 dark:border-blue-400/30 text-blue-700 dark:text-blue-300 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold backdrop-blur-sm animate-pulse">
                <Award className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="leading-tight">{t("heroBadge")}</span>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight text-gray-900 dark:text-white">
                  {t("heroTitle1")}
                  <span className="block bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600 dark:from-blue-400 dark:via-cyan-400 dark:to-blue-400 bg-clip-text text-transparent mt-2 animate-gradient bg-[length:200%_auto]">
                    {t("heroTitle2")}
                  </span>
                </h1>
                <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 leading-relaxed max-w-2xl">
                  {t("heroDescription")}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <button
                  onClick={() => setContactModalOpen(true)}
                  className="group px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center space-x-2 text-base sm:text-lg font-semibold"
                >
                  <span>{t("heroCtaDemo")}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => smoothScroll("#testimonios")}
                  className="px-6 sm:px-8 py-3 sm:py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:border-blue-600 dark:hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 text-base sm:text-lg font-semibold backdrop-blur-sm"
                >
                  {t("heroCtaCases")}
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-4 xs:gap-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex -space-x-2 sm:-space-x-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 border-2 sm:border-4 border-white dark:border-gray-900 flex items-center justify-center text-white font-bold shadow-lg hover:scale-110 transition-transform cursor-pointer"
                      style={{
                        transform: `translateX(${i * 2}px)`,
                      }}
                    >
                      <Users className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex text-yellow-400 mb-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 sm:w-5 sm:h-5 fill-current animate-pulse"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <span className="font-bold text-gray-900 dark:text-white">
                      4.9/5
                    </span>{" "}
                    {t("heroTrustRating")}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Preview Card */}
            <div
              className={`relative transform transition-all duration-1000 delay-300 ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 rounded-2xl sm:rounded-3xl blur-3xl opacity-20 dark:opacity-30 animate-pulse" />
              <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-4 sm:p-6 md:p-8 space-y-4 sm:space-y-6 hover:shadow-3xl transition-all duration-500 hover:scale-105">
                {/* Top Card */}
                <div className="flex items-center justify-between p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-xl sm:rounded-2xl border border-blue-100 dark:border-blue-800 backdrop-blur-sm hover:scale-105 transition-transform duration-300">
                  <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl blur-md opacity-50" />
                      <div className="relative w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                        <ClipboardCheck className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                        Próxima Consulta
                      </p>
                      <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg truncate">
                        Dr. Juan Pérez
                      </p>
                    </div>
                  </div>
                  <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg sm:rounded-xl text-xs sm:text-sm font-semibold shadow-lg animate-pulse flex-shrink-0">
                    Confirmado
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                  <div className="group p-4 sm:p-5 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl sm:rounded-2xl border border-blue-200 dark:border-blue-700 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer">
                    <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      2,847
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Pacientes Activos
                    </p>
                  </div>
                  <div className="group p-4 sm:p-5 bg-gradient-to-br from-cyan-50 to-cyan-100 dark:from-cyan-900/20 dark:to-cyan-800/20 rounded-xl sm:rounded-2xl border border-cyan-200 dark:border-cyan-700 backdrop-blur-sm hover:scale-105 transition-all duration-300 cursor-pointer">
                    <Activity className="w-6 h-6 sm:w-8 sm:h-8 text-cyan-600 dark:text-cyan-400 mb-2 sm:mb-3 group-hover:scale-110 transition-transform" />
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                      99.2%
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
                      Satisfacción
                    </p>
                  </div>
                </div>

                {/* Feature List */}
                <div className="space-y-2 sm:space-y-3 p-4 sm:p-6 bg-gray-50 dark:bg-gray-900/50 rounded-xl sm:rounded-2xl backdrop-blur-sm">
                  {[
                    { icon: Calendar, text: "Agenda sincronizada" },
                    { icon: FileText, text: "Expedientes digitales" },
                    { icon: Shield, text: "Seguridad certificada" },
                  ].map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center space-x-2 sm:space-x-3 group cursor-pointer hover:translate-x-2 transition-transform duration-300"
                    >
                      <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white dark:bg-gray-800 rounded-lg sm:rounded-xl flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-110 transition-all flex-shrink-0">
                        <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium flex-1 min-w-0">
                        {item.text}
                      </span>
                      <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 ml-auto group-hover:scale-125 transition-transform flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 dark:from-blue-700 dark:via-blue-800 dark:to-cyan-700 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="text-center group transform hover:scale-110 transition-all duration-300 cursor-pointer"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-white/10 backdrop-blur-sm rounded-xl sm:rounded-2xl mb-3 sm:mb-4 group-hover:bg-white/20 group-hover:rotate-12 transition-all shadow-lg">
                  <stat.icon className="w-6 h-6 sm:w-8 sm:h-8 text-white group-hover:scale-125 transition-transform" />
                </div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-1 sm:mb-2 group-hover:scale-110 transition-transform">
                  {stat.number}
                </div>
                <div className="text-xs sm:text-sm md:text-base text-blue-100 font-medium px-2">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="características"
        className="py-16 sm:py-20 md:py-24 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden"
      >
        <AnimatedBackground />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 backdrop-blur-sm border border-blue-100 dark:border-blue-800">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
              <span>{t("featuresBadge")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white px-4">
              {t("featuresTitle1")}
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mt-2">
                {t("featuresTitle2")}
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
              {t("featuresDescription")}
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className={`group bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 transition-all duration-500 transform hover:-translate-y-2 hover:scale-105 cursor-pointer ${
                  activeFeature === idx
                    ? "ring-2 ring-blue-500 dark:ring-blue-400"
                    : ""
                }`}
                onMouseEnter={() => setActiveFeature(idx)}
                onFocus={() => setActiveFeature(idx)}
                tabIndex={0}
                role="article"
                aria-label={feature.title}
              >
                <div className="relative mb-4 sm:mb-6">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity`}
                  />
                  <div
                    className={`relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all`}
                  >
                    <feature.icon className="w-7 h-7 sm:w-8 sm:h-8 text-white group-hover:scale-125 transition-transform" />
                  </div>
                </div>

                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4 sm:mb-6">
                  {feature.description}
                </p>

                <div className="space-y-2 mb-4 sm:mb-6">
                  {feature.details.map((detail, dIdx) => (
                    <div
                      key={dIdx}
                      className="flex items-center space-x-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 group-hover:translate-x-1 transition-transform"
                      style={{ transitionDelay: `${dIdx * 50}ms` }}
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 group-hover:scale-150 transition-transform flex-shrink-0" />
                      <span>{detail}</span>
                    </div>
                  ))}
                </div>

                <a
                  href={feature.href}
                  className="inline-flex items-center space-x-2 text-sm sm:text-base text-blue-600 dark:text-blue-400 font-semibold group-hover:space-x-3 transition-all"
                >
                  <span>{t("learnMore")}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Soluciones Section */}
      <section
        id="soluciones"
        className="relative py-20 sm:py-24 md:py-32 px-4 overflow-hidden
          bg-gradient-to-b from-white via-gray-50 to-gray-100
          dark:from-gray-900 dark:via-gray-800 dark:to-gray-900"
      >
        <AnimatedBackground />

        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[700px]
          bg-gradient-to-br from-blue-500/20 to-cyan-500/20 blur-3xl rounded-full opacity-60
          animate-pulse"
        />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-16 sm:mb-20 md:mb-28 relative">
            <div
              className="inline-flex items-center gap-2 px-5 py-2.5
              bg-gradient-to-r from-blue-500/10 to-cyan-500/10
              border border-blue-500/20 dark:border-blue-400/30
              text-blue-600 dark:text-blue-300 rounded-full
              backdrop-blur-xl shadow-lg shadow-blue-500/10
              text-xs sm:text-sm font-semibold mb-6 animate-pulse"
            >
              <Layers className="w-4 h-4" />
              <span className="tracking-wide">{t("navSolutions")}</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold
              text-gray-900 dark:text-white leading-tight"
            >
              Soluciones Médicas
              <span
                className="block mt-2 bg-gradient-to-r from-blue-600 via-cyan-600 to-blue-600
                dark:from-blue-400 dark:via-cyan-400 dark:to-blue-400
                bg-clip-text text-transparent animate-gradient bg-[length:250%_auto]"
              >
                de Próxima Generación
              </span>
            </h2>

            <p className="max-w-3xl mx-auto text-gray-600 dark:text-gray-400 mt-6 text-lg sm:text-xl
              leading-relaxed px-4"
            >
              Cada módulo ha sido diseñado para optimizar el rendimiento clínico,
              mejorar la calidad de atención y consolidar tu operación con tecnología
              empresarial, segura y escalable.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 relative">
            {features.map((sol, idx) => (
              <div
                key={idx}
                className="group relative rounded-3xl overflow-hidden cursor-pointer
                  shadow-xl shadow-blue-500/10 border border-gray-200 dark:border-gray-700
                  bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl
                  transform transition-all duration-500 hover:-translate-y-3 
                  hover:shadow-2xl hover:shadow-blue-500/20"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${sol.color}
                    opacity-20 blur-2xl group-hover:opacity-40 transition-all duration-500`}
                />

                <div className="relative p-8">
                  <div className="mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${sol.color}
                        flex items-center justify-center shadow-xl
                        group-hover:scale-110 group-hover:rotate-6 
                        transition-all duration-500`}
                    >
                      <sol.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3
                    group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
                  >
                    {sol.title}
                  </h3>

                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {sol.description}
                  </p>

                  <div className="mt-6 space-y-2">
                    {sol.details.map((d, dIdx) => (
                      <div
                        key={dIdx}
                        className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm
                          group-hover:translate-x-1 transition-all duration-300"
                        style={{ transitionDelay: `${dIdx * 50}ms` }}
                      >
                        <div
                          className="w-2 h-2 bg-gradient-to-r from-blue-600 to-cyan-600
                          dark:from-blue-400 dark:to-cyan-400 rounded-full"
                        />
                        {d}
                      </div>
                    ))}
                  </div>

                  <div className="mt-8 inline-flex items-center gap-2 font-semibold
                    text-blue-600 dark:text-blue-400 group-hover:gap-3 transition-all"
                  >
                    {t("learnMore")}
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="precios"
        className="py-16 sm:py-20 md:py-24 px-4 bg-white dark:bg-gray-900 relative overflow-hidden"
      >
        <AnimatedBackground />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 backdrop-blur-sm border border-blue-100 dark:border-blue-800">
              <Award className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse" />
              <span>{t("pricingBadge")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white px-4">
              {t("pricingTitle1")}
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mt-2">
                {t("pricingTitle2")}
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto px-4">
              {t("pricingDescription")}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {plans.map((plan, idx) => (
              <div
                key={idx}
                className={`relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-2xl ${
                  plan.popular
                    ? "ring-2 sm:ring-4 ring-blue-600 dark:ring-blue-400 shadow-2xl transform lg:scale-110 z-10"
                    : "shadow-lg border border-gray-200 dark:border-gray-700 hover:scale-105"
                }`}
              >
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white text-center py-2 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-wider animate-gradient bg-[length:200%_auto]">
                    {t("mostPopular")}
                  </div>
                )}

                <div className={`p-6 sm:p-8 ${plan.popular ? "pt-12 sm:pt-16" : ""}`}>
                  <div className="mb-6 sm:mb-8">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium mb-4 sm:mb-6">
                      {plan.subtitle}
                    </p>

                    <div className="flex items-end mb-3 sm:mb-4">
                      {plan.price === t("custom") ? (
                        <span className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
                          {plan.price}
                        </span>
                      ) : (
                        <>
                          <span className="text-xl sm:text-2xl text-gray-600 dark:text-gray-400 font-semibold">
                            $
                          </span>
                          <span className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
                            {plan.price}
                          </span>
                          <span className="text-sm sm:text-base text-gray-600 dark:text-gray-400 ml-2">
                            {plan.period}
                          </span>
                        </>
                      )}
                    </div>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
                      {plan.description}
                    </p>
                  </div>

                  <button
                    onClick={() => setContactModalOpen(true)}
                    className={`block text-center w-full py-3 sm:py-4 rounded-xl font-bold transition-all duration-300 mb-6 sm:mb-8 text-sm sm:text-base ${
                      plan.popular
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transform hover:-translate-y-1"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {plan.cta}
                  </button>

                  <div className="space-y-3 sm:space-y-4">
                    <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-3 sm:mb-4">
                      {t("includedFeatures")}
                    </p>
                    {plan.features.map((feature, fIdx) => (
                      <div
                        key={fIdx}
                        className="flex items-start space-x-2 sm:space-x-3 group hover:translate-x-1 transition-transform"
                      >
                        <div
                          className={`w-5 h-5 sm:w-6 sm:h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                            plan.popular
                              ? "bg-gradient-to-br from-blue-500 to-cyan-500 dark:from-blue-400 dark:to-cyan-400 group-hover:scale-110"
                              : "bg-gray-200 dark:bg-gray-700 group-hover:bg-blue-100 dark:group-hover:bg-blue-900"
                          }`}
                        >
                          <Check
                            className={`w-3 h-3 sm:w-4 sm:h-4 ${
                              plan.popular
                                ? "text-white"
                                : "text-gray-700 dark:text-gray-300"
                            }`}
                          />
                        </div>
                        <span className="text-xs sm:text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Certifications */}
          <div className="mt-12 sm:mt-16 md:mt-20 text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-semibold uppercase tracking-wider mb-6 sm:mb-8">
              Certificaciones y Cumplimiento
            </p>
            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {certifications.map((cert, idx) => (
                <div
                  key={idx}
                  className="flex items-center space-x-2 sm:space-x-3 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl sm:rounded-2xl hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group"
                >
                  <cert.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400 group-hover:scale-125 transition-transform" />
                  <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 dark:text-white">
                    {cert.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section
        id="testimonios"
        className="py-16 sm:py-20 md:py-24 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 relative overflow-hidden"
      >
        <AnimatedBackground />

        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12 sm:mb-16 md:mb-20">
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 backdrop-blur-sm border border-blue-100 dark:border-blue-800">
              <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-current animate-pulse" />
              <span>{t("testimonialsBadge")}</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 text-gray-900 dark:text-white px-4">
              {t("testimonialsTitle1")}
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mt-2">
                {t("testimonialsTitle2")}
              </span>
            </h2>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 p-6 sm:p-10 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 sm:w-96 h-64 sm:h-96 bg-gradient-to-br from-blue-100 to-cyan-100 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2" />

              <div className="relative">
                <div
                  className="flex text-yellow-400 mb-6 sm:mb-8"
                  aria-label={`${testimonials[activeTestimonial].rating} estrellas`}
                >
                  {[...Array(testimonials[activeTestimonial].rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 fill-current animate-pulse"
                        style={{ animationDelay: `${i * 100}ms` }}
                      />
                    )
                  )}
                </div>

                <blockquote className="text-lg sm:text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed mb-8 sm:mb-10 font-medium">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>

                <div className="flex gap-4 sm:gap-6 mb-8 sm:mb-10 flex-wrap">
                  {Object.entries(testimonials[activeTestimonial].stats).map(
                    ([key, value]) => (
                      <div
                        key={key}
                        className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border border-blue-100 dark:border-blue-800 rounded-lg sm:rounded-xl hover:scale-110 transition-transform cursor-pointer"
                      >
                        <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent">
                          {value}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 capitalize">
                          {key}
                        </div>
                      </div>
                    )
                  )}
                </div>

                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-3 sm:space-x-5">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center text-white font-bold text-base sm:text-lg md:text-xl shadow-lg hover:scale-110 transition-transform cursor-pointer flex-shrink-0">
                      {testimonials[activeTestimonial].avatar}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg truncate">
                        {testimonials[activeTestimonial].name}
                      </p>
                      <p className="text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-400 font-medium truncate">
                        {testimonials[activeTestimonial].role}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-500 truncate">
                        {testimonials[activeTestimonial].institution}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    {testimonials.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveTestimonial(idx)}
                        className={`transition-all duration-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:scale-125 ${
                          idx === activeTestimonial
                            ? "w-8 sm:w-10 md:w-12 h-2 sm:h-3 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400"
                            : "w-2 sm:w-3 h-2 sm:h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                        }`}
                        aria-label={`Ver testimonio ${idx + 1}`}
                        aria-current={idx === activeTestimonial}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="py-16 sm:py-20 md:py-24 px-4 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 relative overflow-hidden"
      >
        <AnimatedBackground />

        <div className="max-w-5xl mx-auto relative">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center space-x-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-4 sm:mb-6 backdrop-blur-sm border border-blue-100 dark:border-blue-800">
              <MessageSquare className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>Preguntas Frecuentes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Resolvemos tus dudas
              <span className="block bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-400 dark:to-cyan-400 bg-clip-text text-transparent mt-2">
                antes de tomar una decisión
              </span>
            </h2>
            <p className="mt-4 sm:mt-6 text-gray-600 dark:text-gray-400 text-sm sm:text-base max-w-2xl mx-auto">
              Si tienes necesidades específicas (integraciones, volumen de centros,
              requisitos de cumplimiento), conversemos y armamos un plan a medida.
            </p>
          </div>

          <div className="space-y-3 sm:space-y-4">
            {faqs.map((faq, idx) => {
              const open = openFaqIndex === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() =>
                    setOpenFaqIndex((prev) => (prev === idx ? null : idx))
                  }
                  className="w-full text-left bg-white/80 dark:bg-gray-800/80 backdrop-blur-2xl border border-gray-200 dark:border-gray-700 rounded-2xl sm:rounded-3xl px-4 sm:px-6 md:px-8 py-4 sm:py-5 md:py-6 shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-white text-sm sm:text-base md:text-lg">
                        {faq.question}
                      </span>
                    </div>
                    <div className="flex-shrink-0">
                      <ChevronDown
                        className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform ${
                          open ? "rotate-180" : ""
                        }`}
                      />
                    </div>
                  </div>

                  <div
                    className={`mt-3 sm:mt-4 text-xs sm:text-sm md:text-base text-gray-600 dark:text-gray-300 transition-all duration-300 ${
                      open
                        ? "max-h-40 sm:max-h-48 md:max-h-60 opacity-100"
                        : "max-h-0 opacity-0 overflow-hidden"
                    }`}
                  >
                    {faq.answer}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 sm:mt-10 text-center text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            ¿Tienes otra pregunta?{" "}
            <button
              type="button"
              onClick={() => setContactModalOpen(true)}
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Hablemos con un especialista
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        id="contacto"
        className="relative py-16 sm:py-20 md:py-24 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 dark:from-blue-700 dark:via-blue-800 dark:to-cyan-700" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="max-w-5xl mx-auto text-center relative">
          <div className="mb-6 sm:mb-8">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold mb-6 sm:mb-8 animate-pulse">
              <Globe className="w-3 h-3 sm:w-4 sm:h-4" />
              <span>{t("ctaBadge")}</span>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 sm:mb-8 leading-tight px-4">
            {t("ctaTitle1")}
            <span className="block mt-2">{t("ctaTitle2")}</span>
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4">
            {t("ctaDescription")}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center px-4">
            <button
              onClick={() => setContactModalOpen(true)}
              className="group px-8 sm:px-10 py-4 sm:py-5 bg-white text-blue-600 rounded-xl hover:bg-blue-50 shadow-2xl transform hover:-translate-y-1 transition-all duration-300 text-base sm:text-lg font-bold flex items-center justify-center space-x-2 sm:space-x-3"
            >
              <span className="leading-tight">{t("ctaButton1")}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform flex-shrink-0" />
            </button>
            <button
              onClick={() => setContactModalOpen(true)}
              className="px-8 sm:px-10 py-4 sm:py-5 border-2 border-white text-white rounded-xl hover:bg-white/10 backdrop-blur-sm transition-all duration-300 text-base sm:text-lg font-bold"
            >
              {t("ctaButton2")}
            </button>
          </div>

          <div className="mt-8 sm:mt-12 flex flex-col xs:flex-row items-center justify-center space-y-3 xs:space-y-0 xs:space-x-6 sm:space-x-8 text-white/80 px-4">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{t("noCommitment")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{t("setup24h")}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span className="text-xs sm:text-sm">{t("dedicatedSupport")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tech / Stack Section */}
      <section className="py-12 sm:py-16 px-4 bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
            <div>
              <p className="text-xs sm:text-sm font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                Para equipos de TI y CTOs
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Stack moderno, seguro y escalable
              </h2>
              <p className="mt-3 text-sm sm:text-base text-gray-600 dark:text-gray-400 max-w-xl">
                AnyssaMed está pensado para integrarse a tu ecosistema actual:
                APIs, webhooks, analítica, contabilidad y sistemas de terceros.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                API REST / GraphQL
              </span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300">
                Integraciones contables
              </span>
              <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300">
                Observabilidad & logs
              </span>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: Code,
                title: "API para desarrolladores",
                desc: "Acceso programático a agenda, fichas, billing y más.",
              },
              {
                icon: Database,
                title: "Modelo de datos robusto",
                desc: "Pensado para reporting, BI y data warehouses.",
              },
              {
                icon: Cloud,
                title: "Infraestructura cloud",
                desc: "Alta disponibilidad, backups y escalabilidad vertical/horizontal.",
              },
              {
                icon: GitBranch,
                title: "Integraciones continuas",
                desc: "Conecta con tus sistemas actuales sin frenar la operación.",
              },
              {
                icon: Smartphone,
                title: "Experiencia móvil",
                desc: "Médicos y directivos pueden revisar indicadores desde cualquier lugar.",
              },
              {
                icon: Cpu,
                title: "IA aplicada",
                desc: "Modelos entrenados para apoyar la gestión clínica y operativa.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 sm:p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-3 sm:mb-4">
                  <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 dark:from-black dark:via-gray-900 dark:to-black text-gray-300 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, white 1px, transparent 0)",
            backgroundSize: "40px 40px",
          }}
        />

        <div className="max-w-7xl mx-auto px-4 py-12 sm:py-16 relative">
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10 lg:gap-12 mb-12 sm:mb-16">
            <div className="lg:col-span-2">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6 group cursor-pointer">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-xl sm:rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <Stethoscope className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl font-bold text-white">
                    AnyssaMed
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-400 tracking-wider uppercase">
                    Medical Excellence
                  </span>
                </div>
              </div>

              <p className="text-sm sm:text-base text-gray-400 mb-6 sm:mb-8 leading-relaxed max-w-md">
                {t("footerDescription")}
              </p>

              <div className="space-y-3 sm:space-y-4">
                {[
                  { icon: Phone, text: "+56 2 2845 7890" },
                  { icon: Mail, text: "contacto@anyssamed.cl" },
                  {
                    icon: MapPin,
                    text: "Av. Apoquindo 4800, Las Condes, Santiago",
                  },
                ].map((item, idx) => (
                  <a
                    key={idx}
                    href="#"
                    className="flex items-center space-x-2 sm:space-x-3 text-sm sm:text-base text-gray-400 hover:text-blue-400 transition-colors group"
                  >
                    <item.icon className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-125 transition-transform flex-shrink-0" />
                    <span className="break-all">{item.text}</span>
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: t("footerProduct"),
                links: [
                  { label: t("navFeatures"), href: "#características" },
                  { label: t("navPricing"), href: "#precios" },
                  {
                    label: "Integraciones",
                    href: "/caracteristicas/integraciones",
                  },
                  { label: "Seguridad", href: "/caracteristicas/seguridad" },
                  {
                    label: "Actualizaciones",
                    href: "/recursos/blog",
                  },
                ],
              },
              {
                title: t("footerSolutions"),
                links: [
                  { label: "Agenda Médica", href: "/soluciones/agenda" },
                  {
                    label: "Expediente Digital",
                    href: "/soluciones/expediente",
                  },
                  { label: "Telemedicina", href: "/soluciones/telemedicina" },
                  { label: "Analítica BI", href: "/soluciones/analitica" },
                ],
              },
              {
                title: t("footerResources"),
                links: [
                  { label: "Documentación", href: "/recursos/documentacion" },
                  { label: "API", href: "/recursos/api" },
                  { label: "Blog", href: "/recursos/blog" },
                  { label: "Webinars", href: "/recursos/blog" },
                  { label: "Soporte", href: "/recursos/ayuda" },
                ],
              },
            ].map((column, idx) => (
              <div key={idx}>
                <h4 className="text-white font-bold mb-4 sm:mb-6 text-base sm:text-lg">
                  {column.title}
                </h4>
                <ul className="space-y-2 sm:space-y-3">
                  {column.links.map((link, lIdx) => (
                    <li key={lIdx}>
                      <a
                        href={link.href}
                        onClick={(e) => {
                          if (link.href.startsWith("#")) {
                            e.preventDefault();
                            smoothScroll(link.href);
                          }
                        }}
                        className="text-xs sm:text-sm text-gray-400 hover:text-blue-400 transition-colors group flex items-center space-x-2"
                      >
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -ml-3 group-hover:ml-0 transition-all" />
                        <span>{link.label}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 gap-4">
            <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-left">
              © {new Date().getFullYear()} {t("footerCopyright")}
            </p>

            <div className="flex items-center space-x-4 sm:space-x-6">
              {[
                { icon: Facebook, href: "#", label: "Facebook" },
                { icon: Twitter, href: "#", label: "Twitter" },
                { icon: Instagram, href: "#", label: "Instagram" },
                { icon: Linkedin, href: "#", label: "LinkedIn" },
              ].map((social, idx) => (
                <a
                  key={idx}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 sm:w-10 sm:h-10 bg-gray-800 rounded-xl flex items-center justify-center text-gray-400 hover:text-white hover:bg-gradient-to-br hover:from-blue-600 hover:to-cyan-600 transition-all transform hover:-translate-y-1 hover:scale-110"
                >
                  <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to top */}
      {scrollY > 500 && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="fixed bottom-6 right-6 sm:bottom-8 sm:right-8 z-40 w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-500 dark:to-cyan-500 text-white rounded-xl sm:rounded-2xl shadow-2xl hover:shadow-blue-500/50 flex items-center justify-center transform hover:scale-110 transition-all duration-300 animate-bounce"
          aria-label="Volver arriba"
        >
          <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 -rotate-90" />
        </button>
      )}

      {/* Estilos adicionales */}
      <style jsx>{`
        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes slideInRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }

        .animate-gradient {
          animation: gradient 8s ease infinite;
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-in-out;
        }

        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }

        .animate-slideInRight {
          animation: slideInRight 0.3s ease-out;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .delay-2000 {
          animation-delay: 2s;
        }

        @media (min-width: 475px) {
          .xs\\:block {
            display: block;
          }
          .xs\\:flex-row {
            flex-direction: row;
          }
          .xs\\:space-y-0 > :not([hidden]) ~ :not([hidden]) {
            --tw-space-y-reverse: 0;
            margin-top: calc(0px * calc(1 - var(--tw-space-y-reverse)));
            margin-bottom: calc(0px * var(--tw-space-y-reverse));
          }
          .xs\\:space-x-6 > :not([hidden]) ~ :not([hidden]) {
            --tw-space-x-reverse: 0;
            margin-right: calc(1.5rem * var(--tw-space-x-reverse));
            margin-left: calc(1.5rem * calc(1 - var(--tw-space-x-reverse)));
          }
          .xs\\:space-x-8 > :not([hidden]) ~ :not([hidden]) {
            --tw-space-x-reverse: 0;
            margin-right: calc(2rem * var(--tw-space-x-reverse));
            margin-left: calc(2rem * calc(1 - var(--tw-space-x-reverse)));
          }
          .xs\\:items-center {
            align-items: center;
          }
        }
      `}</style>
    </div>
  );
};

export default AnyssaMedUltraPremium;
