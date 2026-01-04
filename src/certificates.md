# Post-Quantum Certificates

## Overview

X.509 certificates are fundamental to modern public-key infrastructure (PKI), used in TLS/SSL, code signing, and authentication. **QuantumCertificate** is a QubeSec custom resource that generates post-quantum certificates using NIST-approved algorithms, ensuring your certificates remain secure against quantum computing threats.

Traditional certificates use RSA (2048-4096 bits) or ECDSA (256-384 bits), which quantum computers can break. QubeSec generates certificates using:
- **Dilithium (ML-DSA)**: NIST-standardized lattice-based signature algorithm
- **Falcon**: Fast lattice-based signature scheme
- **Hybrid Certificates**: Mix classical (RSA/ECDSA) with post-quantum for gradual migration

---

## The QuantumCertificate CRD

### Purpose
Create X.509 certificates signed with post-quantum algorithms for TLS, mutual TLS (mTLS), code signing, and authentication.

### Basic Usage

```yaml
apiVersion: qubessec.io/v1
kind: QuantumCertificate
metadata:
  name: my-pq-cert
  namespace: default
spec:
  algorithm: Dilithium3       # ML-DSA-65
  certType: self-signed       # self-signed, ca, or server
  commonName: "example.com"
  durationDays: 365
  outputSecretName: my-pq-cert-secret
```

### Specification

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `spec.algorithm` | string | Yes | `Dilithium2`, `Dilithium3`, `Dilithium5`, `Falcon512`, `Falcon1024` |
| `spec.certType` | string | Yes | `self-signed`, `ca` (CA cert), or `server` (server cert) |
| `spec.commonName` | string | Yes | Certificate CN (e.g., "example.com" or "my-service") |
| `spec.subjectAltNames` | []string | No | Subject Alternative Names (SANs) for domains |
| `spec.organization` | string | No | Certificate O field |
| `spec.organizationalUnit` | string | No | Certificate OU field |
| `spec.country` | string | No | Certificate C field (2-letter code) |
| `spec.state` | string | No | Certificate ST field |
| `spec.locality` | string | No | Certificate L field |
| `spec.durationDays` | integer | No | Certificate validity in days (default: 365) |
| `spec.outputSecretName` | string | No | Secret name to store cert (defaults to resource name) |
| `spec.parentCARef` | object | No | Reference to parent CA for signing (if issuing from CA) |

### Status Fields

```yaml
status:
  status: Success              # Pending, Success, or Failed
  certPEM: <base64>           # Base64-encoded PEM certificate
  privateKeyPEM: <base64>     # Base64-encoded private key (if owner)
  publicKeyPEM: <base64>      # Base64-encoded public key
  issuer: CN=my-pq-cert       # Certificate issuer
  subject: CN=my-pq-cert      # Certificate subject
  notBefore: 2025-01-04       # Certificate validity start
  notAfter: 2026-01-04        # Certificate validity end
  fingerprint: <hex>          # SHA256 fingerprint (first 10 chars)
  serialNumber: "..."         # Certificate serial number
  error: ""                   # Error message if failed
```

---

## Certificate Types

### 1. Self-Signed Certificates

A certificate that is both issuer and subject. Used for testing, internal services, and bootstrapping:

```yaml
apiVersion: qubessec.io/v1
kind: QuantumCertificate
metadata:
  name: bootstrap-cert
spec:
  algorithm: Dilithium3
  certType: self-signed
  commonName: "bootstrap.internal"
  durationDays: 730  # 2 years
```

### 2. Certificate Authority (CA) Certificates

A CA certificate used to sign other certificates. Create this first:

```yaml
apiVersion: qubessec.io/v1
kind: QuantumCertificate
metadata:
  name: my-pq-ca
spec:
  algorithm: Dilithium5           # Strongest for CA
  certType: ca
  commonName: "QubeSec Root CA"
  organization: "My Organization"
  country: "US"
  state: "CA"
  locality: "San Francisco"
  durationDays: 3650  # 10 years for CA
```

### 3. Server Certificates

Certificates for TLS servers, signed by a CA:

