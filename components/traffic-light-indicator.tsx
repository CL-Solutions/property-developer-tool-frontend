import { cn } from '@/lib/utils';
import { TrafficLightStatus } from '@/lib/types';

interface TrafficLightIndicatorProps {
  status: TrafficLightStatus;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

// CUSTOM COMPONENT
export function TrafficLightIndicator({
  status,
  label,
  size = 'md',
  showLabel = true,
  className
}: TrafficLightIndicatorProps) {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-6 h-6'
  };

  const labelSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base'
  };

  const statusClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500'
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-full flex-shrink-0',
          sizeClasses[size],
          statusClasses[status]
        )}
      />
      {showLabel && (
        <span className={cn(
          'text-muted-foreground font-medium',
          labelSizeClasses[size]
        )}>
          {label}
        </span>
      )}
    </div>
  );
}

interface TrafficLightGridProps {
  lights: {
    energy: TrafficLightStatus;
    yield: TrafficLightStatus;
    hoa: TrafficLightStatus;
    location: TrafficLightStatus;
  };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

// CUSTOM COMPONENT - Grid layout for all four traffic lights
export function TrafficLightGrid({ lights, size = 'md', className }: TrafficLightGridProps) {
  const labels = {
    energy: 'Energy',
    yield: 'Yield',
    hoa: 'HOA',
    location: 'Location'
  };

  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      {Object.entries(lights).map(([key, status]) => (
        <TrafficLightIndicator
          key={key}
          status={status}
          label={labels[key as keyof typeof labels]}
          size={size}
        />
      ))}
    </div>
  );
}