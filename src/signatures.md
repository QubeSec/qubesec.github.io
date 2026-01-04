# Quantum Digital Signatures

## Overview

Digital signatures provide authentication and non-repudiation—proving that a message came from a specific signer and hasn't been tampered with. **QuantumSignatureKeyPair**, **QuantumSignMessage**, and **QuantumVerifySignature** resources implement post-quantum signature schemes using NIST-standardized algorithms (ML-DSA, Falcon, SPHINCS+).

This guide covers generating signatures with post-quantum algorithms and verifying them in Kubernetes.

---

## Post-Quantum Signature Algorithms

### ML-DSA (Dilithium)
**NIST-standardized lattice-based signatures** (August 2024)

- **ML-DSA-44** (Dilithium2): AES-128 security level
- **ML-DSA-65** (Dilithium3): AES-192 security level
- **ML-DSA-87** (Dilithium5): AES-256 security level

Advantages: Fast, small keys, proven security

### Falcon
**Fast lattice-based signatures** (Accepted August 2024)

- **Falcon-512**: AES-128 security level
- **Falcon-1024**: AES-256 security level

Advantages: Smallest signature sizes, high speed

### SPHINCS+
**Stateless hash-based signatures** (Accepted August 2024)

- **SPHINCS+-SHA2-128f/s**: AES-128 security
- **SPHINCS+-SHA2-256f/s**: AES-256 security

Advantages: Longest proven security track record

---

## Resource Overview

### QuantumSignatureKeyPair
Generate an asymmetric keypair for signing and verification.

```yaml
apiVersion: qubessec.io/v1
kind: QuantumSignatureKeyPair
metadata:
  name: my-sig-keys
spec:
  algorithm: Dilithium3  # ML-DSA-65
```

**Algorithms**: `Dilithium2`, `Dilithium3`, `Dilithium5`, `Falcon512`, `Falcon1024`, `SPHINCS+-SHA2-*`

**Output**: Secret with private and public keys, status with public key fingerprint

### QuantumSignMessage
Sign a message with a private key.

```yaml
apiVersion: qubessec.io/v1
kind: QuantumSignMessage
metadata:
  name: sign-config
spec:
  privateKeyRef:
    name: my-sig-keys
  messageRef:
    name: config-secret  # Secret containing the message
  algorithm: Dilithium3
```

**Inputs**: Signature keypair and message  
**Output**: Secret with signature, status with message fingerprint

### QuantumVerifySignature
Verify a signature with a public key.

```yaml
apiVersion: qubessec.io/v1
kind: QuantumVerifySignature
metadata:
  name: verify-config
spec:
  publicKeyRef:
    name: my-sig-keys
  messageRef:
    name: config-secret
  signatureRef:
    name: sign-config
  algorithm: Dilithium3
```

**Inputs**: Signature keypair, message, and signature  
**Output**: Status indicating Valid/Invalid/Failed

---

## Complete Signing Workflow

### Step 1: Generate Signature Keypair

```yaml
apiVersion: qubessec.io/v1
kind: QuantumSignatureKeyPair
metadata:
  name: release-signer
  namespace: ci-cd
spec:
  algorithm: Dilithium3  # ML-DSA-65
```

Alice now has a keypair for signing messages.

### Step 2: Create a Message to Sign

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: release-manifest
  namespace: ci-cd
type: Opaque
data:
  message: |
    apiVersion: apps/v1
    kind: Deployment
    metadata:
      name: myapp
      labels:
        version: "1.2.3"
    spec:
      template:
        ...
```

### Step 3: Sign the Message

```yaml
apiVersion: qubessec.io/v1
kind: QuantumSignMessage
metadata:
  name: sign-release
  namespace: ci-cd
spec:
  privateKeyRef:
    name: release-signer
  messageRef:
    name: release-manifest
  algorithm: Dilithium3
  outputSecretName: release-signature
```

Result:
- **Signature**: Stored in `release-signature` Secret
- **Message Fingerprint**: In status (commitment to the exact message signed)

### Step 4: Distribute Signature & Message

The signature can be:
- Stored in Git (GitHub releases, signed commits)
- Included in container image metadata
- Transmitted alongside the message
- Used in CI/CD pipelines

### Step 5: Verify the Signature

```yaml
apiVersion: qubessec.io/v1
kind: QuantumVerifySignature
metadata:
  name: verify-release
  namespace: ci-cd
spec:
  publicKeyRef:
    name: release-signer
  messageRef:
    name: release-manifest
  signatureRef:
    name: sign-release
  algorithm: Dilithium3
