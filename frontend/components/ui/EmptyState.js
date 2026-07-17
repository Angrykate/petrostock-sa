export default function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
      {Icon && (
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded bg-canvas-tint text-ink-muted">
          <Icon size={18} />
        </div>
      )}
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-ink-muted">{description}</p>}
    </div>
  );
}
