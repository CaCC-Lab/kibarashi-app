export interface BadgeNotificationProps {
  badgeName: string | null;
  badgeDescription: string | null;
  onClose: () => void;
}

export default function BadgeNotification({
  badgeName,
  badgeDescription,
  onClose,
}: BadgeNotificationProps) {
  if (!badgeName || !badgeDescription) {
    return null;
  }

  return (
    <div role="dialog" data-testid="badge-notification" aria-live="polite">
      <p data-testid="celebration-title">{badgeName}</p>
      <p data-testid="celebration-desc">{badgeDescription}</p>
      <button type="button" data-testid="badge-notification-ok" onClick={onClose}>
        確認
      </button>
    </div>
  );
}
