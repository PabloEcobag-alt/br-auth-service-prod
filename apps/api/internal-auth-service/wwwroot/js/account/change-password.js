// Password visibility toggle
function togglePassword(id) {
  const input = document.getElementById(id);
  const btn = input.nextElementSibling.querySelector(
    ".material-symbols-outlined",
  );
  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "visibility_off";
  } else {
    input.type = "password";
    btn.textContent = "visibility";
  }
}

// Password validation
const passwordInput = document.getElementById("newPassword");
const confirmInput = document.getElementById("confirmPassword");
const submitBtn = document.getElementById("submitBtn");

const requirements = {
  length: document.getElementById("req-length"),
  case: document.getElementById("req-case"),
  number: document.getElementById("req-number"),
  special: document.getElementById("req-special"),
  match: document.getElementById("req-match"),
};

function validatePassword() {
  const val = passwordInput.value;
  const confirmVal = confirmInput.value;

  const checks = {
    length: val.length >= 8,
    case: /[a-z]/.test(val) && /[A-Z]/.test(val),
    number: /[0-9]/.test(val),
    special: /[^A-Za-z0-9]/.test(val),
    match: val === confirmVal && val !== "",
  };

  Object.keys(checks).forEach((key) => {
    const el = requirements[key];
    const icon = el.querySelector(".material-symbols-outlined");
    if (checks[key]) {
      el.classList.remove("unmet");
      el.classList.add("met");
      icon.style.fontVariationSettings = "'FILL' 1";
    } else {
      el.classList.remove("met");
      el.classList.add("unmet");
      icon.style.fontVariationSettings = "'FILL' 0";
    }
  });

  const allMet = Object.values(checks).every(Boolean);
  submitBtn.disabled = !allMet;
}

passwordInput.addEventListener("input", validatePassword);
confirmInput.addEventListener("input", validatePassword);

// Form submission state
const form = document.getElementById("changePasswordForm");
form.addEventListener("submit", () => {
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Updating...`;
});

// Focus animation trigger
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
