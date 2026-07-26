const AVATAR_PALETTE = [
  { bg: "var(--color-surface-soft)", text: "var(--color-primary)" },
  { bg: "var(--color-info-soft)", text: "var(--color-info)" },
  { bg: "var(--color-success-soft)", text: "var(--color-success)" },
  { bg: "var(--color-violet-soft)", text: "var(--color-violet)" },
  { bg: "var(--color-warning-soft)", text: "var(--color-warning)" },
  { bg: "var(--color-cyan-soft)", text: "var(--color-cyan)" },
];

export const getCustomerInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const getCustomerAvatarColors = (name: string) => {
  let hash = 0;
  for (let index = 0; index < name.length; index += 1) {
    hash = name.charCodeAt(index) + ((hash << 5) - hash);
  }

  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length];
};

interface CustomerAvatarProps {
  name: string;
  className?: string;
}

export function CustomerAvatar({ name, className = "" }: CustomerAvatarProps) {
  const colors = getCustomerAvatarColors(name);
  const initials = getCustomerInitials(name);

  return (
    <div
      className={`rounded-full text-[10px] shrink-0 w-9 h-9 font-bold flex items-center justify-center border border-hairline ${className}`}
      style={{ background: colors.bg, color: colors.text }}
      aria-hidden="true"
    >
      {initials}
    </div>
  );
}
