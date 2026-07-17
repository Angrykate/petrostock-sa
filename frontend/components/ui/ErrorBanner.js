import Button from "./Button";

export default function ErrorBanner({ title, description, onRetry }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded border border-danger/30 bg-danger-soft px-4 py-3 text-sm text-danger">
      <div>
        <p className="font-semibold">{title}</p>
        {description && <p className="mt-0.5 text-xs opacity-90">{description}</p>}
      </div>
      {onRetry && (
        <Button variant="secondary" onClick={onRetry} className="!border-danger !text-danger">
          Réessayer
        </Button>
      )}
    </div>
  );
}
