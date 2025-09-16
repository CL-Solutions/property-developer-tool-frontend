# Property Developer Tool - Mockup Foundation Plan

## Executive Summary
A comprehensive property developer management system that orchestrates the entire lifecycle from pre-acquisition assessment through sale and rental management. The system provides flexible property-level control where each project can either:
- Be handled with a sales partner through BlackVesto integration
- Be managed entirely in-house without external sales support
This flexibility allows developers to choose the best approach for each individual property.

## Core Objectives
- Streamline property acquisition decision-making with automated feasibility checks
- Enable seamless collaboration between developer and sales teams
- Provide real-time transparency on project status across all phases
- Automate document management and compliance tracking
- Integrate renovation/construction progress monitoring
- Support both sale and post-sale rental management workflows

## System Architecture Overview

### BlackVesto Data Structure Compatibility
The Property Developer Tool must maintain structural compatibility with BlackVesto's project-property hierarchy:

**Project (Building) Structure:**
- One project represents one building/address
- Contains multiple properties (individual units)
- Stores building-level data (energy, amenities, renovations)
- Has its own images and documents

**Property (Unit) Structure:**
- Always belongs to a project
- Unit identification (WE1, WE2, etc.)
- Individual pricing and rental data
- Can have additionally to the project images and documents
- Can have property-specific overrides for energy data
- Status tracking (active field for reservation status)
- Guaranteed rental price (Erstvermietungsgarantie) stored

**Key Compatibility Requirements:**
- Maintain project_id relationship for all properties
- Support the active status field for reservation synchronization

### Integration with BlackVesto Sales Platform
The Property Developer Tool will maintain **bidirectional real-time communication** with the BlackVesto Sales Platform, sharing:
- Property data and updates
- Document repositories
- Status changes and milestones
- Pricing and availability information
- Lead and customer data
- Transaction progress

### User Roles (Property Developer Tool)
1. **Property Developer (Bauträger)**
   - Project initiator and owner
   - Renovation/construction manager
   - Post-sale landlord

2. **Developer Assistant (Bauträger-Assistenz)**
   - Document manager
   - Construction progress tracker
   - Supporting role for documentation

## Phase-Based Workflow System

### 📋 Phase 1: Pre-Check (Initial Assessment)
**Goal:** Quick viability assessment within 48 hours

#### Developer Input Interface
**Property Configuration:**
- **Sales Partner Selection:**
  - Toggle: Use BlackVesto sales partner / Handle internally
  - If BlackVesto selected: Choose specific sales partner from list
  - If internal: Enable built-in sales workflow features

**Property Data Entry Form:**
- **Location Details**
  - Full address with map integration
  - Neighborhood analysis auto-population

- **Property Specifications**
  - **Property Type:**
    - Single apartment
    - MFH (Multi-family house)
  - Construction year
  - Living space (m²)
  - Number of rooms
  - Current status (vacant/rented)
  - HOA fees (Hausgeld)
    - Recoverable portion
    - Non-recoverable portion

- **Automated Construction Planning:**
  - **Trade Selection (Gewerke):**
    - System suggests required trades based on property condition
    - Checkbox list: Electrical, Plumbing, Painting, Flooring, etc.
  - **Construction Description:**
    - Auto-generated based on selected trades
    - Editable text field for adjustments
  - **Furniture Planning:**
    - Automatically calculated based on room count
    - Room-by-room furniture suggestions
    - Integration with room planner tool

- **Financial Parameters**
  - Purchase price
  - Renovation budget
  - Furnishing budget (if applicable)

- **Rental Yield Calculator**
  - Toggle: Standard Rental / Shared Apartment (WG)
  - Standard: Price per m²
  - WG: Individual room pricing matrix
    - Dynamic room addition
    - Automatic yield calculation

- **Document Upload Section**
  - Floor plans (required)
  - Energy certificate (required)
  - Additional documentation area

- **Special Conditions Checklist**
  - Historic preservation status
  - Property division requirements
  - Available subsidies/grants
  - Building encumbrances

#### Automated System Checks (Traffic Light System)
**Dashboard with Visual Indicators:**
- 🟢 Green: Optimal range
- 🟡 Yellow: Attention needed
- 🔴 Red: Critical issue

