export const faqCategories = [
  {
    title: "General",
    items: [
      {
        question: "What is this platform?",
        answer:
          "This is the internal enterprise platform for Bren Raphael's. It provides centralized access to all company systems—CRM, HR Management, Point of Sale, Supply Chain, and Online Shop—through a single sign-on experience.",
      },
      {
        question: "Who can access the platform?",
        answer:
          "All employees are provisioned accounts by their department admin. Access to specific systems depends on your assigned role and department. If you need access to an additional system, contact your manager.",
      },
      {
        question: "How do I get to the Portal dashboard?",
        answer: `Click 'Sign In' from this page or go directly to ${process.env.NEXT_PUBLIC_PORTAL_URL || "https://localhost:3000"}. Once authenticated, the Portal shows all systems you have access to. Click any module to launch it.`,
      },
    ],
  },
  {
    title: "Account & Access",
    items: [
      {
        question: "How do I sign in for the first time?",
        answer:
          "Your admin will create your account and you will receive an email with a link to set your password. Once your password is set, sign in at the Portal. Your assigned systems will appear on the dashboard.",
      },
      {
        question: "I forgot my password. How do I reset it?",
        answer:
          "Click 'Forgot Password' on the sign-in page. A reset link will be sent to your company email. If you don't receive it within a few minutes, check your spam folder or contact your system administrator.",
      },
      {
        question: "Why can't I see a specific system?",
        answer:
          "You can only see systems that your admin has granted you access to. If you need access to an additional module (e.g., you've moved departments), ask your manager to request the access change.",
      },
      {
        question: "How does Single Sign-On (SSO) work?",
        answer:
          "Once you sign in to any system, you're automatically authenticated across all your assigned modules. You won't need to enter credentials again when switching between systems. Signing out from any system ends all sessions.",
      },
    ],
  },
  {
    title: "Using the Systems",
    items: [
      {
        question: "Can I have multiple systems open at the same time?",
        answer:
          "Yes. Each system runs as a separate web application. You can open multiple modules in different browser tabs and work across them simultaneously. SSO keeps you authenticated in all of them.",
      },
      {
        question: "Is data shared between systems?",
        answer:
          "Yes, where relevant. For example, employee records in HR are available in POS for shift management, and customer data in CRM informs order handling in the Online Shop. All data flows through the centralized platform API.",
      },
      {
        question: "Can I access the platform from my phone?",
        answer:
          "Yes. All systems are built with responsive design and work on mobile browsers. However, for the best experience with complex operations (reporting, bulk actions), we recommend using a desktop browser.",
      },
      {
        question: "What happens if a system is down?",
        answer:
          "System status is monitored automatically. If a module is unavailable, administrators are notified. You can report issues directly via email to your system administrator.",
      },
    ],
  },
  {
    title: "Technical Issues",
    items: [
      {
        question: "What browsers are supported?",
        answer:
          "Latest two versions of Chrome, Firefox, Safari, and Edge. We recommend Chrome or Firefox. Make sure JavaScript is enabled and you're not using an outdated browser version.",
      },
      {
        question: "I'm getting a 'Session Expired' error. What do I do?",
        answer:
          "This means your authentication token has expired. Simply sign in again at the Portal. If this happens frequently, try clearing your browser cookies or contact your system administrator.",
      },
      {
        question: "How do I report a bug or issue?",
        answer:
          "Email your system administrator with: what you were doing, what went wrong, your browser name/version, and any error messages you saw. Screenshots are helpful.",
      },
    ],
  },
];
