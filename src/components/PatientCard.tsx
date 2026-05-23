'use client';

import { Patient } from '@/lib/types';
import { computeAge } from '@/lib/utils';
import ScheduleBadges from './ScheduleBadges';

interface PatientCardProps {
  patient: Patient;
  onClick: () => void;
}

export default function PatientCard({ patient, onClick }: PatientCardProps) {
  const age = computeAge(patient.birth_date);

  return (
    <div
      className="card card-hover"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 2 }}>
            {patient.full_name}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
            {age} years old
          </p>
        </div>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 4,
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '4px 10px',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--color-text-secondary)',
          }}
        >
          <span style={{ fontSize: '0.65rem', opacity: 0.6 }}>DW</span>
          {patient.dry_weight} kg
        </span>
      </div>

      {/* Divider */}
      <div style={{ borderTop: '1px solid var(--color-border-light)' }} />

      {/* Schedule */}
      <div>
        <p
          style={{
            fontSize: '0.65rem',
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
            marginBottom: 8,
          }}
        >
          Schedule
        </p>
        <ScheduleBadges schedule={patient.schedule} />
      </div>

      {/* View indicator */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--color-text-muted)',
          marginTop: 'auto',
        }}
      >
        View records
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 6h8M6 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </div>
  );
}
