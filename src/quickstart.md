# Quick Start & Examples

## Before You Begin

- Kubernetes cluster v1.20+
- `kubectl` configured with cluster access
- QubeSec operator installed on the cluster
- 5-10 minutes of your time

---

## Installation

Install QubeSec operator using your preferred method:

```bash
# Using Helm (recommended)
helm repo add qubesec https://qubesec.github.io/helm-charts
helm install qubesec qubesec/qubesec -n qubesec-system --create-namespace

# Using kubectl + YAML
kubectl apply -k github.com/QubeSec/QubeSec/config/default

# Verify installation
kubectl get deployment -n qubesec-system qubesec-controller-manager
kubectl get crd | grep qubessec
```

---

## Example 1: Generate Random Bytes

Create cryptographically secure random numbers for your applications:

```bash
cat > random-numbers.yaml << 'EOF'
apiVersion: qubessec.io/v1
kind: QuantumRandomNumber
metadata:
  name: my-random
spec:
  numBytes: 32
EOF

kubectl apply -f random-numbers.yaml
kubectl get qrn my-random -w  # Watch until Success
kubectl get qrn my-random -o jsonpath='{.status.fingerprint}'
```

Retrieve the random data:

```bash
kubectl get secret my-random -o jsonpath='{.data.random}' | base64 -d | xxd
```

---

## Example 2: Post-Quantum Key Exchange

Implement secure key exchange using Kyber (ML-KEM-1024):

```bash
cat > key-exchange.yaml << 'EOF'
# Step 1: Alice generates a keypair
apiVersion: qubessec.io/v1
kind: QuantumKEMKeyPair
metadata:
  name: alice-keypair
spec:
  algorithm: Kyber1024

---
# Step 2: Bob encapsulates using Alice's public key
apiVersion: qubessec.io/v1
kind: QuantumEncapsulateSecret
metadata:
  name: bob-encapsulate
spec:
  algorithm: Kyber1024
  publicKeyRef:
    name: alice-keypair

---
# Step 3: Alice decapsulates to recover the same secret
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

---
# Step 4: Derive AES-256 encryption keys
apiVersion: qubessec.io/v1
kind: QuantumDerivedKey
metadata:
  name: shared-aes-key
spec:
  sharedSecretRef:
    name: alice-decapsulate
  keyLength: 32
  outputSecretName: final-encryption-key
EOF

kubectl apply -f key-exchange.yaml
```

Verify the key exchange succeeded:

```bash
# Wait for all resources
kubectl get qkkp,qes,qds,qdk -w

# Verify fingerprints match (proof of successful key exchange)
echo "Bob's shared secret fingerprint:"
kubectl get qes bob-encapsulate -o jsonpath='{.status.fingerprint}'

echo "Alice's recovered secret fingerprint:"
kubectl get qds alice-decapsulate -o jsonpath='{.status.fingerprint}'

# Both should be identical!

# Get the final AES-256 encryption key
kubectl get secret final-encryption-key -o jsonpath='{.data.key}' | base64 -d | xxd
```

---

## Example 3: Digital Signatures

Sign and verify messages using post-quantum algorithms:

```bash
cat > signatures.yaml << 'EOF'
# Create signature keypair
apiVersion: qubessec.io/v1
kind: QuantumSignatureKeyPair
metadata:
  name: signer-keys
spec:
  algorithm: Dilithium3  # ML-DSA-65

---
# Create a message to sign
apiVersion: v1
kind: Secret
metadata:
  name: my-message
type: Opaque
stringData:
  content: "Important message that needs signature"

---
# Sign the message
apiVersion: qubessec.io/v1
kind: QuantumSignMessage
metadata:
  name: sign-message
spec:
  privateKeyRef:
    name: signer-keys
  messageRef:
    name: my-message
  algorithm: Dilithium3
  outputSecretName: my-signature

---
# Verify the signature
apiVersion: qubessec.io/v1
kind: QuantumVerifySignature
metadata:
  name: verify-message
spec:
  publicKeyRef:
    name: signer-keys
  messageRef:
    name: my-message
  signatureRef:
    name: my-signature
  algorithm: Dilithium3
EOF

kubectl apply -f signatures.yaml
kubectl get qskp,qsm,qvs -w
```

