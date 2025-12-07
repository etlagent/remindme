/**
 * USE PERSON FORM HOOK
 * 
 * Manages form state for person information input fields.
 * Centralizes person form data management.
 * 
 * USED BY:
 * - app/page.tsx (main page)
 * - components/capture/PersonInfoForm.tsx
 * 
 * DEPENDENCIES:
 * - lib/types (PersonFormData type)
 * 
 * PROVIDES:
 * - personForm: Object containing all form field values
 * - updateField: Update a single form field
 * - updateForm: Update entire form with loaded person data
 * - clearForm: Reset all fields to empty
 * 
 * FORM FIELDS:
 * - personName: Full name of the person
 * - personCompany: Company they work for
 * - personRole: Job title/role
 * - personLocation: City, state, country
 * 
 * DATA FLOW:
 * 1. User types in form fields
 * 2. updateField updates state
 * 3. On save, form data is sent to /api/save-memory
 * 4. On load person, updateForm populates fields
 */

import { useState } from 'react';
import type { PersonFormData } from '@/lib/types';

export function usePersonForm() {
  const [personForm, setPersonForm] = useState<PersonFormData>({
    personName: '',
    personCompany: '',
    personRole: '',
    personLocation: '',
  });

  /**
   * Update a single form field
   * 
   * @param field - Field name to update
   * @param value - New value for the field
   */
  const updateField = (field: keyof PersonFormData, value: string) => {
    setPersonForm(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  /**
   * Update entire form with loaded person data
   * Used when loading a person from the library
   * 
   * @param data - Partial person form data
   */
  const updateForm = (data: Partial<PersonFormData>) => {
    setPersonForm(prev => ({
      ...prev,
      ...data,
    }));
  };

  /**
   * Clear all form fields
   * Used after saving or when starting fresh
   */
  const clearForm = () => {
    setPersonForm({
      personName: '',
      personCompany: '',
      personRole: '',
      personLocation: '',
    });
  };

  return {
    personForm,
    updateField,
    updateForm,
    clearForm,
  };
}
