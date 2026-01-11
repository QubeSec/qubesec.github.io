# QubeSec Documentation Website

Beautiful, modern documentation for [QubeSec](https://github.com/QubeSec/QubeSec) — a Kubernetes operator for post-quantum cryptography.

Built with [Docusaurus 3.9](https://docusaurus.io/).

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- npm or yarn

### Local Development

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
# Build static files
npm run build

# Test production build locally
npm run serve
```

## 📁 Project Structure

```
qubesec.github.io/
├── docs/                      # Documentation markdown files
│   ├── index.md              # Homepage (hero, features, CTA)
│   ├── quickstart.md         # Installation & examples
│   ├── architecture.md       # System design & data flows
│   ├── keyexchange.md        # Post-Quantum Key Exchange (Kyber)
│   ├── signatures.md         # Digital Signatures (Dilithium)
│   ├── certificates.md       # X.509 Certificate generation
│   ├── qrng.md               # Quantum Random Number Generation
│   └── api-reference.md      # Complete CRD specifications
├── src/
│   └── css/
│       └── custom.css        # Custom styling
├── static/
│   └── img/
│       └── qubesec.png       # Logo and static assets
├── docusaurus.config.ts      # Docusaurus configuration
├── sidebars.ts               # Sidebar navigation structure
└── package.json              # Dependencies and scripts
```

## 🎨 Design & Styling

### Custom Theme

The documentation uses a professional **gradient-based** design:

- **Primary**: Purple gradient (`#667eea` to `#764ba2`)
- **Accent Colors**: Quantum-themed blues and purples
- **Dark Mode**: Dracula theme for code blocks
- **Light Mode**: GitHub theme for code blocks

### Features

✨ **Dark/Light Mode** — Respects user preference  
📱 **Responsive Design** — Mobile-first approach  
🎯 **Feature Cards** — Interactive hover effects  
📊 **Clean Navigation** — Sidebar with collapsible sections  
⚡ **Fast Build** — Optimized with Webpack  
🔘 **CTA Buttons** — Clear call-to-action elements  
🧩 **Mermaid Diagrams** — Architecture visualizations  
🎨 **Syntax Highlighting** — Prism with multiple languages

### Customizing Styles

Edit `src/css/custom.css` to change colors and styles:

```css
:root {
  --ifm-color-primary: #2e8555;
  --ifm-color-primary-dark: #29784c;
  /* ... more color variables */
}
```

## 📄 Documentation Pages

### Homepage (`docs/index.md`)
- Hero section with gradient background
- 6 feature cards highlighting QubeSec capabilities
- Quick start guide (3 steps)
- Resource links and community section
- Call-to-action buttons

### Technical Guides

1. **[Quick Start](./docs/quickstart.md)**
   - Installation with kubectl
   - 5 progressive examples
   - Common operations and troubleshooting

2. **[Architecture](./docs/architecture.md)**
   - System design overview
   - 9 CRD types with Mermaid diagrams
   - Data flow visualization

3. **[Key Exchange](./docs/keyexchange.md)**
   - Kyber (ML-KEM-1024) implementation
   - Complete workflows with encapsulation/decapsulation
   - Key derivation patterns

4. **[Digital Signatures](./docs/signatures.md)**
   - Dilithium (ML-DSA) implementation
   - Sign and verify workflows
   - Real-world examples

5. **[Certificates](./docs/certificates.md)**
   - X.509 certificate generation
   - Self-signed and CA-issued certificates
   - Integration with Kubernetes Ingress

6. **[Quantum RNG](./docs/qrng.md)**
   - Cryptographically secure random numbers
   - Use cases and patterns
   - Fingerprinting and verification

7. **[API Reference](./docs/api-reference.md)**
   - Complete CRD specifications
   - Field descriptions
   - Status conditions

## 🚀 Deployment

### GitHub Actions

The repository uses GitHub Actions for automatic deployment to GitHub Pages:

- Triggered on push to main branch
- Builds with latest Node.js
- Deploys to gh-pages branch

### Manual Deployment

```bash
# Build production files
npm run build

# Deploy to GitHub Pages (requires setup)
npm run deploy
```

## 🔧 Configuration

### Docusaurus Config (`docusaurus.config.ts`)

Key settings:
- **Docs-only mode**: `routeBasePath: '/'` 
- **Mermaid support**: Enabled via `@docusaurus/theme-mermaid`
- **Syntax highlighting**: Bash, YAML, JSON, TypeScript, Nginx, Docker
- **Dark theme**: Dracula for code blocks
- **Light theme**: GitHub for code blocks

### Sidebar Configuration (`sidebars.ts`)

Navigation structure defining doc ordering and grouping.

## 📊 Content Statistics

- **Pages**: 8 documentation pages
- **Code Examples**: 50+ working examples
- **Diagrams**: Mermaid architecture diagrams
- **CRDs**: 9 Custom Resource Definitions
- **Algorithms**: Kyber, Dilithium, Falcon, SPHINCS+

## 🔗 Resources

- **QubeSec GitHub**: https://github.com/QubeSec/QubeSec
- **Docusaurus**: https://docusaurus.io/
- **NIST PQC**: https://csrc.nist.gov/projects/post-quantum-cryptography
- **Open Quantum Safe**: https://openquantumsafe.org/

## ✅ Quality Checklist

Before committing:

- [ ] Run `npm run build` successfully
- [ ] Test all internal links
- [ ] Verify code examples are accurate
- [ ] Check responsive design on mobile
- [ ] Validate Mermaid diagrams render
- [ ] Test both light and dark modes
- [ ] No console errors

## 📧 Contributing

To improve documentation:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm start`
5. Build with `npm run build`
6. Submit a pull request

## 📄 License

Same as [QubeSec](https://github.com/QubeSec/QubeSec) project.

---

**Made with ❤️ for a quantum-safe future** 🔐

