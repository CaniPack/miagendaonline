"use client";

import { useState, useEffect, useCallback } from 'react';

export interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  duration?: number;
  bufferTime?: number;
}

export interface LandingPageData {
  id?: string;
  professionalName: string;
  title: string;
  tagline: string;
  description: string;
  profileImage?: string;
  coverImage?: string;
  logo?: string;
  services: Service[];
  showCalendar: boolean;
  calendarDescription?: string;
  appointmentDuration: number;
  bufferTime: number;
  buttonText: string;
  requirePayment: boolean;
  formFields: FormField[];
  whatsapp?: string;
  instagram?: string;
  contactEmail?: string;
  colorScheme: string;
  slug: string;
  isPublished: boolean;
}

export interface ColorScheme {
  id: string;
  name: string;
  primary: string;
  secondary: string;
}

export const defaultFormFields: FormField[] = [
  { name: "name", label: "Nombre", type: "text", required: true },
  { name: "lastName", label: "Apellido", type: "text", required: true },
  { name: "email", label: "Correo", type: "email", required: true },
  { name: "comment", label: "Comentario", type: "textarea", required: false },
];

export const availableFields = [
  { name: "phone", label: "Teléfono", type: "tel" },
  { name: "age", label: "Edad", type: "number" },
  { name: "reason", label: "Motivo de consulta", type: "textarea" },
  { name: "previousExperience", label: "Experiencia previa", type: "textarea" },
  { name: "referral", label: "¿Cómo nos conociste?", type: "text" },
];

export const colorSchemes: ColorScheme[] = [
  {
    id: "blue",
    name: "Azul Profesional",
    primary: "#2563eb",
    secondary: "#dbeafe",
  },
  {
    id: "green",
    name: "Verde Natural",
    primary: "#16a34a",
    secondary: "#dcfce7",
  },
  {
    id: "purple",
    name: "Morado Elegante",
    primary: "#9333ea",
    secondary: "#f3e8ff",
  },
  {
    id: "rose",
    name: "Rosa Sofisticado",
    primary: "#e11d48",
    secondary: "#fce7f3",
  },
  {
    id: "orange",
    name: "Naranja Energético",
    primary: "#ea580c",
    secondary: "#fed7aa",
  },
  {
    id: "teal",
    name: "Verde Azulado",
    primary: "#0d9488",
    secondary: "#ccfbf1",
  },
];

const initialLandingPageData: LandingPageData = {
  professionalName: "",
  title: "",
  tagline: "",
  description: "",
  services: [],
  showCalendar: true,
  calendarDescription: "Agenda tu cita",
  appointmentDuration: 60,
  bufferTime: 15,
  buttonText: "Agendar Cita",
  requirePayment: false,
  formFields: [...defaultFormFields],
  colorScheme: "blue",
  slug: "",
  isPublished: false,
};

