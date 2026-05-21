import { BrainCircuit, FileText, Send } from 'lucide-react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function AIDrafting() {
  const [draftType, setDraftType] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);

  const draftTemplates = [
    { id: 'barangay-clearance', label: 'Barangay Clearance', desc: 'Generate clearance documents' },
    { id: 'certificate-residency', label: 'Certificate of Residency', desc: 'Create residency certificates' },
    { id: 'ordinance', label: 'Ordinance', desc: 'Draft barangay ordinances' },
    { id: 'letter', label: 'Official Letter', desc: 'Generate official letters' },
    { id: 'report', label: 'Monthly Report', desc: 'Create monthly reports' },
    { id: 'resolution', label: 'Resolution', desc: 'Draft resolutions' },
  ];

  const handleDraft = async (type) => {
    setLoading(true);
    try {
      // Simulate AI drafting
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const templates = {
        'barangay-clearance': 'BARANGAY CLEARANCE\n\nTO WHOM IT MAY CONCERN:\n\nThis is to certify that [NAME] of [ADDRESS] is a bonafide resident of this barangay and has not been convicted of any crime...',
        'certificate-residency': 'CERTIFICATE OF RESIDENCY\n\nTO WHOM IT MAY CONCERN:\n\nThis is to certify that [NAME] is a bonafide resident of [BARANGAY]...',
        'ordinance': 'ORDINANCE NO. ____\n\nAN ORDINANCE [TITLE]\n\nWHEREAS, [PREAMBLE];\n\nBE IT ORDAINED BY THE SANGGUNIANG BARANGAY OF [BARANGAY]:',
        'letter': '[DATE]\n\n[RECIPIENT NAME]\n[RECIPIENT ADDRESS]\n\nDear [RECIPIENT],\n\n[BODY]\n\nRespectfully yours,\n\n[SENDER NAME]\n[POSITION]',
        'report': 'MONTHLY REPORT - [MONTH]\n\n1. OVERVIEW\n[Summary of activities]\n\n2. ACCOMPLISHMENTS\n[List of accomplishments]\n\n3. CHALLENGES\n[Challenges faced]\n\n4. RECOMMENDATIONS\n[Recommendations]',
        'resolution': 'RESOLUTION NO. ____\n\nA RESOLUTION [SUBJECT]\n\nWHEREAS, [PREAMBLE];\n\nBE IT RESOLVED BY THE SANGGUNIANG BARANGAY OF [BARANGAY]:',
      };

      setContent(templates[type] || 'Draft generated.');
      setDraftType(type);
      toast.success('Draft generated successfully!');
    } catch (err) {
      toast.error('Failed to generate draft');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">
            <BrainCircuit size={24} style={{ marginRight: '0.5rem' }} />
            AI Smart Drafting
          </h1>
          <div className="page-subtitle">Intelligently generate documents with AI assistance</div>
        </div>
      </div>

      <div className="page-content">
        {/* Templates Grid */}
        {!content && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem', color: '#1e293b' }}>
              Select Document Type
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {draftTemplates.map(template => (
                <button
                  key={template.id}
                  onClick={() => handleDraft(template.id)}
                  disabled={loading}
                  style={{
                    padding: '1.25rem',
                    background: '#fff',
                    border: '2px solid #e2e8f0',
                    borderRadius: 12,
                    cursor: loading ? 'not-allowed' : 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s',
                    opacity: loading ? 0.6 : 1,
                  }}
                  onMouseEnter={(e) => {
                    if (!loading) {
                      e.currentTarget.style.borderColor = '#1a4f8a';
                      e.currentTarget.style.background = '#eff6ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.background = '#fff';
                  }}
                >
                  <FileText size={28} style={{ margin: '0 auto 0.5rem', color: '#1a4f8a' }} />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1e293b', marginBottom: '0.25rem' }}>
                    {template.label}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                    {template.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Draft Output */}
        {content && (
          <div style={{
            background: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: 12,
            padding: '1.5rem',
            marginBottom: '1rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b' }}>
                Generated Draft
              </h2>
              <button
                onClick={() => {
                  setContent('');
                  setDraftType('');
                }}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#f1f5f9',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  color: '#64748b'
                }}
              >
                New Draft
              </button>
            </div>

            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              style={{
                width: '100%',
                minHeight: '300px',
                padding: '1rem',
                border: '1px solid #e2e8f0',
                borderRadius: 8,
                fontFamily: 'monospace',
                fontSize: '0.9rem',
                lineHeight: '1.5',
                marginBottom: '1rem',
                resize: 'vertical'
              }}
            />

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.75rem 1.5rem',
                  background: '#1a4f8a',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
                onClick={() => {
                  toast.success('Draft copied to clipboard!');
                  navigator.clipboard.writeText(content);
                }}
              >
                <Send size={16} />
                Copy Draft
              </button>
              <button
                style={{
                  padding: '0.75rem 1.5rem',
                  background: '#e2e8f0',
                  color: '#1e293b',
                  border: 'none',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: '0.9rem'
                }}
                onClick={() => {
                  const element = document.createElement('a');
                  element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(content));
                  element.setAttribute('download', `draft_${draftType}.txt`);
                  element.style.display = 'none';
                  document.body.appendChild(element);
                  element.click();
                  document.body.removeChild(element);
                  toast.success('Draft downloaded!');
                }}
              >
                Download
              </button>
            </div>
          </div>
        )}

        {/* Info Section */}
        <div style={{
          background: '#eff6ff',
          border: '1px solid #93c5fd',
          borderRadius: 12,
          padding: '1rem',
          color: '#1e40af'
        }}>
          <strong>💡 Tip:</strong> The AI will generate a template based on your selected document type. You can edit and customize the content before saving or downloading.
        </div>
      </div>
    </div>
  );
}
