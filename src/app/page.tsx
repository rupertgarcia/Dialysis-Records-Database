'use client';

export const dynamic = 'force-dynamic';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Patient } from '@/lib/types';
import PatientCard from '@/components/PatientCard';
import AddPatientModal from '@/components/AddPatientModal';

export default function DashboardPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('full_name', { ascending: true });

    if (!error && data) setPatients(data as Patient[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const filtered = patients.filter((p) =>
    p.full_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      {/* ── Page Shell ── */}
      <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
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
            className="container"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '18px 24px',
              maxWidth: 1280,
              margin: '0 auto',
              width: '100%',
            }}
          >
            {/* Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  background: 'var(--color-accent)',
                  borderRadius: 8,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                  <path d="M9 2a7 7 0 100 14A7 7 0 009 2z" stroke="white" strokeWidth="1.5"/>
                  <path d="M9 5.5v4l2.5 1.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <h1
                  style={{
                    fontSize: '1rem',
                    fontWeight: 700,
                    letterSpacing: '-0.01em',
                    lineHeight: 1.2,
                  }}
                >
                  Clinical Records
                </h1>
                <p style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1 }}>
                  Dialysis Unit
                </p>
              </div>
            </div>

            {/* Actions */}
            <button
              id="open-add-patient-modal"
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              Add New Patient
            </button>
          </div>
        </header>

        {/* ── Main Content ── */}
        <main
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '32px 24px',
            flex: 1,
            width: '100%',
          }}
        >
          {/* Page Title + Search */}
          <div style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 4 }}>
              Patient Registry
            </h2>
            <p style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>
              {patients.length} patient{patients.length !== 1 ? 's' : ''} enrolled
            </p>

            {/* Search */}
            <div style={{ position: 'relative', maxWidth: 400 }}>
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--color-text-muted)',
                  pointerEvents: 'none',
                }}
              >
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <input
                id="patient-search"
                type="text"
                placeholder="Search patients by name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: 38 }}
                aria-label="Search patients"
              />
            </div>
          </div>

          {/* ── Grid ── */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Loading patients…
              </p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">{search ? '🔍' : '🏥'}</div>
              <p style={{ fontWeight: 600, margin: 0 }}>
                {search ? 'No patients match your search' : 'No patients yet'}
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
                {search
                  ? 'Try a different name.'
                  : 'Click "Add New Patient" to enroll your first patient.'}
              </p>
            </div>
          ) : (
            <div className="patient-grid">
              {filtered.map((patient) => (
                <PatientCard
                  key={patient.id}
                  patient={patient}
                  onClick={() => router.push(`/patients/${patient.id}`)}
                />
              ))}
            </div>
          )}
        </main>

        {/* ── Footer ── */}
        <footer
          style={{
            borderTop: '1px solid var(--color-border)',
            padding: '24px',
            textAlign: 'center',
            fontSize: '0.825rem',
            color: 'var(--color-text-muted)',
            background: 'var(--color-surface)',
          }}
        >
          <div className="container" style={{ maxWidth: 1280, margin: '0 auto', width: '100%' }}>
            <p style={{ margin: 0, fontWeight: 500 }}>
              Created by <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>Trepurtech</span> 2026
            </p>
          </div>
        </footer>
      </div>

      {/* ── Modal ── */}
      {showModal && (
        <AddPatientModal
          onClose={() => setShowModal(false)}
          onSuccess={fetchPatients}
        />
      )}
    </>
  );
}
