import { Link } from 'react-router-dom';
import { Phone, Building2, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from './StatusBadge';
import { Prospect, STRUCTURE_LABELS, BESOIN_LABELS } from '@/types';

interface ProspectCardProps {
  prospect: Prospect;
}

export function ProspectCard({ prospect }: ProspectCardProps) {
  return (
    <Link to={`/prospects/${prospect.id}`}>
      <Card className="transition-smooth hover:shadow-md hover:border-primary/30 animate-fade-in">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-foreground truncate">
                  {prospect.nomStructure}
                </h3>
              </div>
              <p className="text-sm text-muted-foreground mb-2 truncate">
                {prospect.nomDecideur}
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <Building2 className="h-3 w-3" />
                  {STRUCTURE_LABELS[prospect.typeStructure]}
                </span>
                <span className="text-border">•</span>
                <span>{BESOIN_LABELS[prospect.besoinPrincipal]}</span>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2">
              <StatusBadge status={prospect.statut} />
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          {prospect.telephone && (
            <a
              href={`tel:${prospect.telephone}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 mt-3 text-sm text-primary hover:underline"
            >
              <Phone className="h-3.5 w-3.5" />
              {prospect.telephone}
            </a>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
