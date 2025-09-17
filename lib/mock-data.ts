import mockDataV2 from '../mockup-data-v2.json';
import {
  MockData,
  Property,
  Project,
  PropertySummary,
  DashboardStats,
  DeveloperPhase,
  DeveloperPhaseStatus,
  SalesPartner,
  TrafficLightStatus,
  PreCheckResult,
  DeveloperDocumentRequest,
  DeveloperConstructionMilestone,
  DeveloperConstructionTrade,
  DeveloperHandoverProtocol,
  DeveloperNotification
} from './types';

// Cast the imported JSON to our typed structure
const mockData = mockDataV2 as MockData;

// Simulate API delay
const simulateApiDelay = (ms: number = 500) =>
  new Promise(resolve => setTimeout(resolve, ms));

// Helper function to calculate days in current phase
const calculateDaysInPhase = (updatedAt: string): number => {
  const lastUpdate = new Date(updatedAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lastUpdate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Helper function to enrich properties with project data
// Helper function to get score from status
const getScoreForStatus = (status: TrafficLightStatus): number => {
  switch (status) {
    case 'green': return 7.5 + Math.random() * 2.5; // 7.5-10
    case 'yellow': return 4 + Math.random() * 3; // 4-7
    case 'red': return Math.random() * 4; // 0-4
  }
};

const enrichPropertiesWithProjects = (properties: Property[]): Property[] => {
  return properties.map(property => {
    const project = mockData.projects.find(p => p.id === property.project_id);
    const enrichedProperty: Property = {
      ...property,
      project,
      project_name: project?.name,
      project_street: project?.street,
      project_house_number: project?.house_number,
      days_in_current_phase: calculateDaysInPhase(property.updated_at)
    };

    // Add Phase 1 pre-check data for properties that have completed Phase 1
    if (enrichedProperty.developer_phase >= 1 && enrichedProperty.developer_pre_check_result) {
      // Calculate initial traffic lights for Phase 1
      const calculatedLights = calculateTrafficLightStatus(enrichedProperty);

      // Add comprehensive Phase 1 data
      enrichedProperty.developer_initial_traffic_lights = {
        energy: calculatedLights.energy,
        yield: calculatedLights.yield,
        hoa: calculatedLights.hoa,
        location: calculatedLights.location,
        scores: {
          energy: getScoreForStatus(calculatedLights.energy),
          yield: getScoreForStatus(calculatedLights.yield),
          hoa: getScoreForStatus(calculatedLights.hoa),
          location: getScoreForStatus(calculatedLights.location)
        }
      };

      // Add sample trade selections and descriptions
      if (!enrichedProperty.developer_selected_trades) {
        const sampleTrades = ['Electrical', 'Plumbing', 'Painting', 'Flooring', 'Kitchen', 'Bathroom'];
        const randomTrades = sampleTrades.slice(0, Math.floor(Math.random() * 3) + 2);
        enrichedProperty.developer_selected_trades = randomTrades;
      }

      if (!enrichedProperty.developer_construction_description) {
        enrichedProperty.developer_construction_description =
          "Comprehensive renovation including electrical system upgrade, plumbing modernization, " +
          "complete interior painting, and premium flooring installation. Energy efficiency improvements " +
          "to achieve better energy class rating.";
      }

      // Add special conditions for some properties
      if (!enrichedProperty.developer_special_conditions && Math.random() > 0.5) {
        enrichedProperty.developer_special_conditions = {
          historic_preservation: Math.random() > 0.8,
          property_division: Math.random() > 0.9,
          subsidies: Math.random() > 0.6 ? ['KfW Energy Efficiency Grant', 'Bavaria Renovation Fund'] : [],
          encumbrances: Math.random() > 0.8 ? ['Right of way for neighboring property'] : []
        };
      }

      // Add feedback for approved with modifications
      if (enrichedProperty.developer_pre_check_result === 'approved_with_modifications' && !enrichedProperty.developer_pre_check_feedback) {
        enrichedProperty.developer_pre_check_feedback =
          "Property shows good potential but requires attention to energy efficiency. " +
          "Consider upgrading insulation and heating system to improve energy class.";
        enrichedProperty.developer_pre_check_modifications = [
          "Upgrade heating system to modern condensing boiler",
          "Install triple-glazed windows in north-facing rooms",
          "Add additional insulation to roof structure"
        ];
      }

      // Add purchase decision for properties past Phase 1
      if (enrichedProperty.developer_phase >= 2 && !enrichedProperty.developer_purchase_decision) {
        enrichedProperty.developer_purchase_decision =
          enrichedProperty.developer_pre_check_result === 'approved' ? 'proceed' :
          enrichedProperty.developer_pre_check_result === 'approved_with_modifications' ? 'modify' : 'reject';
        enrichedProperty.developer_purchase_decision_date =
          new Date(Date.now() - Math.floor(Math.random() * 20 * 24 * 60 * 60 * 1000)).toISOString();
      }
    }

    return enrichedProperty;
  });
};

// Calculate traffic light status based on property data
// This matches the EnhancedTrafficLights component calculations exactly
const calculateTrafficLightStatus = (property: Property): {
  energy: TrafficLightStatus;
  yield: TrafficLightStatus;
  hoa: TrafficLightStatus;
  location: TrafficLightStatus;
} => {
  // Energy Score Calculation - matching EnhancedTrafficLights exactly
  const energyClassScores: Record<string, number> = {
    'A+': 10, 'A': 9, 'B': 8, 'C': 6, 'D': 4, 'E': 2, 'F': 1, 'G': 0, 'H': 0
  };
  const energyClassScore = property.energy_class ? (energyClassScores[property.energy_class] || 0) : 0;

  // Get energy consumption score
  const project = mockData.projects.find(p => p.id === property.project_id);
  const consumption = project?.energy_consumption || 0;
  const consumptionScore = consumption <= 50 ? 10 :
                           consumption <= 75 ? 8 :
                           consumption <= 100 ? 6 :
                           consumption <= 150 ? 4 :
                           consumption <= 200 ? 2 : 0;

  // Heating type score
  const heatingScores: Record<string, number> = {
    'Heat Pump': 10, 'District Heating': 9, 'Fernwärme': 9, 'Solar': 10,
    'Gas': 6, 'Gasheizung': 6, 'Oil': 3, 'Electric': 4
  };
  const heatingScore = property.heating_type ? (heatingScores[property.heating_type] || 5) : 0;

  // Building age score
  const constructionYear = project?.construction_year || 0;
  const age = constructionYear ? (new Date().getFullYear() - constructionYear) : 0;
  const ageScore = age === 0 ? 5 :
                   age <= 5 ? 10 :
                   age <= 15 ? 8 :
                   age <= 30 ? 6 :
                   age <= 50 ? 4 : 2;

  // Weighted energy score (matching exact weights from EnhancedTrafficLights)
  const energyScore = energyClassScore * 0.3 + consumptionScore * 0.3 + heatingScore * 0.2 + ageScore * 0.2;

  // Yield Score Calculation - matching EnhancedTrafficLights exactly
  const grossYield = property.gross_rental_yield || 0;
  const grossYieldScore = grossYield >= 6 ? 10 : grossYield >= 4 ? 6 : grossYield >= 2 ? 3 : 0;

  // Price per sqm score for Munich
  const pricePerSqm = property.size_sqm ? property.selling_price / property.size_sqm : 0;
  const priceScore = pricePerSqm <= 6000 ? 10 : pricePerSqm <= 8000 ? 6 : 2;

  // Renovation ratio score
  const renovationRatio = (property.developer_purchase_price && property.developer_renovation_budget) ?
                          property.developer_renovation_budget / property.developer_purchase_price : 0;
  const renovationScore = renovationRatio <= 0.1 ? 10 : renovationRatio <= 0.2 ? 7 : renovationRatio <= 0.3 ? 4 : 0;

  // Market comparison (mock fixed value as in EnhancedTrafficLights)
  const marketComparisonScore = 7;

  // Weighted yield score (matching exact weights)
  const yieldScore = grossYieldScore * 0.4 + marketComparisonScore * 0.2 + priceScore * 0.2 + renovationScore * 0.2;

  // HOA Score Calculation - matching EnhancedTrafficLights exactly
  const monthlyHOA = (property.hoa_fees_landlord || 0) + (property.hoa_fees_reserve || 0);
  const hoaPerSqm = property.size_sqm ? monthlyHOA / property.size_sqm : 3;
  const monthlyFeesScore = hoaPerSqm <= 2 ? 10 : hoaPerSqm <= 4 ? 7 : hoaPerSqm <= 6 ? 4 : 0;

  // Reserve score
  const reserveScore = property.hoa_fees_reserve >= 1 ? 10 : property.hoa_fees_reserve >= 0.5 ? 6 : 2;

  // Management quality and building condition (mock values as in EnhancedTrafficLights)
  const managementScore = 8;
  const buildingConditionScore = 7;

  // Weighted HOA score (matching exact weights)
  const hoaScore = monthlyFeesScore * 0.4 + reserveScore * 0.3 + managementScore * 0.2 + buildingConditionScore * 0.1;

  // Location Score - matching EnhancedTrafficLights exactly (Munich fixed values)
  const publicTransportScore = 8;
  const amenitiesScore = 9;
  const marketTrendScore = 8;
  const demographicsScore = 7;

  // Weighted location score (matching exact weights)
  const locationScore = publicTransportScore * 0.3 + amenitiesScore * 0.3 + marketTrendScore * 0.2 + demographicsScore * 0.2;

  // Convert scores to traffic light status (same thresholds as EnhancedTrafficLights)
  const getStatus = (score: number): TrafficLightStatus => {
    return score >= 7 ? 'green' : score >= 4 ? 'yellow' : 'red';
  };

  return {
    energy: getStatus(energyScore),
    yield: getStatus(yieldScore),
    hoa: getStatus(hoaScore),
    location: getStatus(locationScore)
  };
};

// Helper function to check for critical alerts
const hasCriticalAlerts = (property: Property): boolean => {
  const lights = calculateTrafficLightStatus(property);
  return lights.energy === 'red' ||
         lights.yield === 'red' ||
         lights.hoa === 'red' ||
         lights.location === 'red';
};

export class MockDataService {
  // Projects
  static async getProjects(): Promise<Project[]> {
    await simulateApiDelay();
    return [...mockData.projects];
  }

  static async getProject(id: string): Promise<Project | null> {
    await simulateApiDelay();
    
    // Try to find by UUID first
    let project = mockData.projects.find(p => p.id === id);
    
    // If not found, try to match by encoded name pattern (project-{name})
    if (!project && id.startsWith('project-')) {
      const decodedId = decodeURIComponent(id);
      const projectName = decodedId.replace('project-', '').replace(/-/g, ' ');
      project = mockData.projects.find(p => 
        p.name.toLowerCase() === projectName.toLowerCase() ||
        p.name.toLowerCase().replace(/\s+/g, '-') === projectName.toLowerCase()
      );
    }
    
    return project || null;
  }

  // Properties
  static async getProperties(): Promise<Property[]> {
    await simulateApiDelay();
    return enrichPropertiesWithProjects([...mockData.properties]);
  }

  static async getProperty(id: string): Promise<Property | null> {
    await simulateApiDelay();
    const property = mockData.properties.find(prop => prop.id === id);
    if (!property) return null;

    const enriched = enrichPropertiesWithProjects([property]);
    return enriched[0];
  }

  static async getPropertiesByProject(projectId: string): Promise<Property[]> {
    await simulateApiDelay();
    const properties = mockData.properties.filter(prop => prop.project_id === projectId);
    return enrichPropertiesWithProjects(properties);
  }

  // Property Summaries for Dashboard
  static async getPropertySummaries(): Promise<PropertySummary[]> {
    await simulateApiDelay();
    const enrichedProperties = enrichPropertiesWithProjects([...mockData.properties]);

    return enrichedProperties.map(property => {
      const calculatedLights = calculateTrafficLightStatus(property);
      return {
        id: property.id,
        unit_number: property.unit_number,
        project_name: property.project_name || 'Unknown Project',
        street: property.project_street || '',
        house_number: property.project_house_number || '',
        city: property.city,
        phase: property.developer_phase,
        phase_status: property.developer_phase_status,
        sales_partner: property.developer_sales_partner,
        traffic_lights: calculatedLights,
        construction_progress: property.developer_construction_progress || 0,
        days_in_current_phase: property.days_in_current_phase || 0,
        has_critical_alerts: hasCriticalAlerts(property)
      };
    });
  }

  // Dashboard Statistics
  static async getDashboardStats(): Promise<DashboardStats> {
    await simulateApiDelay();
    const properties = await this.getProperties();

    const stats: DashboardStats = {
      total_properties: properties.length,
      properties_by_phase: {
        1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
      },
      properties_by_partner: {
        blackvesto: 0,
        internal: 0
      },
      critical_alerts: 0,
      pending_documents: mockData.developer_document_requests?.filter(doc => doc.status === 'pending').length || 0,
      construction_delays: 0 // TODO: Add construction_delays logic to mock data
    };

    properties.forEach(property => {
      // Count by phase
      stats.properties_by_phase[property.developer_phase]++;

      // Count by sales partner
      stats.properties_by_partner[property.developer_sales_partner]++;

      // Count critical alerts
      if (hasCriticalAlerts(property)) {
        stats.critical_alerts++;
      }
    });

    return stats;
  }

  // Filtering methods
  static async getPropertiesByPhase(phase: DeveloperPhase): Promise<Property[]> {
    await simulateApiDelay();
    const properties = await this.getProperties();
    return properties.filter(prop => prop.developer_phase === phase);
  }

  static async getPropertiesBySalesPartner(partner: SalesPartner): Promise<Property[]> {
    await simulateApiDelay();
    const properties = await this.getProperties();
    return properties.filter(prop => prop.developer_sales_partner === partner);
  }

  static async getPropertiesWithCriticalAlerts(): Promise<Property[]> {
    await simulateApiDelay();
    const properties = await this.getProperties();
    return properties.filter(hasCriticalAlerts);
  }

  // Document Requests
  static async getDocumentRequests(): Promise<DeveloperDocumentRequest[]> {
    await simulateApiDelay();
    return [...(mockData.developer_document_requests || [])];
  }

  static async getDocumentRequestsByProperty(propertyId: string): Promise<DeveloperDocumentRequest[]> {
    await simulateApiDelay();
    return (mockData.developer_document_requests || [])
      .filter(doc => doc.property_id === propertyId);
  }

  // Construction data
  static async getConstructionMilestones(propertyId: string): Promise<DeveloperConstructionMilestone[]> {
    await simulateApiDelay();
    return (mockData.developer_construction_milestones || [])
      .filter(milestone => milestone.property_id === propertyId)
      .sort((a, b) => a.milestone_order - b.milestone_order);
  }

  static async getConstructionTrades(propertyId: string): Promise<DeveloperConstructionTrade[]> {
    await simulateApiDelay();
    return (mockData.developer_construction_trades || [])
      .filter(trade => trade.property_id === propertyId);
  }

  // Handover protocols
  static async getHandoverProtocols(propertyId: string): Promise<DeveloperHandoverProtocol[]> {
    await simulateApiDelay();
    return (mockData.developer_handover_protocols || [])
      .filter(protocol => protocol.property_id === propertyId);
  }

  // Notifications
  static async getNotifications(): Promise<DeveloperNotification[]> {
    await simulateApiDelay();
    return [...(mockData.developer_notifications || [])];
  }

  static async getUnreadNotificationsCount(): Promise<number> {
    await simulateApiDelay();
    return (mockData.developer_notifications || [])
      .filter(notification => !notification.read).length;
  }

  // Create/Update methods (simulated)
  static async createProject(projectData: Partial<Project>): Promise<Project> {
    await simulateApiDelay(1000); // Longer delay for create operations

    // In a real app, this would make an API call
    // For now, we simulate by returning the data with an ID
    const newProject: Project = {
      ...projectData,
      id: `project-${Date.now()}`,
      tenant_id: 'default-tenant',
      property_count: 0,
      min_price: 0,
      max_price: 0,
      min_rental_yield: 0,
      max_rental_yield: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Project;

    return newProject;
  }

  static async updateProject(id: string, updates: Partial<Project>): Promise<Project | null> {
    await simulateApiDelay(800);

    const project = await this.getProject(id);
    if (!project) return null;

    return {
      ...project,
      ...updates,
      updated_at: new Date().toISOString(),
    };
  }

  static async createProperty(propertyData: Partial<Property>): Promise<Property> {
    await simulateApiDelay(1000); // Longer delay for create operations

    // In a real app, this would make an API call
    // For now, we simulate by returning the data with an ID
    const newProperty: Property = {
      ...propertyData,
      id: `property-${Date.now()}`,
      tenant_id: 'default-tenant',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as Property;

    return newProperty;
  }

  static async createPropertyFromPreCheck(preCheckData: {
    street: string;
    houseNumber: string;
    city: string;
    zipCode: string;
    apartmentNumber?: string;
    floor?: string;
    constructionYear: number | null;
    livingArea: number | null;
    rooms: number | null;
    purchasePrice: number | null;
    sellingPrice: number | null;
    renovationBudget: number | null;
    furnishingBudget: number | null;
    hoaFeesLandlord: number | null;
    hoaFeesReserve: number | null;
    hoaTransferable: boolean;
    vacancyStatus: 'vacant' | 'rented';
    currentRent: number | null;
    plannedRent: number | null;
    rentalStrategy: 'standard' | 'wg';
    wgRooms?: Array<{ name: string; size: number; rent: number }>;
    salesPartner: 'internal' | 'blackvesto';
    blackvestoPartner?: string;
    energyClass: string;
    historicPreservation?: boolean;
    propertyDivision?: boolean;
    subsidies?: string;
    encumbrances?: string;
  }): Promise<Property> {
    await simulateApiDelay(1000);

    // Create a new project first
    const projectId = `project-${Date.now()}`;
    const project: Project = {
      id: projectId,
      tenant_id: 'tenant-001',
      name: `${preCheckData.street} ${preCheckData.houseNumber}`,
      street: preCheckData.street,
      house_number: preCheckData.houseNumber,
      city: preCheckData.city,
      state: 'Berlin',
      country: 'Germany',
      zip_code: preCheckData.zipCode,
      construction_year: preCheckData.constructionYear || undefined,
      total_floors: 4,
      total_units: 1,
      building_type: 'apartment_building',
      has_elevator: false,
      has_parking: false,
      has_basement: true,
      has_garden: false,
      property_developer: 'CL Immobilien GmbH',
      status: 'active',
      visibility_status: 1,
      property_count: 1,
      min_price: preCheckData.sellingPrice || 0,
      max_price: preCheckData.sellingPrice || 0,
      min_rental_yield: 0,
      max_rental_yield: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Calculate traffic lights
    const energyClassScores: Record<string, TrafficLightStatus> = {
      'A+': 'green', 'A': 'green', 'B': 'green', 'C': 'yellow',
      'D': 'yellow', 'E': 'red', 'F': 'red', 'G': 'red', 'H': 'red'
    };

    const totalInvestment = (preCheckData.purchasePrice || 0) +
                           (preCheckData.renovationBudget || 0) +
                           (preCheckData.furnishingBudget || 0);

    const monthlyRent = preCheckData.vacancyStatus === 'rented'
      ? preCheckData.currentRent
      : preCheckData.rentalStrategy === 'wg'
        ? preCheckData.wgRooms?.reduce((sum, room) => sum + (room.rent || 0), 0) || 0
        : preCheckData.plannedRent;

    const grossYield = totalInvestment > 0 && monthlyRent
      ? (monthlyRent * 12 / totalInvestment * 100)
      : 0;

    const yieldStatus: TrafficLightStatus =
      grossYield >= 5 ? 'green' :
      grossYield >= 3.5 ? 'yellow' : 'red';

    const totalHoaFees = (preCheckData.hoaFeesLandlord || 0) + (preCheckData.hoaFeesReserve || 0);
    const hoaPerSqm = preCheckData.livingArea && totalHoaFees
      ? totalHoaFees / preCheckData.livingArea
      : 0;

    const hoaStatus: TrafficLightStatus =
      hoaPerSqm <= 2 ? 'green' :
      hoaPerSqm <= 4 ? 'yellow' : 'red';

    const locationStatus: TrafficLightStatus =
      ['Munich', 'Berlin', 'Hamburg'].includes(preCheckData.city) ? 'green' : 'yellow';

    // Create the property with Phase 1 data
    const newProperty: Property = {
      id: `property-${Date.now()}`,
      tenant_id: 'default-tenant',
      project_id: projectId,
      project,
      project_name: project.name,
      project_street: project.street,
      project_house_number: project.house_number,
      unit_number: preCheckData.apartmentNumber || 'WE01',
      floor: preCheckData.floor || '',
      size_sqm: preCheckData.livingArea || 0,
      rooms: preCheckData.rooms || 0,
      city: project.city,
      state: project.state,
      zip_code: project.zip_code,
      property_type: 'apartment',
      bathrooms: 1,
      balcony: 'no',
      selling_price: preCheckData.sellingPrice || 0,
      monthly_rent: monthlyRent || 0,
      additional_costs: 0,
      management_fee: 0,
      hoa_fees_landlord: preCheckData.hoaFeesLandlord || 0,
      hoa_fees_tenant: 0,
      hoa_fees_reserve: preCheckData.hoaFeesReserve || 0,
      total_purchase_price: preCheckData.purchasePrice || 0,
      total_monthly_rent: monthlyRent || 0,
      gross_rental_yield: grossYield,
      energy_class: preCheckData.energyClass,
      has_cellar: false,
      active: 1,
      visibility: 1,
      developer_purchase_price: preCheckData.purchasePrice || 0,
      developer_renovation_budget: preCheckData.renovationBudget || 0,
      developer_furnishing_budget: preCheckData.furnishingBudget || 0,
      developer_rental_strategy: preCheckData.rentalStrategy,
      has_erstvermietungsgarantie: false,
      developer_wg_room_pricing: preCheckData.wgRooms?.map(room => ({
        room: room.name,
        size: room.size,
        price: room.rent
      })),
      developer_sales_partner: preCheckData.salesPartner,
      developer_sales_partner_id: preCheckData.blackvestoPartner,
      developer_traffic_light_energy: energyClassScores[preCheckData.energyClass] || 'yellow',
      developer_traffic_light_yield: yieldStatus,
      developer_traffic_light_hoa: hoaStatus,
      developer_traffic_light_location: locationStatus,
      developer_phase: 1,
      developer_phase_status: 'completed' as DeveloperPhaseStatus,
      developer_construction_visible_blackvesto: false,
      developer_pre_check_date: new Date().toISOString(),
      developer_pre_check_result: 'approved' as PreCheckResult,
      developer_initial_traffic_lights: {
        energy: energyClassScores[preCheckData.energyClass] || 'yellow',
        yield: yieldStatus,
        hoa: hoaStatus,
        location: locationStatus,
        scores: {
          energy: energyClassScores[preCheckData.energyClass] === 'green' ? 8 :
                  energyClassScores[preCheckData.energyClass] === 'yellow' ? 5 : 2,
          yield: grossYield >= 5 ? 8 : grossYield >= 3.5 ? 5 : 2,
          hoa: hoaPerSqm <= 2 ? 8 : hoaPerSqm <= 4 ? 5 : 2,
          location: locationStatus === 'green' ? 8 : 5
        }
      },
      developer_special_conditions: {
        historic_preservation: preCheckData.historicPreservation || false,
        property_division: preCheckData.propertyDivision || false,
        subsidies: preCheckData.subsidies ? [preCheckData.subsidies] : [],
        encumbrances: preCheckData.encumbrances ? [preCheckData.encumbrances] : []
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      days_in_current_phase: 0
    };

    // Add the new property to the mock data
    mockData.properties.push(newProperty);

    // Also add the project if not exists
    if (!mockData.projects.find(p => p.id === projectId)) {
      mockData.projects.push(project);
    }

    return newProperty;
  }

  static async updateProperty(id: string, updates: Partial<Property>): Promise<Property | null> {
    await simulateApiDelay(800);

    const property = await this.getProperty(id);
    if (!property) return null;

    return {
      ...property,
      ...updates,
      updated_at: new Date().toISOString(),
    };
  }

  // Utility methods
  static getPhaseLabel(phase: DeveloperPhase): string {
    const phaseLabels: Record<DeveloperPhase, string> = {
      1: 'Pre-Check',
      2: 'Purchase Decision',
      3: 'Documentation & Preparation',
      4: 'Active Marketing & Reservation',
      5: 'Buyer Process & Notary',
      6: 'Handover & Rental Management'
    };
    return phaseLabels[phase];
  }

  static getTrafficLightColor(status: TrafficLightStatus): string {
    const colors = {
      green: '#10b981', // bg-green-500
      yellow: '#f59e0b', // bg-yellow-500
      red: '#ef4444' // bg-red-500
    };
    return colors[status];
  }

  static getSalesPartnerLabel(partner: SalesPartner): string {
    return partner === 'blackvesto' ? 'BlackVesto' : 'Internal';
  }

  static getSalesPartnerBadgeColor(partner: SalesPartner): string {
    return partner === 'blackvesto' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800';
  }

  // Phase 1 Pre-Check Methods
  static getAvailableTrades() {
    return [
      { id: 'electrical', name: 'Electrical', costPerSqm: 50, description: 'Wiring, outlets, lighting' },
      { id: 'plumbing', name: 'Plumbing', costPerSqm: 60, description: 'Pipes, fixtures, drainage' },
      { id: 'painting', name: 'Painting', costPerSqm: 25, description: 'Walls, ceilings, trim' },
      { id: 'flooring', name: 'Flooring', costPerSqm: 70, description: 'Hardwood, tiles, carpet' },
      { id: 'kitchen', name: 'Kitchen', costPerSqm: 150, description: 'Cabinets, countertops, appliances' },
      { id: 'bathroom', name: 'Bathroom', costPerSqm: 120, description: 'Fixtures, tiles, vanity' },
      { id: 'windows', name: 'Windows & Doors', costPerSqm: 80, description: 'Replacement, repair' },
      { id: 'heating', name: 'Heating/Cooling', costPerSqm: 90, description: 'HVAC system, radiators' },
      { id: 'carpentry', name: 'Carpentry', costPerSqm: 40, description: 'Built-ins, trim work' },
      { id: 'furniture', name: 'Furnishing', costPerSqm: 100, description: 'Complete furniture package' },
      { id: 'landscaping', name: 'Landscaping', costPerSqm: 30, description: 'Garden, outdoor areas' },
    ];
  }

  static calculateTradeBasedBudget(trades: string[], livingArea: number): number {
    const availableTrades = this.getAvailableTrades();
    return trades.reduce((total, tradeId) => {
      const trade = availableTrades.find(t => t.id === tradeId);
      return total + (trade?.costPerSqm || 0) * livingArea;
    }, 0);
  }

  static async savePreCheckAssessment(propertyId: string, assessmentData: {
    result: PreCheckResult;
    feedback?: string;
    scores?: Record<string, number>;
  }): Promise<boolean> {
    await simulateApiDelay();
    // In a real app, this would save to the database
    console.log('Saving pre-check assessment:', propertyId, assessmentData);
    return true;
  }

  static async getPreCheckHistory(propertyId: string): Promise<Array<{
    id: string;
    date: string;
    result: PreCheckResult;
    feedback?: string;
  }>> {
    await simulateApiDelay();
    // Mock pre-check history
    return [
      {
        id: 'precheck-1',
        date: '2024-01-20T14:00:00Z',
        result: 'approved' as PreCheckResult,
        feedback: 'Property approved for purchase. Consider energy efficiency improvements.'
      }
    ];
  }

  static getSalesPartners(): Array<{ id: string; name: string; type: 'blackvesto' | 'internal' }> {
    return [
      { id: 'bv-partner-001', name: 'BlackVesto Munich', type: 'blackvesto' },
      { id: 'bv-partner-002', name: 'BlackVesto Berlin', type: 'blackvesto' },
      { id: 'bv-partner-003', name: 'BlackVesto Hamburg', type: 'blackvesto' },
      { id: 'internal-001', name: 'Internal Sales Team', type: 'internal' }
    ];
  }

  static getMarketComparison(city: string, propertyType: string): {
    avgPricePerSqm: number;
    avgRent: number;
    avgYield: number;
  } {
    // Mock market data
    const marketData: Record<string, Record<string, { avgPricePerSqm: number; avgRent: number; avgYield: number }>> = {
      'Munich': {
        apartment: { avgPricePerSqm: 7500, avgRent: 20, avgYield: 3.5 },
        house: { avgPricePerSqm: 8500, avgRent: 25, avgYield: 3.2 }
      },
      'Berlin': {
        apartment: { avgPricePerSqm: 5000, avgRent: 15, avgYield: 4.0 },
        house: { avgPricePerSqm: 6000, avgRent: 20, avgYield: 3.8 }
      },
      'Hamburg': {
        apartment: { avgPricePerSqm: 5500, avgRent: 17, avgYield: 3.8 },
        house: { avgPricePerSqm: 6500, avgRent: 22, avgYield: 3.6 }
      }
    };

    return marketData[city]?.[propertyType] || {
      avgPricePerSqm: 4000,
      avgRent: 12,
      avgYield: 3.5
    };
  }
}