**Metrics Evaluated:**
1. Energy efficiency rating (A-C: Green, D-E: Yellow, F-H: Red)
2. Rental yield percentage
3. HOA fee per m²
4. Location price benchmark

#### Sales Team Review Interface
**Option A: BlackVesto Partner (within BlackVesto Sales Platform):**
- Property summary card (auto-synced from Developer Tool)
- Traffic light overview
- Quick action buttons:
  - ✅ Approve (Go)
  - ⚠️ Approve with modifications
  - ❌ Reject (No Go)
- Comment/feedback section (synced back to Developer Tool)
- Modification suggestions form
- Market comparison data from BlackVesto database

**Option B: Internal Handling (within Property Developer Tool):**
- Built-in assessment dashboard
- Internal team review workflow
- Market analysis tools
- Decision documentation
- Same traffic light system and approval buttons

---

### 🏗️ Phase 2: Purchase Decision
**Goal:** Final acquisition decision based on sales feedback

#### Developer Decision Interface
**Decision Dashboard:**
- Sales team feedback summary
- Modified financial projections (if applicable)
- Traffic light status overview
- Decision buttons:
  - Proceed with purchase
  - Abort project
  - Request revision

**Status Tracking:**
- Project automatically tagged as "Purchased" or "Cancelled"
- Notification system to all stakeholders

---

### 📁 Phase 3: Documentation & Preparation
**Goal:** Document collection and preparation with BlackVesto synchronization

#### Document Management System (Property Developer Tool)
**Developer Assistant Portal:**
- **Document Checklist with Upload:**
  - WEG protocols ✅/❌
  - Declaration of division ✅/❌
  - Land registry extract ✅/❌
  - Energy certificate ✅/❌
  - Floor plans (existing) ✅/❌
  - Renovation plans (new) ✅/❌

**BlackVesto Integration:**
- Documents automatically synced to BlackVesto for sales team processing
- BlackVesto handles:
  - Document verification
  - Photo/visual commissioning?
  - Bank pre-approval coordination?

**Progress Indicator:**
- Visual progress bar for developer documents
- Missing document alerts
- Completion percentage
- Status sync with BlackVesto for sales-side tasks

---

### 💼 Phase 4: Active Marketing & Reservation
**Goal:** Manage buyer acquisition and reservation process

#### Marketing Management Dashboard

**For BlackVesto Partner Properties:**
- View-only dashboard showing BlackVesto marketing activities
- Real-time lead count and status updates
- **Reservation Status Synchronization:**
  - ANGEFRAGT (5) - Requested: New reservation inquiry received
  - RESERVIERT (6) - Reserved: Reservation confirmed 
  - Waitlist number (how many people are on the waitlist)
- Notification when reservation status changes
- Feedback and adjustment requests to sales partner

**For Internal Properties:**
- **Campaign Control:**
  - Marketing channel selector:
    - Online portals integration
    - Off-market distribution
  - Lead management table:
    - Contact details
    - Interest level scoring
    - Follow-up scheduling

- **Demand Indicators (Traffic Lights):**
  - Lead volume tracking
  - Price feedback analysis
  - Viewing request metrics

- **Reservation Management:**
  - Reservation form
  - Deposit tracking
  - Buyer documentation checklist

---

### 📝 Phase 5: Buyer Process & Notary
**Goal:** Execute sale transaction

#### Transaction Management Interface

**For BlackVesto Partner Properties:**
- **Status Synchronization from BlackVesto:**
  - NOTARVORBEREITUNG (9) - Notary Preparation in progress
  - NOTARTERMIN (7) - Notary Appointment confirmed
  - ABGESCHLOSSEN (0) - Sale completed
  - ABGEBROCHEN (2) - Reservation cancelled (activates waitlist)
- Real-time updates on buyer financing status (🟢 Confirmed, 🟡 Pending, 🔴 Rejected)
- **Notary Appointment Workflow (handled by BlackVesto):**
  - BlackVesto requests available dates from notary (from date X onwards)
  - 3 appointment proposals sent to customer
  - Customer confirmation status visible
  - Backoffice confirmation with notary tracked
  - Final appointment details synced to Developer Tool

