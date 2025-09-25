"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Calendar,
  Building2,
  Wrench,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  Home,
  Zap,
  MapPin,
  Euro,
  Shield,
  Landmark,
  X,
  ChevronDown
} from 'lucide-react';
import { Property, TrafficLightStatus, PreCheckResult } from '@/lib/types';
import { cn } from '@/lib/utils';
import { format, differenceInDays } from 'date-fns';
import { useTranslations } from 'next-intl';

interface PreCheckSummaryProps {
  property: Property;
  className?: string;
}

export function PreCheckSummary({ property, className }: PreCheckSummaryProps) {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState('overview');
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);
  const [expandedScores, setExpandedScores] = useState<{
    energy: boolean;
    yield: boolean;
    hoa: boolean;
    location: boolean;
  }>({
    energy: false,
    yield: false,
    hoa: false,
    location: false
  });

  const toggleScoreExpansion = (score: 'energy' | 'yield' | 'hoa' | 'location') => {
    setExpandedScores(prev => ({
      ...prev,
      [score]: !prev[score]
    }));
  };

  // Check if pre-check has been completed
  const hasPreCheck = property.developer_pre_check_result && property.developer_pre_check_date;

  if (!hasPreCheck) {
    return (
      <Card className={cn('', className)}>
        <CardContent className="py-8">
          <div className="text-center space-y-3">
            <Clock className="h-12 w-12 text-gray-400 mx-auto" />
            <p className="text-lg font-medium">{t('properties.preCheckPending')}</p>
            <p className="text-sm text-gray-600">
              {t('properties.preCheckPendingDesc')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const preCheckDate = property.developer_pre_check_date ? new Date(property.developer_pre_check_date) : new Date();
  const daysAgo = property.developer_pre_check_date ? differenceInDays(new Date(), preCheckDate) : 0;

  const getStatusIcon = (status: TrafficLightStatus) => {
    switch (status) {
      case 'green': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'yellow': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'red': return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getStatusColor = (status: TrafficLightStatus) => {
    switch (status) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getResultBadge = (result: PreCheckResult) => {
    switch (result) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800">{t('properties.approved')}</Badge>;
      case 'approved_with_modifications':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('properties.approvedWithModifications')}</Badge>;
      case 'rejected':
        return <Badge variant="destructive">{t('properties.rejected')}</Badge>;
    }
  };

  // Get initial traffic lights (from pre-check phase)
  const initialLights = property.developer_initial_traffic_lights || {
    energy: property.developer_traffic_light_energy,
    yield: property.developer_traffic_light_yield,
    hoa: property.developer_traffic_light_hoa,
    location: property.developer_traffic_light_location
  };

  const scores = property.developer_initial_traffic_lights?.scores || {
    energy: 0,
    yield: 0,
    hoa: 0,
    location: 0
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{t('properties.phasePreCheckAssessment')}</CardTitle>
            <CardDescription className="mt-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {t('properties.completedDate', { date: format(preCheckDate, 'MMM d, yyyy'), days: daysAgo })}
            </CardDescription>
          </div>
          {getResultBadge(property.developer_pre_check_result!)}
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="overview">{t('properties.overview')}</TabsTrigger>
            <TabsTrigger value="details">{t('properties.details')}</TabsTrigger>
            <TabsTrigger value="feedback">{t('properties.feedback')}</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            {/* Quick Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-xs">{t('properties.assessmentDate')}</span>
                </div>
                <p className="text-sm font-medium">{format(preCheckDate, 'dd.MM.yyyy')}</p>
                <p className="text-xs text-gray-500">{t('properties.daysAgo', { days: daysAgo })}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Building2 className="h-4 w-4" />
                  <span className="text-xs">{t('properties.propertyType')}</span>
                </div>
                <p className="text-sm font-medium">{property.unit_number || 'WE ' + property.id.slice(-3)}</p>
                <p className="text-xs text-gray-500">{property.size_sqm} m² • {property.rooms} {t('properties.rooms')}</p>
              </div>

              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 text-gray-600 mb-1">
                  <Euro className="h-4 w-4" />
                  <span className="text-xs">{t('properties.investment')}</span>
                </div>
                <p className="text-sm font-medium">€{property.developer_purchase_price?.toLocaleString()}</p>
                <p className="text-xs text-gray-500">{t('properties.yield')}: {property.gross_rental_yield?.toFixed(2)}%</p>
              </div>
            </div>

            {/* Traffic Lights Grid */}
            <div>
              <h3 className="text-sm font-medium mb-3">Assessment Results</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { key: 'energy', label: 'Energy', icon: Zap },
                  { key: 'yield', label: 'Yield', icon: TrendingUp },
                  { key: 'hoa', label: 'HOA', icon: Home },
                  { key: 'location', label: 'Location', icon: MapPin }
                ].map(({ key, label, icon: Icon }) => (
                  <div
                    key={key}
                    className={cn(
                      "p-3 rounded-lg border",
                      getStatusColor(initialLights[key as keyof typeof initialLights] as TrafficLightStatus || 'gray')
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{label}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      {getStatusIcon(initialLights[key as keyof typeof initialLights] as TrafficLightStatus || 'gray')}
                      <span className="text-lg font-bold">
                        {scores[key as keyof typeof scores].toFixed(1)}/10
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Toggle for Detailed Analysis */}
            <div>
              <Button
                variant="outline"
                onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                className="w-full justify-between"
              >
                <span className="font-medium">View Detailed Score Analysis</span>
                <ChevronDown className={cn(
                  "h-4 w-4 transition-transform",
                  showDetailedAnalysis && "rotate-180"
                )} />
              </Button>
            </div>

            {/* Detailed Score Breakdown - Collapsible */}
            {showDetailedAnalysis && (
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Detailed Score Analysis</h3>

                {/* Energy Score Breakdown */}
              <div className="p-4 border rounded-lg space-y-3 bg-gradient-to-br from-yellow-50/30 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-600" />
                    <span className="font-medium">Energy Efficiency</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      initialLights.energy === 'green' ? 'bg-green-100 text-green-800' :
                      initialLights.energy === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    )}>
                      {scores.energy.toFixed(1)}/10
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleScoreExpansion('energy')}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        expandedScores.energy && "rotate-180"
                      )} />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Energy Class:</span>
                    <span className="font-medium text-lg">{property.energy_class || 'Not specified'}</span>
                  </div>
                  {property.project?.energy_consumption && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Consumption:</span>
                      <span className="font-medium">{property.project.energy_consumption} kWh/m²/year</span>
                    </div>
                  )}
                  {property.heating_type && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Heating:</span>
                      <span className="font-medium">{property.heating_type}</span>
                    </div>
                  )}

                  {/* Collapsible Details */}
                  {expandedScores.energy && (
                    <>
                      {/* Score Calculation Details */}
                      <div className="bg-white/60 rounded p-2 mt-2 space-y-1 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-700 mb-1">Score Breakdown:</div>
                    <div className="text-xs space-y-0.5">
                      <div className={cn("flex justify-between", scores.energy >= 9 && "font-semibold text-green-700")}>
                        <span>• A+/A (9-10 pts)</span>
                        <span>&lt; 50 kWh/m²</span>
                      </div>
                      <div className={cn("flex justify-between", scores.energy >= 7 && scores.energy < 9 && "font-semibold text-green-600")}>
                        <span>• B/C (7-8 pts)</span>
                        <span>50-100 kWh/m²</span>
                      </div>
                      <div className={cn("flex justify-between", scores.energy >= 4 && scores.energy < 7 && "font-semibold text-yellow-600")}>
                        <span>• D/E (4-6 pts)</span>
                        <span>100-200 kWh/m²</span>
                      </div>
                      <div className={cn("flex justify-between", scores.energy < 4 && "font-semibold text-red-600")}>
                        <span>• F/G (1-3 pts)</span>
                        <span>&gt; 200 kWh/m²</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-2" />
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">Impact Analysis:</p>
                    <p className="text-xs text-gray-600">
                      {scores.energy < 3 ? "⚠️ Significant renovation required (~€15-30k). Energy class F/G properties face rental restrictions in some regions." :
                       scores.energy < 5 ? "⚡ Consider insulation & heating upgrades (~€8-15k). Class D/E acceptable but limits tenant appeal." :
                       scores.energy < 7 ? "✓ Meets current standards. Minor improvements (~€3-8k) could increase rent potential." :
                       "✨ Premium efficiency! Attracts quality tenants and commands 5-10% rent premium."}
                    </p>
                  </div>
                    </>
                  )}
                </div>
              </div>

              {/* Yield Score Breakdown */}
              <div className="p-4 border rounded-lg space-y-3 bg-gradient-to-br from-green-50/30 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="font-medium">Rental Yield</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      initialLights.yield === 'green' ? 'bg-green-100 text-green-800' :
                      initialLights.yield === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    )}>
                      {scores.yield.toFixed(1)}/10
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleScoreExpansion('yield')}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        expandedScores.yield && "rotate-180"
                      )} />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Gross Yield:</span>
                    <span className="font-medium text-lg">{property.gross_rental_yield?.toFixed(2)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly Rent:</span>
                    <span className="font-medium">€{property.monthly_rent?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Investment:</span>
                    <span className="font-medium">€{property.developer_purchase_price?.toLocaleString()}</span>
                  </div>

                  {/* Collapsible Details */}
                  {expandedScores.yield && (
                    <>
                      {/* Yield Calculation Details */}
                      <div className="bg-white/60 rounded p-2 mt-2 space-y-1 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-700 mb-1">Market Benchmarks:</div>
                    <div className="text-xs space-y-0.5">
                      <div className={cn("flex justify-between", property.gross_rental_yield && property.gross_rental_yield >= 6 && "font-semibold text-green-700")}>
                        <span>• Excellent (9-10 pts)</span>
                        <span>&gt; 6.0%</span>
                      </div>
                      <div className={cn("flex justify-between", property.gross_rental_yield && property.gross_rental_yield >= 5 && property.gross_rental_yield < 6 && "font-semibold text-green-600")}>
                        <span>• Good (7-8 pts)</span>
                        <span>5.0-6.0%</span>
                      </div>
                      <div className={cn("flex justify-between", property.gross_rental_yield && property.gross_rental_yield >= 4 && property.gross_rental_yield < 5 && "font-semibold text-yellow-600")}>
                        <span>• Average (4-6 pts)</span>
                        <span>4.0-5.0%</span>
                      </div>
                      <div className={cn("flex justify-between", property.gross_rental_yield && property.gross_rental_yield < 4 && "font-semibold text-red-600")}>
                        <span>• Below Market (1-3 pts)</span>
                        <span>&lt; 4.0%</span>
                      </div>
                    </div>
                  </div>

                  {/* Annual Calculation */}
                  <div className="bg-gray-50 rounded p-2 text-xs">
                    <div className="font-medium text-gray-700 mb-1">Annual Projection:</div>
                    <div className="space-y-0.5 text-gray-600">
                      <div className="flex justify-between">
                        <span>Annual Rent:</span>
                        <span className="font-medium">€{((property.monthly_rent || 0) * 12).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>ROI Timeline:</span>
                        <span className="font-medium">{property.gross_rental_yield ? (100 / property.gross_rental_yield).toFixed(1) : 'N/A'} years</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-2" />
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">Investment Analysis:</p>
                    <p className="text-xs text-gray-600">
                      {scores.yield < 3 ? "📉 Below 4% yield requires price negotiation or rent optimization. Consider alternative strategies." :
                       scores.yield < 5 ? "📊 4-5% yield is market standard. Focus on value-add opportunities to improve returns." :
                       scores.yield < 7 ? "📈 5-6% yield exceeds market average. Strong cash flow potential with stable returns." :
                       "🚀 Above 6% yield! Exceptional opportunity with premium returns and fast ROI."}
                    </p>
                  </div>
                    </>
                  )}
                </div>
              </div>

              {/* HOA Score Breakdown */}
              <div className="p-4 border rounded-lg space-y-3 bg-gradient-to-br from-blue-50/30 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">HOA Fees</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      initialLights.hoa === 'green' ? 'bg-green-100 text-green-800' :
                      initialLights.hoa === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    )}>
                      {scores.hoa.toFixed(1)}/10
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleScoreExpansion('hoa')}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        expandedScores.hoa && "rotate-180"
                      )} />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Monthly HOA:</span>
                    <span className="font-medium text-lg">€{((property.hoa_fees_landlord || 0) + (property.hoa_fees_reserve || 0)).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">HOA - Landlord:</span>
                    <span className="font-medium">€{(property.hoa_fees_landlord || 0).toLocaleString()}/month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">HOA - Reserve:</span>
                    <span className="font-medium">€{(property.hoa_fees_reserve || 0).toLocaleString()}/month</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Annual HOA:</span>
                    <span className="font-medium">€{(((property.hoa_fees_landlord || 0) + (property.hoa_fees_reserve || 0)) * 12).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Impact on Yield:</span>
                    <span className="font-medium">
                      {((property.hoa_fees_landlord || 0) + (property.hoa_fees_reserve || 0)) && property.monthly_rent
                        ? `-${((((property.hoa_fees_landlord || 0) + (property.hoa_fees_reserve || 0)) / property.monthly_rent) * 100).toFixed(1)}%`
                        : 'N/A'}
                    </span>
                  </div>

                  {false && (
                    <div className="flex items-center gap-1.5 bg-green-50 rounded p-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                      <span className="text-xs font-medium text-green-700">Transferable to tenant (+2 pts)</span>
                    </div>
                  )}

                  {/* Collapsible Details */}
                  {expandedScores.hoa && (
                    <>
                      {/* HOA Score Calculation */}
                      <div className="bg-white/60 rounded p-2 mt-2 space-y-1 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-700 mb-1">Fee Benchmarks:</div>
                    <div className="text-xs space-y-0.5">
                      <div className={cn("flex justify-between", 0 && 0 <= 150 && "font-semibold text-green-700")}>
                        <span>• Low (8-10 pts)</span>
                        <span>&lt; €150/month</span>
                      </div>
                      <div className={cn("flex justify-between", 0 && 0 > 150 && 0 <= 250 && "font-semibold text-green-600")}>
                        <span>• Average (5-7 pts)</span>
                        <span>€150-250/month</span>
                      </div>
                      <div className={cn("flex justify-between", 0 && 0 > 250 && 0 <= 350 && "font-semibold text-yellow-600")}>
                        <span>• High (3-4 pts)</span>
                        <span>€250-350/month</span>
                      </div>
                      <div className={cn("flex justify-between", 0 && 0 > 350 && "font-semibold text-red-600")}>
                        <span>• Very High (1-2 pts)</span>
                        <span>&gt; €350/month</span>
                      </div>
                    </div>
                  </div>

                  {/* Net Yield Impact */}
                  <div className="bg-gray-50 rounded p-2 text-xs">
                    <div className="font-medium text-gray-700 mb-1">Net Yield Impact:</div>
                    <div className="space-y-0.5 text-gray-600">
                      <div className="flex justify-between">
                        <span>Gross Yield:</span>
                        <span>{property.gross_rental_yield?.toFixed(2)}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>After HOA:</span>
                        <span className="font-medium">
                          {property.gross_rental_yield && 0 && property.developer_purchase_price
                            ? `${(property.gross_rental_yield - ((0 * 12 / property.developer_purchase_price) * 100)).toFixed(2)}%`
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-2" />
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">Fee Assessment:</p>
                    <p className="text-xs text-gray-600">
                      {scores.hoa < 3 ? "💸 Excessive fees (&gt;€350/mo) severely impact returns. Negotiate reduction or ensure premium rent justifies costs." :
                       scores.hoa < 5 ? "💰 Above-average fees (€250-350/mo). Review HOA services and consider cost optimization strategies." :
                       scores.hoa < 7 ? "✓ Standard fees (€150-250/mo) appropriate for property class and amenities provided." :
                       "✨ Low fees (&lt;€150/mo)! Maximizes net yield and improves investment attractiveness."}
                    </p>
                  </div>
                    </>
                  )}
                </div>
              </div>

              {/* Location Score Breakdown */}
              <div className="p-4 border rounded-lg space-y-3 bg-gradient-to-br from-purple-50/30 to-transparent">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-purple-600" />
                    <span className="font-medium">Location Quality</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn(
                      initialLights.location === 'green' ? 'bg-green-100 text-green-800' :
                      initialLights.location === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    )}>
                      {scores.location.toFixed(1)}/10
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleScoreExpansion('location')}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className={cn(
                        "h-4 w-4 transition-transform",
                        expandedScores.location && "rotate-180"
                      )} />
                    </Button>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">District:</span>
                    <span className="font-medium text-lg">{property.project?.district || property.city || 'Berlin'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Address:</span>
                    <span className="font-medium">{property.project?.street} {property.project?.house_number}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Postal Code:</span>
                    <span className="font-medium">{property.project?.zip_code}</span>
                  </div>

                  {/* Collapsible Details */}
                  {expandedScores.location && (
                    <>
                      {/* Location Score Factors */}
                      <div className="bg-white/60 rounded p-2 mt-2 space-y-1 border border-gray-200">
                    <div className="text-xs font-semibold text-gray-700 mb-1">Location Categories:</div>
                    <div className="text-xs space-y-0.5">
                      <div className={cn("flex justify-between", scores.location >= 8 && "font-semibold text-green-700")}>
                        <span>• Prime (8-10 pts)</span>
                        <span>City center, A-location</span>
                      </div>
                      <div className={cn("flex justify-between", scores.location >= 6 && scores.location < 8 && "font-semibold text-green-600")}>
                        <span>• Good (6-7 pts)</span>
                        <span>Established residential</span>
                      </div>
                      <div className={cn("flex justify-between", scores.location >= 4 && scores.location < 6 && "font-semibold text-yellow-600")}>
                        <span>• Average (4-5 pts)</span>
                        <span>Suburban, developing</span>
                      </div>
                      <div className={cn("flex justify-between", scores.location < 4 && "font-semibold text-red-600")}>
                        <span>• Challenging (1-3 pts)</span>
                        <span>Remote, industrial</span>
                      </div>
                    </div>
                  </div>

                  {/* Amenities Assessment */}
                  <div className="bg-gray-50 rounded p-2 text-xs">
                    <div className="font-medium text-gray-700 mb-1">Area Amenities:</div>
                    <div className="grid grid-cols-2 gap-2 text-gray-600">
                      <div className="flex items-center gap-1">
                        {scores.location >= 5 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                        <span>Public Transport</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {scores.location >= 6 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                        <span>Shopping</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {scores.location >= 7 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                        <span>Schools/Unis</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {scores.location >= 5 ? <CheckCircle2 className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                        <span>Parks/Recreation</span>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-gray-200 space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Walk Score:</span>
                        <span className="font-medium">{scores.location >= 7 ? '85+' : scores.location >= 5 ? '60-84' : '< 60'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Transit Access:</span>
                        <span className="font-medium">{scores.location >= 7 ? '< 5 min' : scores.location >= 5 ? '5-15 min' : '> 15 min'}</span>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-2" />
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-xs font-medium text-gray-700 mb-1">Market Analysis:</p>
                    <p className="text-xs text-gray-600">
                      {scores.location < 3 ? "🏚️ Remote location limits tenant pool. Focus on affordable housing or specific demographics (students, workers)." :
                       scores.location < 5 ? "🏘️ Developing area with growth potential. Monitor infrastructure improvements and gentrification trends." :
                       scores.location < 7 ? "🏡 Established residential area attracts stable, long-term tenants. Good for families and professionals." :
                       "🏙️ Premium location commands top rents! High demand from affluent tenants, excellent appreciation potential."}
                    </p>
                    <div className="mt-2 pt-2 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-gray-600">Rental Premium:</span>
                          <div className="font-semibold text-gray-700">
                            {scores.location >= 8 ? "+15-20%" :
                             scores.location >= 6 ? "+5-10%" :
                             scores.location >= 4 ? "Market rate" :
                             "-10-15%"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Vacancy Risk:</span>
                          <div className="font-semibold text-gray-700">
                            {scores.location >= 8 ? "Very Low" :
                             scores.location >= 6 ? "Low" :
                             scores.location >= 4 ? "Average" :
                             "Higher"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                    </>
                  )}
                </div>
              </div>
              </div>
            )}

            {/* Overall Recommendation */}
            <div>
              <h3 className="text-sm font-medium mb-3">Next Steps</h3>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {property.developer_pre_check_result === 'approved' ? (
                    <div className="space-y-2">
                      <p className="font-medium text-green-700">✅ Ready to proceed to Phase 2 - Purchase</p>
                      <p className="text-sm">All assessment criteria met. Property shows strong investment potential.</p>
                    </div>
                  ) : property.developer_pre_check_result === 'approved_with_modifications' ? (
                    <div className="space-y-2">
                      <p className="font-medium text-yellow-700">⚠️ Review modifications before proceeding</p>
                      <p className="text-sm">Property approved with conditions. Check feedback tab for required adjustments.</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="font-medium text-red-700">❌ Not recommended for purchase</p>
                      <p className="text-sm">Property does not meet investment criteria. Consider alternative options.</p>
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            </div>

            {/* Sales Partner */}
            <div>
              <h3 className="text-sm font-medium mb-3">Sales Configuration</h3>
              <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Partner:</span>
                  <Badge variant="outline">
                    {property.developer_sales_partner === 'blackvesto' ? 'BlackVesto' : 'Internal Sales'}
                  </Badge>
                </div>
                {property.developer_sales_partner_id && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Partner ID:</span>
                    <span className="text-sm font-medium">{property.developer_sales_partner_id}</span>
                  </div>
                )}
                {property.has_erstvermietungsgarantie && (
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">First Rental Guarantee Active</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Euro className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600">Total Investment</span>
                </div>
                <p className="text-xl font-bold">
                  €{((property.developer_purchase_price || 0) +
                     (property.developer_renovation_budget || 0) +
                     (property.developer_furnishing_budget || 0)).toLocaleString()}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600">Gross Yield</span>
                </div>
                <p className="text-xl font-bold">
                  {property.gross_rental_yield?.toFixed(2)}%
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-6 mt-6">
            {/* Construction Trades */}
            {property.developer_selected_trades && property.developer_selected_trades.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Selected Construction Trades</h3>
                <div className="flex flex-wrap gap-2">
                  {property.developer_selected_trades.map((trade) => (
                    <Badge key={trade} variant="secondary">
                      <Wrench className="h-3 w-3 mr-1" />
                      {trade}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Construction Description */}
            {property.developer_construction_description && (
              <div>
                <h3 className="text-sm font-medium mb-3">Renovation Plan</h3>
                <p className="text-sm text-gray-600 p-4 bg-gray-50 rounded-lg">
                  {property.developer_construction_description}
                </p>
              </div>
            )}

            {/* Special Conditions */}
            {property.developer_special_conditions && (
              <div>
                <h3 className="text-sm font-medium mb-3">Special Conditions</h3>
                <div className="space-y-2">
                  {property.developer_special_conditions.historic_preservation && (
                    <Alert className="bg-amber-50 border-amber-200">
                      <Landmark className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        Historic preservation requirements apply
                      </AlertDescription>
                    </Alert>
                  )}
                  {property.developer_special_conditions.property_division && (
                    <Alert className="bg-blue-50 border-blue-200">
                      <Building2 className="h-4 w-4 text-blue-600" />
                      <AlertDescription className="text-blue-800">
                        Property division planned
                      </AlertDescription>
                    </Alert>
                  )}
                  {property.developer_special_conditions.subsidies.length > 0 && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-2">Available Subsidies:</p>
                      <ul className="list-disc list-inside text-sm text-green-700">
                        {property.developer_special_conditions.subsidies.map((subsidy) => (
                          <li key={subsidy}>{subsidy}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {property.developer_special_conditions.encumbrances.length > 0 && (
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-sm font-medium text-red-800 mb-2">Encumbrances:</p>
                      <ul className="list-disc list-inside text-sm text-red-700">
                        {property.developer_special_conditions.encumbrances.map((encumbrance) => (
                          <li key={encumbrance}>{encumbrance}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="feedback" className="space-y-6 mt-6">
            {/* Pre-Check Feedback */}
            {property.developer_pre_check_feedback && (
              <div>
                <h3 className="text-sm font-medium mb-3">Assessment Feedback</h3>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-gray-600 mt-0.5" />
                    <p className="text-sm text-gray-700">
                      {property.developer_pre_check_feedback}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Required Modifications */}
            {property.developer_pre_check_modifications &&
             property.developer_pre_check_modifications.length > 0 && (
              <div>
                <h3 className="text-sm font-medium mb-3">Required Modifications</h3>
                <div className="space-y-2">
                  {property.developer_pre_check_modifications.map((mod, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                      <ChevronRight className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <p className="text-sm text-yellow-800">{mod}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Purchase Decision */}
            {property.developer_purchase_decision && (
              <div>
                <h3 className="text-sm font-medium mb-3">Purchase Decision</h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Decision:</span>
                    <Badge variant={
                      property.developer_purchase_decision === 'proceed' ? 'default' :
                      property.developer_purchase_decision === 'modify' ? 'secondary' : 'destructive'
                    }>
                      {property.developer_purchase_decision === 'proceed' ? 'Proceed with Purchase' :
                       property.developer_purchase_decision === 'modify' ? 'Modify Terms' : 'Reject'}
                    </Badge>
                  </div>
                  {property.developer_purchase_decision_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Decision Date:</span>
                      <span className="text-sm font-medium">
                        {format(new Date(property.developer_purchase_decision_date), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}