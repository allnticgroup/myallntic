import { ProspectStatus, STATUS_LABELS } from '@/types';
import { cn } from '@/lib/utils';

interface StatusFilterProps {
  selected: ProspectStatus | 'all';
  onChange: (status: ProspectStatus | 'all') => void;
}

const allStatuses: (ProspectStatus | 'all')[] = [
  'all',
  'prospect',
  'audit_prevu',
  'audit_realise',
  'devis_envoye',
  'signe',
  'refuse',
];

export function StatusFilter({ selected, onChange }: StatusFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 px-4 -mx-4 scrollbar-hide">
      {allStatuses.map((status) => (
        <button
          key={status}
          onClick={() => onChange(status)}
          className={cn(
            'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-smooth',
            selected === status
              ? 'bg-primary text-primary-foreground'
              : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
          )}
        >
          {status === 'all' ? 'Tous' : STATUS_LABELS[status]}
        </button>
      ))}
    </div>
  );
}
