---
id: architecture
title: "Architecture & Design - QubeSec"
description: "Deep dive into QubeSec's architecture. Learn about the 9 Custom Resource Definitions, reconciliation flows, and system design for post-quantum cryptography in Kubernetes."
keywords:
  - architecture
  - system design
  - kubernetes CRDs
  - operator pattern
---

## System Overview

QubeSec is a Kubernetes operator that provides post-quantum cryptography through native custom resources (CRDs). The system architecture follows the standard Kubernetes operator pattern with reconciliation loops, status management, and owned resource cleanup.

---

## Core Components

### 1. CRDs (Custom Resource Definitions)

QubeSec defines 9 custom resources covering the complete cryptographic lifecycle:

| Resource | Purpose | Output |
|----------|---------|--------|
| **QuantumRandomNumber** | Generate random bytes | Random data Secret |
| **QuantumKEMKeyPair** | Generate Kyber keypairs | Public/private key Secret |
| **QuantumEncapsulateSecret** | KEM encapsulation | Shared secret + ciphertext |
| **QuantumDecapsulateSecret** | KEM decapsulation | Recovered shared secret |
| **QuantumDerivedKey** | HKDF key derivation | AES-256 key Secret |
| **QuantumSignatureKeyPair** | Generate signature keypairs | Public/private key Secret |
| **QuantumSignMessage** | Sign messages | Signature Secret |
| **QuantumVerifySignature** | Verify signatures | Verification result in status |
| **QuantumCertificate** | Generate X.509 certs | Certificate Secret |

### 2. Controllers

Each CRD has an associated controller that:
- **Watches** resource changes
- **Reconciles** by executing cryptographic operations
- **Stores** results in Kubernetes Secrets
- **Updates** status with results and fingerprints
- **Manages** owner references for garbage collection

### 3. Supporting Infrastructure

- **Webhooks**: Validate resource specifications
- **RBAC**: Service accounts with appropriate permissions
- **Secrets**: Store all cryptographic material
- **ConfigMaps**: Optional logging and configuration

---

## Data Storage Model

All cryptographic material is stored in Kubernetes Secrets in raw binary format:

```mermaid
graph LR
    A[QuantumKEMKeyPair<br/>alice-keypair] --> B[Secret<br/>alice-keypair]
    B --> C[public_key]
    B --> D[private_key]
    B --> E[metadata]
    A --> F[Status]
    F --> G[fingerprint: a1b2c3d4e5]
    F --> H[status: Success]
```

### Secret Structure

Each cryptographic operation stores its output in a Secret:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: alice-keypair
  ownerReferences:
  - kind: QuantumKEMKeyPair
    name: alice-keypair  # Garbage collected when parent deleted
type: Opaque
data:
  public_key: <base64>
  private_key: <base64>
  metadata: <json>
```

---

## Reconciliation Flow

### Controller Reconciliation Pattern

```mermaid
flowchart TD
    A[Watch CRD Changes] --> B{Secret exists?}
    B -->|Yes| C[Validate Secret]
    C --> D{Valid?}
    D -->|Yes| E[Update Status]
    E --> F[Return - Idempotent]
    D -->|No| G[Regenerate]
    B -->|No| H[Execute Crypto Operation]
    H --> I[Create Secret with ownerRef]
    I --> J[Calculate Fingerprint]
    J --> K[Update Status]
    K --> L[Return Success]
    G --> H
    C -->|Error| M[Update Status Error]
    M --> N[Requeue with Backoff]
```

---

## Key Exchange Data Flow

### Complete Quantum-Safe Key Exchange

```mermaid
sequenceDiagram
    participant Alice as Alice
    participant Bob as Bob
    
    Alice->>Alice: 1. Generate Kyber1024 keypair<br/>(QuantumKEMKeyPair)
    Alice-->>Bob: 2. Share public key
    
    Bob->>Bob: 3. Encapsulate with Alice's public key<br/>(QuantumEncapsulateSecret)
    Note over Bob: Generates SharedSecret + Ciphertext
    Bob-->>Alice: 4. Send ciphertext (non-secret)
    
    Alice->>Alice: 5. Decapsulate using private key<br/>(QuantumDecapsulateSecret)
    Note over Alice: Recovers SharedSecret from ciphertext
    
    Note over Alice,Bob: ✓ Both have identical SharedSecret!
    
    Alice->>Alice: 6. Derive AES-256 key<br/>(QuantumDerivedKey)
    Bob->>Bob: 6. Derive AES-256 key<br/>(QuantumDerivedKey)
    
    Note over Alice,Bob: ✓ Both have identical AES-256 keys!<br/>✓ Ready for symmetric encryption