**For Internal Properties:**
- **Buyer Processing:**
  - Reservation confirmation system
  - Financing verification dashboard:
    - Bank confirmation tracking
    - Status indicators (🟢 Confirmed, 🟡 Pending, 🔴 Rejected)

- **Notary Coordination (internal workflow):**
  - Request available dates from notary (specify earliest possible date)
  - Generate 3 appointment proposals for customer
  - Send proposals to customer via integrated messaging
  - Track customer selection/confirmation
  - Backoffice confirms selected appointment with notary
  - Document preparation checklist
  - Signing status tracker

---

### 🔑 Phase 6: Handover & Rental Management
**Goal:** Property transfer and post-sale rental setup

#### Handover Management
**Buyer Handover Process:**
- **Nebenkostenabrechnung (Utility Cost Settlement):**
  - Automatic calculation up to handover date
  - Pro-rata utility costs breakdown
  - Generate settlement document

- **Meter Readings (Zählerstände):**
  - Electricity meter reading with photo
  - Gas meter reading with photo
  - Water meter reading (if applicable)
  - Timestamp and GPS location capture
  - Automatic reading validation

- **Documentation:**
  - Handover protocol generation
  - Meter reading confirmation
  - Final Nebenkostenabrechnung PDF
  - Ownership transfer confirmation

**Note:** Physical keys typically remain with property developer for direct handover to tenant

#### Rental Management System
**After-Sale Rental Module:**

**Rental Strategy Selection:**
- Standard rental
- Shared apartment (WG)

**Rental Process Workflow:**
1. **Pricing Setup**
   - **Erstvermietungsgarantie Check:**
     - System pulls guaranteed rental price from purchase contract
     - Display: "Guaranteed first rental: €XXX/month"
     - Lock price field if guarantee exists
   - For properties without guarantee:
     - Market analysis integration
     - Pricing recommendation engine

2. **Marketing**
   - Listing creation
   - Multi-channel publication
   - Inquiry management

3. **Tenant Selection**
   - Application tracking
   - Credit check integration
   - Selection matrix

4. **Contract Management**
   - Digital contract generation
   - Deposit handling
   - SEPA mandate setup

5. **Move-in Process**
   - Protocol generation
   - Key handover tracking

**Property Management Handoff:**
- Data export to SEV system
- Document transfer
- Utility account setup

**Transparency Indicators:**
- Milestone: "Post-handover rental active"
- Status lights:
  - 🟡 Yellow: Listings active
  - 🟢 Green: Tenant found
  - 🔴 Red: Vacant >30 days

---

### 🔨 Construction/Renovation Monitoring (Independent Process)
**Goal:** Flexible construction progress tracking with conditional transparency

#### Process Initiation
**Start Triggers:**
- **Manual start by developer** at any phase:
  - Can begin before property purchase (planning stage)
  - Often starts after notary appointment
  - Sometimes concurrent with sales process
- **No phase dependency** - developer decides when to activate

#### Progress Tracking Dashboard
**Visual Timeline:**
- Milestone markers with photo documentation:
  - Renovation start
  - Structural work complete (40%)
  - Electrical/plumbing/bathrooms complete
  - Painting & flooring
  - Furnishing/final touches

**Progress Indicators:**
- Percentage completion bar
- Delay alerts (>14 days: Yellow, >30 days: Red)
- Photo gallery with date stamps

#### BlackVesto Synchronization
**Conditional Visibility Rules:**
- **Before AFTERSALE status:** Progress hidden from BlackVesto
- **After AFTERSALE status (8):**
  - Automatic sync activation
  - Sales team gains visibility to construction progress
  - Buyer can track renovation status
- **Toggle override:** Developer can manually enable/disable sync

---

## Technical Implementation Recommendations

### Dashboard Architecture

1. **Main Dashboard (Portfolio Overview)**
   - **Active Properties Grid:**
     - Property cards showing current phase (1-6)
     - Sales partner indicator (BlackVesto partner logo or "Internal")
     - Traffic light status for each property
     - Construction progress bar (if active)
     - Days in current phase counter
   - **Quick Actions Panel:**
     - Add new property button
     - Filter by phase/status/partner
     - Pending document requests from BlackVesto
     - Critical alerts (red traffic lights, delays)
   - **Notification Center:**
     - BlackVesto sync updates
     - Document requests
     - Phase transition alerts
     - Reservation status changes

