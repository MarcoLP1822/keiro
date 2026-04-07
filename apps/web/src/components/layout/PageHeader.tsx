interface PageHeaderProps {
  titleJp: string;
  subtitle: string;
}

export function PageHeader({ titleJp, subtitle }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1
        className="font-headline text-3xl font-bold"
        style={{ color: 'var(--k-primary)' }}
      >
        {titleJp}
      </h1>
      <p className="text-sm mt-1" style={{ color: 'var(--k-secondary)' }}>
        {subtitle}
      </p>
    </div>
  );
}