```

---

## Signature and Verification Flow

```mermaid
graph TD
    A["QuantumSignatureKeyPair<br/>(signer-keys)"] --> B["Generate Dilithium3 keypair"]
    B --> C["Private Key"]
    B --> D["Public Key"]
    
    C --> E["QuantumSignMessage"]
    E --> F["Input: Private key + Message"]
    F --> G["Output: Signature"]
    G --> H["Secret: signature"]
    
    D --> I["QuantumVerifySignature"]
    I --> J["Input: Public key + Message + Signature"]
    J --> K["Compare fingerprints"]
    K --> L["Output: Valid/Invalid"]
```

---

## Fingerprinting Strategy

Fingerprints provide cryptographic commitments without exposing full key material:

```mermaid
flowchart LR
    A[Key Material<br/>1024+ bytes] --> B[SHA256]
    B --> C[64-char hex hash]
    C --> D[First 10 chars]
    D --> E[a1b2c3d4e5]
    
    subgraph Usage
        F[QuantumKEMKeyPair] -.->|fingerprint| E
        G[QuantumEncapsulateSecret] -.->|fingerprint| H[f6g7h8i9j0]
        I[QuantumDecapsulateSecret] -.->|fingerprint| H
    end
    
    E --> J[Verify without<br/>exposing secrets]
    H --> K[Match = Same secret]
```

**Benefits:**
- ✅ Verify without exposing secrets
- ✅ Audit logs contain readable 10-char strings
- ✅ Safe to include in logs, configs, CI/CD
- ✅ Cross-resource validation

---

## Idempotency and Reconciliation

Controllers implement idempotency to ensure safe reapplication:

```mermaid
stateDiagram-v2
    [*] --> FirstApply
    FirstApply --> CreateResources: kubectl apply
    CreateResources --> GenerateKeys
    GenerateKeys --> Ready
    
    Ready --> SecondApply: kubectl apply again
    SecondApply --> DetectExists: Secret exists?
    DetectExists --> UpdateStatus: Yes
    UpdateStatus --> ReadyIdempotent
    
    Ready --> Delete: kubectl delete
    Delete --> Deleted
    Deleted --> Recreate: kubectl apply
    Recreate --> NewKeys
    NewKeys --> Ready
```

---

## Resource Ownership and Garbage Collection

Resources use Kubernetes ownership references to clean up automatically:

```mermaid
flowchart LR
    A[CRD Resource] -->|owns| B[Secret]
    A -->|ownerReference| B
    C[Delete CRD] -->|cascades| D[Secret Auto-Deleted]
    
    style A fill:#e1f5ff
    style B fill:#fff4e1
    style C fill:#ffe1e1
    style D fill:#ffe1e1
```

---

## Security Architecture

### Key Material Protection

```mermaid
flowchart TB
    subgraph Kubernetes Cluster
        A[ETCD<br/>Encrypted at Rest]
        B[Secret: alice-keypair<br/>RBAC Protected]
    end
    
    subgraph Controller Process
        C[1. Load to Memory]
        D[2. Perform Crypto]
        E[3. Wipe Memory]
        F[4. Never Log Keys]
    end
    
    A --> B
    B --> C
    C --> D
    D --> E
    E --> F
```

### Access Control

**RBAC Configuration:**
- Signing keys restricted to authorized service accounts
- Cross-namespace access requires explicit RBAC grants
- Network policies enforce namespace isolation

**Audit & Monitoring:**
- All Secret access logged via Kubernetes audit logs
- Resource creation/deletion events tracked
- Fingerprints in logs (safe for audit trails)

---

## Scalability Considerations

### Horizontal Scaling

- Multiple controller replicas with leader election
- Stateless reconciliation (state in ETCD)
- Efficient resource watching and caching

### Performance

- Kyber key exchange: microseconds
- Dilithium signing: milliseconds
- Parallel reconciliation of independent resources
- Minimal API server load with careful watches

---

## Integration Points

### With Kubernetes Native Resources

```mermaid
flowchart LR
    A[QuantumCertificate] --> B[Secret]
    B --> C[Ingress TLS]
    
    D[QuantumDerivedKey] --> E[Secret]
    E --> F[Pod Volume]
    E --> G[Env Variable]
    
    H[QuantumSignMessage] --> I[Secret]
    I --> J[Container Mount]
```

### With External Systems

```mermaid
flowchart TB
    A[QubeSec Secret] --> B[External Secrets Operator]
    B --> C[HashiCorp Vault]
    B --> D[AWS Secrets Manager]
    B --> E[GCP Secret Manager]
    B --> F[Azure Key Vault]
```

---

## Future Architecture Enhancements

- **HSM Integration**: Support hardware security modules for key storage
- **Certificate Chains**: Parent CA references for CA hierarchies
- **Key Rotation Policies**: Automatic key rotation scheduling
- **Attestation**: Signed attestations for resource authenticity
- **Multi-tenant Isolation**: Enhanced RBAC for shared clusters
- **Hybrid Crypto**: Classical + post-quantum combined certificates

---

## See Also

- [Introduction](/)
- [Key Exchange Guide](/keyexchange)
- [Quantum Digital Signatures](/signatures)
- [Post-Quantum Certificates](/certificates)
- [Quick Start & Examples](/quickstart)
