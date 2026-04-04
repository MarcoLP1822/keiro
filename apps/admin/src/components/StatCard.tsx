interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export function StatCard({ title, value, subtitle }: StatCardProps) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{title}</p>
      <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="mt-0.5 text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}
