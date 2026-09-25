import { z } from "zod";

const NAME_REGEX = /^[a-zA-Z\s\-]+$/;

const nameField = (label: string) =>
  z
    .string()
    .min(2, `${label} must be at least 2 characters.`)
    .max(50, `${label} must be at most 50 characters.`)
    .regex(NAME_REGEX, `${label} can only contain letters, spaces, and hyphens.`);

export const userFormSchema = z.object({
  firstName: nameField("First name"),
  lastName: nameField("Last name"),
  email: z
    .string()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  role: z.string().min(1, "Role is required."),
});

export type UserFormData = z.infer<typeof userFormSchema>;

/**
 * Validates a single field and returns the first error message or null.
 */
export function validateField(
  field: keyof UserFormData,
  value: string
): string | null {
  const fieldSchema = userFormSchema.shape[field];
  const result = fieldSchema.safeParse(value);
  if (result.success) return null;
  return result.error.issues[0]?.message ?? "Invalid value.";
}

/**
 * Validates the entire form and returns a map of field → error message.
 * Returns an empty object if all fields are valid.
 */
export function validateForm(
  data: Record<keyof UserFormData, string>
): Record<string, string> {
  const result = userFormSchema.safeParse(data);
  if (result.success) return {};

  const errors: Record<string, string> = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as string;
    if (!errors[field]) {
      errors[field] = issue.message;
    }
  }
  return errors;
}
