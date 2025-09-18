"use client";

import { useState, useMemo } from 'react';
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
import { 
  FileCheck, 
  TrendingUp, 
  FileText, 
  Megaphone, 
  UserCheck, 
  Key,
  Calendar,
  CheckCircle2,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface PropertyGanttChartProps {
  propertyId?: string;
  currentPhase: number;
  purchaseDate?: Date;
  projectName?: string;
  unitNumber?: string;
}

interface Phase {
  id: string;
  name: string;
  phase: number;
  startAt: Date;
  endAt: Date;
  status: {
    id: string;
    name: string;
    color: string;
  };
  icon: React.ReactNode;
  description: string;
  milestones?: string[];
}

const phaseStatuses = [
  { id: 'completed', name: 'Completed', color: '#10B981' },
  { id: 'in_progress', name: 'In Progress', color: '#F59E0B' },
  { id: 'planned', name: 'Planned', color: '#6B7280' },
  { id: 'delayed', name: 'Delayed', color: '#EF4444' },
];

export function PropertyGanttChart({ 
  currentPhase,
  purchaseDate = new Date(),
  projectName = 'Property Project',
  unitNumber = 'Unit'
}: PropertyGanttChartProps) {
  const [selectedPhase, setSelectedPhase] = useState<Phase | null>(null);
  const [zoomLevel, setZoomLevel] = useState(40);

  // Generate phase timeline based on purchase date
  const phases = useMemo(() => {
    const baseDate = purchaseDate;
    
    const phaseData: Phase[] = [
      {
        id: 'phase-1',
        name: 'Pre-Check Assessment',
        phase: 1,
        startAt: new Date(baseDate),
        endAt: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
        status: currentPhase > 1 ? phaseStatuses[0] : currentPhase === 1 ? phaseStatuses[1] : phaseStatuses[2],
        icon: <FileCheck className="h-4 w-4" />,
        description: 'Initial property evaluation and traffic light assessment',
        milestones: [
          'Collect property documents',
          'Complete assessment form',
          'Send to BlackVesto partner',
          'Receive feedback'
        ]
      },
      {
        id: 'phase-2',
        name: 'Purchase Decision',
        phase: 2,
        startAt: new Date(baseDate.getTime() + 14 * 24 * 60 * 60 * 1000),
        endAt: new Date(baseDate.getTime() + 21 * 24 * 60 * 60 * 1000), // 1 week after phase 1
        status: currentPhase > 2 ? phaseStatuses[0] : currentPhase === 2 ? phaseStatuses[1] : phaseStatuses[2],
        icon: <TrendingUp className="h-4 w-4" />,
        description: 'GO/NO-GO decision based on assessment',
        milestones: [
          'Review BlackVesto feedback',
          'Negotiate price if needed',
          'Make purchase decision',
          'Sign purchase agreement'
        ]
      },
      {
        id: 'phase-3',
        name: 'Documentation & Preparation',
        phase: 3,
        startAt: new Date(baseDate.getTime() + 21 * 24 * 60 * 60 * 1000),
        endAt: new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000), // ~6 weeks
        status: currentPhase > 3 ? phaseStatuses[0] : currentPhase === 3 ? phaseStatuses[1] : phaseStatuses[2],
        icon: <FileText className="h-4 w-4" />,
        description: 'Complete documentation and prepare for marketing',
        milestones: [
          'Gather all legal documents',
          'Prepare marketing materials',
          'Professional photography',
          'Create property listing'
        ]
      },
      {
        id: 'phase-4',
        name: 'Marketing & Reservation',
        phase: 4,
        startAt: new Date(baseDate.getTime() + 60 * 24 * 60 * 60 * 1000),
        endAt: new Date(baseDate.getTime() + 120 * 24 * 60 * 60 * 1000), // 2 months
        status: currentPhase > 4 ? phaseStatuses[0] : currentPhase === 4 ? phaseStatuses[1] : phaseStatuses[2],
        icon: <Megaphone className="h-4 w-4" />,
        description: 'Active marketing and buyer reservation',
        milestones: [
          'List property on platforms',
          'Schedule viewings',
          'Handle inquiries',
          'Accept reservation'
        ]
      },
      {
        id: 'phase-5',
        name: 'Buyer Process & Notary',
        phase: 5,
        startAt: new Date(baseDate.getTime() + 120 * 24 * 60 * 60 * 1000),
        endAt: new Date(baseDate.getTime() + 150 * 24 * 60 * 60 * 1000), // 1 month
        status: currentPhase > 5 ? phaseStatuses[0] : currentPhase === 5 ? phaseStatuses[1] : phaseStatuses[2],
        icon: <UserCheck className="h-4 w-4" />,
        description: 'Finalize sale with buyer and notary',
        milestones: [
          'Buyer financing confirmation',
          'Schedule notary appointment',
          'Sign sale contract',
          'Transfer ownership'
        ]
      },
      {
        id: 'phase-6',
        name: 'Handover & Rental',
        phase: 6,
        startAt: new Date(baseDate.getTime() + 150 * 24 * 60 * 60 * 1000),
        endAt: new Date(baseDate.getTime() + 180 * 24 * 60 * 60 * 1000), // 1 month
        status: currentPhase === 6 ? phaseStatuses[1] : currentPhase > 6 ? phaseStatuses[0] : phaseStatuses[2],
        icon: <Key className="h-4 w-4" />,
        description: 'Complete handover and setup rental',
        milestones: [
          'Property inspection',
          'Key handover',
          'Meter readings',
          'Setup rental management'
        ]
      }
    ];

    return phaseData;
  }, [purchaseDate, currentPhase]);

  // Important milestones/markers
  const markers = useMemo(() => [
    {
      id: 'marker-1',
      date: new Date(purchaseDate.getTime() + 21 * 24 * 60 * 60 * 1000),
      label: 'Purchase Decision Deadline',
      className: 'bg-red-100 text-red-900'
    },
    {
      id: 'marker-2',
      date: new Date(purchaseDate.getTime() + 120 * 24 * 60 * 60 * 1000),
      label: 'Target Sale Date',
      className: 'bg-blue-100 text-blue-900'
    },
    {
      id: 'marker-3',
      date: new Date(purchaseDate.getTime() + 180 * 24 * 60 * 60 * 1000),
      label: 'Project Completion',
      className: 'bg-green-100 text-green-900'
    }
  ], [purchaseDate]);

  const handlePhaseClick = (phase: Phase) => {
    setSelectedPhase(phase);
  };

  const handlePhaseMove = (id: string, startAt: Date, endAt: Date | null) => {
    if (!endAt) return;
    console.log(`Rescheduling phase: ${id} from ${startAt} to ${endAt}`);
    // In a real app, this would update the phase dates in the backend
  };

  const handleCreateMarker = (date: Date) => {
    console.log(`Creating marker at: ${date.toISOString()}`);
    // In a real app, this would create a new milestone/deadline
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 100));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 10));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Development Timeline
            </CardTitle>
            <CardDescription>
              Project phases for {unitNumber} - {projectName}
            </CardDescription>
          </div>
          <Badge variant={currentPhase <= 2 ? 'secondary' : currentPhase <= 4 ? 'default' : 'outline'}>
            Phase {currentPhase} of 6
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-4 w-full overflow-hidden">
          {/* Phase Summary */}
          {selectedPhase && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {selectedPhase.icon}
                  <h4 className="font-semibold">{selectedPhase.name}</h4>
                </div>
                <Badge 
                  variant={
                    selectedPhase.status.id === 'completed' ? 'default' :
                    selectedPhase.status.id === 'in_progress' ? 'secondary' :
                    selectedPhase.status.id === 'delayed' ? 'destructive' :
                    'outline'
                  }
                >
                  {selectedPhase.status.name}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{selectedPhase.description}</p>
              {selectedPhase.milestones && (
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-gray-500 uppercase">Key Milestones:</p>
                  {selectedPhase.milestones.map((milestone, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      {selectedPhase.status.id === 'completed' || 
                       (selectedPhase.status.id === 'in_progress' && idx === 0) ? (
                        <CheckCircle2 className="h-3 w-3 text-green-500" />
                      ) : (
                        <div className="h-3 w-3 rounded-full border border-gray-300" />
                      )}
                      <span className={
                        selectedPhase.status.id === 'completed' || 
                        (selectedPhase.status.id === 'in_progress' && idx === 0)
                          ? 'text-gray-700' 
                          : 'text-gray-400'
                      }>
                        {milestone}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                <Button size="sm" variant="outline" onClick={() => setSelectedPhase(null)}>
                  Close
                </Button>
                {selectedPhase.phase === currentPhase && (
                  <Button size="sm">
                    View Details
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Gantt Chart */}
          <div className="relative border rounded-lg" style={{
            height: '400px',
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
                <GanttSidebarGroup name={`${unitNumber} Phases`}>
                  {phases.map((phase) => (
                    <GanttSidebarItem
                      key={phase.id}
                      feature={{
                        id: phase.id,
                        name: phase.name,
                        startAt: phase.startAt,
                        endAt: phase.endAt,
                        status: phase.status
                      }}
                      onSelectItem={() => handlePhaseClick(phase)}
                    />
                  ))}
                </GanttSidebarGroup>
              </GanttSidebar>
              <GanttTimeline>
                <GanttHeader />
                <GanttFeatureList>
                  <GanttFeatureListGroup>
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
                                name={phase.name}
                                startAt={phase.startAt}
                                endAt={phase.endAt}
                                status={phase.status}
                                onMove={handlePhaseMove}
                              >
                                <div className="flex items-center gap-2 flex-1">
                                  {phase.icon}
                                  <p className="flex-1 truncate text-xs font-medium">
                                    {phase.name}
                                  </p>
                                  {phase.phase === currentPhase && (
                                    <Badge variant="outline" className="text-xs px-1 py-0">
                                      Current
                                    </Badge>
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
                              View phase details
                            </ContextMenuItem>
                            {phase.phase === currentPhase && (
                              <ContextMenuItem className="flex items-center gap-2">
                                Update progress
                              </ContextMenuItem>
                            )}
                            {phase.status.id === 'planned' && (
                              <ContextMenuItem className="flex items-center gap-2">
                                Reschedule phase
                              </ContextMenuItem>
                            )}
                          </ContextMenuContent>
                        </ContextMenu>
                      </div>
                    ))}
                  </GanttFeatureListGroup>
                </GanttFeatureList>

                {/* Markers for important dates */}
                {markers.map((marker) => (
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
        </div>
      </CardContent>
    </Card>
  );
}