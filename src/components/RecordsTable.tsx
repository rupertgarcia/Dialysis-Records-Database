'use client';

import { useState } from 'react';
import { DialysisRecord, Patient } from '@/lib/types';
import { formatDate, exportToCSV, exportToPDF } from '@/lib/utils';

interface RecordsTableProps {
  patient: Patient;
  records: DialysisRecord[];
}

const PAGE_SIZE = 20;

function getPageNumbers(current: number, total: number): (number | '…')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '…')[] = [];
  if (current <= 4) {
    pages.push(1, 2, 3, 4, 5, '…', total);
  } else if (current >= total - 3) {
    pages.push(1, '…', total - 4, total - 3, total - 2, total - 1, total);
  } else {
    pages.push(1, '…', current - 1, current, current + 1, '…', total);
  }
  return pages;
}

export default function RecordsTable({ patient, records }: RecordsTableProps) {
  const [page, setPage] = useState(1);

  const sorted = [...records].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageRecords = sorted.slice(start, start + PAGE_SIZE);

  const goTo = (p: number) => {
    if (p >= 1 && p <= totalPages) setPage(p);
  };

  const pageNumbers = getPageNumbers(safePage, totalPages);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Table Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid var(--color-border)',
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 2 }}>
            Session History
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
            {sorted.length} record{sorted.length !== 1 ? 's' : ''} — newest first
          </p>
        </div>

        {/* Export Buttons */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            id="export-csv-btn"
            className="btn btn-ghost btn-sm"
            onClick={() => exportToCSV(patient, sorted)}
            disabled={sorted.length === 0}
            title="Export all records as CSV"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v7.5M4 6.5l2.5 2 2.5-2M2 10.5h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Export CSV
          </button>
          <button
            id="export-pdf-btn"
            className="btn btn-ghost btn-sm"
            onClick={() => exportToPDF(patient, sorted)}
            disabled={sorted.length === 0}
            title="Download PDF report"
          >
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M2.5 1.5h5.5l2.5 2.5v7.5H2.5V1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M7.5 1.5v3h3" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M4.5 7h4M4.5 9h2.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            PDF Report
          </button>
        </div>
      </div>

      {/* Table */}
      {sorted.length === 0 ? (
        <div className="empty-state" style={{ padding: '48px 24px' }}>
          <div className="empty-state-icon">📋</div>
          <p style={{ fontWeight: 500, color: 'var(--color-text-secondary)', margin: 0 }}>
            No sessions logged yet
          </p>
          <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-muted)', margin: 0 }}>
            Use the form on the left to log the first session.
          </p>
        </div>
      ) : (
        <>
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Date</th>
                  <th>Pre-Weight</th>
                  <th>Pre-BP</th>
                  <th>UV (L)</th>
                  <th>Post-BP</th>
                  <th>Post-Weight</th>
                  <th>Dry Weight</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {pageRecords.map((record, idx) => (
                  <tr key={record.id}>
                    <td style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem', fontWeight: 500 }}>
                      {start + idx + 1}
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatDate(record.date)}</td>
                    <td>{record.pre_weight} kg</td>
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.8125rem',
                          background: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 4,
                          padding: '2px 6px',
                        }}
                      >
                        {record.pre_bp}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{record.uv}</span>
                    </td>
                    <td>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '0.8125rem',
                          background: 'var(--color-bg)',
                          border: '1px solid var(--color-border)',
                          borderRadius: 4,
                          padding: '2px 6px',
                        }}
                      >
                        {record.post_bp}
                      </span>
                    </td>
                    <td>{record.post_weight} kg</td>
                    <td>
                      <span
                        style={{
                          background: 'var(--color-accent-light)',
                          color: 'var(--color-accent)',
                          borderRadius: 4,
                          padding: '2px 8px',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                        }}
                      >
                        {record.dry_weight} kg
                      </span>
                    </td>
                    <td style={{ maxWidth: 200, whiteSpace: 'normal', fontSize: '0.8125rem' }}>
                      {record.notes || (
                        <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '14px 24px',
                borderTop: '1px solid var(--color-border)',
                flexWrap: 'wrap',
                gap: 12,
              }}
            >
              {/* Page info */}
              <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', margin: 0 }}>
                Showing{' '}
                <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  {start + 1}–{Math.min(start + PAGE_SIZE, sorted.length)}
                </span>{' '}
                of{' '}
                <span style={{ fontWeight: 600, color: 'var(--color-text-secondary)' }}>
                  {sorted.length}
                </span>{' '}
                sessions
              </p>

              {/* Page buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* Prev */}
                <button
                  id="page-prev-btn"
                  className="btn btn-ghost btn-sm"
                  onClick={() => goTo(safePage - 1)}
                  disabled={safePage === 1}
                  title="Previous page"
                  style={{ padding: '4px 8px', minWidth: 0 }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M8 2L4 6.5l4 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>

                {/* Numbered pages */}
                {pageNumbers.map((p, i) =>
                  p === '…' ? (
                    <span
                      key={`ellipsis-${i}`}
                      style={{
                        padding: '4px 2px',
                        fontSize: '0.8125rem',
                        color: 'var(--color-text-muted)',
                        userSelect: 'none',
                      }}
                    >
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      id={`page-btn-${p}`}
                      onClick={() => goTo(p as number)}
                      style={{
                        minWidth: 32,
                        height: 32,
                        borderRadius: 'var(--radius-md)',
                        border: safePage === p
                          ? '1px solid var(--color-accent)'
                          : '1px solid var(--color-border)',
                        background: safePage === p
                          ? 'var(--color-accent)'
                          : 'transparent',
                        color: safePage === p
                          ? 'white'
                          : 'var(--color-text-secondary)',
                        fontSize: '0.8125rem',
                        fontWeight: safePage === p ? 700 : 500,
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        padding: '0 6px',
                        fontFamily: 'inherit',
                      }}
                      onMouseEnter={(e) => {
                        if (safePage !== p) {
                          (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-bg)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (safePage !== p) {
                          (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
                        }
                      }}
                    >
                      {p}
                    </button>
                  )
                )}

                {/* Next */}
                <button
                  id="page-next-btn"
                  className="btn btn-ghost btn-sm"
                  onClick={() => goTo(safePage + 1)}
                  disabled={safePage === totalPages}
                  title="Next page"
                  style={{ padding: '4px 8px', minWidth: 0 }}
                >
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M5 2l4 4.5L5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
