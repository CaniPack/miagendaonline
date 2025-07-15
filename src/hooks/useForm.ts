'use client';

import { useState, useCallback, useRef } from 'react';

interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Partial<Record<keyof T, string>>;
  onSubmit: (values: T) => Promise<void> | void;
  resetOnSubmit?: boolean;
  validateOnChange?: boolean;
  validateOnBlur?: boolean;
}

interface UseFormReturn<T> {
  // Estado del formulario
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValidating: boolean;
  isValid: boolean;
  isDirty: boolean;
  
  // Funciones de campo
  setValue: (name: keyof T, value: any) => void;
  setFieldValue: (name: keyof T, value: any) => void;
  setFieldError: (name: keyof T, error: string | undefined) => void;
  setFieldTouched: (name: keyof T, touched?: boolean) => void;
  
  // Funciones de formulario
  setValues: (values: Partial<T>) => void;
  setErrors: (errors: Partial<Record<keyof T, string>>) => void;
  setTouched: (touched: Partial<Record<keyof T, boolean>>) => void;
  resetForm: () => void;
  resetField: (name: keyof T) => void;
  validateForm: () => Promise<boolean>;
  validateField: (name: keyof T) => Promise<void>;
  
  // Manejadores de eventos
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  
  // Utilidades
  getFieldProps: (name: keyof T) => {
    name: string;
    value: any;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
    error?: string;
  };
  getFieldState: (name: keyof T) => {
    value: any;
    error?: string;
    touched: boolean;
    hasError: boolean;
  };
}

