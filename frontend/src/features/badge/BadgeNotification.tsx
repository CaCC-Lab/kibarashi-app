export interface BadgeNotificationProps {
  badge: { name: string; description: string } | null;
  onClose: () => void;
}

export default function BadgeNotification({
  badge,
  onClose,
}: BadgeNotificationProps) {
  if (!badge) {
    return null;
  }

  return (
    <div role="dialog" data-testid="badge-notification" aria-live="polite">
      <p data-testid="celebration-title">{badge.name}</p>
      <p data-testid="celebration-desc">{badge.description}</p>
      <button type="button" data-testid="badge-notification-ok" onClick={onClose}>
        確認
      </button>
    </div>
  );
}
