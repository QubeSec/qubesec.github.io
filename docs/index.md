---
id: index
title: "QubeSec - Quantum-Safe Security for Kubernetes"
description: "NIST-standardized post-quantum cryptography for Kubernetes. Protect your applications with Kyber (ML-KEM), Dilithium (ML-DSA), and quantum-resistant algorithms."
slug: /
keywords:
  - post-quantum cryptography
  - kubernetes security
  - quantum-safe
  - kyber
  - dilithium
  - ML-KEM
  - ML-DSA
  - NIST PQC
---

import CopyButton from '@site/src/components/CopyButton';

<div className="new-homepage">
  {/* Hero Section */}
  <section className="new-hero">
    <div className="hero-background">
      <div className="hero-grid"></div>
      <div className="hero-glow hero-glow-1"></div>
      <div className="hero-glow hero-glow-2"></div>
    </div>
    
    <div className="hero-container">
      <div className="hero-badge">
        <span className="badge-dot"></span>
        <span>NIST-Standardized • Production-Ready</span>
      </div>
      
      <h1 className="hero-title">
        Quantum-Safe Security
        <span className="hero-gradient-text">for Kubernetes</span>
      </h1>
      
      <p className="hero-subtitle">
        Deploy post-quantum cryptography with a single kubectl command.
        Protect your cluster with ML-KEM, ML-DSA, and quantum-resistant algorithms.
      </p>
      
      <div className="hero-cta">
        <a href="/quickstart" className="cta-primary">Get Started →</a>
        <a href="https://github.com/QubeSec/QubeSec" className="cta-secondary" target="_blank" rel="noopener noreferrer">⭐ Star on GitHub</a>
      </div>
      
      <div className="hero-install">
        <div className="install-header">
          <div className="install-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <span className="install-title">Quick Install</span>
          <CopyButton text="kubectl apply -f https://raw.githubusercontent.com/QubeSec/QubeSec/main/dist/install.yaml" />
        </div>
        <pre className="install-code">kubectl apply -f https://raw.githubusercontent.com/QubeSec/QubeSec/main/dist/install.yaml</pre>
      </div>
    </div>
  </section>

  {/* Stats Section */}
  <section className="stats-band">
    <div className="stats-container">
      <div className="stat-box">
        <div className="stat-value">9</div>
        <div className="stat-label">Custom Resources</div>
      </div>
      <div className="stat-divider"></div>
      <div className="stat-box">
        <div className="stat-value">4</div>
        <div className="stat-label">NIST Algorithms</div>
      </div>
      <div className="stat-divider"></div>
      <div className="stat-box">
        <div className="stat-value">100%</div>
        <div className="stat-label">K8s Native</div>
      </div>
      <div className="stat-divider"></div>
      <div className="stat-box">
        <div className="stat-value">∞</div>
        <div className="stat-label">Quantum-Safe</div>
      </div>
    </div>
  </section>

  {/* Features Section */}
  <section className="features-section">
    <div className="section-container">
      <div className="section-intro">
        <span className="section-label">Features</span>
        <h2 className="section-heading">Built for the Quantum Era</h2>
        <p className="section-text">
          Everything you need to secure your Kubernetes workloads against quantum threats
        </p>
      </div>

      <div className="features-layout">
        <div className="feature-box">
          <div className="feature-icon-box">
            <span className="feature-emoji">🔐</span>
          </div>
          <h3 className="feature-title">Post-Quantum Algorithms</h3>
          <p className="feature-desc">
            Kyber (ML-KEM), Dilithium (ML-DSA), Falcon, and SPHINCS+. 
            All NIST-standardized and battle-tested.
          </p>
        </div>

        <div className="feature-box feature-highlight">
          <div className="feature-icon-box">
            <span className="feature-emoji">☸️</span>
          </div>
          <h3 className="feature-title">Kubernetes Operator</h3>
          <p className="feature-desc">
            Native CRDs with reconciliation, status tracking, and GitOps integration. 
            Works like any other K8s resource.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon-box">
            <span className="feature-emoji">⚡</span>
          </div>
          <h3 className="feature-title">Simple YAML</h3>
          <p className="feature-desc">
            Declarative interface with zero learning curve. 
            Define crypto operations in YAML, let the operator handle the rest.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon-box">
            <span className="feature-emoji">🔑</span>
          </div>
          <h3 className="feature-title">Key Management</h3>
          <p className="feature-desc">
            Complete lifecycle management for keys, secrets, and certificates. 
            Generate, rotate, and revoke with ease.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon-box">
            <span className="feature-emoji">✍️</span>
          </div>
          <h3 className="feature-title">Digital Signatures</h3>
          <p className="feature-desc">
            Sign and verify with quantum-resistant algorithms. 
            Perfect for code signing and artifact verification.
          </p>
        </div>

        <div className="feature-box">
          <div className="feature-icon-box">
            <span className="feature-emoji">📜</span>
          </div>
          <h3 className="feature-title">X.509 Certificates</h3>
          <p className="feature-desc">
            Post-quantum TLS certificates for Ingress and mTLS. 
            Drop-in replacement for traditional PKI.
          </p>
        </div>
      </div>
    </div>
  </section>

  {/* Use Cases Section */}
  <section className="use-cases-section">
    <div className="section-container">
      <div className="section-intro">
        <span className="section-label">Use Cases</span>
        <h2 className="section-heading">Production-Ready Solutions</h2>
      </div>

      <div className="use-cases-grid">
        <div className="use-case-card">
          <div className="use-case-number">01</div>
          <div className="use-case-content">
            <h3>Key Exchange</h3>
            <p>Kyber-based key encapsulation for secure communication between services</p>
            <a href="/keyexchange" className="use-case-link">View documentation →</a>
          </div>
        </div>

        <div className="use-case-card">
          <div className="use-case-number">02</div>
          <div className="use-case-content">
            <h3>Digital Signatures</h3>
            <p>Dilithium signatures for message authentication and code signing</p>
            <a href="/signatures" className="use-case-link">View documentation →</a>
          </div>
        </div>

        <div className="use-case-card">
          <div className="use-case-number">03</div>
          <div className="use-case-content">
            <h3>TLS Certificates</h3>
            <p>Post-quantum X.509 certificates for Kubernetes Ingress and services</p>
            <a href="/certificates" className="use-case-link">View documentation →</a>
          </div>
        </div>

        <div className="use-case-card">
          <div className="use-case-number">04</div>
          <div className="use-case-content">
            <h3>Quantum Random Numbers</h3>
            <p>Generate cryptographically secure random data with quantum entropy sources</p>
            <a href="/qrng" className="use-case-link">View documentation →</a>
          </div>
        </div>
      </div>
    </div>
  </section>

  {/* Resources Section */}
  <section className="resources-section">
    <div className="section-container">
      <div className="section-intro">
        <span className="section-label">Resources</span>
        <h2 className="section-heading">Build, Learn, and Ship</h2>
      </div>
      <div className="resources-grid">
        <div className="resource-card resource-primary">
          <div className="resource-icon">📚</div>
          <h3>Guides & Reference</h3>
          <p>Comprehensive guides and API references</p>
          <ul className="resource-links">
            <li><a href="/quickstart">Quickstart Guide</a></li>
            <li><a href="/architecture">Architecture</a></li>
            <li><a href="/api-reference">API Reference</a></li>
          </ul>
        </div>

        <div className="resource-card">
          <div className="resource-icon">💡</div>
          <h3>Blueprints & Patterns</h3>
          <p>Real-world implementations and patterns</p>
          <ul className="resource-links">
            <li><a href="/keyexchange#complete-key-exchange-workflow">Key Exchange</a></li>
            <li><a href="/signatures#real-world-examples">Code Signing</a></li>
            <li><a href="/certificates#kubernetes-service-certificate">mTLS Setup</a></li>
          </ul>
        </div>

      </div>
    </div>
  </section>

  {/* Final CTA */}
  <section className="final-cta">
    <div className="cta-content-wrapper">
      <h2 className="cta-title">Ready to Secure Your Cluster?</h2>
      <p className="cta-text">Deploy quantum-safe cryptography in under 5 minutes</p>
      <div className="cta-actions">
        <a href="/quickstart" className="cta-primary-large">Get Started →</a>
        <a href="https://github.com/QubeSec/QubeSec" className="cta-secondary-large" target="_blank" rel="noopener noreferrer">View on GitHub</a>
      </div>
    </div>
  </section>
</div>
