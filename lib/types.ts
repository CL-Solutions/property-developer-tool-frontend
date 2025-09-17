// Base interfaces for database entities

export type TrafficLightStatus = 'green' | 'yellow' | 'red';
export type DeveloperPhase = 1 | 2 | 3 | 4 | 5 | 6;
export type DeveloperPhaseStatus = 'active' | 'completed' | 'pending';
export type SalesPartner = 'blackvesto' | 'internal';
export type PropertyType = 'apartment' | 'house' | 'commercial';
export type BuildingType = 'apartment_building' | 'single_family' | 'multi_family';
export type RentalStrategy = 'standard' | 'wg';
export type PreCheckResult = 'approved' | 'approved_with_modifications' | 'rejected';
export type PurchaseDecision = 'proceed' | 'modify' | 'reject';
export type ConstructionStatus = 'planning' | 'in_progress' | 'completed' | 'delayed';

export interface WGRoomPricing {
  room: string;
  size: number;
  price: number;
}

export interface Project {
  // Base identification
  id: string;
  tenant_id: string;

  // Shared columns (BlackVesto + Developer Tool)
  name: string;
  street: string;
  house_number: string;
  city: string;
  district?: string;
  state: string;
  country: string;
  zip_code: string;
  latitude?: number;
  longitude?: number;
  construction_year?: number;
  renovation_year?: number;
  total_floors: number;
  total_units: number;
  building_type: BuildingType;
  has_elevator: boolean;
  has_parking: boolean;
  has_basement: boolean;
  has_garden: boolean;
  energy_certificate_type?: string;
  energy_consumption?: number;
  energy_class?: string;
  heating_type?: string;
  property_developer: string;
  status: string;
  visibility_status: number;
  property_count: number;
  min_price: number;
  max_price: number;
  min_rental_yield: number;
  max_rental_yield: number;

  // Developer Tool Specific Columns
  developer_purchase_price?: number;
  developer_purchase_date?: string;
  renovation_total_budget?: number;
  furnishing_total_budget?: number;
  construction_start_date?: string;
  construction_end_date?: string;
  construction_status?: ConstructionStatus;
  construction_progress?: number;

  // Timestamps
  created_at: string;
  updated_at: string;
}

export interface Property {
  // Base identification
  id: string;
  tenant_id: string;
  project_id: string;

  // Shared columns (BlackVesto + Developer Tool)
  unit_number: string;
  floor?: string;
  city: string;
  state: string;
  zip_code: string;
  property_type: PropertyType;
  size_sqm: number;
  rooms: number;
  bathrooms: number;
  balcony?: string;
  selling_price: number;
  monthly_rent: number;
  additional_costs: number;
  management_fee: number;
  hoa_fees_landlord: number;
  hoa_fees_tenant: number;
  hoa_fees_reserve: number;
  total_purchase_price: number;
  total_monthly_rent: number;
  gross_rental_yield: number;
  energy_class?: string;
  heating_type?: string;
  has_cellar: boolean;
  active: number;
  visibility: number;

  // Developer Tool Specific Columns
  developer_phase: DeveloperPhase;
  developer_phase_status: DeveloperPhaseStatus;
  developer_sales_partner: SalesPartner;
  developer_sales_partner_id?: string;
  developer_purchase_price: number;
  developer_renovation_budget: number;
  developer_furnishing_budget: number;
  developer_rental_strategy: RentalStrategy;
  has_erstvermietungsgarantie: boolean;
  developer_wg_room_pricing?: WGRoomPricing[];
  developer_traffic_light_energy: TrafficLightStatus;
  developer_traffic_light_yield: TrafficLightStatus;
  developer_traffic_light_hoa: TrafficLightStatus;
  developer_traffic_light_location: TrafficLightStatus;
  developer_pre_check_result?: PreCheckResult;
  developer_pre_check_date?: string;
  developer_purchase_decision?: PurchaseDecision;
  developer_purchase_decision_date?: string;
  developer_construction_status?: ConstructionStatus;
  developer_construction_progress?: number;
  developer_construction_visible_blackvesto: boolean;

  // Phase 1 Pre-Check specific fields
  developer_selected_trades?: string[];
  developer_construction_description?: string;
  developer_special_conditions?: {
    historic_preservation: boolean;
    property_division: boolean;
    subsidies: string[];
    encumbrances: string[];
  };
  developer_pre_check_feedback?: string;
  developer_pre_check_modifications?: string[];
  developer_initial_traffic_lights?: {
    energy: TrafficLightStatus;
    yield: TrafficLightStatus;
    hoa: TrafficLightStatus;
    location: TrafficLightStatus;
    scores?: {
      energy: number;
      yield: number;
      hoa: number;
      location: number;
    };
  };

