import { cn } from '@/lib/utils';
import { ProspectStatus, STATUS_LABELS } from '@/types';

interface StatusBadgeProps {
  status: ProspectStatus;
  className?: string;
}

const statusClasses: Record<ProspectStatus, string> = {
  prospect: 'status-prospect',
  audit_prevu: 'status-audit-prevu',
  audit_realise: 'status-audit-realise',
  devis_envoye: 'status-devis-envoye',
  signe: 'status-signe',
  refuse: 'status-refuse',
};

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusClasses[status],
        className
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}
