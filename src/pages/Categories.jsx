import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApi } from '../hooks/useApi';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

export default function Categories() {
  useDocumentTitle('Categories');
  const { data, loading } = useApi('/categories');

  return (
    <div>
      <PageHeader
        eyebrow="Browse"
        title="Shop by Category"
        description="Find exactly what you are looking for — every category, updated live."
      />

      <div className="container-page py-10">
        {loading ? (
          <Spinner label="Loading categories…" />
        ) : data?.categories?.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {data.categories.map((c, i) => (
              <Link
                key={c.id}
                to={`/categories/${c.id}`}
                className="card group flex items-center gap-5 p-6 transition-colors hover:border-accent/50"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-xl font-black text-accent">
                  {c.name.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-semibold text-white group-hover:text-accent">{c.name}</h2>
                  <p className="mt-0.5 text-xs text-muted">
                    {c.product_count} product{c.product_count !== 1 ? 's' : ''}
                  </p>
                  {c.description && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted/70">{c.description}</p>
                  )}
                </div>
                <ArrowRight size={18} className="shrink-0 text-muted group-hover:text-accent" />
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState title="No categories yet" description="Categories will appear here once published by the team." />
        )}
      </div>
    </div>
  );
}