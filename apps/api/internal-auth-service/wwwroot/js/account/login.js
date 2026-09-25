// --- Field Validation ---

const USERNAME_REGEX = /^\d{4}-[A-Z]{2}-\d{3}$/;
const PASSWORD_MIN_LENGTH = 8;

const validationRules = {
  username: [
    { test: (v) => v.trim().length > 0, message: "Username is required." },
    {
      test: (v) => USERNAME_REGEX.test(v.trim()),
      message: "Format must be YYYY-II-NNN (e.g. 2024-AB-001).",
    },
  ],
  password: [
    { test: (v) => v.length > 0, message: "Password is required." },
    {
      test: (v) => v.length >= PASSWORD_MIN_LENGTH,
      message: "Password must be at least 8 characters.",
    },
  ],
};

/**
 * Validates a single field against its rules.
 * Shows/hides the error message and toggles the input-error class.
 * Returns true if the field is valid.
 */
function validateField(input) {
  const rules = validationRules[input.id];
  if (!rules) return true;

  const errorEl = document.getElementById(`${input.id}-error`);
  const value = input.value;

  for (const rule of rules) {
    if (!rule.test(value)) {
      // Show error
      errorEl.textContent = rule.message;
      errorEl.classList.remove("hidden");
      input.classList.add("input-error");
      return false;
    }
  }

  // Clear error
  errorEl.textContent = "";
  errorEl.classList.add("hidden");
  input.classList.remove("input-error");
  return true;
}

// --- DOM References ---

const form = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const submitBtn = document.getElementById("submitBtn");
const togglePassword = document.getElementById("togglePassword");

// --- Validation Event Listeners ---

// On blur: validate the field
usernameInput.addEventListener("blur", () => validateField(usernameInput));
passwordInput.addEventListener("blur", () => validateField(passwordInput));

// On input: clear error as soon as user types (only if field currently has an error)
usernameInput.addEventListener("input", () => {
  if (usernameInput.classList.contains("input-error")) {
    validateField(usernameInput);
  }
});
passwordInput.addEventListener("input", () => {
  if (passwordInput.classList.contains("input-error")) {
    validateField(passwordInput);
  }
});

// --- Form Submission ---

form.addEventListener("submit", (e) => {
  const isUsernameValid = validateField(usernameInput);
  const isPasswordValid = validateField(passwordInput);

  if (!isUsernameValid || !isPasswordValid) {
    e.preventDefault();
    // Focus the first invalid field
    if (!isUsernameValid) {
      usernameInput.focus();
    } else {
      passwordInput.focus();
    }
    return;
  }

  // Valid — show loading state
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Authenticating...`;
});

// --- Password Visibility Toggle ---

togglePassword.addEventListener("click", () => {
  const isHidden = passwordInput.type === "password";
  passwordInput.type = isHidden ? "text" : "password";
  togglePassword.querySelector(".material-symbols-outlined").textContent =
    isHidden ? "visibility_off" : "visibility";
});

// --- Focus Animation ---

const inputs = document.querySelectorAll(
  'input[type="text"], input[type="password"]',
);
inputs.forEach((input) => {
  input.addEventListener("focus", () => {
    input.parentElement.parentElement.classList.add("scale-[1.01]");
  });
  input.addEventListener("blur", () => {
    input.parentElement.parentElement.classList.remove("scale-[1.01]");
  });
});