export const useLandingPage = () => {
  const [landingPageData, setLandingPageData] = useState<LandingPageData>(initialLandingPageData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Fetch landing page data
  const fetchLandingPage = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/landing-page');
      
      if (response.ok) {
        const data = await response.json();
        if (data.landingPage) {
          setLandingPageData({
            ...initialLandingPageData,
            ...data.landingPage,
            services: data.landingPage.services || [],
            formFields: data.landingPage.formFields || defaultFormFields,
          });
        } else if (data && !data.error) {
          // Handle direct landingPage response (fallback)
          setLandingPageData({
            ...initialLandingPageData,
            ...data,
            services: data.services || [],
            formFields: data.formFields || defaultFormFields,
          });
        }
      } else if (response.status !== 404) {
        throw new Error('Error al cargar la configuración');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Save landing page data
  const saveLandingPage = useCallback(async () => {
    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/landing-page', {
        method: landingPageData.id ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(landingPageData),
      });

      if (!response.ok) {
        throw new Error('Error al guardar la configuración');
      }

      const result = await response.json();
      
      setLandingPageData(prev => ({
        ...prev,
        id: result.landingPage.id,
        slug: result.landingPage.slug,
      }));

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al guardar';
      setError(errorMessage);
      throw err;
    } finally {
      setSaving(false);
    }
  }, [landingPageData]);

  // Update landing page data
  const updateLandingPageData = useCallback((updates: Partial<LandingPageData>) => {
    setLandingPageData(prev => ({ ...prev, ...updates }));
  }, []);

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    try {
      setUploadingImage(true);
      
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen');
      }

      const data = await response.json();
      return data.url;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al subir imagen';
      setError(errorMessage);
      throw err;
    } finally {
      setUploadingImage(false);
    }
  }, []);

  // Form field management
  const addFormField = useCallback((field: typeof availableFields[0]) => {
    const newField: FormField = {
      name: field.name,
      label: field.label,
      type: field.type,
      required: false,
    };

    setLandingPageData(prev => ({
      ...prev,
      formFields: [...prev.formFields, newField],
    }));
  }, []);

  const removeFormField = useCallback((index: number) => {
    setLandingPageData(prev => ({
      ...prev,
      formFields: prev.formFields.filter((_, i) => i !== index),
    }));
  }, []);

  const updateFormField = useCallback((index: number, updates: Partial<FormField>) => {
    setLandingPageData(prev => ({
      ...prev,
      formFields: prev.formFields.map((field, i) => 
        i === index ? { ...field, ...updates } : field
      ),
    }));
  }, []);

  // Service management
  const addService = useCallback(() => {
    const newService: Service = {
      id: Date.now().toString(),
      name: '',
      description: '',
      price: '',
      duration: landingPageData.appointmentDuration,
      bufferTime: landingPageData.bufferTime,
    };

    setLandingPageData(prev => ({
      ...prev,
      services: [...prev.services, newService],
    }));
  }, [landingPageData.appointmentDuration, landingPageData.bufferTime]);

  const removeService = useCallback((id: string) => {
    setLandingPageData(prev => ({
      ...prev,
      services: prev.services.filter(service => service.id !== id),
    }));
  }, []);

  const updateService = useCallback((id: string, updates: Partial<Service>) => {
    setLandingPageData(prev => ({
      ...prev,
      services: prev.services.map(service => 
        service.id === id ? { ...service, ...updates } : service
      ),
    }));
  }, []);

  // Get preview URL
  const getPreviewUrl = useCallback(() => {
    if (landingPageData.slug && landingPageData.isPublished) {
      return `/p/${landingPageData.slug}`;
    }
    return null;
  }, [landingPageData.slug, landingPageData.isPublished]);

  // Get available fields for adding
  const getAvailableFieldsToAdd = useCallback(() => {
    const usedFieldNames = landingPageData.formFields.map(field => field.name);
    return availableFields.filter(field => !usedFieldNames.includes(field.name));
  }, [landingPageData.formFields]);

  // Validation
  const validateData = useCallback(() => {
    const errors: string[] = [];

    if (!landingPageData.professionalName.trim()) {
      errors.push('El nombre profesional es requerido');
    }

    if (!landingPageData.title.trim()) {
      errors.push('El título es requerido');
    }

    if (!landingPageData.description.trim()) {
      errors.push('La descripción es requerida');
    }

    if (landingPageData.services.length === 0) {
      errors.push('Debe agregar al menos un servicio');
    }

    // Validate services
    landingPageData.services.forEach((service, index) => {
      if (!service.name.trim()) {
        errors.push(`El servicio ${index + 1} debe tener un nombre`);
      }
      if (!service.price.trim()) {
        errors.push(`El servicio ${index + 1} debe tener un precio`);
      }
    });

    return errors;
  }, [landingPageData]);

  // Generate slug from professional name
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim();
  }, []);

  // Auto-generate slug when professional name changes
  useEffect(() => {
    if (landingPageData.professionalName && !landingPageData.slug) {
      const slug = generateSlug(landingPageData.professionalName);
      updateLandingPageData({ slug });
    }
  }, [landingPageData.professionalName, landingPageData.slug, generateSlug, updateLandingPageData]);

  // Initialize
  useEffect(() => {
    fetchLandingPage();
  }, [fetchLandingPage]);

  return {
    // Data
    landingPageData,
    colorSchemes,
    availableFields: getAvailableFieldsToAdd(),
    
    // Loading states
    loading,
    saving,
    uploadingImage,
    error,
    
    // Actions
    updateLandingPageData,
    saveLandingPage,
    handleImageUpload,
    
    // Form field management
    addFormField,
    removeFormField,
    updateFormField,
    
    // Service management
    addService,
    removeService,
    updateService,
    
    // Utilities
    getPreviewUrl,
    validateData,
    generateSlug,
    
    // Reset error
    clearError: () => setError(null),
  };
}; 