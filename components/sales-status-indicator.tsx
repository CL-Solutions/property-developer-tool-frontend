'use client';

import React from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Users, 
  AlertCircle,
  TrendingUp,
  Calendar,
  FileText,
  Home
} from 'lucide-react';
import { 
  ReservationStatus, 
  BuyerFinancingStatus, 
  NotaryAppointmentStatus,
  Property
} from '@/lib/types';

interface SalesStatusIndicatorProps {
  property: Property;
  detailed?: boolean;
}

export function SalesStatusIndicator({ property, detailed = false }: SalesStatusIndicatorProps) {
  const t = useTranslations();
  // Reservation Status Badge
  const getReservationBadge = (status?: ReservationStatus) => {
    switch (status) {
      case 'available':
        return (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Home className="h-3 w-3" />
            {t('properties.available')}
          </Badge>
        );
      case 'requested':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-yellow-500">
            <Clock className="h-3 w-3" />
            {t('properties.requested')}
          </Badge>
        );
      case 'reserved':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-green-500">
            <CheckCircle2 className="h-3 w-3" />
            {t('properties.reserved')}
          </Badge>
        );
      case 'sold':
        return (
          <Badge variant="default" className="flex items-center gap-1 bg-blue-500">
            <TrendingUp className="h-3 w-3" />
            {t('properties.sold')}
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="destructive" className="flex items-center gap-1">
            <XCircle className="h-3 w-3" />
            {t('properties.cancelled')}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {t('properties.unknown')}
          </Badge>
        );
    }
  };

  // Financing Status Indicator
  const getFinancingIndicator = (status?: BuyerFinancingStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm text-green-700">{t('properties.financingConfirmed')}</span>
          </div>
        );
      case 'pending':
        return (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-sm text-yellow-700">{t('properties.financingPending')}</span>
          </div>
        );
      case 'rejected':
        return (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-sm text-red-700">{t('properties.financingRejected')}</span>
          </div>
        );
      case 'not_required':
        return (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-300" />
            <span className="text-sm text-gray-600">Cash Purchase</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Notary Status
  const getNotaryStatus = (status?: NotaryAppointmentStatus) => {
    switch (status) {
      case 'preparation':
        return (
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-yellow-600" />
            <span className="text-sm">Notary Preparation</span>
          </div>
        );
      case 'scheduled':
        return (
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-green-600" />
            <span className="text-sm">
              Notary Scheduled
              {property.notary_appointment_date && (
                <span className="font-medium ml-1">
                  ({new Date(property.notary_appointment_date).toLocaleDateString()})
                </span>
              )}
            </span>
          </div>
        );
      case 'completed':
        return (
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blue-600" />
            <span className="text-sm">Notary Completed</span>
          </div>
        );
      default:
        return null;
    }
  };

  // Waitlist indicator
  const getWaitlistBadge = () => {
    if (!property.waitlist_count || property.waitlist_count === 0) return null;
    
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        {property.waitlist_count} on waitlist
      </Badge>
    );
  };

  // Traffic light status for sales (green = sold/reserved, yellow = requested, red = available long time)
  const getSalesTrafficLight = () => {
    const status = property.reservation_status;
    const daysInPhase = property.days_in_current_phase || 0;
    
    let color = 'bg-gray-300';
    let label = 'No Data';
    
    if (status === 'sold' || status === 'reserved') {
      color = 'bg-green-500';
      label = 'Good';
    } else if (status === 'requested') {
      color = 'bg-yellow-500';
      label = 'Processing';
    } else if (status === 'available' && daysInPhase > 30) {
      color = 'bg-red-500';
      label = 'Attention';
    } else if (status === 'available') {
      color = 'bg-gray-400';
      label = 'Available';
    }
    
    return (
      <div className="flex items-center gap-2">
        <div className={`w-8 h-8 rounded-full ${color}`} />
        <div>
          <p className="text-xs text-muted-foreground">Sales Status</p>
          <p className="text-sm font-medium">{label}</p>
        </div>
      </div>
    );
  };

  if (!detailed) {
    // Compact view for property cards
    return (
      <div className="flex items-center gap-2">
        {getReservationBadge(property.reservation_status)}
        {property.waitlist_count && property.waitlist_count > 0 && (
          <span className="text-xs text-muted-foreground">
            +{property.waitlist_count} waiting
          </span>
        )}
      </div>
    );
  }

  // Detailed view for property detail page
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Sales Process Status</span>
          {property.developer_sales_partner === 'blackvesto' && (
            <Badge variant="outline">
              <TrendingUp className="h-3 w-3 mr-1" />
              BlackVesto Sync
            </Badge>
          )}
        </CardTitle>
        {property.sales_status_sync_date && (
          <p className="text-xs text-muted-foreground">
            Last synced: {new Date(property.sales_status_sync_date).toLocaleString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Status Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {getSalesTrafficLight()}
            {getReservationBadge(property.reservation_status)}
            {getWaitlistBadge()}
          </div>
        </div>

        {/* Buyer & Financing Info */}
        {property.buyer_info && (
          <div className="space-y-2 pt-3 border-t">
            <h4 className="text-sm font-medium">Buyer Information</h4>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="text-muted-foreground">Name:</span>{' '}
                <span className="font-medium">{property.buyer_info.name}</span>
              </p>
              {property.buyer_info.reservation_date && (
                <p className="text-sm">
                  <span className="text-muted-foreground">Reserved on:</span>{' '}
                  {new Date(property.buyer_info.reservation_date).toLocaleDateString()}
                </p>
              )}
              {getFinancingIndicator(property.buyer_financing_status)}
            </div>
          </div>
        )}

        {/* Notary Status */}
        {property.notary_appointment_status && 
         property.notary_appointment_status !== 'not_scheduled' && (
          <div className="pt-3 border-t">
            <h4 className="text-sm font-medium mb-2">Notary Process</h4>
            {getNotaryStatus(property.notary_appointment_status)}
          </div>
        )}

        {/* Phase-specific guidance */}
        {property.developer_phase === 4 && property.reservation_status === 'available' && (
          <div className="p-3 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-800">
              <AlertCircle className="h-4 w-4 inline mr-1" />
              Property available for {property.days_in_current_phase} days. 
              Consider price adjustment or marketing strategy review.
            </p>
          </div>
        )}

        {property.developer_phase === 5 && property.buyer_financing_status === 'pending' && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <Clock className="h-4 w-4 inline mr-1" />
              Awaiting financing confirmation from buyer&apos;s bank.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}