```

Result:
- **Status**: Valid/Invalid indicating if signature matches
- **Message Fingerprint**: Same as signing step (same message verified)

---

## Real-World Examples

### Example 1: Sign Kubernetes Configuration

Sign a ConfigMap before deployment:

```yaml
# The configuration to sign
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  config.yaml: |
    database:
      host: db.example.com
      port: 5432
    cache:
      ttl: 3600

---
# Create a secret with the config content for signing
apiVersion: v1
kind: Secret
metadata:
  name: config-message
type: Opaque
stringData:
  content: |
    database:
      host: db.example.com
      port: 5432
    cache:
      ttl: 3600

---
# Generate signing keys
apiVersion: qubessec.io/v1
kind: QuantumSignatureKeyPair
metadata:
  name: config-signer
spec:
  algorithm: Dilithium3

---
# Sign the configuration
apiVersion: qubessec.io/v1
kind: QuantumSignMessage
metadata:
  name: sign-app-config
spec:
  privateKeyRef:
    name: config-signer
  messageRef:
    name: config-message
  algorithm: Dilithium3
  outputSecretName: config-signature

---
# Verify the signature
apiVersion: qubessec.io/v1
kind: QuantumVerifySignature
metadata:
  name: verify-app-config
spec:
  publicKeyRef:
    name: config-signer
  messageRef:
    name: config-message
  signatureRef:
    name: sign-app-config
  algorithm: Dilithium3
```

### Example 2: CI/CD Pipeline Integration

Sign container image metadata in GitHub Actions:

```yaml
# In your GitHub Actions workflow
name: Build and Sign
on: [push]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v3
    
    - name: Build Image
      run: docker build -t myrepo/myapp:${{ github.sha }} .
    
    - name: Sign with Post-Quantum
      env:
        KUBE_CONFIG: ${{ secrets.KUBECONFIG }}
      run: |
        # Apply to Kubernetes
        kubectl apply -f - <<EOF
        apiVersion: v1
        kind: Secret
        metadata:
          name: image-manifest
          namespace: ci-cd
        type: Opaque
        stringData:
          content: "myrepo/myapp:${{ github.sha }}"
        ---
        apiVersion: qubessec.io/v1
        kind: QuantumSignMessage
        metadata:
          name: sign-image
          namespace: ci-cd
        spec:
          privateKeyRef:
            name: ci-signer
          messageRef:
            name: image-manifest
          algorithm: Dilithium3
          outputSecretName: image-signature
        EOF
        
        # Get the signature
        kubectl get secret image-signature -o jsonpath='{.data.signature}' | base64 -d > signature.bin
    
    - name: Upload to Registry
      run: |
        # Upload image and signature
        docker push myrepo/myapp:${{ github.sha }}
        # Upload signature as OCI artifact or attestation
```

### Example 3: Message Signing Between Services

Service A signs data, Service B verifies:

```yaml
# Namespace A: Service A (signer)
apiVersion: qubessec.io/v1
kind: QuantumSignatureKeyPair
metadata:
  name: service-a-keys
  namespace: service-a
spec:
  algorithm: Dilithium3

---
apiVersion: v1
kind: Secret
metadata:
  name: event-data
  namespace: service-a
type: Opaque
stringData:
  event: '{"user": "alice", "action": "purchase", "amount": 99.99}'

---
apiVersion: qubessec.io/v1
kind: QuantumSignMessage
metadata:
  name: sign-event
  namespace: service-a
spec:
  privateKeyRef:
    name: service-a-keys
  messageRef:
    name: event-data
  algorithm: Dilithium3
  outputSecretName: event-signature

---
# Namespace B: Service B (verifier)
apiVersion: qubessec.io/v1
kind: QuantumVerifySignature
metadata:
  name: verify-event
  namespace: service-b
spec:
  publicKeyRef:
    name: service-a-keys
    namespace: service-a  # Cross-namespace reference
  messageRef:
    name: event-data
    namespace: service-a
  signatureRef:
    name: event-signature
    namespace: service-a
  algorithm: Dilithium3
```

---

## Fingerprint Verification

Fingerprints provide a commitment without exposing full key material or large signatures:

```bash
# Sign a message
kubectl get qsm sign-event -o jsonpath='{.status.messageFingerprint}'
# Output: a1b2c3d4e5 (10 hex chars)

# Verify with same message
kubectl get qvs verify-event -o jsonpath='{.status.messageFingerprint}'
# Output: a1b2c3d4e5

