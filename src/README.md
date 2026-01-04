# QubeSec: Quantum-Safe Security for Kubernetes

<div style="text-align: center; margin: 3em 0;">
  <img src="https://raw.githubusercontent.com/QubeSec/QubeSec/refs/heads/main/assets/qubesec.png" alt="QubeSec Logo" width="250" style="filter: drop-shadow(0 4px 15px rgba(0, 217, 255, 0.3));">
</div>

<div class="hero">
  <h1 class="hero-title">Secure Your Kubernetes Against Quantum Threats</h1>
  <p class="hero-subtitle">Post-quantum cryptography operator providing quantum-safe key generation, key encapsulation, digital signatures, and X.509 certificates</p>
  
  <div class="cta-buttons">
    <a href="./quickstart.html" class="btn">🚀 Get Started</a>
    <a href="./architecture.html" class="btn btn-secondary">📚 Learn Architecture</a>
    <a href="https://github.com/QubeSec/QubeSec" class="btn btn-secondary">⭐ GitHub</a>
  </div>
</div>

---

## 🎯 The Quantum Threat is Real

Quantum computers pose an **existential threat** to modern cryptography. Governments worldwide have issued official directives:

| Authority | Directive | Year |
|-----------|-----------|------|
| **White House/OMB** | [M-23-02: Migrate to PQC](https://www.whitehouse.gov/wp-content/uploads/2022/11/M-23-02-M-Memo-on-Migrating-to-Post-Quantum-Cryptography.pdf) | 2022 |
| **NSA/CISA/NIST** | [Quantum Readiness Resource](https://www.cisa.gov/news-events/news/cisa-nsa-and-nist-publish-new-resource-migrating-post-quantum-cryptography) | 2023 |
| **UK NCSC** | [PQC Migration Timelines](https://www.ncsc.gov.uk/whitepaper/next-steps-preparing-for-post-quantum-cryptography) | 2024 |
| **DoD/NSA** | [CNSA Suite 2.0](https://media.defense.gov/2022/Sep/07/2003071836/-1/-1/0/CSI_CNSA_2.0_FAQ_.PDF) | 2024 |

**The time to act is NOW.** Don't wait for quantum computers to become operational.

---

## ✨ What is QubeSec?

QubeSec is a **Kubernetes operator** that automates post-quantum cryptographic operations through native custom resources. It implements NIST-standardized quantum-safe algorithms:

<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 2rem; margin: 2rem 0; padding: 2rem; background: rgba(0, 217, 255, 0.05); border-radius: 10px; border: 1px solid rgba(0, 217, 255, 0.2);">
  <div style="text-align: center;">
    <div style="font-size: 2.5rem; font-weight: 900; color: #00d9ff; margin-bottom: 0.5rem;">9</div>
    <div style="font-size: 0.95rem; color: #94a3b8;">Custom Resources</div>
  </div>
  <div style="text-align: center;">
    <div style="font-size: 2.5rem; font-weight: 900; color: #00d9ff; margin-bottom: 0.5rem;">4</div>
    <div style="font-size: 0.95rem; color: #94a3b8;">Algorithm Families</div>
  </div>
  <div style="text-align: center;">
    <div style="font-size: 2.5rem; font-weight: 900; color: #00d9ff; margin-bottom: 0.5rem;">100%</div>
    <div style="font-size: 0.95rem; color: #94a3b8;">NIST Approved</div>
  </div>
  <div style="text-align: center;">
    <div style="font-size: 2.5rem; font-weight: 900; color: #00d9ff; margin-bottom: 0.5rem;">∞</div>
    <div style="font-size: 0.95rem; color: #94a3b8;">Years of Security</div>
  </div>
</div>



### Core Features

<div class="feature-grid">
  <div class="feature-card">
    <h3>🔐 Key Generation</h3>
    <p>Generate Kyber KEMs and Dilithium/Falcon/SPHINCS+ signature keypairs with NIST-standardized algorithms.</p>
  </div>
  
  <div class="feature-card">
    <h3>🔄 Key Exchange</h3>
    <p>Implement quantum-safe Kyber-based key encapsulation and decapsulation for secure secret sharing.</p>
  </div>
  
  <div class="feature-card">
    <h3>✍️ Digital Signatures</h3>
    <p>Sign and verify messages with post-quantum algorithms resistant to quantum computing attacks.</p>
  </div>
  
  <div class="feature-card">
    <h3>📜 Certificates</h3>
    <p>Create X.509 certificates with Dilithium or Falcon for TLS, mTLS, and authentication.</p>
  </div>
  
  <div class="feature-card">
    <h3>🎲 Random Numbers</h3>
    <p>Generate cryptographically secure random bytes for keys, nonces, IVs, and other crypto operations.</p>
  </div>
  
  <div class="feature-card">
    <h3>🔑 Key Derivation</h3>
    <p>Transform shared secrets into usable AES-256 keys using HKDF-SHA256 key derivation.</p>
  </div>
</div>

---

## 📊 NIST-Approved Algorithms

<span class="badge badge-nist">✅ NIST Standardized</span>

### Key Encapsulation Mechanism (KEM)
- **Kyber-512** (ML-KEM-512) — AES-128 security level
- **Kyber-768** (ML-KEM-768) — AES-192 security level  
- **Kyber-1024** (ML-KEM-1024) — AES-256 security level

### Digital Signatures
- **ML-DSA-44** (Dilithium2) — AES-128 security level
- **ML-DSA-65** (Dilithium3) — AES-192 security level
- **ML-DSA-87** (Dilithium5) — AES-256 security level
- **Falcon-512** — AES-128 security level
- **Falcon-1024** — AES-256 security level
- **SPHINCS+-SHA2** — Hash-based signatures

### Key Derivation
- **HKDF-SHA256** — Industry-standard KDF

---

## ⚡ 30-Second Example

Implement quantum-safe key exchange in 3 Kubernetes resources:

```yaml
# 1️⃣ Alice generates a keypair
apiVersion: qubessec.io/v1
kind: QuantumKEMKeyPair
metadata:
  name: alice-keypair
spec:
  algorithm: Kyber1024

---
# 2️⃣ Bob encapsulates using Alice's public key
apiVersion: qubessec.io/v1
kind: QuantumEncapsulateSecret
metadata:
  name: bob-secret
spec:
  algorithm: Kyber1024
  publicKeyRef:
    name: alice-keypair

---
# 3️⃣ Both derive the same AES-256 encryption key
apiVersion: qubessec.io/v1
kind: QuantumDerivedKey
metadata:
  name: shared-encryption-key
spec:
  sharedSecretRef:
    name: bob-secret
  keyLength: 32
```

Result: **Both Alice and Bob have identical encryption keys**, established using post-quantum Kyber! 🎉

---

## 🚀 Quick Start

### Prerequisites
- Kubernetes 1.20+
- `kubectl` configured
- QubeSec operator installed

### Installation

```bash
# Using Helm (recommended)
helm repo add qubesec https://qubesec.github.io/helm-charts
helm install qubesec qubesec/qubesec -n qubesec-system --create-namespace

# Verify
kubectl get deployment -n qubesec-system qubesec-controller-manager
```

### Your First Resource

```bash
# Generate random bytes
cat <<EOF | kubectl apply -f -
apiVersion: qubessec.io/v1
kind: QuantumRandomNumber
metadata:
  name: my-random
spec:
  numBytes: 32
EOF

# Watch creation
kubectl get qrn my-random -w

# Retrieve the data
kubectl get secret my-random -o jsonpath='{.data.random}' | base64 -d | xxd
```

---

## 📚 Documentation Roadmap

<div class="timeline">
  <div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content">
      <h3>Getting Started</h3>
      <p><a href="./quickstart.html">Quick Start & Examples</a> — Installation and 5 progressive examples to get you running in minutes.</p>
    </div>
  </div>
  
  <div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content">
      <h3>Core Guides</h3>
      <ul>
        <li><a href="./qrng.html">Quantum Random Number Generation</a> — Cryptographically secure random bytes</li>
        <li><a href="./keyexchange.html">Key Exchange Guide</a> — Complete Kyber KEM workflows</li>
        <li><a href="./signatures.html">Digital Signatures</a> — Sign and verify with post-quantum algorithms</li>
        <li><a href="./certificates.html">Post-Quantum Certificates</a> — Create X.509 certificates</li>
      </ul>
    </div>
  </div>
  
  <div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content">
      <h3>Deep Dives</h3>
      <ul>
        <li><a href="./architecture.html">Architecture & Design</a> — System design and data flows</li>
        <li><a href="./api-reference.html">API Reference</a> — Complete CRD specifications</li>
      </ul>
    </div>
  </div>
</div>

---

## 🔗 Why Post-Quantum Cryptography?

### The Quantum Computing Threat

Traditional cryptographic algorithms (RSA, ECC) rely on mathematical problems that are **hard for classical computers** but **easy for quantum computers**:

- **RSA-2048**: Breakable by quantum computers in hours
- **ECDSA-256**: Vulnerable to quantum algorithms
- **Post-Quantum Algorithms**: Remain secure even with quantum computers

### The "Harvest Now, Decrypt Later" Attack

Adversaries are **collecting encrypted data today** to decrypt once quantum computers become operational. This includes:

- ✗ Your encrypted databases
- ✗ Sensitive communications
- ✗ Customer data
- ✗ Trade secrets

**The only defense: Migrate to post-quantum cryptography NOW.**

### QubeSec's Solution

✅ **NIST-standardized algorithms** approved in 2024  
✅ **Automated deployment** through Kubernetes  
✅ **Zero trust integration** with native Secrets  
✅ **Seamless scaling** across your cluster  
✅ **Future-proof security** for decades  

---

## 🎯 Use Cases

### 1. Secure Kubernetes Communication
Replace TLS certificates with quantum-safe X.509 certificates signed by Dilithium.

### 2. Encryption Key Management
Use Kyber KEM for secure key exchange and HKDF for key derivation.

### 3. Code & Container Signing
Sign container images and deployments with post-quantum digital signatures.

### 4. mTLS with Post-Quantum
Secure service-to-service communication with quantum-resistant authentication.

### 5. Hybrid Cryptography
Mix classical and post-quantum algorithms during transition period.

### 6. Compliance & Auditing
Meet regulatory requirements for quantum-safe cryptography (NIST, CNSA Suite 2.0).

---

## 🛡️ Security Guarantees

### Key Storage
- ✅ Keys stored in encrypted Kubernetes Secrets
- ✅ ETCD encryption at rest
- ✅ RBAC-based access control
- ✅ Audit logging of all operations

### Algorithms
- ✅ NIST-standardized post-quantum algorithms
- ✅ Lattice-based (Kyber, Dilithium, Falcon)
- ✅ Hash-based (SPHINCS+)
- ✅ 20+ years of cryptanalysis

### Auditability
- ✅ SHA256 fingerprints for verification
- ✅ Cross-resource validation
- ✅ Immutable audit trails
- ✅ No key material in logs

---

## 🌍 Ecosystem Integration

### With Kubernetes
- Native CRDs and controllers
- Owned resource cleanup via garbage collection
- Cross-namespace references
- RBAC-based access control

### With External Systems
- External Secrets Operator integration
- HashiCorp Vault support
- AWS Secrets Manager compatibility
- Prometheus metrics

### With Cloud Platforms
- Multi-cloud deployments
- Managed Kubernetes (EKS, GKE, AKS)
- Hybrid on-prem/cloud setups

---

## 📊 Comparison: Classical vs Post-Quantum

| Feature | RSA/ECDSA | QubeSec (Post-Quantum) |
|---------|-----------|----------------------|
| **Quantum Safe** | ❌ No | ✅ Yes |
| **NIST Approved** | ✅ Yes (Legacy) | ✅ Yes (2024) |
| **Key Size** | 2048-4096 bits | 2688-4096 bytes |
| **Performance** | Fast | Slightly Slower |
| **Proven Security** | Yes | 20+ years of research |
| **Future-Proof** | ❌ No | ✅ Yes |

---

## 🚀 Get Started Today

<div class="cta-buttons" style="margin-top: 2em;">
  <a href="./quickstart.html" class="btn">🚀 Start with Quick Start</a>
  <a href="./keyexchange.html" class="btn">🔄 Explore Key Exchange</a>
  <a href="./architecture.html" class="btn">📐 Understand Architecture</a>
  <a href="https://github.com/QubeSec/QubeSec" class="btn btn-secondary">⭐ Star on GitHub</a>
</div>

---

## 📖 Full Documentation

This mdbook contains comprehensive guides for all QubeSec resources:

- **[Quick Start & Examples](./quickstart.html)** — Get running in 5 minutes
- **[Quantum Random Numbers](./qrng.html)** — Generate secure randomness
- **[Key Exchange Guide](./keyexchange.html)** — Kyber KEM workflows
- **[Digital Signatures](./signatures.html)** — Post-quantum signing
- **[Certificates](./certificates.html)** — X.509 certificate generation
- **[Architecture & Design](./architecture.html)** — System internals
- **[API Reference](./api-reference.html)** — Complete CRD specs

---

## 🔗 Resources & References

- **[Open Quantum Safe Project](https://openquantumsafe.org/)** — Reference implementations
- **[Post-Quantum Cryptography Alliance](https://pqca.org/)** — Industry standards
- **[NIST Post-Quantum Cryptography](https://csrc.nist.gov/projects/post-quantum-cryptography/)** — Official standards
- **[liboqs](https://github.com/open-quantum-safe/liboqs)** — Quantum-safe library
- **[OQS-Provider for OpenSSL](https://github.com/open-quantum-safe/oqs-provider)** — OpenSSL integration

---

## 📝 License & Support

QubeSec is open-source and community-driven. For support:

- 🐛 **Issues**: [GitHub Issues](https://github.com/QubeSec/QubeSec/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/QubeSec/QubeSec/discussions)
- 📧 **Contact**: [QubeSec Team](https://github.com/QubeSec)

---

<div style="text-align: center; margin-top: 3em; padding-top: 2em; border-top: 1px solid rgba(0, 217, 255, 0.2);">
  <p style="color: var(--text-muted);">Made with ❤️ for a quantum-safe future</p>
  <p style="font-size: 0.9em; color: var(--text-muted);">QubeSec © 2025 | <a href="https://github.com/QubeSec/QubeSec">GitHub</a> | <a href="https://qubesec.github.io">Documentation</a></p>
</div>
