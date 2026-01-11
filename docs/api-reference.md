---
id: api-reference
title: "API Reference - QubeSec CRDs"
description: "Complete API reference for all 9 QubeSec Custom Resource Definitions (CRDs). Field specifications, validation rules, and status conditions."
keywords:
  - API reference
  - CRD specification
  - kubernetes API
  - resource definitions
---

This is a comprehensive reference for all QubeSec custom resources and their specifications.

---

## QuantumRandomNumber

Generate cryptographically secure random bytes.

### API Group & Version
`qubessec.io/v1`

### Specification

```yaml
apiVersion: qubessec.io/v1
kind: QuantumRandomNumber
metadata:
  name: my-random
  namespace: default
spec:
  numBytes: 32  # Required: 1-65536
```

### Spec Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `numBytes` | integer | Yes | Number of random bytes to generate (1-65536) |

### Status Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Pending, Success, or Failed |
| `size` | integer | Number of bytes successfully generated |
| `fingerprint` | string | SHA256 fingerprint of generated data (first 10 hex chars) |
| `lastGeneratedTime` | string | ISO8601 timestamp of generation |
| `error` | string | Error message if failed |

---

## QuantumKEMKeyPair

Generate Kyber (ML-KEM) keypairs for key encapsulation mechanism.

### API Group & Version
`qubessec.io/v1`

### Specification

```yaml
apiVersion: qubessec.io/v1
kind: QuantumKEMKeyPair
metadata:
  name: my-keypair
  namespace: default
spec:
  algorithm: Kyber1024  # Required: Kyber512, Kyber768, or Kyber1024
```

### Spec Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `algorithm` | string | Yes | `Kyber512` (ML-KEM-512), `Kyber768` (ML-KEM-768), `Kyber1024` (ML-KEM-1024) |

### Status Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Pending, Success, or Failed |
| `fingerprint` | string | SHA256 fingerprint of public key (first 10 hex chars) |
| `lastUpdateTime` | string | ISO8601 timestamp of last update |
| `error` | string | Error message if failed |

### Output Secret

Created as `<resource-name>` Secret containing:
- `public_key`: Binary public key
- `private_key`: Binary private key
- `metadata`: JSON metadata about the keypair

---

## QuantumEncapsulateSecret

Perform KEM encapsulation to create shared secrets.

### API Group & Version
`qubessec.io/v1`

### Specification

```yaml
apiVersion: qubessec.io/v1
kind: QuantumEncapsulateSecret
metadata:
  name: my-encapsulation
  namespace: default
spec:
  algorithm: Kyber1024  # Required
  publicKeyRef:         # Required
    name: keypair-name
    namespace: default  # Optional, defaults to current namespace
  outputSecretName: my-secret  # Optional, defaults to resource name
```

### Spec Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `algorithm` | string | Yes | `Kyber512`, `Kyber768`, or `Kyber1024` |
| `publicKeyRef.name` | string | Yes | Name of QuantumKEMKeyPair resource |
| `publicKeyRef.namespace` | string | No | Namespace of keypair (default: current) |
| `outputSecretName` | string | No | Secret to store result (default: resource name) |

### Status Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Pending, Success, or Failed |
| `fingerprint` | string | SHA256 fingerprint of shared secret |
| `ciphertextFingerprint` | string | SHA256 fingerprint of ciphertext |
| `lastUpdateTime` | string | ISO8601 timestamp |
| `error` | string | Error message if failed |

### Output Secret

Contains:
- `shared_secret`: Binary shared secret
- `ciphertext`: Binary encapsulated ciphertext
- `metadata`: JSON metadata

---

## QuantumDecapsulateSecret

Perform KEM decapsulation to recover shared secrets.

### API Group & Version
`qubessec.io/v1`

### Specification

```yaml
apiVersion: qubessec.io/v1
kind: QuantumDecapsulateSecret
metadata:
  name: my-decapsulation
  namespace: default
spec:
  algorithm: Kyber1024  # Required
  privateKeyRef:        # Required
    name: keypair-name
    namespace: default  # Optional
  ciphertextRef:        # Required
    name: encapsulation-resource
    namespace: default  # Optional
  outputSecretName: recovered-secret  # Optional
```

### Spec Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `algorithm` | string | Yes | `Kyber512`, `Kyber768`, or `Kyber1024` |
| `privateKeyRef.name` | string | Yes | Name of QuantumKEMKeyPair resource |
| `privateKeyRef.namespace` | string | No | Namespace of keypair |
| `ciphertextRef.name` | string | Yes | Name of QuantumEncapsulateSecret resource |
| `ciphertextRef.namespace` | string | No | Namespace of encapsulation |
| `outputSecretName` | string | No | Secret to store result |

