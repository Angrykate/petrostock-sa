export default function Card({ title, action, children, className = "", bodyClassName = "" }) {
  return (
    <section className={`panel ${className}`}>
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          {title ? <h2 className="text-sm font-semibold text-navy-800">{title}</h2> : <div />}
          {action}
        </div>
      )}
      <div className={`px-4 py-4 sm:px-5 ${bodyClassName}`}>{children}</div>
    </section>
  );
}