```yaml
apiVersion: qubessec.io/v1
kind: QuantumCertificate
metadata:
  name: server-cert
spec:
  algorithm: Dilithium3
  certType: server
  commonName: "api.example.com"
  subjectAltNames:
    - "api.example.com"
    - "*.example.com"
    - "example.com"
  parentCARef:
    name: my-pq-ca           # Reference to CA that signs this
  durationDays: 365
```

---

## Real-World Examples

### Example 1: Kubernetes Service Certificate

Create a certificate for a Kubernetes service to use in TLS:

```yaml
apiVersion: qubessec.io/v1
kind: QuantumCertificate
metadata:
  name: my-service-cert
  namespace: default
spec:
  algorithm: Dilithium3
  certType: server
  commonName: "my-service.default.svc.cluster.local"
  subjectAltNames:
    - "my-service"
    - "my-service.default"
    - "my-service.default.svc"
    - "my-service.default.svc.cluster.local"
  durationDays: 365

---
# Use the certificate in your service
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  ports:
  - port: 443
    targetPort: 8443
  selector:
    app: my-app
```

### Example 2: Mutual TLS (mTLS) Setup

Client and server certificates for mTLS:

```yaml
# Create a CA
apiVersion: qubessec.io/v1
kind: QuantumCertificate
metadata:
  name: mtls-ca
spec:
  algorithm: Dilithium5
  certType: ca
  commonName: "mTLS Root CA"
  durationDays: 3650

---
# Server certificate
apiVersion: qubessec.io/v1
kind: QuantumCertificate
metadata:
  name: server-mtls-cert
spec:
  algorithm: Dilithium3
  certType: server
  commonName: "server.example.com"
  parentCARef:
    name: mtls-ca
  durationDays: 365

---
# Client certificate
apiVersion: qubessec.io/v1
kind: QuantumCertificate
metadata:
  name: client-mtls-cert
spec:
  algorithm: Dilithium3
  certType: server  # mTLS client certs are also server-type
  commonName: "client.example.com"
  parentCARef:
    name: mtls-ca
  durationDays: 365
```

### Example 3: Hybrid Classical + Post-Quantum (Future Enhancement)

For transitional security, combining classical RSA with post-quantum Dilithium:

```yaml
# Note: Hybrid support planned for future QubeSec versions
# Currently, create separate classical and PQ certificates:

apiVersion: qubessec.io/v1
kind: QuantumCertificate
metadata:
  name: hybrid-pq-cert
spec:
  algorithm: Dilithium3
  certType: self-signed
  commonName: "hybrid-test.example.com"
```

---

## Using Certificates in Kubernetes

### Mount Certificate in Pod

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: tls-server
spec:
  containers:
  - name: app
    image: myapp:latest
    volumeMounts:
    - name: tls-certs
      mountPath: /etc/tls
      readOnly: true
  volumes:
  - name: tls-certs
    secret:
      secretName: my-service-cert  # Secret created by QuantumCertificate
```

### Configure Ingress with Post-Quantum Certs

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: pq-ingress
spec:
  tls:
  - hosts:
    - api.example.com
    secretName: api-pq-cert       # Use PQ certificate
  rules:
  - host: api.example.com
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 443
```

### Setup NGINX with Post-Quantum Certs

```nginx
server {
    listen 443 ssl;
    server_name api.example.com;

    # Load post-quantum certificate
    ssl_certificate /etc/nginx/certs/cert.pem;
    ssl_certificate_key /etc/nginx/certs/key.pem;

    # Modern TLS configuration
    ssl_protocols TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
```

---

## Certificate Chain Management

### Building a Certificate Chain

For a complete PKI with QubeSec:

```
1. Create Root CA (Dilithium5)
   ↓
2. Create Intermediate CA (Dilithium3, signed by Root)
   ↓
3. Create Server/Client Certs (Dilithium3, signed by Intermediate)
```

