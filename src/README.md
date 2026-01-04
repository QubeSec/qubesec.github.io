# QubeSec: Quantum-Safe Security for Kubernetes

<div align="center">
  <img src="https://raw.githubusercontent.com/QubeSec/QubeSec/refs/heads/main/assets/qubesec.png" alt="QubeSec Logo" width="300">
</div>

**A Kubernetes operator for post-quantum cryptography providing custom resource definitions (CRDs) and controllers for quantum-safe key generation, key encapsulation, key derivation, and certificate management.**

---

## 🚀 The Quantum Threat is Real

Quantum computing represents an existential threat to modern cryptography. Governments and cybersecurity agencies worldwide have issued official guidance directing organizations to begin migrating to post-quantum cryptography **now**:

- **White House/OMB (Nov 2022)**: [Memorandum M-23-02](https://www.whitehouse.gov/wp-content/uploads/2022/11/M-23-02-M-Memo-on-Migrating-to-Post-Quantum-Cryptography.pdf) - Federal agencies must prepare migration plans
- **NSA/CISA/NIST (Aug 2023)**: [Quantum Readiness Resource](https://www.cisa.gov/news-events/news/cisa-nsa-and-nist-publish-new-resource-migrating-post-quantum-cryptography) - Start inventory and planning now
- **UK NCSC (Aug 2024)**: [Next Steps in Preparing for PQC](https://www.ncsc.gov.uk/whitepaper/next-steps-preparing-for-post-quantum-cryptography) - Explicit timelines and deadlines
- **NIST (Nov 2024)**: [IR 8547 - Transition to Post-Quantum Standards](https://csrc.nist.gov/pubs/ir/8547/ipd) - Technical guidance for migration
- **DoD/NSA (Dec 2024)**: [CNSA Suite 2.0](https://media.defense.gov/2022/Sep/07/2003071836/-1/-1/0/CSI_CNSA_2.0_FAQ_.PDF) - Quantum-resistant requirements for national security

---

## ✨ What is QubeSec?

QubeSec is a Kubernetes operator that automates post-quantum cryptographic operations through native Kubernetes custom resources. It leverages **NIST-standardized quantum-safe algorithms** (Kyber, Dilithium, Falcon, SPHINCS+) integrated via [liboqs](https://github.com/open-quantum-safe/liboqs) and [OpenSSL oqs-provider](https://github.com/open-quantum-safe/oqs-provider).

### Key Characteristics

- **Native Kubernetes Integration**: Custom resources for every cryptographic operation
- **Fully Automated**: Controllers handle all crypto operations; no manual key management
- **Chainable Workflows**: Resources reference each other for complex operations
- **Auditability**: Fingerprints for verification without exposing key material
- **Secure Storage**: All keys stored in encrypted Kubernetes Secrets
- **NIST-Approved Algorithms**: Standards-based post-quantum cryptography

---

## 🔐 Core Capabilities

### **Quantum-Safe Key Generation**
Generate cryptographically-secure keypairs for key encapsulation and digital signatures:
- **Kyber KEMs**: ML-KEM-512/768/1024 for quantum-safe key exchange
- **Signature Algorithms**: ML-DSA-44/65/87 (Dilithium), Falcon, SPHINCS+

### **Key Encapsulation Mechanism (KEM)**
Implement post-quantum secure key exchange:
- **Encapsulation**: Derive shared secrets from public keys
- **Decapsulation**: Recover shared secrets using private keys
- **Kyber-based**: NIST-standardized ML-KEM for all-quantum-safe communication

### **Key Derivation**
Transform shared secrets into usable cryptographic keys:
- **HKDF-SHA256**: Industry-standard key derivation from shared secrets
- **AES-256 Keys**: Ready-to-use encryption keys for application layer security

### **Digital Signatures**
Sign and verify messages with post-quantum algorithms:
- **ML-DSA** (Dilithium): NIST-standardized lattice-based signatures
- **Falcon**: High-speed signature scheme
- **SPHINCS+**: Hash-based signatures

### **X.509 Certificates**
Create quantum-safe certificates for TLS and authentication:
- **Post-Quantum Certificates**: Using Dilithium or Falcon algorithms
- **Hybrid Support**: Combine classical and post-quantum for smooth migration
- **Self-Signed & CA**: Flexible certificate generation

### **Cryptographically Secure Random Numbers**
Generate high-entropy randomness for all cryptographic operations:
- **System Entropy**: OS-level random number generation
- **OpenSSL oqs-provider**: Additional entropy sources
- **Suitable for**: Key seeding, initialization vectors, nonces

---

## 📊 Supported Algorithms

| Category | Algorithms | NIST Status |
|----------|-----------|------------|
| **Key Encapsulation** | Kyber-512, Kyber-768, Kyber-1024 (ML-KEM) | ✅ Standardized (Nov 2024) |
| **Digital Signatures** | ML-DSA-44, ML-DSA-65, ML-DSA-87 (Dilithium) | ✅ Standardized (Aug 2024) |
| | Falcon-512, Falcon-1024 | ✅ Accepted (Aug 2024) |
| | SPHINCS+-SHA2 (128s, 128f, 256s, 256f) | ✅ Accepted (Aug 2024) |
| **Key Derivation** | HKDF-SHA256 | ✅ Industry Standard |

---

## 📖 Documentation Structure

This guide covers:

1. **[Quantum Random Number Generation](./qrng.md)** - Generate cryptographically secure random bytes
2. **[Post-Quantum Key Exchange](./keyexchange.md)** - Implement Kyber-based KEM workflows
3. **[Quantum Digital Signatures](./signatures.md)** - Sign and verify messages safely
4. **[Post-Quantum Certificates](./certificates.md)** - Create X.509 certificates
5. **[Architecture & Design](./architecture.md)** - System design and data flows
6. **[Quick Start & Examples](./quickstart.md)** - Get started in minutes
7. **[API Reference](./api-reference.md)** - Detailed CRD specifications

---

## ⚡ Quick Example

Here's a complete quantum-safe key exchange in just 3 Kubernetes resources:

```yaml
# 1. Generate a Kyber keypair
apiVersion: qubessec.io/v1
kind: QuantumKEMKeyPair
metadata:
  name: alice-keypair
spec:
  algorithm: Kyber1024

---
# 2. Bob encapsulates using Alice's public key
apiVersion: qubessec.io/v1
kind: QuantumEncapsulateSecret
metadata:
  name: bob-encapsulate
spec:
  algorithm: Kyber1024
  publicKeyRef:
    name: alice-keypair

---
# 3. Derive an AES-256 key from the shared secret
apiVersion: qubessec.io/v1
kind: QuantumDerivedKey
metadata:
  name: shared-aes-key
spec:
  sharedSecretRef:
    name: bob-encapsulate
```

Result: Both Alice and Bob can independently derive the **same AES-256 encryption key** using only publicly available data, secured by post-quantum Kyber!

---

## 🛠️ Getting Started

Choose your path:

- **New to QubeSec?** → Start with [Quick Start & Examples](./quickstart.md)
- **Want to understand the design?** → Read [Architecture & Design](./architecture.md)
- **Building specific workflows?** → Jump to [Key Exchange](./keyexchange.md), [Signatures](./signatures.md), or [Certificates](./certificates.md)
- **Need API details?** → See [API Reference](./api-reference.md)

---

## 🌍 About Post-Quantum Cryptography

Post-quantum cryptography refers to algorithms that are believed to be resistant to attacks by both classical **and** quantum computers. Unlike RSA and ECC (which quantum computers could break), PQC algorithms are based on hard mathematical problems that remain difficult even with quantum computing—such as lattice reduction, multivariate polynomials, and hash-based signatures.

NIST has been standardizing post-quantum algorithms since 2016, with the first standards approved in August 2024. QubeSec implements these NIST-approved algorithms to future-proof your Kubernetes security.

---

## 🔗 References

- **Open Quantum Safe Project**: https://openquantumsafe.org/
- **Post-Quantum Cryptography Alliance**: https://pqca.org/
- **NIST Post-Quantum Cryptography**: https://csrc.nist.gov/projects/post-quantum-cryptography/
- **QubeSec GitHub**: https://github.com/QubeSec/QubeSec
- **liboqs**: https://github.com/open-quantum-safe/liboqs
- **OQS-Provider for OpenSSL**: https://github.com/open-quantum-safe/oqs-provider
