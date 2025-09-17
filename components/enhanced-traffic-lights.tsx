"use client";

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { TrafficLightStatus, Property } from '@/lib/types';
import { cn } from '@/lib/utils';
import {
  Calculator,
  Zap,
  TrendingUp,
  Home,
  MapPin,
  Info,
  CheckCircle2,
  AlertTriangle,
  X
} from 'lucide-react';

interface TrafficLightCalculations {
  energy: {
    status: TrafficLightStatus;
    score: number;
    maxScore: number;
    factors: {
      energyClass: { value: string; score: number; maxScore: number; weight: number };
      consumption: { value: number; score: number; maxScore: number; weight: number };
      heatingType: { value: string; score: number; maxScore: number; weight: number };
      buildingAge: { value: number; score: number; maxScore: number; weight: number };
    };
  };
  yield: {
    status: TrafficLightStatus;
    score: number;
    maxScore: number;
    factors: {
      grossRentalYield: { value: number; score: number; maxScore: number; weight: number };
      marketComparison: { value: number; score: number; maxScore: number; weight: number };
      pricePerSqm: { value: number; score: number; maxScore: number; weight: number };
      renovationCosts: { value: number; score: number; maxScore: number; weight: number };
    };
  };
  hoa: {
    status: TrafficLightStatus;
    score: number;
    maxScore: number;
    factors: {
      monthlyFees: { value: number; score: number; maxScore: number; weight: number };
      reserves: { value: number; score: number; maxScore: number; weight: number };
      managementQuality: { value: string; score: number; maxScore: number; weight: number };
      buildingCondition: { value: string; score: number; maxScore: number; weight: number };
    };
  };
  location: {
    status: TrafficLightStatus;
    score: number;
    maxScore: number;
    factors: {
      publicTransport: { value: string; score: number; maxScore: number; weight: number };
      amenities: { value: string; score: number; maxScore: number; weight: number };
      marketTrend: { value: string; score: number; maxScore: number; weight: number };
      demographics: { value: string; score: number; maxScore: number; weight: number };
    };
  };
}

interface EnhancedTrafficLightsProps {
  property: Property;
  onCalculationUpdate?: (calculations: TrafficLightCalculations) => void;
}