2. **Property Detail View**
   - **Phase Timeline (Visual Progress Bar):**
     - Current phase highlighted
     - Completed phases with checkmarks
     - Time spent in each phase
     - Expected vs actual timeline
   - **Sales Partner Section:**
     - Toggle display based on selection (BlackVesto/Internal)
     - BlackVesto: Read-only sync status, reservation info
     - Internal: Full sales workflow controls
   - **Document Hub:**
     - Upload interface with drag-and-drop
     - Completion checklist by phase
     - BlackVesto document requests queue
     - Version history and timestamps
   - **Traffic Light Panel:**
     - Energy efficiency: A-H scale with color coding
     - Rental yield: Percentage with thresholds
     - HOA fees: €/m² comparison
     - Location benchmark: Market comparison
   - **Construction Monitor (Conditional):**
     - Only visible after AFTERSALE or manual activation
     - Photo gallery with milestone markers
     - Progress percentage
     - Delay warnings

3. **Analytics Dashboard**
   - **Portfolio Performance:**
     - Properties by phase distribution
     - Average time per phase metrics
     - Success rate (purchased vs cancelled)
     - Partner performance comparison (BlackVesto vs Internal)
   - **Financial Overview:**
     - Total portfolio value
     - Aggregated rental yields
     - Renovation cost tracking
     - ROI projections
   - **Bottleneck Analysis:**
     - Longest pending phases
     - Document completion rates
     - Construction delays
     - Vacant rental periods
   - **Trend Analysis:**
     - Phase duration trends over time
     - Seasonal patterns
     - Market performance indicators

### Key Features to Prioritize
1. **Flexible workflow** - per-property choice of sales partner or internal handling
2. **Real-time collaboration** with BlackVesto when partnership is selected
3. **Automated traffic light system** for quick decision-making
4. **Document management** with completion tracking
5. **Construction progress** visualization
6. **Integrated rental management** post-sale
7. **Built-in sales features** for properties handled internally
8. **Mobile-responsive design** for on-site access

### Integration Points

#### Primary Integration
- **BlackVesto Sales Platform** (bidirectional real-time sync)
  - Property data synchronization
  - Lead and customer management
  - Document sharing
  - Status updates and notifications
  - Sales pipeline integration
  - Commission tracking

#### External Integrations
- Banking APIs for financing verification
- Real estate portals for marketing
- Credit check services

---

## Success Metrics
- Time from initial entry to pre-check decision: <48 hours
- Document completion rate: >95%
- Average time to sale: Track and optimize
- Rental vacancy period: <30 days
- User satisfaction score: >4.5/5

---

## BlackVesto Integration Specifications

### Data Synchronization
- **Real-time sync triggers:**
  - Property creation/update in Developer Tool → BlackVesto
  - Sales feedback in BlackVesto → Developer Tool
  - Document uploads in either system → Both platforms
  - Status changes → Bidirectional updates
  - Document requests from BlackVesto → Developer Tool notifications

### Shared Data Models
- Properties/Projects
- Documents and media
- Customer/Lead information
- Transaction status
- Financial calculations
- User permissions and access

### Document Request System
**BlackVesto → Property Developer Tool:**
- Sales team can request missing documents at any phase
- Request includes:
  - Document type needed
  - Urgency level
  - Reason/context for request
  - Deadline if applicable

**Developer Tool Notifications:**
- Push notification to developer/assistant
- Dashboard alert with document request queue
- Email/SMS alerts for urgent requests
- Request tracking with status updates

**Document Request Workflow:**
1. BlackVesto identifies missing document
2. Creates document request with details
3. Developer Tool receives notification
4. Developer uploads requested document
5. BlackVesto automatically notified of upload
6. Request marked as fulfilled

### API Requirements
- RESTful API endpoints for both platforms
- WebSocket connections for real-time updates
- Event-driven architecture for status changes
- Unified authentication/SSO between platforms
- Document request endpoints with priority handling

## Questions for Client Clarification

