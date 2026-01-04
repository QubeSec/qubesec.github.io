# Post-Quantum Key Exchange Guide

## Overview

Key exchange is the foundation of secure communication. The **QuantumKEMKeyPair**, **QuantumEncapsulateSecret**, and **QuantumDecapsulateSecret** resources implement NIST-standardized Kyber (ML-KEM) for post-quantum secure key establishment.

This guide covers implementing complete quantum-safe key exchange workflows in Kubernetes—from keypair generation to shared secret recovery.

---

## The Kyber KEM Algorithm

**Kyber (ML-KEM)** is a lattice-based Key Encapsulation Mechanism (KEM) standardized by NIST in November 2024. It provides:
- **Security**: Resistant to quantum computer attacks
- **Efficiency**: Fast key establishment with small ciphertexts
- **Standardization**: NIST FIPS 203-approved
- **Variants**: ML-KEM-512, ML-KEM-768, ML-KEM-1024 for different security levels

---

## Resource Overview

### QuantumKEMKeyPair
Generate an asymmetric keypair for KEM operations.

```yaml
apiVersion: qubessec.io/v1
kind: QuantumKEMKeyPair
metadata:
  name: alice-keypair
spec:
  algorithm: Kyber1024  # ML-KEM-1024 (highest security)
```

**Algorithms**: `Kyber512` (ML-KEM-512), `Kyber768` (ML-KEM-768), `Kyber1024` (ML-KEM-1024)

**Output**: Secret containing public key and private key, status with public key fingerprint

### QuantumEncapsulateSecret
Create a shared secret by encapsulating with a public key.

```yaml
apiVersion: qubessec.io/v1
kind: QuantumEncapsulateSecret
metadata:
  name: bob-encapsulate
spec:
  algorithm: Kyber1024
  publicKeyRef:
    name: alice-keypair
```

**Input**: Reference to a QuantumKEMKeyPair  
**Output**: Secret with shared secret and ciphertext, status with fingerprint

### QuantumDecapsulateSecret
Recover the shared secret using the private key and ciphertext.

```yaml
apiVersion: qubessec.io/v1
kind: QuantumDecapsulateSecret
metadata:
  name: alice-decapsulate
spec:
  algorithm: Kyber1024
  privateKeyRef:
    name: alice-keypair
  ciphertextRef:
    name: bob-encapsulate
```

**Inputs**: Private key reference and ciphertext reference  
**Output**: Recovered shared secret with matching fingerprint

---

## Complete Key Exchange Workflow

### Step 1: Alice Generates a Keypair

```yaml
apiVersion: qubessec.io/v1
kind: QuantumKEMKeyPair
metadata:
  name: alice-keypair
  namespace: default
spec:
  algorithm: Kyber1024
```

After reconciliation, Alice has:
- **Public Key**: Stored in `alice-keypair` Secret (safe to share)
- **Private Key**: Stored in `alice-keypair` Secret (keep secret)
- **Fingerprint**: In status (public commitment to the keypair)

### Step 2: Bob Obtains Alice's Public Key

In a real scenario, Bob receives Alice's public key through a secure channel:

```bash
# Bob retrieves Alice's public key from the Secret
kubectl get secret alice-keypair -o jsonpath='{.data.public_key}' | base64 -d > alice_pk.pem
```

### Step 3: Bob Encapsulates Using Alice's Public Key

```yaml
apiVersion: qubessec.io/v1
kind: QuantumEncapsulateSecret
metadata:
  name: bob-encapsulate
  namespace: default
spec:
  algorithm: Kyber1024
  publicKeyRef:
    name: alice-keypair
```

Result:
- **Shared Secret**: Generated inside the encapsulation (stored in Secret)
- **Ciphertext**: Companion data to recover the secret
- **Bob's Secret**: Bob now has a shared secret at `bob-encapsulate`

### Step 4: Bob Sends Ciphertext to Alice

The ciphertext is non-secret and can be transmitted publicly:

```bash
# Bob extracts and sends the ciphertext to Alice
kubectl get secret bob-encapsulate -o jsonpath='{.data.ciphertext}' | base64 -d > ciphertext.bin
```