export function EnhancedTrafficLights({ property, onCalculationUpdate }: EnhancedTrafficLightsProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Calculate energy efficiency score
  const calculateEnergyScore = (): TrafficLightCalculations['energy'] => {
    const factors = {
      energyClass: {
        value: property.energy_class || 'Unknown',
        score: getEnergyClassScore(property.energy_class),
        maxScore: 10,
        weight: 0.3
      },
      consumption: {
        value: property.project?.energy_consumption || 0,
        score: getConsumptionScore(property.project?.energy_consumption || 0),
        maxScore: 10,
        weight: 0.3
      },
      heatingType: {
        value: property.heating_type || 'Unknown',
        score: getHeatingTypeScore(property.heating_type),
        maxScore: 10,
        weight: 0.2
      },
      buildingAge: {
        value: property.project?.construction_year || 0,
        score: getBuildingAgeScore(property.project?.construction_year || 0),
        maxScore: 10,
        weight: 0.2
      }
    };

    const weightedScore = Object.values(factors).reduce(
      (sum, factor) => sum + (factor.score * factor.weight), 0
    );
    const maxScore = Object.values(factors).reduce(
      (sum, factor) => sum + (factor.maxScore * factor.weight), 0
    );

    return {
      status: weightedScore >= 7 ? 'green' : weightedScore >= 4 ? 'yellow' : 'red',
      score: weightedScore,
      maxScore,
      factors
    };
  };

  // Calculate rental yield score
  const calculateYieldScore = (): TrafficLightCalculations['yield'] => {
    const grossYield = property.gross_rental_yield || 0;
    const pricePerSqm = property.selling_price / property.size_sqm;
    const renovationRatio = property.developer_renovation_budget / property.developer_purchase_price;

    const factors = {
      grossRentalYield: {
        value: grossYield,
        score: grossYield >= 6 ? 10 : grossYield >= 4 ? 6 : grossYield >= 2 ? 3 : 0,
        maxScore: 10,
        weight: 0.4
      },
      marketComparison: {
        value: 0, // Would compare to market average
        score: 7, // Mock score
        maxScore: 10,
        weight: 0.2
      },
      pricePerSqm: {
        value: pricePerSqm,
        score: getPricePerSqmScore(pricePerSqm, property.city),
        maxScore: 10,
        weight: 0.2
      },
      renovationCosts: {
        value: renovationRatio,
        score: renovationRatio <= 0.1 ? 10 : renovationRatio <= 0.2 ? 7 : renovationRatio <= 0.3 ? 4 : 0,
        maxScore: 10,
        weight: 0.2
      }
    };

    const weightedScore = Object.values(factors).reduce(
      (sum, factor) => sum + (factor.score * factor.weight), 0
    );
    const maxScore = Object.values(factors).reduce(
      (sum, factor) => sum + (factor.maxScore * factor.weight), 0
    );

    return {
      status: weightedScore >= 7 ? 'green' : weightedScore >= 4 ? 'yellow' : 'red',
      score: weightedScore,
      maxScore,
      factors
    };
  };

  // Calculate HOA score
  const calculateHOAScore = (): TrafficLightCalculations['hoa'] => {
    const monthlyHOA = property.operation_cost_landlord + property.operation_cost_reserve;
    const hoaPerSqm = monthlyHOA / property.size_sqm;

    const factors = {
      monthlyFees: {
        value: monthlyHOA,
        score: hoaPerSqm <= 2 ? 10 : hoaPerSqm <= 4 ? 7 : hoaPerSqm <= 6 ? 4 : 0,
        maxScore: 10,
        weight: 0.4
      },
      reserves: {
        value: property.operation_cost_reserve,
        score: property.operation_cost_reserve >= 1 ? 10 : property.operation_cost_reserve >= 0.5 ? 6 : 2,
        maxScore: 10,
        weight: 0.3
      },
      managementQuality: {
        value: 'Good', // Mock data
        score: 8,
        maxScore: 10,
        weight: 0.2
      },
      buildingCondition: {
        value: 'Good', // Mock data
        score: 7,
        maxScore: 10,
        weight: 0.1
      }
    };

    const weightedScore = Object.values(factors).reduce(
      (sum, factor) => sum + (factor.score * factor.weight), 0
    );
    const maxScore = Object.values(factors).reduce(
      (sum, factor) => sum + (factor.maxScore * factor.weight), 0
    );

    return {
      status: weightedScore >= 7 ? 'green' : weightedScore >= 4 ? 'yellow' : 'red',
      score: weightedScore,
      maxScore,
      factors
    };
  };

  // Calculate location score
  const calculateLocationScore = (): TrafficLightCalculations['location'] => {
    const factors = {
      publicTransport: {
        value: 'Good', // Mock data
        score: 8,
        maxScore: 10,
        weight: 0.3
      },
      amenities: {
        value: 'Excellent', // Mock data
        score: 9,
        maxScore: 10,
        weight: 0.3
      },
      marketTrend: {
        value: 'Growing', // Mock data
        score: 8,
        maxScore: 10,
        weight: 0.2
      },
      demographics: {
        value: 'Young Professionals', // Mock data
        score: 7,
        maxScore: 10,
        weight: 0.2
      }
    };

    const weightedScore = Object.values(factors).reduce(
      (sum, factor) => sum + (factor.score * factor.weight), 0
    );
    const maxScore = Object.values(factors).reduce(
      (sum, factor) => sum + (factor.maxScore * factor.weight), 0
    );

    return {
      status: weightedScore >= 7 ? 'green' : weightedScore >= 4 ? 'yellow' : 'red',
      score: weightedScore,
      maxScore,
      factors
    };
  };

  // Helper functions for scoring
  function getEnergyClassScore(energyClass?: string): number {
    if (!energyClass) return 0;
    const scores: Record<string, number> = {
      'A+': 10, 'A': 9, 'B': 8, 'C': 6, 'D': 4, 'E': 2, 'F': 1, 'G': 0, 'H': 0
    };
    return scores[energyClass] || 0;
  }

  function getConsumptionScore(consumption: number): number {
    if (consumption <= 50) return 10;
    if (consumption <= 75) return 8;
    if (consumption <= 100) return 6;
    if (consumption <= 150) return 4;
    if (consumption <= 200) return 2;
    return 0;
  }

  function getHeatingTypeScore(heatingType?: string): number {
    if (!heatingType) return 0;
    const scores: Record<string, number> = {
      'Heat Pump': 10, 'District Heating': 9, 'Solar': 10, 'Gas': 6, 'Oil': 3, 'Electric': 4
    };
    return scores[heatingType] || 5;
  }

  function getBuildingAgeScore(year: number): number {
    if (year === 0) return 5;
    const age = new Date().getFullYear() - year;
    if (age <= 5) return 10;
    if (age <= 15) return 8;
    if (age <= 30) return 6;
    if (age <= 50) return 4;
    return 2;
  }

  function getPricePerSqmScore(pricePerSqm: number, city: string): number {
    // City-specific pricing thresholds (mock data)
    const cityThresholds: Record<string, { good: number; fair: number }> = {
      'Berlin': { good: 4000, fair: 6000 },
      'Munich': { good: 6000, fair: 8000 },
      'Hamburg': { good: 4500, fair: 6500 },
      'default': { good: 3500, fair: 5000 }
    };

    const thresholds = cityThresholds[city] || cityThresholds.default;

    if (pricePerSqm <= thresholds.good) return 10;
    if (pricePerSqm <= thresholds.fair) return 6;
    return 2;
  }

  // Calculate all scores and determine status based on score thresholds
  const calculations: TrafficLightCalculations = {
    energy: calculateEnergyScore(),
    yield: calculateYieldScore(),
    hoa: calculateHOAScore(),
    location: calculateLocationScore()
  };

  // Call update callback if provided
  if (onCalculationUpdate) {
    onCalculationUpdate(calculations);
  }

  const getStatusIcon = (status: TrafficLightStatus) => {
    switch (status) {
      case 'green': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'yellow': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'red': return <X className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: TrafficLightStatus) => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
    }
  };

  const getStatusBadgeVariant = (status: TrafficLightStatus) => {
    switch (status) {
      case 'green': return 'default';
      case 'yellow': return 'secondary';
      case 'red': return 'destructive';
    }
  };

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Status Assessment
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              <Info className="h-4 w-4 mr-2" />
              {showDetails ? 'Hide Details' : 'Show Details'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Traffic Light Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(calculations).map(([key, calculation]) => {
              const icons = {
                energy: <Zap className="h-5 w-5" />,
                yield: <TrendingUp className="h-5 w-5" />,
                hoa: <Home className="h-5 w-5" />,
                location: <MapPin className="h-5 w-5" />
              };

              const labels = {
                energy: 'Energy',
                yield: 'Yield',
                hoa: 'HOA',
                location: 'Location'
              };

              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <div className="text-center p-4 border rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-center mb-2">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center',
                          getStatusColor(calculation.status)
                        )}>
                          {icons[key as keyof typeof icons]}
                        </div>
                      </div>
                      <p className="font-medium text-sm mb-1">
                        {labels[key as keyof typeof labels]}
                      </p>
                      <Badge variant={getStatusBadgeVariant(calculation.status)} className="text-xs">
                        {calculation.score.toFixed(1)}/{calculation.maxScore.toFixed(1)}
                      </Badge>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Score: {calculation.score.toFixed(1)}/{calculation.maxScore.toFixed(1)}</p>
                    <p>Status: {calculation.status.toUpperCase()}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Overall Score */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Overall Assessment</h4>
              <div className="flex items-center gap-2">
                {Object.values(calculations).every(calc => calc.status === 'green') && (
                  <Badge variant="default">Excellent Investment</Badge>
                )}
                {Object.values(calculations).some(calc => calc.status === 'red') && (
                  <Badge variant="destructive">High Risk</Badge>
                )}
                {Object.values(calculations).every(calc => calc.status !== 'red') &&
                 Object.values(calculations).some(calc => calc.status === 'yellow') && (
                  <Badge variant="secondary">Moderate Risk</Badge>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Energy:</span>
                <span className="ml-2 font-medium">{calculations.energy.score.toFixed(1)}/10</span>
              </div>
              <div>
                <span className="text-gray-600">Yield:</span>
                <span className="ml-2 font-medium">{calculations.yield.score.toFixed(1)}/10</span>
              </div>
              <div>
                <span className="text-gray-600">HOA:</span>
                <span className="ml-2 font-medium">{calculations.hoa.score.toFixed(1)}/10</span>
              </div>
              <div>
                <span className="text-gray-600">Location:</span>
                <span className="ml-2 font-medium">{calculations.location.score.toFixed(1)}/10</span>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          {showDetails && (
            <div className="space-y-4 border-t pt-4">
              <Alert className="mb-4">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  The traffic lights above are calculated based on property characteristics. The detailed breakdown below shows how each score is determined.
                </AlertDescription>
              </Alert>
              <h4 className="font-medium">Detailed Breakdown</h4>

              {Object.entries(calculations).map(([key, calculation]) => {
                const titles = {
                  energy: 'Energy Efficiency',
                  yield: 'Rental Yield',
                  hoa: 'HOA Assessment',
                  location: 'Location Quality'
                };

                return (
                  <Card key={key}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base flex items-center gap-2">
                        {getStatusIcon(calculation.status)}
                        {titles[key as keyof typeof titles]}
                        <Badge variant={getStatusBadgeVariant(calculation.status)}>
                          {calculation.status.toUpperCase()}
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(calculation.factors).map(([factorKey, factor]) => {
                        const typedFactor = factor as { value: string | number; score: number; maxScore: number; weight: number };
                        return (
                          <div key={factorKey} className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium capitalize">
                                  {factorKey.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <span className="text-sm text-gray-600">
                                  {typeof typedFactor.value === 'number'
                                    ? typedFactor.value.toLocaleString()
                                    : typedFactor.value
                                  }
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Progress
                                  value={(typedFactor.score / typedFactor.maxScore) * 100}
                                  className="flex-1 h-2"
                                />
                                <span className="text-xs text-gray-500 min-w-12">
                                  {typedFactor.score.toFixed(1)}/{typedFactor.maxScore}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}