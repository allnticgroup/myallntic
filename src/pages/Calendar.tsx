import { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, addMonths, subMonths, addWeeks, subWeeks, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Wrench, Calendar as CalendarIcon } from 'lucide-react';
import { useInterventions, useProspects } from '@/hooks/useData';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { INTERVENTION_TYPE_LABELS, INTERVENTION_STATUS_LABELS } from '@/types';
import { Link } from 'react-router-dom';

type ViewMode = 'month' | 'week';

interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'intervention';
  status: string;
  prospectId: string;
  prospectName: string;
  interventionType: string;
}

export default function Calendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  
  const { interventions } = useInterventions();
  const { getProspect } = useProspects();

  // Convert interventions to calendar events
  const events = useMemo<CalendarEvent[]>(() => {
    return interventions.map((intervention) => {
      const prospect = getProspect(intervention.prospectId);
      return {
        id: intervention.id,
        title: `${INTERVENTION_TYPE_LABELS[intervention.type]} - ${prospect?.nomStructure || 'Client inconnu'}`,
        date: parseISO(intervention.datePrevue),
        type: 'intervention' as const,
        status: intervention.statut,
        prospectId: intervention.prospectId,
        prospectName: prospect?.nomStructure || 'Client inconnu',
        interventionType: intervention.type,
      };
    });
  }, [interventions, getProspect]);

  // Get days for month view
  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate), { locale: fr });
    const end = endOfWeek(endOfMonth(currentDate), { locale: fr });
    const days: Date[] = [];
    let day = start;
    while (day <= end) {
      days.push(day);
      day = addDays(day, 1);
    }
    return days;
  }, [currentDate]);

  // Get days for week view
  const weekDays = useMemo(() => {
    const start = startOfWeek(currentDate, { locale: fr });
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      days.push(addDays(start, i));
    }
    return days;
  }, [currentDate]);

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(event.date, date));
  };

  const navigatePrev = () => {
    if (viewMode === 'month') {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const selectedDateEvents = selectedDate ? getEventsForDate(selectedDate) : [];

  return (
    <div className="min-h-screen bg-background pb-20">
      <PageHeader title="Calendrier" />

      <div className="p-4 space-y-4">
        {/* Controls */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={navigatePrev}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={navigateNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={goToToday}>
              Aujourd'hui
            </Button>
          </div>
          
          <h2 className="text-lg font-semibold capitalize">
            {viewMode === 'month' 
              ? format(currentDate, 'MMMM yyyy', { locale: fr })
              : `Semaine du ${format(startOfWeek(currentDate, { locale: fr }), 'd MMM', { locale: fr })}`
            }
          </h2>
          
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="month">Mois</TabsTrigger>
              <TabsTrigger value="week">Semaine</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Calendar Grid */}
        <Card className="p-4">
          {/* Day Headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          {viewMode === 'month' ? (
            <div className="grid grid-cols-7 gap-1">
              {monthDays.map((day, idx) => {
                const dayEvents = getEventsForDate(day);
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'min-h-[80px] p-1 rounded-lg border text-left transition-colors',
                      isCurrentMonth ? 'bg-card' : 'bg-muted/30',
                      isToday && 'ring-2 ring-primary',
                      isSelected && 'bg-primary/10 border-primary',
                      'hover:bg-accent'
                    )}
                  >
                    <div className={cn(
                      'text-sm font-medium mb-1',
                      !isCurrentMonth && 'text-muted-foreground'
                    )}>
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 2).map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            'text-xs px-1 py-0.5 rounded truncate',
                            event.status === 'fait' 
                              ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                              : 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
                          )}
                        >
                          {event.interventionType === 'Installation' ? '🔧' : '🛠️'} {event.prospectName}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayEvents.length - 2} autres
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, idx) => {
                const dayEvents = getEventsForDate(day);
                const isToday = isSameDay(day, new Date());
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                
                return (
                  <button
                    key={idx}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'min-h-[200px] p-2 rounded-lg border text-left transition-colors',
                      isToday && 'ring-2 ring-primary',
                      isSelected && 'bg-primary/10 border-primary',
                      'hover:bg-accent'
                    )}
                  >
                    <div className="text-center mb-2">
                      <div className="text-lg font-semibold">{format(day, 'd')}</div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {format(day, 'EEEE', { locale: fr })}
                      </div>
                    </div>
                    <div className="space-y-1">
                      {dayEvents.map((event) => (
                        <div
                          key={event.id}
                          className={cn(
                            'text-xs p-1.5 rounded',
                            event.status === 'fait' 
                              ? 'bg-green-500/20 text-green-700 dark:text-green-400'
                              : 'bg-orange-500/20 text-orange-700 dark:text-orange-400'
                          )}
                        >
                          <div className="font-medium truncate">
                            {INTERVENTION_TYPE_LABELS[event.interventionType as keyof typeof INTERVENTION_TYPE_LABELS]}
                          </div>
                          <div className="truncate">{event.prospectName}</div>
                        </div>
                      ))}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </Card>

        {/* Selected Date Events */}
        {selectedDate && (
          <Card className="p-4">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              {format(selectedDate, 'EEEE d MMMM yyyy', { locale: fr })}
            </h3>
            
            {selectedDateEvents.length === 0 ? (
              <p className="text-muted-foreground text-sm">Aucun événement ce jour</p>
            ) : (
              <div className="space-y-2">
                {selectedDateEvents.map((event) => (
                  <Link
                    key={event.id}
                    to={`/prospects/${event.prospectId}`}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-accent transition-colors"
                  >
                    <div className={cn(
                      'p-2 rounded-full',
                      event.status === 'fait' 
                        ? 'bg-green-500/20'
                        : 'bg-orange-500/20'
                    )}>
                      <Wrench className={cn(
                        'h-4 w-4',
                        event.status === 'fait' 
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-orange-600 dark:text-orange-400'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium">{event.prospectName}</div>
                      <div className="text-sm text-muted-foreground">
                        {INTERVENTION_TYPE_LABELS[event.interventionType as keyof typeof INTERVENTION_TYPE_LABELS]}
                      </div>
                    </div>
                    <Badge variant={event.status === 'fait' ? 'default' : 'secondary'}>
                      {INTERVENTION_STATUS_LABELS[event.status as keyof typeof INTERVENTION_STATUS_LABELS]}
                    </Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {events.filter((e) => e.status === 'a_faire').length}
            </div>
            <div className="text-sm text-muted-foreground">À faire</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {events.filter((e) => e.status === 'fait').length}
            </div>
            <div className="text-sm text-muted-foreground">Terminées</div>
          </Card>
        </div>
      </div>
    </div>
  );
}
