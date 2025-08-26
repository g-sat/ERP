# ERP System

A comprehensive, responsive, and accessible ERP system built with Next.js, React, and TypeScript.

## 🚀 Features

### Responsive Design

- **Mobile-First Approach**: Optimized for all screen sizes (320px to 1200px+)
- **Breakpoints**:
  - `sm`: 320px (small mobile)
  - `md`: 768px (tablet)
  - `lg`: 1024px (laptop)
  - `xl`: 1200px (desktop)
- **Fluid Typography**: Responsive text scaling using CSS clamp()
- **Touch-Friendly**: 44x44px minimum touch targets for mobile devices
- **Collapsible Navigation**: Mobile hamburger menu with slide-out sidebar

### Accessibility (WCAG AA Compliant)

- **Keyboard Navigation**: Full keyboard support with focus management
- **Screen Reader Support**: ARIA labels, roles, and live regions
- **Skip Links**: Quick navigation to main content and navigation
- **High Contrast**: Maintains WCAG AA contrast ratios
- **Focus Indicators**: Clear focus states for all interactive elements
- **Semantic HTML**: Proper heading hierarchy and landmark roles

### Performance Optimized

- **Dynamic Imports**: Lazy loading for non-critical components
- **Image Optimization**: Next.js Image component with proper sizing
- **Bundle Optimization**: Tree-shaking and code splitting
- **React Query Caching**: Efficient data fetching and caching
- **Target Score**: Lighthouse performance score ≥ 85

### UI Components

- **Responsive Tables**: Transform to cards on mobile devices
- **Sticky Action Bars**: For long forms and data entry
- **Responsive Forms**: Touch-friendly inputs with proper spacing
- **Dashboard Grids**: CSS Grid layouts that adapt to screen size
- **Modal Dialogs**: Responsive modals with proper focus management

## 🛠️ Technology Stack

- **Framework**: Next.js 15.3.5
- **Language**: TypeScript 5.8.3
- **Styling**: Tailwind CSS v4
- **State Management**: Zustand
- **Data Fetching**: Tanstack Query
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React
- **Charts**: Recharts

## 📱 Responsive Strategy

### Layout System

- **Container**: Responsive container with fluid max-widths
- **Grid**: CSS Grid with auto-fit columns for flexible layouts
- **Flexbox**: Responsive flex containers that stack on mobile
- **Spacing**: Consistent spacing scale (4px, 8px, 12px, 16px, 24px, 32px)

### Navigation

- **Desktop**: Persistent sidebar with collapsible sections
- **Mobile**: Hamburger menu with slide-out navigation
- **Touch Targets**: All interactive elements meet 44x44px minimum

### Tables

- **Desktop**: Traditional table layout with sticky headers
- **Mobile**: Card-based layout with key information prominently displayed
- **Horizontal Scroll**: Fallback for complex tables on small screens

## ♿ Accessibility Features

### Navigation

- Skip links for main content and navigation
- Proper heading hierarchy (h1-h6)
- ARIA landmarks (banner, main, contentinfo, navigation)
- Keyboard navigation support

### Forms

- Proper labels and descriptions
- Error announcements via live regions
- Focus management and trapping
- Touch-friendly input sizes

### Interactive Elements

- ARIA labels and descriptions
- Keyboard shortcuts where appropriate
- Focus indicators and states
- Screen reader announcements

## 🎨 Design System

### Typography

- **Fluid Scaling**: Responsive font sizes using clamp()
- **Hierarchy**: Consistent heading and text styles
- **Readability**: Optimized line heights and spacing

### Colors

- **Theme Support**: Light and dark mode
- **Contrast**: WCAG AA compliant color ratios
- **Semantic**: Meaningful color usage for states and actions

### Spacing

- **Consistent Scale**: 4px base unit system
- **Responsive**: Adapts to screen size
- **Touch-Friendly**: Adequate spacing for mobile interaction

## 📊 Performance Metrics

- **Lighthouse Score**: ≥ 85 (Performance, Accessibility, Best Practices, SEO)
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms

## 🔧 Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Type Checking

```bash
npm run typecheck
```

### Linting

```bash
npm run lint
```

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth)/            # Authentication pages
│   ├── (root)/            # Main application pages
│   └── globals.css        # Global styles and responsive utilities
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── ui-custom/        # Custom UI components
│   └── layout/           # Layout components
├── hooks/                # Custom React hooks
├── interfaces/           # TypeScript interfaces
├── lib/                  # Utility functions and configurations
├── schemas/              # Zod validation schemas
└── stores/               # Zustand state stores
```

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📱 Device Support

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1199px
- **Large Desktop**: 1200px+

## 🔄 Updates and Maintenance

### Code Quality

- TypeScript for type safety
- ESLint for code quality
- Prettier for code formatting
- Husky for pre-commit hooks

### Testing Strategy

- Unit tests for utilities and hooks
- Integration tests for components
- E2E tests for critical user flows
- Accessibility testing with axe-core

## 📄 License

This project is proprietary software. All rights reserved.
