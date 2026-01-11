import React, { useState } from 'react';

export default function CopyButton({ text = 'kubectl apply -f https://raw.githubusercontent.com/QubeSec/QubeSec/main/dist/install.yaml' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <button
      className="install-copy-btn"
      onClick={handleCopy}
      style={{
        background: 'rgba(255, 255, 255, 0.1)',
        color: 'white',
        border: '1px solid rgba(255, 255, 255, 0.3)',
        padding: '0.4rem 0.8rem',
        fontSize: '0.75rem',
        fontWeight: '600',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        marginLeft: '0.75rem',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {copied ? '✓ Copied!' : '📋 Copy'}
    </button>
  );
}
