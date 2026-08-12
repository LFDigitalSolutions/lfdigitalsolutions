# L.F Digital Solutions - Portfolio Website

A modern, responsive portfolio and marketing website for L.F Digital Solutions, built with vanilla HTML, CSS, and JavaScript.

## About

L.F Digital Solutions is a 2-person digital solutions company based in Digos City, Davao del Sur, Philippines. We specialize in custom website development, business systems, and creative design services.

**Tagline**: WE BUILD, YOU GROW

## Features

- 🎨 Modern, responsive design (320px to 3840px viewports)
- ⚡ High performance (Lighthouse 90+ desktop, 80+ mobile)
- ♿ WCAG 2.1 Level AA accessibility compliant
- 🔍 SEO optimized with structured data
- 📱 Mobile-first responsive design
- 🎭 Smooth animations and interactions
- 📮 Contact form with spam protection
- 📊 Google Analytics integration

## Technology Stack

- **HTML5**: Semantic markup for SEO and accessibility
- **CSS3**: Modern CSS with Grid, Flexbox, and custom properties
- **JavaScript (ES6+)**: Vanilla JavaScript for optimal performance
- **Formspree**: Contact form backend service

## Project Structure

```
/
├── index.html              # Main HTML document
├── css/
│   ├── reset.css          # CSS reset/normalization
│   ├── variables.css      # CSS custom properties
│   ├── layout.css         # Layout and grid systems
│   ├── components.css     # Reusable component styles
│   ├── sections.css       # Section-specific styles
│   └── animations.css     # Animation definitions
├── js/
│   ├── navigation.js      # Navigation and scroll management
│   ├── animations.js      # Intersection Observer animations
│   ├── form.js            # Contact form validation and submission
│   └── analytics.js       # Analytics integration
├── assets/
│   ├── images/            # Optimized images
│   ├── logo.svg           # Company logo
│   └── patterns/          # Background patterns
├── robots.txt             # Search engine directives
├── sitemap.xml            # XML sitemap
└── manifest.json          # Web app manifest
```

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, or Edge)
- A local development server (optional, for testing)

### Running Locally

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd lf-digital-solutions
   ```

2. Open `index.html` in your web browser, or use a local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   ```

3. Visit `http://localhost:8000` in your browser

### Configuration

#### Contact Form Setup

1. Sign up for a free Formspree account at https://formspree.io
2. Create a new form and get your form ID
3. Update the form action in `index.html`:
   ```html
   <form action="https://formspree.io/f/YOUR_FORM_ID" ...>
   ```

#### Google Analytics Setup

1. Create a Google Analytics 4 property
2. Get your measurement ID (format: G-XXXXXXXXXX)
3. Update the analytics script in `index.html`:
   ```html
   <script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
   ```

## Content Management

### Updating Company Information

Company information is defined in the HTML and can be updated directly in `index.html`. Look for these sections:

- **Hero Section**: Company name, tagline, main message
- **About Section**: Team member information
- **Contact Section**: Phone numbers, email addresses, location

### Adding/Updating Projects

Projects are defined in the Projects section. To add a new project:

1. Open `index.html`
2. Find the `<section id="projects">` element
3. Add a new project card following this template:

```html
<article class="project-card animate-on-scroll" data-animation="slide-up">
  <div class="project-image">
    <img src="assets/images/project-name.jpg" alt="Project Name">
  </div>
  <div class="project-content">
    <h3 class="project-title">Project Name</h3>
    <p class="project-description">Project description goes here...</p>
    <div class="project-tags">
      <span class="tag">Tag1</span>
      <span class="tag">Tag2</span>
    </div>
  </div>
</article>
```

### Image Optimization Guidelines

For best performance, optimize images before uploading:

- **Format**: WebP with JPEG/PNG fallbacks
- **Logo**: SVG format (scalable)
- **Project Images**: 800x600px, optimized to <200KB
- **Open Graph Image**: 1200x630px, optimized to <500KB
- **Tools**: Use [Squoosh](https://squoosh.app/) or [TinyPNG](https://tinypng.com/)

## Deployment

### Netlify (Recommended)

1. Push your code to GitHub
2. Sign up at [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Deploy settings:
   - Build command: (leave empty)
   - Publish directory: /
6. Click "Deploy site"

### Vercel

1. Push your code to GitHub
2. Sign up at [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your repository
5. Deploy with default settings

### GitHub Pages

1. Push your code to GitHub
2. Go to repository Settings > Pages
3. Select branch (main) and folder (root)
4. Save and wait for deployment

## Browser Support

- Chrome (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Edge (latest 2 versions)

## Performance Targets

- ✅ First Contentful Paint: ≤1.8s (3G)
- ✅ Largest Contentful Paint: ≤2.5s (3G)
- ✅ Lighthouse Score: 90+ (desktop), 80+ (mobile)
- ✅ WCAG 2.1 Level AA compliance

## Team

- **Arianne Faith S. Panes** - Creative Designer
  - Email: ariannefaith.panes.art@gmail.com
  - Phone: 0966 759 0644

- **Charles Louis C. David** - Developer
  - Email: charleslouis.david.dev@gmail.com
  - Phone: 0967 470 1338

## Location

San Antonio, Roxas Ext. Digos City, Davao del Sur, Philippines

## License

© 2026 L.F Digital Solutions. All rights reserved.

## Support

For technical support or inquiries, contact us at:
- Email: ariannefaith.panes.art@gmail.com or charleslouis.david.dev@gmail.com
- Phone: 0966 759 0644 / 0967 470 1338
