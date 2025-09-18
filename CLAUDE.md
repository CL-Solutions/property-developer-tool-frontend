# Property Developer Tool Frontend

This guide provides frontend-specific instructions for the Property Developer Tool Next.js application. For general project information, see the [root CLAUDE.md](../CLAUDE.md).

## Overview
Next.js frontend for property developer features including pre-check assessment, project management, and construction tracking.

## Current Status
Phase 1 (Pre-Check) features completed with comprehensive property assessment forms and traffic light system.

## Tech Stack
- **Framework**: Next.js 15 with Turbopack
- **UI Library**: shadcn/ui component library
- **Styling**: Tailwind CSS
- **Type Safety**: TypeScript with strict mode
- **Data**: Mock data service for development

## Project Structure
```
property-developer-tool-frontend/
├── app/                  # Next.js App Router pages
│   ├── dashboard/       # Main dashboard
│   ├── projects/        # Project management
│   ├── properties/      # Property management
│   ├── pre-check/       # Property assessment
│   └── document-requests/ # Document management
├── components/          # React components
│   ├── ui/             # shadcn/ui components
│   ├── phase1/         # Phase 1 specific components
│   └── pre-check/      # Pre-check components
├── lib/                # Utilities and helpers
└── public/             # Static assets
```

## Development Commands
```bash
# Install dependencies
npm install

# Run development server with Turbopack
npm run dev

# Build for production
npm run build

# Run production build locally
npm run start

# Install shadcn/ui components
npx shadcn@latest add [component-name]
```

## Key Features Implemented

### Phase 1: Pre-Check (95% Complete)
- **Property Assessment Forms**:
  - Single apartment (Eigentumswohnung) form
  - Multi-family house (Mehrfamilienhaus) with multiple units
  - Dynamic unit management with collapsible cards

- **Traffic Light System**:
  - Real-time calculation and preview
  - Energy efficiency rating (A-H scale)
  - Rental yield percentage
  - HOA fee per m² comparison
  - Location price benchmark

- **Rental Strategies**:
  - Standard rental (Normalvermietung)
  - WG rental with room-by-room configuration
  - Dynamic room management with individual pricing

- **Sales Partner Configuration**:
  - Internal vs BlackVesto partner selection
  - Building-level defaults for MFH
  - Per-unit override capability
  - BlackVesto partner dropdown

- **Document Upload**:
  - Floor plan upload (PDF, JPG, PNG)
  - Energy certificate upload
  - Drag-and-drop with visual feedback
  - File preview with metadata

- **Financial Calculations**:
  - Purchase price (Kaufpreis) vs Selling price (Abgabepreis)
  - Renovation and furnishing budgets
  - HOA fees split (landlord/reserve portions)
  - Gross yield calculation with indicators

### Navigation & UI (Complete)
- **AppSidebar**: Persistent navigation across all pages
- **NotificationCenter**: Modern shadcn/ui design with animations
- **PropertyDashboard**: Project-focused overview
- **PhaseIndicator**: Visual phase progress (1-6)
- **TrafficLightIndicator**: Color-coded status system

### Edit Functionality (Complete)
- Property edit using existing new property form
- Project edit using existing new project form
- Query parameter-based routing (?edit={id})
- Data prefilling from mock service

## Component Documentation

### Pre-Check Components
- **SingleApartmentForm**: Comprehensive property data entry
- **MultiFamilyHouseForm**: Building with multiple units
- **UnitCard**: Collapsible unit management UI
- **LiveTrafficLights**: Real-time assessment preview
- **AggregateTrafficLights**: MFH summary view
- **RentalStrategySelector**: Standard/WG toggle
- **WGRoomConfiguration**: Individual room pricing
- **DocumentUpload**: File upload zones

### Traffic Light Thresholds
- **Energy**: A-C (Green), D-E (Yellow), F-H (Red)
- **Yield**: >5% (Green), 3-5% (Yellow), <3% (Red)
- **HOA**: <€3/m² (Green), €3-5/m² (Yellow), >€5/m² (Red)
- **Location**: Within 20% of average (Green), 20-40% (Yellow), >40% (Red)

## Mock Data Service
Located in `lib/mock-data.ts` with TypeScript interfaces in `lib/types.ts`.

### Key Entities
- **Project**: Building-level data
- **Property**: Individual units within projects
- **DeveloperNotification**: Notification system
- **TrafficLightScores**: Assessment metrics

### Mock Data File
`mockup-data-v2.json` contains all sample data including:
- Projects with multiple properties
- Developer notifications
- Construction milestones
- Document requests

## State Management Patterns
- React hooks for local state
- URL parameters for edit mode
- Mock data service for persistence
- Form state with controlled inputs

## TypeScript Patterns
```typescript
// Type-safe mock data access
const projects = await MockDataService.getProjects();

// Interface for forms
interface PropertyFormData {
  unitNumber: string;
  propertyType: 'apartment' | 'house';
  // ...
}

// Query parameters
const searchParams = useSearchParams();
const editId = searchParams.get('edit');
```

## Common Issues & Solutions
1. **Build Errors**: Check for unused imports and type mismatches
2. **Controlled Components**: Use `value || ''` for input defaults
3. **Animation Issues**: Ensure Sheet component has proper CSS
4. **TypeScript Errors**: Use type assertions for mock data fields

## Next Development Priorities
1. **Document Management Enhancement**:
   - Complete document hub with version history
   - BlackVesto sync indicators
   - Document request queue

2. **Construction Tracking**:
   - Milestone cards with progress
   - Photo upload per milestone
   - Delay warnings

3. **Handover & Rental**:
   - Meter reading forms
   - Tenant management interface

## Testing
```bash
# Run build to check for errors
npm run build

# Type checking
npx tsc --noEmit
```

## Recent Updates
- Notification center redesigned with shadcn/ui
- Edit functionality for properties and projects
- Centralized mock data for notifications
- Fixed all TypeScript build errors
- Clean build with no compilation errors