```yaml
# Step 1: Root CA
apiVersion: qubessec.io/v1
kind: QuantumCertificate
metadata:
  name: root-ca
spec:
  algorithm: Dilithium5
  certType: ca
  commonName: "QubeSec Root CA"
  durationDays: 7300  # 20 years

---
# Step 2: Intermediate CA (requires parent CA support - planned feature)
apiVersion: qubessec.io/v1
kind: QuantumCertificate
metadata:
  name: intermediate-ca
spec:
  algorithm: Dilithium3
  certType: ca
  commonName: "QubeSec Intermediate CA"
  parentCARef:
    name: root-ca  # Signed by root CA
  durationDays: 3650  # 10 years

---
# Step 3: End-entity certificate
apiVersion: qubessec.io/v1
kind: QuantumCertificate
metadata:
  name: server-cert
spec:
  algorithm: Dilithium3
  certType: server
  commonName: "myserver.example.com"
  parentCARef:
    name: intermediate-ca  # Signed by intermediate CA
  durationDays: 365
```

---

## Accessing Certificates

### Retrieve Certificate from Secret

```bash
# Get the certificate in PEM format
kubectl get secret my-service-cert -o jsonpath='{.data.cert\.pem}' | base64 -d > cert.pem

# Get the private key
kubectl get secret my-service-cert -o jsonpath='{.data.key\.pem}' | base64 -d > key.pem

# Get the public key
kubectl get secret my-service-cert -o jsonpath='{.data.pub\.pem}' | base64 -d > pub.pem

# View certificate details
openssl x509 -in cert.pem -text -noout
```

### Verify Certificate Fingerprint

```bash
# Get fingerprint from status (safe for logs)
kubectl get quantum certificate my-service-cert -o jsonpath='{.status.fingerprint}'

# Verify with openssl
openssl x509 -in cert.pem -fingerprint -noout
```

---

## Security Considerations

### Key Management
- Private keys are stored in Kubernetes Secrets
- Enable ETCD encryption at rest
- Use RBAC to restrict Secret access
- Consider HSM integration (planned feature)

### Certificate Validity
- Set appropriate expiration dates
- Implement certificate rotation before expiry
- Monitor certificate expiration with alerts
- Plan renewal workflows

### Hybrid Transition
- During migration from RSA/ECC to post-quantum:
  - Issue both classical and PQ certificates
  - Use server name indication (SNI) to serve correct cert
  - Support dual-cert scenarios in TLS implementations

### Fingerprint Verification
- Log certificate fingerprints for audit trails
- Verify fingerprints across systems without transmitting full certs
- Use fingerprints in configuration management and CI/CD

---

## Troubleshooting

### Certificate Generation Failed

```bash
# Check controller logs
kubectl logs -n qubesec-system deployment/qubesec-controller-manager | grep QuantumCertificate

# Check resource status
kubectl describe qc my-service-cert
```

### Certificate Expired

```bash
# Check current validity
kubectl get qc my-service-cert -o jsonpath='{.status.notAfter}'

# Generate a new certificate with same details
kubectl delete qc my-service-cert
kubectl apply -f certificate.yaml  # Apply again with updated resource
```

---

## Best Practices

1. **Organize by Purpose**: Use separate certificates for different services
2. **Set Appropriate Validity**: Longer for CAs (5-20 years), shorter for end-entity (1 year)
3. **Use SANs**: Always include Subject Alternative Names for all domains/IPs
4. **Rotate Regularly**: Re-issue certificates well before expiry
5. **Secure Storage**: Encrypt Secrets and restrict RBAC
6. **Automate Renewal**: Build certificate renewal into your CD pipeline
7. **Monitor Expiry**: Set up alerts for certificates approaching expiry
8. **Include Metadata**: Document cert purpose in labels/annotations

---

## Comparison: Classical vs Post-Quantum Certificates

| Aspect | RSA/ECDSA | Post-Quantum (Dilithium) |
|--------|-----------|------------------------|
| **Key Size** | 2048-4096 bits (RSA), 256-384 bits (ECDSA) | 2688-4096 bytes |
| **Signature Size** | 256-512 bytes | 2420-4740 bytes |
| **Security** | Vulnerable to quantum computers | Resistant to quantum attacks |
| **Performance** | Fast | Slightly slower |
| **Standardization** | Legacy | NIST-approved (Aug 2024) |
| **Quantum-Safe** | No | Yes |

---

## See Also

- [Introduction](./README.md)
- [Quantum Digital Signatures](./signatures.md)
- [Key Exchange Guide](./keyexchange.md)
- [Architecture & Design](./architecture.md)
- [Quick Start & Examples](./quickstart.md)
