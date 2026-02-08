# Design Document: Use Case SEO Optimization

## Overview

This design document outlines the technical approach for optimizing 21 HTML files in the use-cases folder. The optimization consolidates multiple CSS files into a single unified stylesheet, adds comprehensive SEO meta tags and JSON-LD structured data schemas, implements call-to-action sections, and ensures consistent responsive design matching the main site (index.html).

The solution involves creating a reusable stylesheet that captures all styling from reset.css, layout.css, navigation.css, hero.css, and critical.css, then systematically updating each HTML file with industry-specific SEO metadata, structured data schemas (Article, FAQPage, BreadcrumbList, HowTo, Organization), and a prominent CTA section linking to the contact form.

## Architecture

### High-Level Components

1. **Unified Stylesheet Module** (use-cases/style.css)
   - Consolidates all existing CSS files
   - Implements mobile-first responsive design
   - Includes dark mode support
   - Provides consistent styling across all use case pages

2. **HTML Template Structure**
   - Semantic HTML5 elements (article, section, nav, footer)
   - Accessibility features (skip links, ARIA labels)
   - Proper heading hierarchy
   - Preserved content structure

3. **SEO Metadata Module**
   - Standard meta tags (charset, viewport, description, keywords, author, robots)
   - Open Graph tags for social media
   - Twitter Card tags
   - Additional SEO tags (canonical, language, theme-color)

4. **Structured Data Module**
   - Article schema
   - FAQPage schema
   - BreadcrumbList schema
   - HowTo schema (conditional)
   - Organization schema

5. **Call-to-Action Component**
   - Heading and persuasive text
   - Styled button linking to contact form
   - Responsive and accessible design

### Data Flow

```
Existing Use Case HTML Files
    ↓
Remove inline styles and multiple CSS references
    ↓
Add single stylesheet reference (use-cases/style.css)
    ↓
Add comprehensive SEO meta tags (unique per file)
    ↓
Add JSON-LD structured data schemas (unique per file)
    ↓
Add CTA section before footer
    ↓
Validate HTML and schema syntax
    ↓
Optimized Use Case HTML Files
```

## Components and Interfaces

### 1. Unified Stylesheet (use-cases/style.css)

**Purpose**: Provide all styling for use case pages in a single, maintainable file.

**Structure**:

```css
/* Section Organization */
1. Reset and Base Styles
2. Typography
3. Layout and Container
4. Navigation (sticky nav with mobile menu)
5. Hero Section (gradient background)
6. Content Sections
7. Call-to-Action Section
8. Footer
9. Responsive Breakpoints (576px, 768px, 992px, 1200px)
10. Dark Mode (@media prefers-color-scheme: dark)
11. Accessibility Styles
12. Performance Optimizations
```

**Key CSS Variables**:
- Primary text color: `#2c3e50`
- Accent color: `#3498db`
- Background: `#ffffff` (light mode), `#121212` (dark mode)
- Font family: `'Segoe UI', -apple-system, BlinkMacSystemFont, 'Roboto', 'Helvetica Neue', Arial, sans-serif`
- Font display: `swap`

**Responsive Breakpoints**:
- Mobile: < 576px
- Small: 576px - 767px
- Medium: 768px - 991px
- Large: 992px - 1199px
- Extra Large: ≥ 1200px

### 2. HTML Template Structure

**Document Structure**:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- SEO Meta Tags -->
    <!-- Preload Stylesheet -->
    <!-- JSON-LD Schemas -->
</head>
<body>
    <!-- Skip Links -->
    <nav><!-- Navigation --></nav>
    <main>
        <article>
            <header><!-- Page Title --></header>
            <section><!-- Content Sections --></section>
        </article>
        <!-- CTA Section -->
    </main>
    <footer><!-- Site Footer --></footer>