### Status Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Pending, Success, or Failed |
| `fingerprint` | string | SHA256 fingerprint of recovered secret |
| `lastUpdateTime` | string | ISO8601 timestamp |
| `error` | string | Error message if failed |

---

## QuantumDerivedKey

Derive symmetric encryption keys from shared secrets using HKDF.

### API Group & Version
`qubessec.io/v1`

### Specification

```yaml
apiVersion: qubessec.io/v1
kind: QuantumDerivedKey
metadata:
  name: my-derived-key
  namespace: default
spec:
  sharedSecretRef:      # Required
    name: shared-secret
    namespace: default  # Optional
  keyLength: 32         # Optional, default: 32 (256 bits)
  algorithm: HKDF-SHA256  # Optional, default
  info: "my-app"        # Optional, for domain separation
  outputSecretName: derived  # Optional
```

### Spec Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `sharedSecretRef.name` | string | Yes | Name of shared secret source (QuantumEncapsulateSecret or QuantumDecapsulateSecret) |
| `sharedSecretRef.namespace` | string | No | Namespace of shared secret |
| `keyLength` | integer | No | Length of derived key in bytes (1-32, default: 32) |
| `algorithm` | string | No | KDF algorithm (currently only `HKDF-SHA256`) |
| `info` | string | No | Optional domain separation string |
| `outputSecretName` | string | No | Secret to store result |

### Status Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Pending, Success, or Failed |
| `fingerprint` | string | SHA256 fingerprint of derived key |
| `keyLength` | integer | Length of derived key in bytes |
| `lastUpdateTime` | string | ISO8601 timestamp |
| `error` | string | Error message if failed |

---

## QuantumSignatureKeyPair

Generate keypairs for digital signatures.

### API Group & Version
`qubessec.io/v1`

### Specification

```yaml
apiVersion: qubessec.io/v1
kind: QuantumSignatureKeyPair
metadata:
  name: my-signer
  namespace: default
spec:
  algorithm: Dilithium3  # Required
```

### Spec Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `algorithm` | string | Yes | `Dilithium2`, `Dilithium3`, `Dilithium5`, `Falcon512`, `Falcon1024`, or `SPHINCS+-SHA2-*` |

### Status Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Pending, Success, or Failed |
| `fingerprint` | string | SHA256 fingerprint of public key |
| `lastUpdateTime` | string | ISO8601 timestamp |
| `error` | string | Error message if failed |

### Output Secret

Contains:
- `private_key`: Binary private key
- `public_key`: Binary public key
- `metadata`: JSON metadata

---

## QuantumSignMessage

Sign messages using a private key.

### API Group & Version
`qubessec.io/v1`

### Specification

```yaml
apiVersion: qubessec.io/v1
kind: QuantumSignMessage
metadata:
  name: my-signature
  namespace: default
spec:
  privateKeyRef:           # Required
    name: keypair
    namespace: default     # Optional
  messageRef:              # Required
    name: message-secret
    namespace: default     # Optional
  algorithm: Dilithium3    # Required
  outputSecretName: sig    # Optional
```

### Spec Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `privateKeyRef.name` | string | Yes | Name of QuantumSignatureKeyPair |
| `privateKeyRef.namespace` | string | No | Namespace of keypair |
| `messageRef.name` | string | Yes | Name of Secret containing message |
| `messageRef.namespace` | string | No | Namespace of message Secret |
| `algorithm` | string | Yes | Signature algorithm |
| `outputSecretName` | string | No | Secret to store signature |

### Status Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Pending, Success, or Failed |
| `signature` | string | Base64-encoded signature |
| `messageFingerprint` | string | SHA256 fingerprint of signed message |
| `lastUpdateTime` | string | ISO8601 timestamp |
| `error` | string | Error message if failed |

---

## QuantumVerifySignature

Verify signatures using a public key.

### API Group & Version
`qubessec.io/v1`

### Specification

```yaml
apiVersion: qubessec.io/v1
kind: QuantumVerifySignature
metadata:
  name: my-verification
  namespace: default
spec:
  publicKeyRef:           # Required
    name: keypair
    namespace: default    # Optional
  messageRef:             # Required
    name: message-secret
    namespace: default    # Optional
  signatureRef:           # Required
    name: signature-secret
    namespace: default    # Optional
  algorithm: Dilithium3   # Required
```

### Spec Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `publicKeyRef.name` | string | Yes | Name of QuantumSignatureKeyPair |
| `publicKeyRef.namespace` | string | No | Namespace of keypair |
| `messageRef.name` | string | Yes | Name of Secret containing message |
| `messageRef.namespace` | string | No | Namespace of message |
| `signatureRef.name` | string | Yes | Name of Secret containing signature |
| `signatureRef.namespace` | string | No | Namespace of signature |
| `algorithm` | string | Yes | Signature algorithm |

