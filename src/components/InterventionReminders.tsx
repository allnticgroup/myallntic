import { useEffect } from 'react';
import { toast } from 'sonner';
import { isPast, isToday, isTomorrow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useInterventions, useProspects } from '@/hooks/useData';

const LAST_NOTIF_KEY = 'allntic_interventions_last_reminder';

export function InterventionReminders() {
  const { interventions } = useInterventions();
  const { getProspect } = useProspects();

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (localStorage.getItem(LAST_NOTIF_KEY) === today) return;
    if (interventions.length === 0) return;

    const pending = interventions.filter((i) => {
      if (i.statut !== 'a_faire') return false;
      const d = new Date(i.datePrevue);
      return isToday(d) || isTomorrow(d) || isPast(d);
    });

    if (pending.length === 0) return;
    localStorage.setItem(LAST_NOTIF_KEY, today);

    const late = pending.filter((i) => isPast(new Date(i.datePrevue)) && !isToday(new Date(i.datePrevue)));
    const titre = `${pending.length} intervention${pending.length > 1 ? 's' : ''} à réaliser`;
    const details = pending
      .slice(0, 3)
      .map((i) => {
        const p = getProspect(i.prospectId);
        return `${p?.nomStructure || 'Client'} — ${format(new Date(i.datePrevue), 'dd MMM', { locale: fr })}`;
      })
      .join('\n');

    const description = late.length > 0 ? `${late.length} en retard\n${details}` : details;

    setTimeout(() => {
      toast.warning(titre, { description, duration: 8000 });
    }, 1500);

    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('ALLNTIC GROUP — Rappel interventions', { body: `${titre}\n${description}` });
      } catch {
        // ignore
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interventions.length]);

  return null;
}
