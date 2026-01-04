# QubeSec mdbook Setup Instructions

## ✅ Your Homepage is Ready!

The beautiful landing page has been created at `src/README.md`. To see it, follow these steps:

## Step 1: Install mdbook

```bash
# Using Rust (recommended)
cargo install mdbook

# Or using Homebrew (macOS)
brew install mdbook

# Or using other package managers
# Ubuntu: sudo apt-get install mdbook
# Or download from: https://github.com/rust-lang/mdBook/releases
```

## Step 2: Verify Installation

```bash
mdbook --version
# Should output: mdbook v0.4.x or higher
```

## Step 3: Build the Documentation

```bash
cd /Users/shubham/myfiles/git/qubesec/qubesec.github.io

# Build the book
mdbook build

# Output directory: ./book/
```

## Step 4: View the Home Page Locally

```bash
# Serve on localhost:3000
mdbook serve

# Or serve on all interfaces (accessible from other machines)
mdbook serve -n 0.0.0.0

# Then open: http://localhost:3000
```

## 📁 What You'll See

### Landing Page Features:
- ✨ **Hero Section** with gradient title
- 🎯 **Quantum Threat Context** with government directives
- 📊 **Stats Dashboard** (9 CRDs, 4 algorithms, 100% NIST-approved)
- 🎨 **Feature Cards** (Key Gen, Key Exchange, Signatures, Certs, Random, Derivation)
- ⚡ **30-Second Example** with working YAML
- 📚 **Documentation Roadmap** with timeline navigation
- 🛡️ **Security Guarantees** section
- 📈 **Algorithm Comparison** table
- 🔗 **Quick Links** and resources

### Styling:
- 🌈 **Quantum Theme** — Cyan, Purple, Pink gradient
- 🌓 **Dark Mode Support** — Automatic user preference detection
- 📱 **Responsive Design** — Perfect on mobile, tablet, desktop
- ✨ **Smooth Animations** — Professional transitions and hover effects

## 🔧 File Structure

```
qubesec.github.io/
├── book.toml                      # Configuration ✅ Updated
├── src/
│   ├── README.md                  # 🏠 Landing page (your homepage!)
│   ├── custom.css                 # 🎨 Styling (newly added)
│   ├── SUMMARY.md                 # 📋 Table of contents
│   ├── quickstart.md              # 🚀 Quick start guide
│   ├── qrng.md                    # 🎲 Random numbers
│   ├── keyexchange.md             # 🔄 Key exchange (Kyber)
│   ├── signatures.md              # ✍️ Digital signatures
│   ├── certificates.md            # 📜 X.509 certificates
│   ├── architecture.md            # 📐 System design
│   └── api-reference.md           # 📖 API specs
└── theme/
    ├── custom.css                 # Original theme CSS
    └── index.html                 # Theme template
```

## 🎯 Next Steps

After installing mdbook:

```bash
# 1. Navigate to the project
cd /Users/shubham/myfiles/git/qubesec/qubesec.github.io

# 2. Start local server
mdbook serve -n 0.0.0.0

# 3. Open browser to http://localhost:3000

# 4. See your beautiful landing page!
```

## 🚀 Deploy to GitHub Pages

When ready to deploy:

```bash
# 1. Commit all changes
git add .
git commit -m "Update mdbook with beautiful landing page and complete documentation"

# 2. Push to main
git push origin main

# 3. GitHub Actions will automatically build and deploy
# Your site will be live at: https://qubesec.github.io
```

## ✨ What Makes Your Homepage Special

| Feature | Details |
|---------|---------|
| **Quantum Theme** | Custom cyan/purple/pink gradient colors |
| **Modern Design** | Feature cards, stats, timeline navigation |
| **Mobile Responsive** | Looks great on all devices |
| **Dark Mode** | Automatically adapts to user preference |
| **Government Context** | Links to official quantum threat directives |
| **Code Example** | Working YAML you can copy |
| **Professional** | Enterprise-grade styling and layout |
| **Fast** | No external dependencies, pure CSS |

## 📞 Troubleshooting

### "mdbook command not found"
```bash
# Install Rust first if needed
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Then install mdbook
cargo install mdbook
```

### "CSS not loading"
- Ensure `custom.css` is in `src/` directory
- Check `book.toml` has `additional-css = ["custom.css"]`
- Run `mdbook build` then `mdbook serve`

### "Links not working"
- Make sure all `.md` files are referenced in `SUMMARY.md`
- Link format: `./filename.html` (not `.md`)

### Want to see it live without building?
Your documentation will be live at `https://qubesec.github.io` once you push to GitHub!

---

**Your landing page is ready! Just install mdbook and run `mdbook serve`** 🚀