### Status Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Valid, Invalid, Pending, or Failed |
| `verified` | boolean | True if signature is valid |
| `messageFingerprint` | string | SHA256 fingerprint of message |
| `lastCheckedTime` | string | ISO8601 timestamp of verification |
| `error` | string | Error message if failed |

---

## QuantumCertificate

Generate X.509 certificates with post-quantum algorithms.

### API Group & Version
`qubessec.io/v1`

### Specification

```yaml
apiVersion: qubessec.io/v1
kind: QuantumCertificate
metadata:
  name: my-cert
  namespace: default
spec:
  algorithm: Dilithium3           # Required
  certType: self-signed           # Required: self-signed, ca, or server
  commonName: "example.com"       # Required
  subjectAltNames:                # Optional
    - "example.com"
    - "*.example.com"
  organization: "My Org"          # Optional
  organizationalUnit: "IT"        # Optional
  country: "US"                   # Optional
  state: "CA"                     # Optional
  locality: "San Francisco"       # Optional
  durationDays: 365               # Optional, default: 365
  outputSecretName: cert-secret   # Optional
  parentCARef:                    # Optional, for CA-signed certs
    name: ca-resource
    namespace: default
```

### Spec Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `algorithm` | string | Yes | `Dilithium2`, `Dilithium3`, `Dilithium5`, `Falcon512`, `Falcon1024` |
| `certType` | string | Yes | `self-signed`, `ca` (Certificate Authority), or `server` |
| `commonName` | string | Yes | Certificate Common Name (CN) |
| `subjectAltNames` | []string | No | Subject Alternative Names (SANs) |
| `organization` | string | No | Certificate Organization (O) |
| `organizationalUnit` | string | No | Certificate OU field |
| `country` | string | No | Certificate Country Code (C) |
| `state` | string | No | Certificate State (ST) |
| `locality` | string | No | Certificate Locality (L) |
| `durationDays` | integer | No | Certificate validity in days (default: 365) |
| `outputSecretName` | string | No | Secret to store certificate |
| `parentCARef.name` | string | No | Parent CA name for signing |
| `parentCARef.namespace` | string | No | Parent CA namespace |

### Status Fields

| Field | Type | Description |
|-------|------|-------------|
| `status` | string | Pending, Success, or Failed |
| `certPEM` | string | Base64-encoded PEM certificate |
| `privateKeyPEM` | string | Base64-encoded private key |
| `publicKeyPEM` | string | Base64-encoded public key |
| `issuer` | string | Certificate issuer DN |
| `subject` | string | Certificate subject DN |
| `notBefore` | string | Certificate validity start date |
| `notAfter` | string | Certificate expiration date |
| `fingerprint` | string | SHA256 certificate fingerprint |
| `serialNumber` | string | Certificate serial number |
| `error` | string | Error message if failed |

### Output Secret

Contains:
- `cert.pem`: PEM-encoded certificate
- `key.pem`: PEM-encoded private key
- `pub.pem`: PEM-encoded public key
- `metadata.json`: Certificate metadata

---

## Common Status Values

### Status Field Values

```
Pending   - Resource is being processed
Success   - Operation completed successfully
Failed    - Operation failed
Valid     - For QuantumVerifySignature: signature is valid
Invalid   - For QuantumVerifySignature: signature is invalid
```

### Fingerprint Format

- SHA256 hash of content
- Base16 (hex) encoded
- First 10 characters taken
- Example: `a1b2c3d4e5`

---

## Common Patterns

### Cross-Namespace References

```yaml
publicKeyRef:
  name: keypair
  namespace: other-namespace  # Requires RBAC permissions
```

### Referencing Secrets

```yaml
messageRef:
  name: my-secret  # Must exist as Kubernetes Secret
  # Secret should contain message data in .data.content or similar
```

### Output Secret Naming

If `outputSecretName` is not specified:
- QuantumKEMKeyPair → `<resource-name>`
- QuantumEncapsulateSecret → `<resource-name>`
- QuantumSignMessage → `<resource-name>-signature`
- QuantumCertificate → `<resource-name>-secret`

---

## Field Validation Rules

| Resource | Field | Validation |
|----------|-------|-----------|
| All | `metadata.name` | DNS-1123 label (lowercase alphanumeric, hyphens) |
| QuantumRandomNumber | `spec.numBytes` | 1-65536 |
| QuantumDerivedKey | `spec.keyLength` | 1-32 |
| QuantumCertificate | `spec.durationDays` | 1-36500 |
| QuantumCertificate | `spec.country` | 2 characters |

---

## See Also

- [Quick Start & Examples](/quickstart)
- [Architecture & Design](/architecture)
- [Key Exchange Guide](/keyexchange)
- [Quantum Digital Signatures](/signatures)
- [Post-Quantum Certificates](/certificates)