### Step 5: Alice Decapsulates to Recover Shared Secret

```yaml
apiVersion: qubessec.io/v1
kind: QuantumDecapsulateSecret
metadata:
  name: alice-decapsulate
  namespace: default
spec:
  algorithm: Kyber1024
  privateKeyRef:
    name: alice-keypair
  ciphertextRef:
    name: bob-encapsulate
```

Result:
- **Alice's Shared Secret**: Recovered at `alice-decapsulate`
- **Verification**: Both secrets have identical fingerprints!

### Step 6: Verify Correctness

```bash
# Get Bob's shared secret fingerprint
kubectl get qes bob-encapsulate -o jsonpath='{.status.fingerprint}'
# Output: a1b2c3d4e5

# Get Alice's decapsulated fingerprint
kubectl get qds alice-decapsulate -o jsonpath='{.status.fingerprint}'
# Output: a1b2c3d4e5

# ✓ Fingerprints match! Key exchange successful.
```

---

## Deriving Encryption Keys from Shared Secrets

Shared secrets are large random numbers. Derive actual encryption keys:

### Using QuantumDerivedKey

```yaml
apiVersion: qubessec.io/v1
kind: QuantumDerivedKey
metadata:
  name: alice-aes-key
spec:
  sharedSecretRef:
    name: alice-decapsulate  # From decapsulation
  algorithm: HKDF-SHA256
  keyLength: 32  # 256-bit AES key
  outputSecretName: alice-encryption-key

---
apiVersion: qubessec.io/v1
kind: QuantumDerivedKey
metadata:
  name: bob-aes-key
spec:
  sharedSecretRef:
    name: bob-encapsulate    # From encapsulation
  algorithm: HKDF-SHA256
  keyLength: 32  # 256-bit AES key
  outputSecretName: bob-encryption-key
```

Result: Both Alice and Bob have identical AES-256 keys!

---

## Complete End-to-End Example

Here's a complete working example you can deploy:

```yaml
# Step 1: Alice's keypair
apiVersion: qubessec.io/v1
kind: QuantumKEMKeyPair
metadata:
  name: alice-keypair
  namespace: default
spec:
  algorithm: Kyber1024

---
# Step 2: Bob encapsulates
apiVersion: qubessec.io/v1
kind: QuantumEncapsulateSecret
metadata:
  name: bob-secret
  namespace: default
spec:
  algorithm: Kyber1024
  publicKeyRef:
    name: alice-keypair

---
# Step 3: Alice decapsulates
apiVersion: qubessec.io/v1
kind: QuantumDecapsulateSecret
metadata:
  name: alice-secret
  namespace: default
spec:
  algorithm: Kyber1024
  privateKeyRef:
    name: alice-keypair
  ciphertextRef:
    name: bob-secret

---
# Step 4: Derive encryption keys
apiVersion: qubessec.io/v1
kind: QuantumDerivedKey
metadata:
  name: shared-aes-key
spec:
  sharedSecretRef:
    name: alice-secret
  keyLength: 32
  outputSecretName: final-encryption-key
```

Deploy and verify:

```bash
# Apply resources
kubectl apply -f key-exchange.yaml

# Wait for reconciliation
kubectl get qkkp alice-keypair
kubectl get qes bob-secret
kubectl get qds alice-secret
kubectl get qdk shared-aes-key

# Verify fingerprints match
echo "Bob's secret fingerprint:"
kubectl get qes bob-secret -o jsonpath='{.status.fingerprint}'

echo "Alice's secret fingerprint:"
kubectl get qds alice-secret -o jsonpath='{.status.fingerprint}'

# Retrieve the final AES key
kubectl get secret final-encryption-key -o jsonpath='{.data.key}' | base64 -d | xxd
```

---

## Security Strengths of Kyber

### Post-Quantum Security
Kyber's security is based on the **Learning With Errors (LWE)** problem over lattices, believed to be hard even for quantum computers:

- **ML-KEM-512**: ~AES-128 security level
- **ML-KEM-768**: ~AES-192 security level  
- **ML-KEM-1024**: ~AES-256 security level

