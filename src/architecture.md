# Architecture & Design

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

<div class="mermaid">
graph TD
    A["QuantumKEMKeyPair (resource)"] --> B["alice-keypair Secret"]
    B --> C["public_key (binary)"]
    B --> D["private_key (binary)"]
    B --> E["metadata (JSON)"]
    A --> F["Status"]
    F --> G["fingerprint: a1b2c3d4e5"]
    F --> H["status: Success"]
    F --> I["lastUpdateTime: 2025-01-04"]
</div>

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

### QuantumKEMKeyPair Reconciliation

<div class="mermaid">
graph TD
    A["Watch for QuantumKEMKeyPair changes"] --> B{"Secret exists?"}
    B -->|Yes & Valid| C["Update status with fingerprint"]
    C --> D["Return Idempotent"]
    B -->|No| E["Generate keypair with liboqs"]
    E --> F["Create owned Secret"]
    F --> G["Calculate fingerprint"]
    G --> H["Update status"]
    H --> I["Return"]
    B -->|Error| J["Update status.error"]
    J --> K["Requeue with backoff"]
</div>

### QuantumEncapsulateSecret Reconciliation

<div class="mermaid">
graph TD
    A["Watch QuantumEncapsulateSecret changes"] --> B["Fetch QuantumKEMKeyPair"]
    B --> C["Extract public key from Secret"]
    C --> D["Perform encapsulation with liboqs"]
    D --> E["Generate shared_secret + ciphertext"]
    E --> F["Store in output Secret"]
    F --> G["Calculate fingerprints"]
    G --> H["Update status"]
    H --> I["Success"]
</div>

---

## Key Exchange Data Flow

### Complete Quantum-Safe Key Exchange

<div class="mermaid">
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
</div>

---

## Signature and Verification Flow

<div class="mermaid">
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
</div>

---

## Fingerprinting Strategy

Fingerprints provide cryptographic commitments without exposing full key material:

<div class="mermaid">
graph LR
    A["Key Material<br/>1024+ bytes"] --> B["SHA256 Hash"]
    B --> C["a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6..."]
    C --> D["Take first 10 chars"]
    D --> E["Fingerprint: a1b2c3d4e5"]
</div>

### Usage Pattern

<div class="mermaid">
graph TD
    A["QuantumKEMKeyPair Status"] --> B["fingerprint: a1b2c3d4e5<br/>Commitment to keypair"]
    C["QuantumEncapsulateSecret Status"] --> D["fingerprint: f6g7h8i9j0<br/>Commitment to shared secret"]
    E["QuantumDecapsulateSecret Status"] --> F["fingerprint: f6g7h8i9j0<br/>Same fingerprint = same secret!"]
</div>

Benefits:
- ✅ Verify without exposing secrets
- ✅ Audit logs contain readable 10-char strings
- ✅ Safe to include in logs, configs, CIs
- ✅ Cross-resource validation

---

## Idempotency and Reconciliation

Controllers implement idempotency to ensure safe reapplication:

<div class="mermaid">
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
</div>

---

## Resource Ownership and Garbage Collection

Resources use Kubernetes ownership references to clean up automatically:

<div class="mermaid">
graph TD
    A["QuantumKEMKeyPair: alice-keypair"] -->|ownerReferences| B["Secret: alice-keypair"]
    A -->|ownerReferences| C["Secret: alice-keypair"]
    
    D["Delete QuantumKEMKeyPair"] -->|triggers| E["Secret auto-deleted"]
    F["Delete QuantumEncapsulateSecret"] -->|triggers| G["Owned Secret auto-deleted"]
    H["Delete QuantumSignMessage"] -->|triggers| I["Owned Secret auto-deleted"]
</div>

---

## Security Architecture

### Key Material Protection

### Key Material Protection

<div class="mermaid">
graph TD
    A["Kubernetes Cluster"] --> B["ETCD Encrypted at Rest"]
    B --> C["Secret: alice-keypair"]
    C --> D["private_key: encrypted"]
    C --> E["public_key: encrypted"]
    C --> F["permissions: RBAC restricted"]
    
    A --> G["Controller Process"]
    G --> H["1. Load Secret to memory"]
    H --> I["2. Use for crypto"]
    I --> J["3. Wipe from memory"]
    J --> K["4. Never log key material"]
</div>

### Access Control

<div class="mermaid">
graph TD
    A["RBAC Rules"] --> B["Signing keys restricted<br/>to authorized service accounts"]
    C["Network Policies"] --> D["Cross-namespace access<br/>requires explicit RBAC"]
    E["Audit Logging"] --> F["Track all key access"]
</div>

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

<div class="mermaid">
graph TD
    A["QuantumCertificate"] --> B["TLS Secret"]
    B --> C["For Ingress"]
    A --> D["Secret for Pod mounts"]
    
    E["QuantumDerivedKey"] --> F["Secret"]
    F --> G["Environment variables in Pods"]
    E --> H["ConfigMap"]
    H --> I["Distributed across nodes"]
    
    J["QuantumSignMessage"] --> K["Secret"]
    K --> L["Signature verification in containers"]
</div>

### With External Systems

<div class="mermaid">
graph TD
    A["QubeSec Secret"] --> B["External Secrets Operator"]
    B --> C["HashiCorp Vault"]
    B --> D["AWS Secrets Manager"]
    B --> E["Google Cloud Secret Manager"]
</div>

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

- [Introduction](./README.md)
- [Key Exchange Guide](./keyexchange.md)
- [Quantum Digital Signatures](./signatures.md)
- [Post-Quantum Certificates](./certificates.md)
- [Quick Start & Examples](./quickstart.md)