Check verification result:

```bash
# Get verification status
kubectl get qvs verify-message -o jsonpath='{.status.status}'
# Output: Valid (or Invalid if signature doesn't match)

# Get the signature
kubectl get secret my-signature -o jsonpath='{.data.signature}' | base64 -d > signature.bin
```

---

## Example 4: Post-Quantum Certificates

Create an X.509 certificate for TLS:

```bash
cat > certificate.yaml << 'EOF'
apiVersion: qubessec.io/v1
kind: QuantumCertificate
metadata:
  name: my-service-cert
spec:
  algorithm: Dilithium3
  certType: self-signed
  commonName: "my-service.default.svc.cluster.local"
  subjectAltNames:
    - "my-service"
    - "my-service.default"
    - "my-service.default.svc.cluster.local"
  organization: "My Organization"
  country: "US"
  durationDays: 365
EOF

kubectl apply -f certificate.yaml
kubectl get qc my-service-cert -w
```

Use the certificate in your Ingress:

```bash
cat > ingress.yaml << 'EOF'
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: my-ingress
spec:
  tls:
  - hosts:
    - my-service.default.svc.cluster.local
    secretName: my-service-cert-secret
  rules:
  - host: my-service.default.svc.cluster.local
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: my-service
            port:
              number: 443
EOF

kubectl apply -f ingress.yaml
```

---

## Example 5: Complete Multi-Step Workflow

Combine multiple resources for a comprehensive security setup:

```bash
cat > complete-workflow.yaml << 'EOF'
---
# 1. Generate random seed material
apiVersion: qubessec.io/v1
kind: QuantumRandomNumber
metadata:
  name: workflow-seed
spec:
  numBytes: 64

---
# 2. Create signature keys
apiVersion: qubessec.io/v1
kind: QuantumSignatureKeyPair
metadata:
  name: workflow-signer
spec:
  algorithm: Dilithium3

---
# 3. Create KEM keypair
apiVersion: qubessec.io/v1
kind: QuantumKEMKeyPair
metadata:
  name: workflow-kem
spec:
  algorithm: Kyber1024

---
# 4. Encapsulate using public key
apiVersion: qubessec.io/v1
kind: QuantumEncapsulateSecret
metadata:
  name: workflow-encapsulate
spec:
  algorithm: Kyber1024
  publicKeyRef:
    name: workflow-kem

---
# 5. Derive encryption key
apiVersion: qubessec.io/v1
kind: QuantumDerivedKey
metadata:
  name: workflow-derived-key
spec:
  sharedSecretRef:
    name: workflow-encapsulate
  keyLength: 32

---
# 6. Create message to sign
apiVersion: v1
kind: Secret
metadata:
  name: workflow-message
type: Opaque
stringData:
  content: "This workflow demonstrates QubeSec's capabilities"

---
# 7. Sign the message
apiVersion: qubessec.io/v1
kind: QuantumSignMessage
metadata:
  name: workflow-sign
spec:
  privateKeyRef:
    name: workflow-signer
  messageRef:
    name: workflow-message
  algorithm: Dilithium3

---
# 8. Verify the signature
apiVersion: qubessec.io/v1
kind: QuantumVerifySignature
metadata:
  name: workflow-verify
spec:
  publicKeyRef:
    name: workflow-signer
  messageRef:
    name: workflow-message
  signatureRef:
    name: workflow-sign
  algorithm: Dilithium3

---
# 9. Create certificate
apiVersion: qubessec.io/v1
kind: QuantumCertificate
metadata:
  name: workflow-certificate
spec:
  algorithm: Dilithium3
  certType: self-signed
  commonName: "workflow.example.com"
  durationDays: 365
EOF

kubectl apply -f complete-workflow.yaml
```

Monitor all resources:

```bash
# Watch creation progress
kubectl get qrn,qskp,qkkp,qes,qdk,qsm,qvs,qc -w

# Once all are ready, check status
kubectl get qrn,qskp,qkkp,qes,qdk,qsm,qvs,qc -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.status.status}{"\n"}{end}'
```