export function useForm<T extends Record<string, any>>(
  options: UseFormOptions<T>
): UseFormReturn<T> {
  const {
    initialValues,
    validate,
    onSubmit,
    resetOnSubmit = false,
    validateOnChange = false,
    validateOnBlur = true
  } = options;

  // Estados del formulario
  const [values, setValuesState] = useState<T>(initialValues);
  const [errors, setErrorsState] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouchedState] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValidating, setIsValidating] = useState(false);

  // Referencias para comparar valores
  const initialValuesRef = useRef(initialValues);
  const validateRef = useRef(validate);
  validateRef.current = validate;

  // Valores calculados
  const isDirty = JSON.stringify(values) !== JSON.stringify(initialValuesRef.current);
  const hasErrors = Object.keys(errors).length > 0;
  const isValid = !hasErrors && Object.keys(touched).length > 0;

  // Función para validar valores
  const runValidation = useCallback(async (valuesToValidate: T): Promise<Partial<Record<keyof T, string>>> => {
    if (!validateRef.current) return {};
    
    setIsValidating(true);
    try {
      const validationErrors = validateRef.current(valuesToValidate);
      return validationErrors || {};
    } catch (error) {
      console.error('Error en validación:', error);
      return {};
    } finally {
      setIsValidating(false);
    }
  }, []);

  // Establecer valor de campo
  const setValue = useCallback((name: keyof T, value: any) => {
    setValuesState(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const setFieldValue = setValue;

  // Establecer error de campo
  const setFieldError = useCallback((name: keyof T, error: string | undefined) => {
    setErrorsState(prev => {
      if (error) {
        return { ...prev, [name]: error };
      } else {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      }
    });
  }, []);

  // Establecer touched de campo
  const setFieldTouched = useCallback((name: keyof T, touched: boolean = true) => {
    setTouchedState(prev => ({
      ...prev,
      [name]: touched
    }));
  }, []);

  // Establecer valores completos
  const setValues = useCallback((newValues: Partial<T>) => {
    setValuesState(prev => ({
      ...prev,
      ...newValues
    }));
  }, []);

  // Establecer errores completos
  const setErrors = useCallback((newErrors: Partial<Record<keyof T, string>>) => {
    setErrorsState(newErrors);
  }, []);

  // Establecer touched completo
  const setTouched = useCallback((newTouched: Partial<Record<keyof T, boolean>>) => {
    setTouchedState(newTouched);
  }, []);

  // Resetear formulario
  const resetForm = useCallback(() => {
    setValuesState(initialValuesRef.current);
    setErrorsState({});
    setTouchedState({});
    setIsSubmitting(false);
  }, []);

  // Resetear campo específico
  const resetField = useCallback((name: keyof T) => {
    setValuesState(prev => ({
      ...prev,
      [name]: initialValuesRef.current[name]
    }));
    setErrorsState(prev => {
      const newErrors = { ...prev };
      delete newErrors[name];
      return newErrors;
    });
    setTouchedState(prev => {
      const newTouched = { ...prev };
      delete newTouched[name];
      return newTouched;
    });
  }, []);

  // Validar formulario completo
  const validateForm = useCallback(async (): Promise<boolean> => {
    const validationErrors = await runValidation(values);
    setErrors(validationErrors);
    
    // Marcar todos los campos como touched
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key as keyof T] = true;
      return acc;
    }, {} as Partial<Record<keyof T, boolean>>);
    setTouched(allTouched);
    
    return Object.keys(validationErrors).length === 0;
  }, [values, runValidation, setErrors, setTouched]);

  // Validar campo específico
  const validateField = useCallback(async (name: keyof T) => {
    const validationErrors = await runValidation(values);
    const fieldError = validationErrors[name];
    setFieldError(name, fieldError);
  }, [values, runValidation, setFieldError]);

  // Manejador de cambio
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const fieldName = name as keyof T;
    
    // Convertir valor según tipo
    let processedValue: any = value;
    if (type === 'number') {
      processedValue = value === '' ? '' : Number(value);
    } else if (type === 'checkbox') {
      processedValue = (e.target as HTMLInputElement).checked;
    }
    
    setValue(fieldName, processedValue);
    
    // Validar si está habilitado
    if (validateOnChange) {
      validateField(fieldName);
    } else {
      // Limpiar error existente si el campo ahora tiene valor
      if (processedValue && errors[fieldName]) {
        setFieldError(fieldName, undefined);
      }
    }
  }, [setValue, validateOnChange, validateField, errors, setFieldError]);

  // Manejador de blur
  const handleBlur = useCallback((e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    const fieldName = name as keyof T;
    
    setFieldTouched(fieldName, true);
    
    if (validateOnBlur) {
      validateField(fieldName);
    }
  }, [setFieldTouched, validateOnBlur, validateField]);

  // Manejador de submit
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    
    try {
      // Validar formulario
      const isFormValid = await validateForm();
      
      if (!isFormValid) {
        setIsSubmitting(false);
        return;
      }
      
      // Ejecutar onSubmit
      await onSubmit(values);
      
      // Reset si está configurado
      if (resetOnSubmit) {
        resetForm();
      }
    } catch (error) {
      console.error('Error en submit:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, validateForm, onSubmit, values, resetOnSubmit, resetForm]);

  // Obtener props de campo
  const getFieldProps = useCallback((name: keyof T) => {
    return {
      name: String(name),
      value: values[name] ?? '',
      onChange: handleChange,
      onBlur: handleBlur,
      error: touched[name] ? errors[name] : undefined
    };
  }, [values, handleChange, handleBlur, touched, errors]);

  // Obtener estado de campo
  const getFieldState = useCallback((name: keyof T) => {
    return {
      value: values[name],
      error: errors[name],
      touched: !!touched[name],
      hasError: !!touched[name] && !!errors[name]
    };
  }, [values, errors, touched]);

  return {
    // Estado del formulario
    values,
    errors,
    touched,
    isSubmitting,
    isValidating,
    isValid,
    isDirty,
    
    // Funciones de campo
    setValue,
    setFieldValue,
    setFieldError,
    setFieldTouched,
    
    // Funciones de formulario
    setValues,
    setErrors,
    setTouched,
    resetForm,
    resetField,
    validateForm,
    validateField,
    
    // Manejadores de eventos
    handleChange,
    handleBlur,
    handleSubmit,
    
    // Utilidades
    getFieldProps,
    getFieldState,
  };
} 