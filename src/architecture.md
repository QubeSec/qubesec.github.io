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

```
QuantumKEMKeyPair (resource)
├── alice-keypair Secret (owned)
│   ├── public_key (binary)
│   ├── private_key (binary)
│   └── metadata (JSON)
└── Status
    ├── fingerprint: "a1b2c3d4e5"
    ├── status: "Success"
    └── lastUpdateTime: "2025-01-04T..."
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

### QuantumKEMKeyPair Reconciliation

```
1. Watch for QuantumKEMKeyPair resource changes
   ↓
2. Fetch existing Secret (if any)
   ↓
3. If Secret exists and valid
   ├─ Update status with fingerprint
   └─ Return (idempotent, no re-generation)
   ↓
4. If Secret missing
   ├─ Generate keypair with liboqs
   ├─ Create owned Secret
   ├─ Calculate public key fingerprint
   ├─ Update status with fingerprint
   └─ Return
   ↓
5. If error occurs
   ├─ Update status.error
   └─ Requeue with exponential backoff
```

### QuantumEncapsulateSecret Reconciliation

```
1. Watch for QuantumEncapsulateSecret changes
   ↓
2. Fetch referenced QuantumKEMKeyPair
   ↓
3. Extract public key from associated Secret
   ↓
4. Perform encapsulation with liboqs
   ├─ Input: public key + algorithm
   ├─ Output: shared secret + ciphertext
   ↓
5. Store in output Secret
   ├─ shared_secret (binary)
   ├─ ciphertext (binary)
   └─ metadata (JSON)
   ↓
6. Update status
   ├─ fingerprint: SHA256(shared_secret)[0:10]
   ├─ ciphertextFingerprint: SHA256(ciphertext)[0:10]
   └─ status: Success
```

---

## Key Exchange Data Flow

### Complete Quantum-Safe Key Exchange

```
┌─────────────────────────────────────────────────────────┐
│                     Alice's Namespace                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  QuantumKEMKeyPair (alice-keypair)                      │
│  ├─ Generate Kyber1024 keypair                          │
│  └─ Secret: [public_key | private_key]                  │
│     └─ alice-keypair Secret                             │
│                                                          │
│  Public key shared with Bob ────────────────────────┐   │
│                                                     │   │
└─────────────────────────────────────────────────────┼─────────────────────────────────────────┐
                                                     │                                       │
                    ┌──────────────────────────────────┘                                       │
                    │                                                                          │
            ┌───────▼──────────────────────────────────────────────────────────────┐          │
            │                     Bob's Namespace                                   │          │
            ├────────────────────────────────────────────────────────────────────┤          │
            │                                                                      │          │
            │  QuantumEncapsulateSecret (bob-secret)                             │          │
            │  ├─ Fetch Alice's public_key from alice-keypair Secret           │◄───────┘
            │  ├─ Encapsulate: Generate SharedSecret + Ciphertext             │
            │  └─ Secret: [shared_secret | ciphertext]                         │
            │     └─ bob-secret Secret                                          │
            │        ├─ Fingerprint: "a1b2c3d4e5"                              │
            │        └─ Bob's SharedSecret ✓                                    │
            │                                                                   │
            │  Ciphertext sent to Alice ──────────────────────────────────┐    │
            │                                                             │    │
            └─────────────────────────────────────────────────────────────┼────────────────────┐
                                                                          │                    │
                        ┌─────────────────────────────────────────────────┘                    │
                        │                                                                      │
            ┌───────────▼──────────────────────────────────────────────────────────────┐     │
            │                     Alice's Namespace (cont)                              │     │
            ├────────────────────────────────────────────────────────────────────────┤     │
            │                                                                         │     │
            │  QuantumDecapsulateSecret (alice-secret)                              │     │
            │  ├─ Fetch Alice's private_key from alice-keypair Secret             │◄────┘
            │  ├─ Fetch Bob's ciphertext from bob-secret Secret                   │
            │  ├─ Decapsulate: Recover SharedSecret from ciphertext              │
            │  └─ Secret: [shared_secret]                                         │
            │     └─ alice-secret Secret                                          │
            │        ├─ Fingerprint: "a1b2c3d4e5"                                │
            │        └─ Alice's SharedSecret ✓                                   │
            │                                                                     │
            │  ✓ RESULT: Both Alice & Bob have identical shared secrets!         │
            │                                                                     │
            └─────────────────────────────────────────────────────────────────────┘
            
            ┌─────────────────────────────────────────────────────────────────────┐
            │         Both Namespaces: Derive Encryption Keys                     │
            ├─────────────────────────────────────────────────────────────────────┤
            │                                                                     │
            │  QuantumDerivedKey (alice-aes-key)                                 │
            │  └─ Input: alice-secret SharedSecret                              │
            │     └─ Output: AES-256 Key ───────────────┐                       │
            │                                            │                       │
            │  QuantumDerivedKey (bob-aes-key)          │                       │
            │  └─ Input: bob-secret SharedSecret       │                       │
            │     └─ Output: AES-256 Key ───────────────┼──────┐                │
            │                                           │      │                 │
            │  ✓ Both AES Keys are IDENTICAL!          │      │                 │
            │  ✓ Ready for symmetric encryption         ✓      ✓                 │
            │                                                                    │
            └────────────────────────────────────────────────────────────────────┘
