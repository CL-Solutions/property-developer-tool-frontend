import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { PropertySummary } from '@/lib/types';
import { MockDataService } from '@/lib/mock-data';
import { TrafficLightGrid } from './traffic-light-indicator';
import { PhaseIndicator } from './phase-indicator';
import { MapPin, Calendar, AlertTriangle } from 'lucide-react';

interface PropertyCardProps {
  property: PropertySummary;
  onClick?: () => void;
  className?: string;
}

// CUSTOM COMPONENT
export function PropertyCard({ property, onClick, className }: PropertyCardProps) {
  const hasAlerts = property.has_critical_alerts;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        hasAlerts && 'border-red-200 bg-red-50/30',
        className
      )}
      onClick={onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            {/* Property identifier */}
            <h3 className="font-semibold text-lg truncate">
              {property.unit_number}
            </h3>

            {/* Address */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">
                {property.street} {property.house_number}, {property.city}
              </span>
            </div>

            {/* Project name */}
            <div className="text-sm text-muted-foreground truncate mt-1">
              {property.project_name}
            </div>
          </div>

          {/* Critical alerts indicator */}
          {hasAlerts && (
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-red-500" />
            </div>
          )}
        </div>

        {/* Sales Partner Badge */}
        <div className="flex justify-start">
          <Badge
            variant="secondary"
            className={cn(
              MockDataService.getSalesPartnerBadgeColor(property.sales_partner)
            )}
          >
            {MockDataService.getSalesPartnerLabel(property.sales_partner)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Phase Indicator */}
        <PhaseIndicator
          currentPhase={property.phase}
          status={property.phase_status}
          showLabel={false}
          size="sm"
        />

        {/* Traffic Light Status */}
        <div>
          <div className="text-xs text-muted-foreground mb-2 font-medium">
            Status Overview
          </div>
          <TrafficLightGrid
            lights={property.traffic_lights}
            size="sm"
          />
        </div>

        {/* Construction Progress */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs text-muted-foreground font-medium">
              Construction Progress
            </span>
            <span className="text-xs font-medium">
              {property.construction_progress}%
            </span>
          </div>
          <Progress
            value={property.construction_progress}
            className="h-2"
          />
        </div>

        {/* Days in Phase */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">
            {property.days_in_current_phase} days in current phase
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

interface PropertyCardSkeletonProps {
  className?: string;
}

// CUSTOM COMPONENT - Skeleton for loading state
export function PropertyCardSkeleton({ className }: PropertyCardSkeletonProps) {
  return (
    <Card className={cn('animate-pulse', className)}>
      <CardHeader className="pb-3">
        <div className="space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-6 bg-gray-200 rounded w-20" />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="h-8 bg-gray-200 rounded" />
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-6 bg-gray-200 rounded" />
            <div className="h-6 bg-gray-200 rounded" />
            <div className="h-6 bg-gray-200 rounded" />
            <div className="h-6 bg-gray-200 rounded" />
          </div>
        </div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-200 rounded" />
          <div className="h-2 bg-gray-200 rounded" />
        </div>
        <div className="h-4 bg-gray-200 rounded w-2/3" />
      </CardContent>
    </Card>
  );
}