---

## Accessing Generated Resources

### Retrieve Random Data

```bash
kubectl get secret my-random -o jsonpath='{.data.random}' | base64 -d | xxd
```

### Retrieve Keypair

```bash
# Public key
kubectl get secret alice-keypair -o jsonpath='{.data.public_key}' | base64 -d > pub.pem

# Private key (be careful!)
kubectl get secret alice-keypair -o jsonpath='{.data.private_key}' | base64 -d > priv.pem
```

### Retrieve Certificate

```bash
# Certificate
kubectl get secret my-service-cert-secret -o jsonpath='{.data.cert\.pem}' | base64 -d > cert.pem

# Private key
kubectl get secret my-service-cert-secret -o jsonpath='{.data.key\.pem}' | base64 -d > key.pem

# View certificate details
openssl x509 -in cert.pem -text -noout
```

### Retrieve Signature

```bash
kubectl get secret my-signature -o jsonpath='{.data.signature}' | base64 -d > signature.bin
```

---

## Common Operations

### Check Status of All Resources

```bash
# List all QubeSec resources
kubectl get qrn,qkkp,qes,qds,qdk,qskp,qsm,qvs,qc -A

# Get detailed status
kubectl describe qkkp alice-keypair
kubectl describe qes bob-encapsulate
kubectl describe qvs verify-message
```

### Delete Resources

```bash
# Delete a single resource (associated Secrets auto-deleted)
kubectl delete qkkp alice-keypair

# Delete all resources in a file
kubectl delete -f key-exchange.yaml

# Delete by label
kubectl delete qrn -l app=myapp
```

### View Fingerprints

```bash
# Get fingerprint from any resource
kubectl get qkkp alice-keypair -o jsonpath='{.status.fingerprint}'
kubectl get qes bob-encapsulate -o jsonpath='{.status.fingerprint}'
kubectl get qvs verify-message -o jsonpath='{.status.messageFingerprint}'
```

### Mount in Pod

```bash
cat > pod.yaml << 'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: app-with-keys
spec:
  containers:
  - name: app
    image: myapp:latest
    volumeMounts:
    - name: encryption-key
      mountPath: /secrets/encryption
      readOnly: true
    - name: certificate
      mountPath: /etc/tls
      readOnly: true
  volumes:
  - name: encryption-key
    secret:
      secretName: final-encryption-key
  - name: certificate
    secret:
      secretName: my-service-cert-secret
EOF

kubectl apply -f pod.yaml
```

---

## Troubleshooting

### Resource Stuck in "Pending"

```bash
# Check controller logs
kubectl logs -n qubesec-system deployment/qubesec-controller-manager -f

# Check resource events
kubectl describe qkkp alice-keypair

# Check if Secret was created
kubectl get secret alice-keypair
```

### Signature Verification Failed

```bash
# Check fingerprints match
echo "Message fingerprint at signing:"
kubectl get qsm sign-message -o jsonpath='{.status.messageFingerprint}'

echo "Message fingerprint at verification:"
kubectl get qvs verify-message -o jsonpath='{.status.messageFingerprint}'

# If they don't match, the message was modified
```

### Permission Denied Errors

```bash
# Check RBAC permissions
kubectl auth can-i get secrets
kubectl auth can-i list customresourcedefinitions

# Check service account
kubectl get sa -n qubesec-system
```

---

## Next Steps

- **Learn Architecture**: Read [Architecture & Design](./architecture.md)
- **Key Exchange Deep Dive**: See [Key Exchange Guide](./keyexchange.md)
- **Digital Signatures**: Explore [Quantum Digital Signatures](./signatures.md)
- **Certificates**: Study [Post-Quantum Certificates](./certificates.md)
- **API Details**: Reference [API Reference](./api-reference.md)

---

## Getting Help

- Check logs: `kubectl logs -n qubesec-system -f deployment/qubesec-controller-manager`
- Describe resources: `kubectl describe qkkp <name>`
- GitHub Issues: https://github.com/QubeSec/QubeSec/issues
- Documentation: https://qubesec.github.io/

