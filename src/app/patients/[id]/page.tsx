'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Patient, DialysisRecord } from '@/lib/types';
import { computeAge, formatBirthDate } from '@/lib/utils';
import SessionForm from '@/components/SessionForm';
import RecordsTable from '@/components/RecordsTable';
import ScheduleBadges from '@/components/ScheduleBadges';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.id as string;

  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<DialysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchPatient = useCallback(async () => {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();

    if (error || !data) { setNotFound(true); setLoading(false); return; }
    setPatient(data as Patient);
  }, [patientId]);

  const fetchRecords = useCallback(async () => {
    const { data } = await supabase
      .from('dialysis_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('date', { ascending: false });

    setRecords((data as DialysisRecord[]) ?? []);
    setLoading(false);
  }, [patientId]);

  useEffect(() => {
    fetchPatient();
    fetchRecords();
  }, [fetchPatient, fetchRecords]);

  const refresh = useCallback(() => fetchRecords(), [fetchRecords]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="loading-state">
          <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Loading patient data…
          </p>
        </div>
      </div>
    );
  }

  if (notFound || !patient) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'var(--color-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div className="empty-state">
          <div className="empty-state-icon">❓</div>
          <p style={{ fontWeight: 600 }}>Patient not found</p>
          <button className="btn btn-secondary" onClick={() => router.push('/')}>
            ← Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const age = computeAge(patient.birth_date);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {/* ── Top Bar ── */}
      <header
        style={{
          background: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '14px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <button
            id="back-to-dashboard"
            className="btn btn-ghost btn-sm"
            onClick={() => router.push('/')}
            style={{ display: 'flex', alignItems: 'center', gap: 6 }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Dashboard
          </button>
          <span style={{ color: 'var(--color-border)', fontSize: '1rem' }}>/</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
            {patient.full_name}
          </span>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>

        {/* ── Patient Profile Header ── */}
        <div
          className="card"
          style={{
            marginBottom: 28,
            background: 'var(--color-surface)',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            gap: 32,
            alignItems: 'start',
          }}
        >
          {/* Left: Patient Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: '50%',
                  background: 'var(--color-accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.125rem',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                {patient.full_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 2 }}>
                  {patient.full_name}
                </h1>
                <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0 }}>
                  Patient ID: <code style={{ fontSize: '0.75rem' }}>{patient.id.slice(0, 8)}…</code>
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: 32,
                marginTop: 16,
                paddingTop: 16,
                borderTop: '1px solid var(--color-border-light)',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  Age
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1 }}>
                  {age}
                  <span style={{ fontSize: '0.875rem', fontWeight: 400, color: 'var(--color-text-muted)', marginLeft: 4 }}>yrs</span>
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  Date of Birth
                </p>
                <p style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
                  {formatBirthDate(patient.birth_date)}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 4 }}>
                  Sessions Logged
                </p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, lineHeight: 1 }}>
                  {records.length}
                </p>
              </div>
            </div>
          </div>

          {/* Right: Dry Weight + Schedule */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
              minWidth: 200,
              paddingLeft: 32,
              borderLeft: '1px solid var(--color-border)',
            }}
          >
            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 6 }}>
                Dry Weight
              </p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                <span style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, color: 'var(--color-text-primary)' }}>
                  {patient.dry_weight}
                </span>
                <span style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>kg</span>
              </div>
            </div>

            <div>
              <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-muted)', marginBottom: 8 }}>
                Scheduled Days
              </p>
              <ScheduleBadges schedule={patient.schedule} showAll />
            </div>
          </div>
        </div>

        {/* ── Split Layout: Form + Table ── */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '340px 1fr',
            gap: 24,
            alignItems: 'start',
          }}
        >
          <SessionForm patient={patient} onSuccess={refresh} />
          <RecordsTable patient={patient} records={records} />
        </div>
      </main>
    </div>
  );
}