# ✓ Fingerprints match, same message verified!
```

Use fingerprints in audit logs:

```json
{
  "timestamp": "2025-01-04T12:00:00Z",
  "signer": "release-signer",
  "algorithm": "Dilithium3",
  "messageFingerprint": "a1b2c3d4e5",
  "signatureFingerprint": "f6g7h8i9j0",
  "status": "signed"
}
```

---

## Algorithm Comparison

| Algorithm | Security Level | Key Size | Sig Size | Speed | Standardization |
|-----------|---|---|---|---|---|
| **ML-DSA-44** | AES-128 | 1632 bytes | 2420 bytes | Fast | NIST |
| **ML-DSA-65** | AES-192 | 2400 bytes | 3293 bytes | Fast | NIST |
| **ML-DSA-87** | AES-256 | 3167 bytes | 4740 bytes | Fast | NIST |
| **Falcon-512** | AES-128 | 897 bytes | ~690 bytes | Fastest | Accepted |
| **Falcon-1024** | AES-256 | 1793 bytes | ~1280 bytes | Fastest | Accepted |
| **SPHINCS+-SHA2** | AES-128/256 | ~64 bytes | ~17KB | Slowest | Accepted |

**Recommendation**: Use **Dilithium3 (ML-DSA-65)** for most applications—excellent balance of security, performance, and signature size.

---

## Security Considerations

### Key Management
- Store private keys in encrypted Kubernetes Secrets
- Enable ETCD encryption at rest
- Restrict RBAC access to signing keys
- Consider HSM integration (planned feature)

### Signature Verification
- Always verify signatures before trusting data
- Check message fingerprints match expected values
- Use verified messages in critical decisions
- Log verification results for audit trails

### Key Rotation
- Rotate signing keys periodically (annually recommended)
- Maintain key history for verifying old signatures
- Create new keys before retiring old ones
- Sign rollover events with both old and new keys

### Cross-Service Verification
- Share public keys through authenticated channels
- Use fingerprints for identity verification
- Implement proper RBAC for cross-namespace verification
- Monitor unauthorized verification attempts

---

## Troubleshooting

### Signature Verification Failed

The signature doesn't match. Common causes:

```bash
# 1. Different message
# Check message fingerprints match
kubectl get qsm sign-event -o jsonpath='{.status.messageFingerprint}'
kubectl get qvs verify-event -o jsonpath='{.status.messageFingerprint}'

# 2. Wrong keypair
# Verify public key matches the one used for signing
kubectl get qskp used-for-signing -o jsonpath='{.status.fingerprint}'

# 3. Corrupted signature
# Check signature is retrieved correctly
kubectl get secret event-signature -o jsonpath='{.data.signature}' | base64 -d | wc -c
```

### Cannot Access Private Key

Ensure the Secret exists and RBAC allows access:

```bash
# Verify Secret exists
kubectl get secret my-sig-keys

# Check RBAC permissions
kubectl auth can-i get secrets --as=system:serviceaccount:default:default
```

---

## Best Practices

1. **Use Strong Algorithms**: Dilithium3 or stronger for important signatures
2. **Regular Key Rotation**: New keys every 1-2 years minimum
3. **Secure Distribution**: Share public keys through authenticated channels
4. **Verify Immediately**: Don't delay verification of received messages
5. **Log Everything**: Maintain audit trails of all signing/verification
6. **Fingerprint Commitment**: Log message fingerprints for auditability
7. **Isolate Keys**: Keep signing keys in separate Secrets from app config
8. **Monitor Access**: Alert on unusual access to signing keys

---

## Integration with Other QubeSec Resources

### Sign a Certificate

```yaml
# Create a certificate
apiVersion: qubessec.io/v1
kind: QuantumCertificate
metadata:
  name: my-cert
spec:
  algorithm: Dilithium3
  commonName: "example.com"

---
# Sign attestation of the certificate
apiVersion: v1
kind: Secret
metadata:
  name: cert-attestation
stringData:
  content: "Certificate issued for example.com"

---
apiVersion: qubessec.io/v1
kind: QuantumSignMessage
metadata:
  name: attest-cert
spec:
  privateKeyRef:
    name: my-sig-keys
  messageRef:
    name: cert-attestation
  algorithm: Dilithium3
```

### Sign Deployment Images

```yaml
# Create image artifact
apiVersion: v1
kind: ConfigMap
metadata:
  name: image-manifest
data:
  manifest: "myapp:v1.2.3@sha256:abc123..."

---
# Sign the manifest
apiVersion: qubessec.io/v1
kind: QuantumSignMessage
metadata:
  name: sign-manifest
spec:
  privateKeyRef:
    name: image-signer
  messageRef:
    name: image-manifest
  algorithm: Dilithium3
```

---

## See Also

- [Introduction](./README.md)
- [Key Exchange Guide](./keyexchange.md)
- [Post-Quantum Certificates](./certificates.md)
- [Architecture & Design](./architecture.md)
- [Quick Start & Examples](./quickstart.md)