### Advantages
✅ NIST-standardized (FIPS 203)  
✅ Fast key establishment (microseconds)  
✅ Modest ciphertext sizes (1088-1568 bytes)  
✅ No quantum assumptions needed  
✅ Proven security over 20+ years of research

---

## Cross-Namespace Key Exchange

QubeSec supports cross-namespace references for multi-team scenarios:

```yaml
# Alice's keypair in namespace-a
apiVersion: qubessec.io/v1
kind: QuantumKEMKeyPair
metadata:
  name: alice-keypair
  namespace: namespace-a
spec:
  algorithm: Kyber1024

---
# Bob's encapsulation in namespace-b, referencing Alice's key
apiVersion: qubessec.io/v1
kind: QuantumEncapsulateSecret
metadata:
  name: bob-secret
  namespace: namespace-b
spec:
  algorithm: Kyber1024
  publicKeyRef:
    name: alice-keypair
    namespace: namespace-a  # Cross-namespace reference
```

**RBAC Required**: The service account in namespace-b must have permissions to read Secrets in namespace-a.

---

## Algorithm Selection Guide

| Use Case | Recommended | Rationale |
|----------|-------------|-----------|
| **General TLS** | Kyber768 (ML-KEM-768) | Balanced security & performance |
| **High-Security** | Kyber1024 (ML-KEM-1024) | Maximum security margin |
| **Performance-Critical** | Kyber512 (ML-KEM-512) | Fastest, still quantum-safe |
| **Legacy Compat** | Kyber768 | Standard choice for transition |

---

## Troubleshooting

### Fingerprints Don't Match

This indicates the key exchange failed. Check:

```bash
# Verify both resources succeeded
kubectl get qes bob-secret -o jsonpath='{.status.status}'    # Should be "Success"
kubectl get qds alice-secret -o jsonpath='{.status.status}'  # Should be "Success"

# Check error messages
kubectl describe qes bob-secret
kubectl describe qds alice-secret
```

### Cannot Find Public Key

The `publicKeyRef` or `privateKeyRef` must point to an existing QuantumKEMKeyPair:

```bash
# Verify the keypair exists
kubectl get qkkp alice-keypair
# If not found, create it first
```

### Cross-Namespace References Fail

Ensure RBAC permissions:

```bash
# Give service account read access to namespace-a Secrets
kubectl create rolebinding cross-namespace-read \
  --clusterrole=view \
  --serviceaccount=namespace-b:default \
  --namespace=namespace-a
```

---

## Best Practices

1. **Use Kyber1024 for Important Data**: Maximum security for long-term confidentiality
2. **Rotate Keys Periodically**: Don't reuse the same keypair indefinitely
3. **Secure Public Key Distribution**: Use authenticated channels for public key exchange
4. **Never Reuse Ciphertexts**: Each encapsulation produces a unique ciphertext
5. **Fingerprint Verification**: Log fingerprints to audit key exchanges
6. **Proper Secret Storage**: Enable Kubernetes Secret encryption at rest
7. **RBAC Management**: Restrict who can access private keys

---

## Integration with Other QubeSec Resources

### Sign the Shared Secret

After key exchange, sign the derived key for authenticity:

```yaml
apiVersion: qubessec.io/v1
kind: QuantumSignMessage
metadata:
  name: sign-key-exchange
spec:
  privateKeyRef:
    name: alice-signature-keypair
  messageRef:
    name: final-encryption-key
```

### Use Key Exchange Result in Pods

Mount the derived key in your application:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: encrypted-app
spec:
  containers:
  - name: app
    image: myapp:latest
    volumeMounts:
    - name: encryption-key
      mountPath: /secrets/encryption
  volumes:
  - name: encryption-key
    secret:
      secretName: final-encryption-key
```

---

## See Also

- [Introduction](./README.md)
- [Quantum Digital Signatures](./signatures.md)
- [Post-Quantum Certificates](./certificates.md)
- [Architecture & Design](./architecture.md)
- [Quick Start & Examples](./quickstart.md)