</body>
</html>
```

### 3. SEO Metadata Module

**Standard Meta Tags**:
```html
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="description" content="[Unique 150-160 char description]">
<meta name="keywords" content="[Industry-specific keywords]">
<meta name="author" content="Hussain Nazary">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="language" content="English">
<meta name="theme-color" content="#0078d4">
<link rel="canonical" href="https://ggufloader.github.io/use-cases/[filename].html">
```

**Open Graph Tags**:
```html
<meta property="og:type" content="article">
<meta property="og:title" content="[Page Title]">
<meta property="og:description" content="[Description]">
<meta property="og:url" content="https://ggufloader.github.io/use-cases/[filename].html">
<meta property="og:image" content="https://ggufloader.github.io/preview.png">
<meta property="og:site_name" content="GGUF Loader">
```

**Twitter Card Tags**:
```html
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="[Page Title]">
<meta name="twitter:description" content="[Description]">
<meta name="twitter:image" content="https://ggufloader.github.io/preview.png">
```

**Content Customization Rules**:
- Each file must have unique meta description (150-160 characters)
- Keywords must be industry-specific and relevant
- Titles must include industry name and "Local AI Automation"
- All URLs must use absolute paths with full domain

### 4. Structured Data Module

**Article Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "[Page Title]",
  "description": "[Meta description]",
  "author": {
    "@type": "Person",
    "name": "Hussain Nazary"
  },
  "datePublished": "2025-01-27T00:00:00Z",
  "dateModified": "2025-01-27T00:00:00Z",
  "publisher": {
    "@type": "Organization",
    "name": "GGUF Loader",
    "logo": {
      "@type": "ImageObject",
      "url": "https://ggufloader.github.io/preview.png"
    }
  },
  "image": "https://ggufloader.github.io/preview.png"
}
```

**FAQPage Schema** (5-8 questions per page):
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "[Industry-specific question]",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "[Detailed answer]"
      }
    }
  ]
}
```

**BreadcrumbList Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://ggufloader.github.io/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Use Cases",
      "item": "https://ggufloader.github.io/use-cases/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "[Industry Name]",
      "item": "https://ggufloader.github.io/use-cases/[filename].html"
    }
  ]
}
```

**HowTo Schema** (conditional - for pages with step-by-step workflows):
```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "[How to automate X tasks]",
  "description": "[Description]",
  "step": [
    {
      "@type": "HowToStep",
      "name": "[Step name]",
      "text": "[Step description]"
    }
  ]
}
```

**Organization Schema**:
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "GGUF Loader",
  "url": "https://ggufloader.github.io",
  "logo": "https://ggufloader.github.io/preview.png",
  "sameAs": [
    "https://github.com/ggufloader/gguf-loader"
  ]
}
```

### 5. Call-to-Action Component

**HTML Structure**:
```html
<section class="cta-section">
  <div class="container">
    <h2>Need Help Implementing Local AI?</h2>
    <p>Our team can help you deploy local AI solutions tailored to your [industry] needs.</p>
    <a href="../need-help.html" class="cta-button">Get in Touch</a>
  </div>
</section>
```

**CSS Styling**:
```css
.cta-section {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 3rem 0;
  text-align: center;
  margin-top: 3rem;
}

.cta-button {
  display: inline-block;
  background: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  text-decoration: none;
  font-weight: 600;
  border-radius: 5px;
  transition: all 0.3s ease;
  min-height: 44px;
  min-width: 44px;
}
```

## Data Models

### Use Case Page Model

```typescript
interface UseCasePage {
  filename: string;
  industry: string;
  title: string;
  metaDescription: string;
  keywords: string[];
  content: ContentSection[];
  faqs: FAQ[];
  hasWorkflow: boolean;
  workflowSteps?: WorkflowStep[];
}

interface ContentSection {
  heading: string;
  level: number; // 1, 2, or 3
  content: string;
}

interface FAQ {
  question: string;
  answer: string;
}

interface WorkflowStep {
  name: string;
  description: string;
  position: number;
}
```

### Stylesheet Configuration

```typescript
interface StylesheetConfig {
  colors: {
    primaryText: string;
    accentColor: string;
    background: string;
    darkBackground: string;
  };
  breakpoints: {
    small: number;
    medium: number;
    large: number;
    extraLarge: number;
  };
  fonts: {
    family: string;
    display: string;
  };
}
```