### Technical Integration
1. **BlackVesto API Specifications:**
   - Exact REST API endpoints for property/project sync?
   - WebSocket implementation for real-time updates?
   - API rate limits and throttling?

2. **Authentication & Access Control:**
   - Single Sign-On (SSO) between platforms?
   - User role mapping between systems?
   - API key management approach?

3. **Technology Stack Preferences:**
   - Backend: FastAPI (matching BlackVesto)?
   - Frontend: Next.js (matching BlackVesto)?
   - Database: PostgreSQL?
   - Real-time: WebSockets or Server-Sent Events?

### Data & Compliance
4. **Data Retention Policies:**
   - GDPR compliance requirements?
   - Construction photo retention period?
   - Document archival requirements?
   - Backup and disaster recovery needs?

5. **Reporting Requirements:**
   - Unified analytics dashboard across both platforms?
   - Separate reporting per tool?
   - Export formats needed (PDF, Excel, CSV)?
   - KPI tracking priorities?

### User Experience
6. **Language Support:**
   - German-only initially?
   - Future internationalization plans?
   - Currency handling (EUR only)?

7. **Mobile & Offline Capabilities:**
   - Native mobile app required?
   - Progressive Web App (PWA) acceptable?
   - Offline photo capture with later sync?
   - Construction site connectivity limitations?

9. **SEV Property Management System:**
   - API specifications available?
   - Data export format requirements?
   - Scheduling for integration phase?

### Process Clarifications
10. **Document Handling (Phase 3):**
    - Photo/visual commissioning by BlackVesto or Developer Tool?
    - Bank pre-approval coordination by which system?
    - Document versioning requirements?

11. **Notification System:**
    - Unified notification center or separate per platform?
    - Email/SMS integration requirements?
    - Push notification support needed?

12. **Construction Monitoring:**
    - Who captures progress photos (developer or contractors)?
    - Approval workflow for milestone completion?
    - Integration with contractor management systems?

---

## Development Implementation Plan

### Database Architecture

**Shared Tables Structure:**
- Single `projects` and `properties` tables shared between BlackVesto and Property Developer Tool
- Column-level permissions via different database users:
  - `blackvesto_user`: Access to sales-related columns + `has_erstvermietungsgarantie`
  - `developer_tool_user`: Access to all developer-specific columns (prefixed with `developer_`)
  - `admin_user`: Full access to all columns

**Field Clarifications:**
- `additional_costs`: Nebenkosten - Monthly utility/service charges paid by tenant
- `operation_cost_landlord`: HOA fee portion paid by landlord (non-recoverable)
- `operation_cost_tenant`: HOA fee portion passed to tenant (recoverable)
- `operation_cost_reserve`: Reserve fund contribution (Instandhaltungsrücklage)
- `has_erstvermietungsgarantie`: Boolean flag visible to BlackVesto
- `monthly_rent`: Contains guaranteed amount when `has_erstvermietungsgarantie=true`

### Project Setup Steps

1. **Initialize Next.js Project** (already done)
   - TypeScript configuration
   - shadcn/ui component library
   - Tailwind CSS setup
   - Project folder structure

2. **Install Required Dependencies**
   ```bash
   npx shadcn@latest add button card form input label select tabs toast
   ```

3. **Configure Data Layer**
   - Mock data integration (`mockup-data-v2.json`)
   - Type definitions for all entities
   - Mock API endpoints for CRUD operations

### Mockup Development Priorities

#### Phase 1: Core Dashboard (Priority 1)
**Main Dashboard Screen:**
- [ ] Portfolio overview grid with property cards
- [ ] Phase indicators (1-6) with visual progress
- [ ] Sales partner badges (BlackVesto/Internal)
- [ ] Traffic light status indicators
- [ ] Construction progress bars
- [ ] Days in current phase counter
- [ ] Quick action buttons (Add property, filters)
- [ ] Notification center with unread count
- [ ] Critical alerts panel (red lights, delays)

**Components Needed:**
- PropertyCard component with traffic lights
- PhaseIndicator with progress visualization
- NotificationBadge with count
- TrafficLightIndicator (green/yellow/red)

