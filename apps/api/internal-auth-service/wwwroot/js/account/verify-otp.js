// OTP digit input management
const digits = document.querySelectorAll(".otp-digit");
const codeInput = document.getElementById("codeInput");
const form = document.getElementById("otpForm");
const submitBtn = document.getElementById("submitBtn");

// Auto-focus first input on load
if (digits.length > 0) {
  digits[0].focus();
}

// Handle digit input and navigation
digits.forEach((input, index) => {
  input.addEventListener("input", (e) => {
    const value = e.target.value;

    // Only allow single digit
    if (value && !/^[0-9]$/.test(value)) {
      e.target.value = "";
      return;
    }

    // Toggle filled class
    if (value) {
      input.classList.add("filled");
    } else {
      input.classList.remove("filled");
    }

    // Auto-advance to next input
    if (value && index < digits.length - 1) {
      digits[index + 1].focus();
    }

    updateCodeInput();
  });

  // Handle backspace navigation
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      digits[index - 1].focus();
      digits[index - 1].value = "";
      digits[index - 1].classList.remove("filled");
      updateCodeInput();
    }
  });

  // Handle paste
  input.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasteData = (e.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, 6);

    for (let i = 0; i < pasteData.length && i < digits.length; i++) {
      digits[i].value = pasteData[i];
      digits[i].classList.add("filled");
    }

    // Focus the next empty or last input
    const nextEmpty = Math.min(pasteData.length, digits.length - 1);
    digits[nextEmpty].focus();

    updateCodeInput();
  });
});

// Combine all digits into the hidden code field
function updateCodeInput() {
  let code = "";
  digits.forEach((input) => {
    code += input.value;
  });
  codeInput.value = code;
}

// Form submission
form.addEventListener("submit", (e) => {
  updateCodeInput();

  if (codeInput.value.length !== 6) {
    e.preventDefault();
    digits[0].focus();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.innerHTML =
    '<span class="material-symbols-outlined animate-spin text-[18px]">progress_activity</span> Verifying...';
});

// Resend form submission state
const resendForm = document.getElementById("resendForm");
const resendBtn = document.getElementById("resendBtn");
if (resendForm && resendBtn) {
  resendForm.addEventListener("submit", () => {
    resendBtn.disabled = true;
    resendBtn.textContent = "Sending...";
  });
}
