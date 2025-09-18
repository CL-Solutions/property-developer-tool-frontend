"use client";

import { useState, useMemo, useEffect } from 'react';
import {
  GanttCreateMarkerTrigger,
  GanttFeatureItem,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttHeader,
  GanttMarker,
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttToday,
} from "@/components/ui/kibo-ui/gantt";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MockDataService } from '@/lib/mock-data';
import { Property } from '@/lib/types';
import { 
  FileCheck, 
  TrendingUp, 
  FileText, 
  Megaphone, 
  UserCheck, 
  Key,
  Calendar,
  Home,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronRight,
  ChevronDown,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";


interface ProjectGanttChartProps {
  projectId: string;
  projectName?: string;
}

interface PropertyPhase {
  id: string;
  propertyId: string;
  propertyName: string;
  unitNumber: string;
  phase: number;
  phaseName: string;
  startAt: Date;
  endAt: Date;
  status: {
    id: string;
    name: string;
    color: string;
  };
  icon: React.ReactNode;
  salesPartner: 'internal' | 'blackvesto';
  currentPhase: number;
  rooms?: number;
  size?: number;
}

const phaseStatuses = [
  { id: 'completed', name: 'Completed', color: '#10B981' },
  { id: 'in_progress', name: 'In Progress', color: '#F59E0B' },
  { id: 'planned', name: 'Planned', color: '#6B7280' },
  { id: 'delayed', name: 'Delayed', color: '#EF4444' },
];

const phaseIcons = {
  1: <FileCheck className="h-4 w-4" />,
  2: <TrendingUp className="h-4 w-4" />,
  3: <FileText className="h-4 w-4" />,
  4: <Megaphone className="h-4 w-4" />,
  5: <UserCheck className="h-4 w-4" />,
  6: <Key className="h-4 w-4" />
};

const phaseNames = {
  1: 'Pre-Check',
  2: 'Purchase Decision',
  3: 'Documentation',
  4: 'Marketing',
  5: 'Buyer & Notary',
  6: 'Handover & Rental'
};

export function ProjectGanttChart({ projectId, projectName = 'Project' }: ProjectGanttChartProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyPhase | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedProperties, setExpandedProperties] = useState<Set<string>>(new Set());
  const [zoomLevel, setZoomLevel] = useState(40);

  useEffect(() => {
    const loadProperties = async () => {
      setLoading(true);
      try {
        const allProperties = await MockDataService.getProperties();
        
        // Decode the URL-encoded project ID
        const decodedProjectId = decodeURIComponent(projectId);
        
        // Extract project name from ID (remove the 'project-' prefix)
        const extractedName = decodedProjectId.replace('project-', '');
        
        // Filter properties for this project (matching by project name)
        const projectProperties = allProperties.filter(p => 
          p.project?.name?.toLowerCase() === extractedName.toLowerCase()
        );
        
        setProperties(projectProperties);
        
        // Initially expand all properties
        const propertyIds = new Set(projectProperties.map(p => p.id));
        setExpandedProperties(propertyIds);
      } catch (error) {
        console.error('Error loading properties:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProperties();
  }, [projectId]);

  // Generate timeline for all properties and their phases
  const propertyPhases = useMemo(() => {
    const phases: PropertyPhase[] = [];
    
    properties.forEach((property) => {
      const purchaseDate = new Date(); // Use current date as default since developer_purchase_date doesn't exist
      
      // Calculate phase dates based on standard timeline
      const phaseDurations = {
        1: 14, // 2 weeks
        2: 7,  // 1 week
        3: 39, // ~6 weeks
        4: 60, // 2 months
        5: 30, // 1 month
        6: 30  // 1 month
      };

      let cumulativeDays = 0;
      
      for (let phase = 1; phase <= 6; phase++) {
        const startDays = cumulativeDays;
        const duration = phaseDurations[phase as keyof typeof phaseDurations];
        cumulativeDays += duration;

        // Determine status based on current phase
        let status;
        if (phase < property.developer_phase) {
          status = phaseStatuses[0]; // completed
        } else if (phase === property.developer_phase) {
          status = phaseStatuses[1]; // in progress
        } else {
          status = phaseStatuses[2]; // planned
        }

        phases.push({
          id: `${property.id}-phase-${phase}`,
          propertyId: property.id,
          propertyName: `${property.unit_number}`,
          unitNumber: property.unit_number,
          phase: phase,
          phaseName: phaseNames[phase as keyof typeof phaseNames],
          startAt: new Date(purchaseDate.getTime() + startDays * 24 * 60 * 60 * 1000),
          endAt: new Date(purchaseDate.getTime() + cumulativeDays * 24 * 60 * 60 * 1000),
          status: status,
          icon: phaseIcons[phase as keyof typeof phaseIcons],
          salesPartner: property.developer_sales_partner as 'internal' | 'blackvesto',
          currentPhase: property.developer_phase,
          rooms: property.rooms,
          size: property.size_sqm
        });
      }
    });

    return phases;
  }, [properties]);

  // Group phases by property
  const groupedPhases = useMemo(() => {
    const grouped: { [key: string]: PropertyPhase[] } = {};
    
    propertyPhases.forEach((phase) => {
      if (!grouped[phase.propertyName]) {
        grouped[phase.propertyName] = [];
      }
      grouped[phase.propertyName].push(phase);
    });

    // Sort properties by unit number
    const sortedEntries = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
    return Object.fromEntries(sortedEntries);
  }, [propertyPhases]);

  // Calculate project milestones
  const milestones = useMemo(() => {
    const markers = [];
    
    // Find earliest and latest dates
    if (propertyPhases.length > 0) {
      const allDates = propertyPhases.flatMap(p => [p.startAt, p.endAt]);
      const earliestDate = new Date(Math.min(...allDates.map(d => d.getTime())));
      const latestDate = new Date(Math.max(...allDates.map(d => d.getTime())));
      
      // Add project start milestone
      markers.push({
        id: 'project-start',
        date: earliestDate,
        label: 'Project Start',
        className: 'bg-green-100 text-green-900'
      });
      
      // Add project completion milestone
      markers.push({
        id: 'project-end',
        date: latestDate,
        label: 'Project Completion Target',
        className: 'bg-blue-100 text-blue-900'
      });
      
      // Add current review milestone if any properties are in pre-check phase
      const propertiesInPreCheck = properties.filter(p => p.developer_phase === 1);
      if (propertiesInPreCheck.length > 0) {
        markers.push({
          id: 'pre-check-review',
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          label: 'Pre-Check Reviews Due',
          className: 'bg-yellow-100 text-yellow-900'
        });
      }
    }
    
    return markers;
  }, [propertyPhases, properties]);

  const handlePhaseClick = (phase: PropertyPhase) => {
    setSelectedProperty(phase);
  };

  const handlePhaseMove = (id: string, startAt: Date, endAt: Date | null) => {
    if (!endAt) return;
    console.log(`Rescheduling phase: ${id} from ${startAt} to ${endAt}`);
    // In a real app, this would update the phase dates in the backend
  };

  const handleCreateMarker = (date: Date) => {
    console.log(`Creating marker at: ${date.toISOString()}`);
    // In a real app, this would create a new milestone
  };

  const togglePropertyExpanded = (propertyId: string) => {
    setExpandedProperties(prev => {
      const newSet = new Set(prev);
      if (newSet.has(propertyId)) {
        newSet.delete(propertyId);
      } else {
        newSet.add(propertyId);
      }
      return newSet;
    });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 100));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 10));
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Project Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    );
  }

  if (properties.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Project Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-2">No properties in this project yet</p>
            <p className="text-sm text-gray-400">Add properties to see the project timeline</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate summary stats
  const totalProperties = properties.length;
  const completedProperties = properties.filter(p => p.developer_phase === 6).length;
  const activeProperties = properties.filter(p => p.developer_phase > 0 && p.developer_phase < 6).length;
  const delayedPhases = propertyPhases.filter(p => p.status.id === 'delayed').length;

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Project Timeline - {projectName}
            </CardTitle>
            <CardDescription>
              Development phases for all properties in the project
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant="outline">
              <Home className="h-3 w-3 mr-1" />
              {totalProperties} Properties
            </Badge>
            {delayedPhases > 0 && (
              <Badge variant="destructive">
                <AlertCircle className="h-3 w-3 mr-1" />
                {delayedPhases} Delayed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4 w-full overflow-hidden">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-2xl font-semibold">{totalProperties}</p>
              <p className="text-xs text-gray-500">Total Units</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-green-600">{activeProperties}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-blue-600">{completedProperties}</p>
              <p className="text-xs text-gray-500">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-semibold text-orange-600">{delayedPhases}</p>
              <p className="text-xs text-gray-500">Delays</p>
            </div>
          </div>

          {/* Selected Property Details */}
          {selectedProperty && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {selectedProperty.icon}
                  <div>
                    <h4 className="font-semibold">{selectedProperty.propertyName}</h4>
                    <p className="text-sm text-gray-600">
                      Phase {selectedProperty.phase}: {selectedProperty.phaseName}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={selectedProperty.salesPartner === 'blackvesto' ? 'default' : 'secondary'}
                  >
                    {selectedProperty.salesPartner === 'blackvesto' ? 'BlackVesto' : 'Internal'}
                  </Badge>
                  <Badge 
                    variant={
                      selectedProperty.status.id === 'completed' ? 'default' :
                      selectedProperty.status.id === 'in_progress' ? 'secondary' :
                      selectedProperty.status.id === 'delayed' ? 'destructive' :
                      'outline'
                    }
                  >
                    {selectedProperty.status.name}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-4 text-sm text-gray-600 mb-3">
                <span>{selectedProperty.rooms} rooms</span>
                <span>{selectedProperty.size} m²</span>
                <span>Phase {selectedProperty.currentPhase} of 6</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setSelectedProperty(null)}>
                  Close
                </Button>
                <Button size="sm" onClick={() => window.location.href = `/properties/${selectedProperty.propertyId}`}>
                  View Property
                </Button>
              </div>
            </div>
          )}

          {/* Gantt Chart */}
          <div className="relative border rounded-lg" style={{
            height: '500px',
            width: '100%',
            maxWidth: '100%',
            overflow: 'hidden',
            position: 'relative',
            contain: 'layout'
          }}>
            {/* Zoom Controls */}
            <div className="absolute top-2 right-2 z-10 flex gap-1 bg-white border rounded-lg shadow-sm">
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 10}
                className="h-8 w-8 p-0"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <div className="flex items-center px-2 min-w-[3rem] justify-center">
                <span className="text-xs font-medium">{zoomLevel}%</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 100}
                className="h-8 w-8 p-0"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              overflow: 'hidden'
            }}>
              <GanttProvider
                className="h-full"
                onAddItem={(date) => console.log('Add item at:', date)}
                range="monthly"
                zoom={zoomLevel}
              >
              <GanttSidebar>
                {Object.entries(groupedPhases).map(([propertyName, phases]) => {
                  const propertyId = phases[0]?.propertyId;
                  const isExpanded = expandedProperties.has(propertyId);
                  
                  return (
                    <GanttSidebarGroup 
                      key={propertyName} 
                      name={
                        <button
                          onClick={() => togglePropertyExpanded(propertyId)}
                          className="flex items-center gap-1 w-full text-left hover:bg-accent/50 rounded px-1"
                        >
                          {isExpanded ? (
                            <ChevronDown className="h-3 w-3" />
                          ) : (
                            <ChevronRight className="h-3 w-3" />
                          )}
                          <span className="text-sm font-medium">{propertyName}</span>
                        </button>
                      }
                    >
                      {isExpanded && phases.map((phase) => (
                        <GanttSidebarItem
                          key={phase.id}
                          feature={{
                            id: phase.id,
                            name: `Phase ${phase.phase}: ${phase.phaseName}`,
                            startAt: phase.startAt,
                            endAt: phase.endAt,
                            status: phase.status
                          }}
                          onSelectItem={() => handlePhaseClick(phase)}
                        />
                      ))}
                    </GanttSidebarGroup>
                  );
                })}
              </GanttSidebar>
              <GanttTimeline>
                <GanttHeader />
                <GanttFeatureList>
                  {Object.entries(groupedPhases).map(([propertyName, phases]) => {
                    const propertyId = phases[0]?.propertyId;
                    const isExpanded = expandedProperties.has(propertyId);
                    
                    if (!isExpanded) {
                      // Show a single collapsed row for the property with full timeline
                      const firstPhaseStart = phases[0].startAt;
                      const lastPhaseEnd = phases[phases.length - 1].endAt;
                      
                      // Calculate overall status based on current phase
                      const currentPhase = phases[0].currentPhase;
                      let overallStatus;
                      if (currentPhase === 6) {
                        overallStatus = phaseStatuses[0]; // completed
                      } else if (phases.some(p => p.status.id === 'delayed')) {
                        overallStatus = phaseStatuses[3]; // delayed
                      } else if (currentPhase > 0) {
                        overallStatus = phaseStatuses[1]; // in progress
                      } else {
                        overallStatus = phaseStatuses[2]; // planned
                      }
                      
                      return (
                        <GanttFeatureListGroup key={propertyName}>
                          <div className="flex">
                            <ContextMenu>
                              <ContextMenuTrigger asChild>
                                <button
                                  onClick={() => togglePropertyExpanded(propertyId)}
                                  type="button"
                                  className="w-full"
                                >
                                  <GanttFeatureItem
                                    id={`${propertyId}-collapsed`}
                                    name={`${propertyName} - Full Timeline`}
                                    startAt={firstPhaseStart}
                                    endAt={lastPhaseEnd}
                                    status={overallStatus}
                                    onMove={() => {}}
                                  >
                                    <div className="flex items-center gap-2 flex-1">
                                      <ChevronRight className="h-4 w-4" />
                                      <p className="flex-1 truncate text-xs font-medium">
                                        {propertyName} - All Phases
                                      </p>
                                      <Badge variant="outline" className="text-xs">
                                        Phase {currentPhase}/6
                                      </Badge>
                                    </div>
                                  </GanttFeatureItem>
                                </button>
                              </ContextMenuTrigger>
                              <ContextMenuContent>
                                <ContextMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => togglePropertyExpanded(propertyId)}
                                >
                                  Expand phases
                                </ContextMenuItem>
                                <ContextMenuItem
                                  className="flex items-center gap-2"
                                  onClick={() => window.location.href = `/properties/${propertyId}`}
                                >
                                  Open property
                                </ContextMenuItem>
                              </ContextMenuContent>
                            </ContextMenu>
                          </div>
                        </GanttFeatureListGroup>
                      );
                    }
                    
                    return (
                      <GanttFeatureListGroup key={propertyName}>
                        {/* Property header row when expanded */}
                        <div className="flex">
                          <button
                            onClick={() => togglePropertyExpanded(propertyId)}
                            type="button"
                            className="w-full"
                          >
                            <GanttFeatureItem
                              id={`${propertyId}-header`}
                              name={propertyName}
                              startAt={phases[0].startAt}
                              endAt={phases[phases.length - 1].endAt}
                              status={{ id: 'header', name: 'Header', color: '#E5E7EB' }}
                              onMove={() => {}}
                            >
                              <div className="flex items-center gap-2 flex-1">
                                <ChevronDown className="h-4 w-4" />
                                <p className="flex-1 truncate text-xs font-medium">
                                  {propertyName}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  Phase {phases[0].currentPhase}/6
                                </Badge>
                              </div>
                            </GanttFeatureItem>
                          </button>
                        </div>
                        {phases.map((phase) => (
                        <div className="flex" key={phase.id}>
                          <ContextMenu>
                            <ContextMenuTrigger asChild>
                              <button
                                onClick={() => handlePhaseClick(phase)}
                                type="button"
                                className="w-full"
                              >
                                <GanttFeatureItem
                                  id={phase.id}
                                  name={`${phase.propertyName} - ${phase.phaseName}`}
                                  startAt={phase.startAt}
                                  endAt={phase.endAt}
                                  status={phase.status}
                                  onMove={handlePhaseMove}
                                >
                                  <div className="flex items-center gap-2 flex-1">
                                    {phase.icon}
                                    <p className="flex-1 truncate text-xs font-medium">
                                      {phase.propertyName} - P{phase.phase}
                                    </p>
                                    {phase.phase === phase.currentPhase && (
                                      <Clock className="h-3 w-3 text-gray-500" />
                                    )}
                                    {phase.status.id === 'delayed' && (
                                      <AlertCircle className="h-3 w-3 text-red-500" />
                                    )}
                                    {phase.status.id === 'completed' && (
                                      <CheckCircle2 className="h-3 w-3 text-green-500" />
                                    )}
                                  </div>
                                </GanttFeatureItem>
                              </button>
                            </ContextMenuTrigger>
                            <ContextMenuContent>
                              <ContextMenuItem
                                className="flex items-center gap-2"
                                onClick={() => handlePhaseClick(phase)}
                              >
                                View details
                              </ContextMenuItem>
                              <ContextMenuItem
                                className="flex items-center gap-2"
                                onClick={() => window.location.href = `/properties/${phase.propertyId}`}
                              >
                                Open property
                              </ContextMenuItem>
                              {phase.status.id === 'planned' && (
                                <ContextMenuItem className="flex items-center gap-2">
                                  Reschedule
                                </ContextMenuItem>
                              )}
                            </ContextMenuContent>
                          </ContextMenu>
                        </div>
                      ))}
                    </GanttFeatureListGroup>
                    );
                  })}
                </GanttFeatureList>
                
                {/* Project Milestones */}
                {milestones.map((marker) => (
                  <GanttMarker
                    key={marker.id}
                    {...marker}
                    onRemove={(id) => console.log('Remove marker:', id)}
                  />
                ))}
                
                <GanttToday />
                <GanttCreateMarkerTrigger onCreateMarker={handleCreateMarker} />
              </GanttTimeline>
            </GanttProvider>
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-500" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-500" />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-gray-500" />
                <span>Planned</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-500" />
                <span>Delayed</span>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <div className="flex items-center gap-1">
                <Badge variant="default" className="h-4 text-xs">BlackVesto</Badge>
                <span>Partner Sale</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="h-4 text-xs">Internal</Badge>
                <span>Direct Sale</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}