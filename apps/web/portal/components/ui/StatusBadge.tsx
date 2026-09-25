interface StatusBadgeProps {
  variant: "success" | "critical" | "warning" | "changed";
  label: string;
}

const styles = {
  success: "bg-green-50 text-green-700 border-green-200",
  critical: "bg-red-50 text-red-700 border-red-200",
  warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
  changed: "bg-surface-container-high text-on-surface-variant border-border",
};

const dotStyles = {
  success: "bg-green-500",
  critical: "bg-red-500",
  warning: "bg-yellow-500",
  changed: "bg-outline",
};

/** Status badge component matching the design reference style */
export function StatusBadge({ variant, label }: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest border ${styles[variant]}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotStyles[variant]}`} />
      {label}
    </span>
  );
}
