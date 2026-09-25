// Micro-interaction for form submission
const form = document.getElementById("forgotPasswordForm");
form.addEventListener("submit", () => {
  const btn = document.getElementById("submitBtn");
  btn.disabled = true;
  btn.innerHTML = `<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Submitting...`;
});

// Focus animation trigger
const inputs = document.querySelectorAll('input[type="text"]');
inputs.forEach((input) => {
  input.addEventListener("focus", () => {
    input.parentElement.parentElement.classList.add("scale-[1.01]");
  });
  input.addEventListener("blur", () => {
    input.parentElement.parentElement.classList.remove("scale-[1.01]");
  });
});
