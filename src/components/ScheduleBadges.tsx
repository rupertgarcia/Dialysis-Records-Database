'use client';

const ALL_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface ScheduleBadgesProps {
  schedule: string[];
  showAll?: boolean;
}

export default function ScheduleBadges({ schedule, showAll = false }: ScheduleBadgesProps) {
  if (showAll) {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {ALL_DAYS.map((day) => (
          <span
            key={day}
            className={schedule.includes(day) ? 'badge badge-day' : 'badge badge-day-inactive'}
          >
            {day}
          </span>
        ))}
      </div>
    );
  }

  const active = schedule.filter((d) => ALL_DAYS.includes(d));
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
      {active.map((day) => (
        <span key={day} className="badge badge-day">
          {day}
        </span>
      ))}
    </div>
  );
}
