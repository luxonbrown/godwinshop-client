export default function PageHeader({ eyebrow, title, description }) {
  return (
    <div className="border-b border-divider bg-base-2">
      <div className="container-page py-10 sm:py-14">
        {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{eyebrow}</p>}
        <h1 className="mt-2 text-3xl font-bold text-white sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{description}</p>}
      </div>
    </div>
  );
}