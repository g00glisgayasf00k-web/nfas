'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'

const DOC_TYPES = [
  {
    key:         'public_liability',
    label:       'Public Liability Insurance',
    description: 'Certificate showing cover of at least £1m',
    required:    true,
    icon:        '🛡️',
  },
  {
    key:         'dbs',
    label:       'DBS Certificate',
    description: 'Enhanced DBS check (within last 3 years)',
    required:    true,
    icon:        '📋',
  },
  {
    key:         'driving_licence',
    label:       'Driving Licence',
    description: 'Front of your valid UK driving licence',
    required:    false,
    icon:        '🪪',
  },
  {
    key:         'photo',
    label:       'Profile Photo',
    description: 'Clear photo of your face — shown to customers',
    required:    false,
    icon:        '📸',
  },
]

interface Doc {
  doc_type: string
  status:   'pending' | 'approved' | 'rejected'
  created_at: string
}

interface DocumentUploadProps {
  existingDocs: Doc[]
  fitterId: string
}

export function DocumentUpload({ existingDocs, fitterId }: DocumentUploadProps) {
  const router   = useRouter()
  const [uploading, setUploading] = useState<string | null>(null)
  const [errors,    setErrors]    = useState<Record<string, string>>({})
  const [success,   setSuccess]   = useState<Record<string, boolean>>({})
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const getDoc = (key: string) => existingDocs.find(d => d.doc_type === key)

  const handleUpload = async (docType: string, file: File) => {
    if (!file) return
    setUploading(docType)
    setErrors(e => ({ ...e, [docType]: '' }))

    const form = new FormData()
    form.append('file',     file)
    form.append('doc_type', docType)

    const res  = await fetch('/api/fitters/documents', { method: 'POST', body: form })
    const data = await res.json()
    setUploading(null)

    if (!res.ok) {
      setErrors(e => ({ ...e, [docType]: data.error ?? 'Upload failed.' }))
      return
    }

    setSuccess(s => ({ ...s, [docType]: true }))
    router.refresh()
  }

  const statusBadge = (status: string) => {
    const styles: Record<string, { bg: string; color: string; label: string }> = {
      pending:  { bg: '#fef3c7', color: '#92400e', label: '⏳ Pending Review' },
      approved: { bg: '#dcfce7', color: '#15803d', label: '✓ Approved' },
      rejected: { bg: '#fee2e2', color: '#dc2626', label: '✗ Rejected — Please re-upload' },
    }
    const s = styles[status] ?? styles.pending
    return (
      <span style={{ background: s.bg, color: s.color, padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 700 }}>
        {s.label}
      </span>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 12, padding: '14px 18px', fontSize: 13, color: '#1e40af', lineHeight: 1.6 }}>
        <strong>Verification required:</strong> Upload your documents below to get your account verified. Most reviews are completed within 48 hours.
      </div>

      {DOC_TYPES.map(doc => {
        const existing  = getDoc(doc.key)
        const isLoading = uploading === doc.key
        const uploaded  = success[doc.key]

        return (
          <div key={doc.key} style={{ background: '#fff', border: `1px solid ${existing?.status === 'approved' ? '#bbf7d0' : '#e8ecf0'}`, borderRadius: 14, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20 }}>{doc.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: '#0a1628', display: 'flex', alignItems: 'center', gap: 6 }}>
                    {doc.label}
                    {doc.required && <span style={{ background: '#fee2e2', color: '#dc2626', fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 999 }}>Required</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{doc.description}</div>
                </div>
              </div>
              {existing && statusBadge(existing.status)}
            </div>

            {errors[doc.key] && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#dc2626', marginBottom: 10 }}>
                {errors[doc.key]}
              </div>
            )}

            {uploaded && !errors[doc.key] && (
              <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '8px 12px', fontSize: 12, color: '#15803d', marginBottom: 10, fontWeight: 600 }}>
                ✓ Uploaded — pending review
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <input
                ref={el => { inputRefs.current[doc.key] = el }}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                style={{ display: 'none' }}
                onChange={e => {
                  const file = e.target.files?.[0]
                  if (file) handleUpload(doc.key, file)
                }}
              />
              <button
                onClick={() => inputRefs.current[doc.key]?.click()}
                disabled={isLoading || existing?.status === 'approved'}
                style={{
                  padding: '8px 18px',
                  background: existing?.status === 'approved' ? '#f0fdf4' : '#0a1628',
                  color:  existing?.status === 'approved' ? '#15803d' : '#fff',
                  border: existing?.status === 'approved' ? '1px solid #bbf7d0' : 'none',
                  borderRadius: 8, fontSize: 12, fontWeight: 700,
                  cursor: isLoading || existing?.status === 'approved' ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  opacity: isLoading ? 0.7 : 1,
                  transition: 'all 0.15s',
                }}
              >
                {isLoading
                  ? 'Uploading…'
                  : existing?.status === 'approved'
                  ? '✓ Approved'
                  : existing
                  ? '↑ Re-upload'
                  : '↑ Upload'}
              </button>
              <span style={{ fontSize: 11, color: '#94a3b8' }}>PDF, JPG or PNG · Max 10MB</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