#### Phase 2: Property Entry & Pre-Check (Priority 2)
**Property Data Entry Form:**
- [ ] Sales partner selection toggle
- [ ] Location details with map placeholder
- [ ] Property specifications form
- [ ] Automated trade selection checklist
- [ ] Construction description auto-generation
- [ ] Furniture planning calculator
- [ ] Financial parameters input
- [ ] Rental yield calculator (standard/WG toggle)
- [ ] Document upload dropzone
- [ ] Special conditions checklist

**Traffic Light Assessment Dashboard:**
- [ ] Real-time calculation display
- [ ] Energy efficiency rating (A-H scale)
- [ ] Rental yield percentage with threshold indicators
- [ ] HOA fee per m² comparison
- [ ] Location price benchmark
- [ ] Decision buttons (Go/No Go/Modify)

#### Phase 3: Property Detail View (Priority 3)
**Property Detail Screen:**
- [ ] Phase timeline with milestones
- [ ] Current phase highlight with time tracking
- [ ] Sales partner section (conditional UI)
- [ ] Document hub with upload progress
- [ ] Document request queue from BlackVesto
- [ ] Traffic light summary panel
- [ ] Construction monitor (conditional visibility)
- [ ] Photo gallery with date stamps
- [ ] Action buttons based on current phase

**Components Needed:**
- PhaseTimeline component
- DocumentUploadCard
- ConstructionMilestone
- PhotoGallery with metadata

#### Phase 4: Supporting Features (Priority 4)
**Document Management:**
- [ ] Document checklist by phase
- [ ] Upload interface with drag-and-drop
- [ ] Version history display
- [ ] Missing document alerts
- [ ] BlackVesto request notifications

**Construction Tracking:**
- [ ] Milestone cards with progress
- [ ] Trade contractor list
- [ ] Photo upload per milestone
- [ ] Delay warnings (>14 days yellow, >30 days red)
- [ ] Visibility toggle for BlackVesto

**Handover & Rental:**
- [ ] Meter reading form with photo capture
- [ ] Nebenkostenabrechnung generator
- [ ] Handover protocol checklist
- [ ] Tenant information form
- [ ] Rental contract status

### UI/UX Design Guidelines

**Color Scheme:**
- Traffic Lights:
  - Green: `#10b981` (success)
  - Yellow: `#f59e0b` (warning)
  - Red: `#ef4444` (danger)
- Phase Colors: Gradient from light to dark as phases progress
- Partner Indicators:
  - BlackVesto: Brand blue
  - Internal: Neutral gray

**Layout Principles:**
- Mobile-responsive design
- Card-based layout for property information
- Sidebar navigation with phase shortcuts
- Sticky headers for long forms
- Modal overlays for quick actions
- Toast notifications for status updates

**Component Library:**
- Use shadcn/ui as base
- Extend with custom property-specific components
- Consistent spacing using Tailwind classes
- Accessible form controls with proper labels

### Technical Implementation Notes

**State Management:**
- Use React Context for global app state
- Local state for form management
- Mock data served from JSON file initially
- Prepare for future API integration

**Routing Structure:**
```
/dashboard - Main portfolio overview
/properties/new - Add new property (Phase 1)
/properties/[id] - Property detail view
/properties/[id]/documents - Document management
/properties/[id]/construction - Construction tracking
/properties/[id]/handover - Handover management
/notifications - Notification center
/settings - App settings
```

**Mock API Endpoints:**
```javascript
// Property CRUD
GET /api/properties
POST /api/properties
GET /api/properties/[id]
PUT /api/properties/[id]

// Document management
POST /api/properties/[id]/documents
GET /api/document-requests

// Construction tracking
GET /api/properties/[id]/milestones
PUT /api/properties/[id]/milestones/[id]

// Notifications
GET /api/notifications
PUT /api/notifications/[id]/read
```

### Development Timeline

**Week 1:**
- Project setup and configuration
- Main dashboard implementation
- Basic navigation structure

**Week 2:**
- Phase 1 (Pre-Check) screens
- Property entry form
- Traffic light calculations

**Week 3:**
- Property detail views
- Document management
- Phase timeline implementation

**Week 4:**
- Construction tracking
- Handover management
- Notification system
- Final polish and testing