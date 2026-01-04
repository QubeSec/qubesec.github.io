# QubeSec Documentation Website

Beautiful, modern documentation for [QubeSec](https://github.com/QubeSec/QubeSec) — a Kubernetes operator for post-quantum cryptography.

## 🚀 Quick Start

### Prerequisites
- [mdbook](https://rust-lang.github.io/mdBook/) (install: `cargo install mdbook`)
- Rust toolchain

### Build & Serve Locally

```bash
# Test locally on all interfaces (0.0.0.0)
mdbook serve -n 0.0.0.0

# Or just localhost
mdbook serve
```

Then open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
qubesec.github.io/
├── book.toml                 # mdbook configuration
├── theme/
│   ├── custom.css           # Custom quantum-themed styling
│   └── index.html           # Theme template
└── src/
    ├── README.md            # Landing page (hero, features, stats)
    ├── SUMMARY.md           # Table of contents
    ├── quickstart.md        # Installation & 5 progressive examples
    ├── qrng.md              # Quantum Random Number Generation guide
    ├── keyexchange.md       # Post-Quantum Key Exchange (Kyber)
    ├── signatures.md        # Digital Signatures guide
    ├── certificates.md      # X.509 Certificate generation
    ├── architecture.md      # System design & data flows
    └── api-reference.md     # Complete CRD specifications
```

## 🎨 Design & Styling

### Custom Theme

The documentation uses a professional **quantum-themed** color scheme:

- **Primary**: Cyan (`#00d9ff`) — Represents quantum superposition
- **Secondary**: Purple (`#7c3aed`) — Post-quantum cryptography
- **Accent**: Pink (`#ec4899`) — Security & protection

### Features

✨ **Dark Mode** — Automatic detection of user preference  
📱 **Responsive Design** — Perfect on mobile, tablet, desktop  
🎯 **Feature Cards** — Interactive hover effects  
📊 **Statistics Badges** — Visual metrics dashboard  
⚡ **Smooth Animations** — Professional transitions  
🔘 **CTA Buttons** — Clear call-to-action elements  
🌗 **Light/Dark Themes** — Configured in `book.toml`

### Customizing Colors

Edit `/theme/custom.css` to change colors:

```css
:root {
  --qube-primary: #00d9ff;      /* Change primary color */
  --qube-secondary: #7c3aed;    /* Change secondary color */
  --qube-accent: #ec4899;       /* Change accent color */
}
```

## 📄 Documentation Sections

### Landing Page (`README.md`)
- Hero section with gradient title
- Stats dashboard (9 CRDs, 4 algorithms, 100% NIST-approved)
- Feature cards grid (6 core capabilities)
- 30-second example with complete YAML
- Quantum threat context with government directives
- Use cases and security guarantees
- Timeline-based navigation to other docs

### Guides

1. **[Quick Start](./src/quickstart.md)** (11 KB)
   - Installation instructions
   - 5 progressive examples
   - Common operations
   - Troubleshooting

2. **[Quantum Random Numbers](./src/qrng.md)** (7.7 KB)
   - QuantumRandomNumber CRD
   - Real-world examples
   - Security considerations
   - Fingerprinting patterns

3. **[Key Exchange](./src/keyexchange.md)** (10 KB)
   - Complete Kyber KEM workflow
   - 5-step process with verification
   - Cross-namespace examples
   - Algorithm selection guide

4. **[Digital Signatures](./src/signatures.md)** (13 KB)
   - Post-quantum signature algorithms
   - CI/CD integration examples
   - Key rotation & security
   - Message fingerprinting

5. **[Certificates](./src/certificates.md)** (12 KB)
   - Self-signed, CA, and server certificates
   - Certificate chain management
   - Kubernetes integration (Ingress, mTLS)
   - Real-world production examples

6. **[Architecture & Design](./src/architecture.md)** (17 KB)
   - System overview with diagrams
   - 9 CRDs fully documented
   - Reconciliation flows
   - Data storage model
   - Security architecture

7. **[API Reference](./src/api-reference.md)** (14 KB)
   - Complete CRD specifications
   - All resource fields documented
   - Common patterns & validation
   - Cross-namespace references

## 🔧 Development

### Building

```bash
# Build the documentation
mdbook build

# Output is in ./book/
ls -la book/
```

### Testing

```bash
# Watch mode with auto-reload
mdbook watch

# Serve on specific port
mdbook serve --port 3001
```

### Deployment

The documentation is automatically deployed to GitHub Pages when you push:

1. Push changes to `main` branch
2. GitHub Actions builds the site
3. Updated at `qubesec.github.io`

## 📝 Writing Guide

### Markdown Conventions

- Use `##` for section headers (H2)
- Use `###` for subsections (H3)
- Include code examples with language highlighting
- Add tables for comparisons
- Use lists for features/benefits

### Custom Styling Classes

Available CSS classes in the theme:

```markdown
<!-- Feature Card -->
<div class="feature-card">
  <h3>Title</h3>
  <p>Description</p>
</div>

<!-- Button -->
<a href="..." class="btn">Click Me</a>
<a href="..." class="btn btn-secondary">Secondary</a>

<!-- Badge -->
<span class="badge">Label</span>
<span class="badge badge-nist">NIST Approved</span>

<!-- Feature Grid (auto-responsive) -->
<div class="feature-grid">
  <div class="feature-card">...</div>
  <div class="feature-card">...</div>
</div>

<!-- Stats Dashboard -->
<div class="stats">
  <div class="stat-item">
    <div class="stat-number">9</div>
    <div class="stat-label">Custom Resources</div>
  </div>
</div>

<!-- Timeline -->
<div class="timeline">
  <div class="timeline-item">
    <div class="timeline-dot"></div>
    <div class="timeline-content">
      <h3>Title</h3>
      <p>Content</p>
    </div>
  </div>
</div>
```

## 🎯 Content Statistics

- **Total Pages**: 8 (1 landing + 7 guides)
- **Total Words**: 10,800+
- **Code Examples**: 50+
- **Diagrams**: ASCII art flows and tables
- **Tables**: 15+ comparison & reference tables
- **Real-World Examples**: 15+

## 🔗 Resources

- **QubeSec GitHub**: https://github.com/QubeSec/QubeSec
- **mdbook Docs**: https://rust-lang.github.io/mdBook/
- **NIST PQC**: https://csrc.nist.gov/projects/post-quantum-cryptography/
- **Open Quantum Safe**: https://openquantumsafe.org/

## 📋 Configuration

### book.toml Settings

```toml
[book]
title = "QubeSec"
description = "Quantum-Safe Security for Kubernetes..."
src = "src"

[output.html]
theme = "theme"                 # Use custom theme
default-theme = "light"         # Light by default
preferred-dark-theme = "dark"   # Dark mode option
curly-quotes = true             # Professional quotes
mathjax-support = true          # Math formula support
```

### Theme Customization

The `/theme` directory contains:
- `custom.css` — All styling (400+ lines)
- `index.html` — Theme template

To override mdbook defaults, ensure the theme directory structure matches mdbook's expected layout.

## 🚀 Deployment

### GitHub Pages

1. Ensure `book.toml` exists in repository root
2. Push to main branch
3. GitHub Actions will automatically build and deploy

### Manual Build

```bash
mdbook build
# Upload ./book/ to any static hosting
```

## ✅ Quality Checklist

Before committing changes:

- [ ] All links work correctly
- [ ] Code examples are accurate
- [ ] Tables render properly
- [ ] Images load correctly
- [ ] No broken cross-references
- [ ] Tested in light and dark modes
- [ ] Mobile responsive (test on mobile)
- [ ] No typos or grammar errors

## 📧 Support & Contributions

For documentation improvements:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `mdbook serve`
5. Submit a pull request

## 📄 License

Same as [QubeSec](https://github.com/QubeSec/QubeSec) project.

---

**Made with ❤️ for a quantum-safe future** 🔐

