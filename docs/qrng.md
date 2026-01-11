---
id: qrng
title: "Quantum Random Number Generation - QubeSec"
description: "Generate cryptographically secure random numbers for your Kubernetes applications. Use quantum-based entropy for keys, tokens, and secure identifiers."
keywords:
  - quantum random numbers
  - QRNG
  - cryptographic randomness
  - entropy
  - random number generation
---

## Overview

Cryptographically secure random numbers are fundamental to all cryptography. QubeSec provides the **QuantumRandomNumber** custom resource to generate high-entropy random bytes suitable for key generation, initialization vectors, and other cryptographic needs.

Traditional pseudo-random number generators (PRNGs) rely on algorithms that can be predictable if the seed is known or compromised. QubeSec leverages the unpredictability of physical or quantum sources to provide genuinely random numbers via [liboqs](https://github.com/open-quantum-safe/liboqs).

---

## The QuantumRandomNumber CRD

### Purpose
Generate cryptographically secure random bytes using quantum or system entropy sources.

### Basic Usage

```yaml
apiVersion: qubessec.io/v1
kind: QuantumRandomNumber
metadata:
  name: my-random-bytes
  namespace: default
spec:
  numBytes: 32  # Generate 32 random bytes (256 bits)
```

### Specification

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `spec.numBytes` | integer | Yes | Number of random bytes to generate (1-65536) |

### Status Fields

After the controller reconciles the resource, the status will contain:

```yaml
status:
  status: Success  # Pending, Success, or Failed
  randomData:      # Base64-encoded random bytes
  fingerprint:     # SHA256 fingerprint of generated data (first 10 hex chars)
  size:           # Number of bytes generated
  lastGeneratedTime: # Timestamp of generation
  error:          # Error message if operation failed
```

---

## Real-World Examples

### Example 1: Generate Random Nonce for Encryption

```yaml
apiVersion: qubessec.io/v1
kind: QuantumRandomNumber
metadata:
  name: encryption-nonce
spec:
  numBytes: 16  # 128-bit nonce
---
# Use the nonce in your application
apiVersion: v1
kind: ConfigMap
metadata:
  name: nonce-config
data:
  nonce-ref: encryption-nonce  # Reference to retrieve the random bytes
```

### Example 2: Seed Material for Key Derivation

Generate random seed material to feed into key derivation functions:

```yaml
apiVersion: qubessec.io/v1
kind: QuantumRandomNumber
metadata:
  name: kdf-seed
spec:
  numBytes: 64  # 512 bits of seed material

---
# Reference this in a QuantumDerivedKey
apiVersion: qubessec.io/v1
kind: QuantumDerivedKey
metadata:
  name: derived-from-random
spec:
  sharedSecretRef:
    name: kdf-seed
  outputSecretName: my-derived-key
```

### Example 3: Batch Generate Multiple Random Numbers

```yaml
apiVersion: qubessec.io/v1
kind: QuantumRandomNumber
metadata:
  name: batch-random-1
spec:
  numBytes: 32

---
apiVersion: qubessec.io/v1
kind: QuantumRandomNumber
metadata:
  name: batch-random-2
spec:
  numBytes: 32

---
apiVersion: qubessec.io/v1
kind: QuantumRandomNumber
metadata:
  name: batch-random-3
spec:
  numBytes: 32
```

---

## Accessing Random Data

The generated random bytes are stored in a Kubernetes Secret named after the resource. To retrieve the random data:

```bash
# Get the secret containing random bytes
kubectl get secret my-random-bytes -o jsonpath='{.data.random}'

# Decode and view (if text-based display is needed)
kubectl get secret my-random-bytes -o jsonpath='{.data.random}' | base64 -d | xxd

# Get the fingerprint (useful for verification without exposing full data)
kubectl get quantum randomnumber my-random-bytes -o jsonpath='{.status.fingerprint}'
```

---

## Use Cases

### 1. **Initialization Vectors (IVs) for Encryption**
Generate IVs for AES-GCM or other authenticated encryption modes:
```yaml
spec:
  numBytes: 12  # 96-bit IV recommended for GCM
```

### 2. **Nonces for Protocol Handshakes**
Generate fresh nonces for ECDH, KEM protocols, or TLS handshakes:
```yaml
spec:
  numBytes: 32  # 256-bit nonce
```

### 3. **Salt for PBKDF2 or Argon2**
Generate salt for password-based key derivation:
```yaml
spec:
  numBytes: 16  # 128-bit salt minimum
```

### 4. **Challenge-Response Protocols**
Generate challenges in authentication flows:
```yaml
spec:
  numBytes: 32  # 256-bit challenge
```

### 5. **Entropy Pool Seeding**
Replenish entropy pools for other cryptographic operations:
```yaml
spec:
  numBytes: 256  # Large seed material
```

---

## Security Considerations

### Entropy Quality
- QubeSec uses liboqs-provided randomness, which sources entropy from:
  - System entropy (e.g., `/dev/urandom` on Linux)
  - OpenSSL oqs-provider entropy sources
  - Quantum entropy when available in the underlying system

### Fingerprint Verification
The `status.fingerprint` field provides a SHA256 hash of generated data without exposing the full random bytes. This is useful for:
- Verifying that the same random bytes were generated and stored
- Creating audit trails without logging sensitive data
- Comparing random data across systems without transmission

### Secret Storage
- All random data is stored in Kubernetes Secrets
- Enable ETCD encryption at rest in your cluster for maximum security
- Use RBAC to restrict access to Secrets containing random data
- Consider using external secret management (HashiCorp Vault, AWS Secrets Manager, etc.)

---

## Advanced: Fingerprinting Without Exposing Data

You can track and verify random data generation using only the fingerprint:

```yaml
# Generate random data
apiVersion: qubessec.io/v1
kind: QuantumRandomNumber
metadata:
  name: sensitive-random
spec:
  numBytes: 64

---
# View only the fingerprint (safe to log/audit)
# kubectl get qrn sensitive-random -o jsonpath='{.status.fingerprint}'
# Output: a1b2c3d4e5 (10 hex characters)
```

Fingerprints help you:
- Track which random data was used when
- Verify consistency across multiple uses
- Maintain audit logs without exposing secrets
- Compare random data across namespaces or clusters

---

## Troubleshooting

### Resource Stuck in "Pending" State

```bash
# Check the controller logs
kubectl logs -n qubesec-system deployment/qubesec-controller-manager | grep "QuantumRandomNumber"

# Check resource status for error messages
kubectl describe qrn my-random-bytes
```

### Accessing Generated Data in Pods

Mount the Secret as a volume in your Pod:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: app-using-random
spec:
  containers:
  - name: app
    image: myapp:latest
    volumeMounts:
    - name: random-data
      mountPath: /etc/random
  volumes:
  - name: random-data
    secret:
      secretName: my-random-bytes
```

Then in your application, read from `/etc/random/random`.

---

## Best Practices

1. **Generate Only What You Need**: Generate the exact number of bytes needed; don't over-generate
2. **Rotate Regularly**: For long-lived applications, regenerate random material periodically
3. **Store Securely**: Use Kubernetes Secret encryption and RBAC
4. **Audit Access**: Monitor who accesses Secrets containing random data
5. **Use Fingerprints**: Log fingerprints instead of full random data for auditability
6. **Isolate Sensitive Data**: Store random data in separate Secrets from other application config
7. **Verify After Generation**: Check the `status.status` field to ensure successful generation

---

## Integration with Other QubeSec Resources

### With QuantumDerivedKey
Use random data as input to key derivation:

```yaml
apiVersion: qubessec.io/v1
kind: QuantumRandomNumber
metadata:
  name: my-seed
spec:
  numBytes: 32

---
apiVersion: qubessec.io/v1
kind: QuantumDerivedKey
metadata:
  name: derived-key
spec:
  sharedSecretRef:
    name: my-seed
```

### With QuantumSignMessage
Generate random padding or nonces for signing operations:

```yaml
apiVersion: qubessec.io/v1
kind: QuantumRandomNumber
metadata:
  name: signing-nonce
spec:
  numBytes: 32
```

---

## See Also

- [Quick Start & Examples](/quickstart)
- [Key Exchange Guide](/keyexchange)
- [Architecture & Design](/architecture)
- [API Reference](/api-reference)
