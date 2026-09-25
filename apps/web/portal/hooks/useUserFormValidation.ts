import { useCallback, useMemo, useRef, useState } from "react";
import { validateField, validateForm, UserFormData } from "@/lib/validation/userFormSchema";

interface UseUserFormValidationOptions {
  isEdit: boolean;
  userId?: string;
  onCheckEmailAction?: (email: string, excludeUserId?: string) => Promise<boolean>;
}

export function useUserFormValidation({
  isEdit,
  userId,
  onCheckEmailAction,
}: UseUserFormValidationOptions) {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [checkingEmail, setCheckingEmail] = useState(false);
  const emailDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasErrors = useMemo(
    () => Object.values(fieldErrors).some((e) => e.length > 0),
    [fieldErrors]
  );

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleBlur = useCallback(
    (field: keyof UserFormData, value: string) => {
      const error = validateField(field, value);
      if (error) {
        setFieldErrors((prev) => ({ ...prev, [field]: error }));
      } else {
        clearFieldError(field);
      }

      // Async email duplicate check
      if (field === "email" && !error && onCheckEmailAction) {
        if (emailDebounceRef.current) clearTimeout(emailDebounceRef.current);
        emailDebounceRef.current = setTimeout(async () => {
          setCheckingEmail(true);
          try {
            const exists = await onCheckEmailAction(
              value,
              isEdit ? userId : undefined
            );
            if (exists) {
              setFieldErrors((prev) => ({
                ...prev,
                email: "This email is already registered.",
              }));
            }
          } catch {
            // Silently fail — submit safety net will catch it
          } finally {
            setCheckingEmail(false);
          }
        }, 300);
      }
    },
    [onCheckEmailAction, isEdit, userId, clearFieldError]
  );

  /**
   * Validates the full form. Returns true if valid, false otherwise.
   * Sets fieldErrors state on failure.
   */
  const validateAllFields = useCallback(
    (data: Record<keyof UserFormData, string>): boolean => {
      const errors = validateForm(data);
      if (Object.keys(errors).length > 0) {
        setFieldErrors(errors);
        return false;
      }
      return true;
    },
    []
  );

  /**
   * Runs the email duplicate check as a final safety net before submit.
   * Returns true if the email already exists (should block submit).
   */
  const checkEmailBeforeSubmit = useCallback(
    async (email: string): Promise<boolean> => {
      if (!onCheckEmailAction) return false;
      setCheckingEmail(true);
      try {
        const exists = await onCheckEmailAction(
          email,
          isEdit ? userId : undefined
        );
        if (exists) {
          setFieldErrors((prev) => ({
            ...prev,
            email: "This email is already registered.",
          }));
          return true;
        }
        return false;
      } catch {
        return false; // Proceed — backend will catch duplicates
      } finally {
        setCheckingEmail(false);
      }
    },
    [onCheckEmailAction, isEdit, userId]
  );

  return {
    fieldErrors,
    checkingEmail,
    hasErrors,
    clearFieldError,
    handleBlur,
    validateAllFields,
    checkEmailBeforeSubmit,
  };
}
