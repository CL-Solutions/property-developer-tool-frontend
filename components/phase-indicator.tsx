import { cn } from '@/lib/utils';
import { DeveloperPhase, DeveloperPhaseStatus } from '@/lib/types';
import { MockDataService } from '@/lib/mock-data';

interface PhaseIndicatorProps {
  currentPhase: DeveloperPhase;
  status: DeveloperPhaseStatus;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// CUSTOM COMPONENT
export function PhaseIndicator({
  currentPhase,
  status,
  showLabel = true,
  size = 'md',
  className
}: PhaseIndicatorProps) {
  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-2'
  };

  const statusClasses = {
    active: 'bg-blue-100 text-blue-800 border-blue-200',
    completed: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-gray-100 text-gray-600 border-gray-200'
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn(
        'rounded-full border font-medium',
        sizeClasses[size],
        statusClasses[status]
      )}>
        Phase {currentPhase}
      </div>
      {showLabel && (
        <span className="text-sm text-muted-foreground">
          {MockDataService.getPhaseLabel(currentPhase)}
        </span>
      )}
    </div>
  );
}

interface PhaseTimelineProps {
  currentPhase: DeveloperPhase;
  phases?: Array<{
    phase: DeveloperPhase;
    status: DeveloperPhaseStatus;
    label: string;
  }>;
  className?: string;
}

// CUSTOM COMPONENT - Timeline visualization for all 6 phases
export function PhaseTimeline({ currentPhase, phases, className }: PhaseTimelineProps) {
  // Default phases if not provided
  const defaultPhases = [1, 2, 3, 4, 5, 6].map(phase => ({
    phase: phase as DeveloperPhase,
    status: (phase < currentPhase ? 'completed' :
             phase === currentPhase ? 'active' : 'pending') as DeveloperPhaseStatus,
    label: MockDataService.getPhaseLabel(phase as DeveloperPhase)
  }));

  const phaseList = phases || defaultPhases;

  // Simplified labels for horizontal display
  const getShortLabel = (phase: DeveloperPhase): string => {
    switch(phase) {
      case 1: return 'Pre-Check';
      case 2: return 'Purchase';
      case 3: return 'Documentation';
      case 4: return 'Marketing';
      case 5: return 'Buyer Process';
      case 6: return 'Handover';
      default: return '';
    }
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Timeline container */}
      <div className="relative">
        {/* Connecting lines - positioned absolutely behind circles */}
        <div className="absolute top-5 left-0 right-0 flex">
          {[0, 1, 2, 3, 4].map((index) => (
            <div
              key={`line-${index}`}
              className={cn(
                'flex-1 h-0.5',
                index < currentPhase - 1 ? 'bg-green-500' : 'bg-gray-300'
              )}
            />
          ))}
        </div>

        {/* Phase circles and labels */}
        <div className="relative grid grid-cols-6 gap-0">
          {phaseList.map((phaseItem) => (
            <div key={phaseItem.phase} className="flex flex-col items-center">
              {/* Phase number circle */}
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all relative z-10 bg-white',
                phaseItem.status === 'completed' && 'bg-green-500 text-white border-green-500',
                phaseItem.status === 'active' && 'bg-blue-500 text-white animate-pulse border-blue-500',
                phaseItem.status === 'pending' && 'bg-gray-200 text-gray-600 border-gray-200',
                'border-2'
              )}>
                {phaseItem.phase}
              </div>

              {/* Phase label */}
              <div className="mt-3 text-center">
                <div className={cn(
                  'text-xs font-medium',
                  phaseItem.status === 'completed' && 'text-green-600',
                  phaseItem.status === 'active' && 'text-blue-600',
                  phaseItem.status === 'pending' && 'text-gray-500'
                )}>
                  {getShortLabel(phaseItem.phase)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

interface PhaseProgressBarProps {
  currentPhase: DeveloperPhase;
  totalPhases?: number;
  className?: string;
}

// CUSTOM COMPONENT - Progress bar for phases
export function PhaseProgressBar({
  currentPhase,
  totalPhases = 6,
  className
}: PhaseProgressBarProps) {
  const progressPercentage = (currentPhase / totalPhases) * 100;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Phase Progress</span>
        <span className="font-medium">{currentPhase} of {totalPhases}</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>
    </div>
  );
}