  // Timestamps
  created_at: string;
  updated_at: string;

  // Computed fields for display
  project?: Project;
  project_name?: string;
  project_street?: string;
  project_house_number?: string;
  days_in_current_phase?: number;
}

export interface DeveloperDocumentRequest {
  id: string;
  property_id: string;
  project_id: string;
  requested_by_system: string;
  requested_by_user_id: string;
  document_type: string;
  urgency: 'low' | 'medium' | 'high';
  reason: string;
  deadline: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  created_at: string;
  updated_at: string;
}

export interface DeveloperConstructionMilestone {
  id: string;
  property_id: string;
  project_id: string;
  milestone_name: string;
  milestone_order: number;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress_percentage: number;
  completed_at?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
}

export interface DeveloperConstructionTrade {
  id: string;
  property_id: string;
  project_id: string;
  trade_type: string;
  company_name: string;
  contact_person: string;
  contact_phone: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'delayed';
  scheduled_start: string;
  actual_start?: string;
  scheduled_end: string;
  actual_end?: string;
  cost_estimate: number;
  actual_cost?: number;
  created_at: string;
  updated_at: string;
}

export interface DeveloperHandoverProtocol {
  id: string;
  property_id: string;
  handover_type: 'buyer' | 'tenant';
  handover_date: string;
  buyer_name?: string;
  buyer_email?: string;
  tenant_name?: string;
  tenant_email?: string;
  electricity_meter_reading?: number;
  electricity_meter_photo?: string;
  gas_meter_reading?: number;
  gas_meter_photo?: string;
  water_meter_reading?: number;
  water_meter_photo?: string;
  nebenkostenabrechnung_amount?: number;
  nebenkostenabrechnung_pdf?: string;
  protocol_signed: boolean;
  protocol_pdf?: string;
  created_at: string;
  updated_at: string;
}

export interface DeveloperNotification {
  id: string;
  tenant_id: string;
  user_id: string;
  notification_type: 'document_request' | 'status_change' | 'alert' | 'info' | 'reservation_status';
  priority: 'low' | 'medium' | 'high';
  title: string;
  message: string;
  related_table: string;
  related_id: string;
  read: boolean;
  created_at: string;
  property_id?: string;
  property_name?: string;
}

// Dashboard summary interfaces
export interface PropertySummary {
  id: string;
  unit_number: string;
  project_name: string;
  street: string;
  house_number: string;
  city: string;
  phase: DeveloperPhase;
  phase_status: DeveloperPhaseStatus;
  sales_partner: SalesPartner;
  traffic_lights: {
    energy: TrafficLightStatus;
    yield: TrafficLightStatus;
    hoa: TrafficLightStatus;
    location: TrafficLightStatus;
  };
  construction_progress: number;
  days_in_current_phase: number;
  has_critical_alerts: boolean;
}

export interface DashboardStats {
  total_properties: number;
  properties_by_phase: Record<DeveloperPhase, number>;
  properties_by_partner: Record<SalesPartner, number>;
  critical_alerts: number;
  pending_documents: number;
  construction_delays: number;
}

// Form interfaces for property entry
export interface PropertyEntryForm {
  // Basic Information
  project_id: string;
  unit_number: string;
  floor?: string;
  property_type: PropertyType;
  size_sqm: number;
  rooms: number;
  bathrooms: number;
  balcony?: string;
  has_cellar: boolean;

  // Sales Partner
  developer_sales_partner: SalesPartner;
  developer_sales_partner_id?: string;

  // Financial Parameters
  developer_purchase_price: number;
  developer_renovation_budget: number;
  developer_furnishing_budget: number;
  selling_price: number;
  monthly_rent: number;
  additional_costs: number;
  hoa_fees_landlord: number;
  hoa_fees_tenant: number;
  hoa_fees_reserve: number;

  // Rental Strategy
  developer_rental_strategy: RentalStrategy;
  has_erstvermietungsgarantie: boolean;
  developer_wg_room_pricing?: WGRoomPricing[];

  // Automated Trade Selection (TODO: Add specific trade types to mock data)
  required_trades?: string[];

  // Document uploads (TODO: Add document types to mock data)
  uploaded_documents?: string[];
}

// Mock data structure
export interface MockData {
  projects: Project[];
  properties: Property[];
  developer_document_requests: DeveloperDocumentRequest[];
  developer_construction_milestones: DeveloperConstructionMilestone[];
  developer_construction_trades: DeveloperConstructionTrade[];
  developer_handover_protocols: DeveloperHandoverProtocol[];
  developer_notifications: DeveloperNotification[];
}