```

---

## Signature and Verification Flow

```
┌──────────────────────────────────────────────────┐
│  QuantumSignatureKeyPair (signer-keys)          │
│  ├─ Generate Dilithium3 keypair                 │
│  └─ Secret: [public_key | private_key]          │
│     └─ signer-keys Secret                       │
└──────────────────────────────────────────────────┘
         │
         ├─ Private key used for signing
         │   └─ QuantumSignMessage
         │      ├─ Input: Private key + Message
         │      ├─ Output: Signature
         │      └─ Secret: [signature]
         │
         └─ Public key used for verification
             └─ QuantumVerifySignature
                ├─ Input: Public key + Message + Signature
                ├─ Compare: Message fingerprints
                └─ Output: Valid/Invalid in status
```

---

## Fingerprinting Strategy

Fingerprints provide cryptographic commitments without exposing full key material:

```
SHA256(data) → Take first 10 hex characters → Fingerprint

Example:
  Data: <1024+ bytes of key material>
  SHA256: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6...
  Fingerprint: a1b2c3d4e5 (10 chars)
```

### Usage Pattern

```yaml
QuantumKEMKeyPair Status:
  fingerprint: "a1b2c3d4e5"  # Commitment to this specific keypair

QuantumEncapsulateSecret Status:
  fingerprint: "f6g7h8i9j0"  # Commitment to shared secret generated

QuantumDecapsulateSecret Status:
  fingerprint: "f6g7h8i9j0"  # Same fingerprint = same shared secret!
```

Benefits:
- ✅ Verify without exposing secrets
- ✅ Audit logs contain readable 10-char strings
- ✅ Safe to include in logs, configs, CIs
- ✅ Cross-resource validation

---

## Idempotency and Reconciliation

Controllers implement idempotency to ensure safe reapplication:

```yaml
# First apply: Creates resources, generates keys
kubectl apply -f key-exchange.yaml

# Second apply: No changes (idempotent)
# Controller detects Secret exists with matching content
# Updates status, returns early without regeneration
kubectl apply -f key-exchange.yaml

# Delete and recreate: Clean regeneration
kubectl delete qkkp alice-keypair
kubectl apply -f key-exchange.yaml  # Generates new keypair
```

---

## Resource Ownership and Garbage Collection

Resources use Kubernetes ownership references to clean up automatically:

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: alice-keypair
  ownerReferences:
  - apiVersion: qubessec.io/v1
    kind: QuantumKEMKeyPair
    name: alice-keypair
    uid: <uid>
    controller: true
    blockOwnerDeletion: true
```

**Cleanup Behavior**:
- Delete QuantumKEMKeyPair → Secret automatically deleted
- Delete QuantumEncapsulateSecret → Owned Secret automatically deleted
- Delete QuantumSignMessage → Owned Secret automatically deleted

---

## Security Architecture

### Key Material Protection

```
┌─────────────────────────────────────────────┐
│  Kubernetes Cluster (ETCD encrypted)        │
├─────────────────────────────────────────────┤
│  Secret: alice-keypair (encrypted at rest)  │
│  ├─ private_key: <encrypted binary>         │
│  ├─ public_key: <encrypted binary>          │
│  └─ permissions: restricted by RBAC         │
│                                             │
│  Controller Process                        │
│  ├─ Load Secret into memory                │
│  ├─ Use for crypto operation               │
│  ├─ Wipe from memory after use             │
│  └─ Never log key material                 │
│                                             │
└─────────────────────────────────────────────┘
```

### Access Control

```
RBAC + Network Policies:
├─ Signing keys restricted to authorized service accounts
├─ Cross-namespace access requires explicit RBAC rules
├─ Network policies limit pod-to-pod communication
└─ Audit logs track all key access
```

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

```
QuantumCertificate
  └─ TLS Secret (for Ingress)
  └─ Secret (for Pod mounts)

QuantumDerivedKey
  └─ Secret (environment variables in Pods)
  └─ ConfigMap (distributed across nodes)

QuantumSignMessage
  └─ Secret (signature verification in containers)
```

### With External Systems

```
QubeSec Secret
  └─ External Secret Operator
     ├─ HashiCorp Vault
     ├─ AWS Secrets Manager
     └─ Google Cloud Secret Manager
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

- [Introduction](./README.md)
- [Key Exchange Guide](./keyexchange.md)
- [Quantum Digital Signatures](./signatures.md)
- [Post-Quantum Certificates](./certificates.md)
- [Quick Start & Examples](./quickstart.md)
