'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Building2,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrafficLightStatus } from '@/lib/types';
import { UnitData } from './multi-family-house-form';

interface BuildingData {
  street: string;
  houseNumber: string;
  city: string;
  zipCode: string;
  constructionYear: number | null;
  totalFloors: number | null;
  totalBuildingArea: number | null;
  energyClass: string;
  buildingRenovationBudget: number | null;
  renovationDescription: string;
  historicPreservation: boolean;
  propertyDivision: boolean;
  subsidies: string;
  encumbrances: string;
}

interface AggregateTrafficLightsProps {
  units: UnitData[];
  buildingData: BuildingData;
}

export function AggregateTrafficLights({ units, buildingData }: AggregateTrafficLightsProps) {
  const aggregateScores = useMemo(() => {
    // Calculate individual unit scores
    const unitScores = units.map(unit => {
      const monthlyRent = unit.vacancyStatus === 'rented' ? unit.currentRent : unit.plannedRent;
      const totalInvestment = (unit.purchasePrice || 0) + (unit.renovationBudget || 0) + (unit.furnishingBudget || 0);

      // Energy Score (building-level)
      const energyClassScores: Record<string, number> = {
        'A+': 10, 'A': 9, 'B': 8, 'C': 6, 'D': 4, 'E': 2, 'F': 1, 'G': 0, 'H': 0
      };
      const energyClassScore = buildingData.energyClass ? (energyClassScores[buildingData.energyClass] || 0) : 5;
      const age = buildingData.constructionYear ? new Date().getFullYear() - buildingData.constructionYear : 0;
      const ageScore = age === 0 ? 5 : age <= 5 ? 10 : age <= 15 ? 8 : age <= 30 ? 6 : age <= 50 ? 4 : 2;
      const energyScore = energyClassScore * 0.6 + ageScore * 0.4;

      // Yield Score (unit-level)
      const grossYield = (monthlyRent && totalInvestment) ? ((monthlyRent * 12) / totalInvestment) * 100 : 0;
      const grossYieldScore =
        grossYield >= 6 ? 10 :
        grossYield >= 5 ? 8 :
        grossYield >= 4 ? 6 :
        grossYield >= 3 ? 4 :
        grossYield >= 2 ? 2 : 0;

      const pricePerSqm = (unit.purchasePrice && unit.livingArea) ? unit.purchasePrice / unit.livingArea : 0;
      const priceScore = buildingData.city === 'Munich'
        ? (pricePerSqm <= 6000 ? 10 : pricePerSqm <= 8000 ? 6 : 2)
        : (pricePerSqm <= 3500 ? 10 : pricePerSqm <= 5000 ? 6 : 2);

      const renovationRatio = (unit.purchasePrice && unit.renovationBudget)
        ? unit.renovationBudget / unit.purchasePrice : 0;
      const renovationScore =
        renovationRatio <= 0.1 ? 10 :
        renovationRatio <= 0.2 ? 7 :
        renovationRatio <= 0.3 ? 4 : 0;

      const yieldScore = grossYieldScore * 0.5 + priceScore * 0.25 + renovationScore * 0.25;

      // HOA Score (unit-level)
      const totalHoaFees = (unit.hoaFeesLandlord || 0) + (unit.hoaFeesReserve || 0);
      const hoaPerSqm = (unit.livingArea && totalHoaFees) ? totalHoaFees / unit.livingArea : 0;
      const hoaScore =
        hoaPerSqm === 0 ? 5 :
        hoaPerSqm <= 2 ? 10 :
        hoaPerSqm <= 4 ? 7 :
        hoaPerSqm <= 6 ? 4 : 0;

      // Location Score (building-level)
      const locationScore =
        buildingData.city === 'Munich' ? 8.5 :
        buildingData.city === 'Berlin' ? 7.5 :
        buildingData.city === 'Hamburg' ? 7.5 :
        buildingData.city === 'Frankfurt' ? 7 :
        buildingData.city === 'Stuttgart' ? 7 :
        buildingData.city === 'Cologne' ? 6.5 : 6;

      return {
        unitNumber: unit.unitNumber,
        energy: energyScore,
        yield: yieldScore,
        hoa: hoaScore,
        location: locationScore,
        grossYield,
        livingArea: unit.livingArea || 0,
        investment: totalInvestment
      };
    });

    // Calculate weighted averages based on investment size
    const totalInvestment = unitScores.reduce((sum, unit) => sum + unit.investment, 0);
    const totalArea = unitScores.reduce((sum, unit) => sum + unit.livingArea, 0);

    const weightedScores = {
      energy: 0,
      yield: 0,
      hoa: 0,
      location: 0
    };

    if (totalInvestment > 0) {
      unitScores.forEach(unit => {
        const weight = unit.investment / totalInvestment;
        weightedScores.energy += unit.energy * weight;
        weightedScores.yield += unit.yield * weight;
        weightedScores.hoa += unit.hoa * weight;
        weightedScores.location += unit.location * weight;
      });
    }

    // Calculate worst-case scenario (any red = overall red)
    const worstScores = {
      energy: Math.min(...unitScores.map(u => u.energy)),
      yield: Math.min(...unitScores.map(u => u.yield)),
      hoa: Math.min(...unitScores.map(u => u.hoa)),
      location: Math.min(...unitScores.map(u => u.location))
    };

    // Convert to traffic light status
    const getStatus = (score: number): TrafficLightStatus => {
      return score >= 7 ? 'green' : score >= 4 ? 'yellow' : 'red';
    };

    // Calculate aggregate yield
    const totalMonthlyRent = units.reduce((sum, unit) => {
      const rent = unit.vacancyStatus === 'rented' ? unit.currentRent : unit.plannedRent;
      return sum + (rent || 0);
    }, 0);

    const totalBuildingInvestment = totalInvestment + (buildingData.buildingRenovationBudget || 0);
    const aggregateYield = totalBuildingInvestment > 0
      ? (totalMonthlyRent * 12 / totalBuildingInvestment * 100)
      : 0;

    return {
      weighted: {
        energy: { score: weightedScores.energy, status: getStatus(weightedScores.energy) },
        yield: { score: weightedScores.yield, status: getStatus(weightedScores.yield) },
        hoa: { score: weightedScores.hoa, status: getStatus(weightedScores.hoa) },
        location: { score: weightedScores.location, status: getStatus(weightedScores.location) }
      },
      worst: {
        energy: { score: worstScores.energy, status: getStatus(worstScores.energy) },
        yield: { score: worstScores.yield, status: getStatus(worstScores.yield) },
        hoa: { score: worstScores.hoa, status: getStatus(worstScores.hoa) },
        location: { score: worstScores.location, status: getStatus(worstScores.location) }
      },
      aggregateYield,
      totalArea,
      unitScores
    };
  }, [units, buildingData]);

  const getStatusIcon = (status: TrafficLightStatus) => {
    switch (status) {
      case 'green': return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'yellow': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'red': return <XCircle className="h-4 w-4 text-red-600" />;
    }
  };

  const getStatusColor = (status: TrafficLightStatus) => {
    switch (status) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  // Count issues based on worst-case
  const redCount = Object.values(aggregateScores.worst).filter(s => s.status === 'red').length;
  const yellowCount = Object.values(aggregateScores.worst).filter(s => s.status === 'yellow').length;


  const overallStatus = redCount > 0 ? 'critical' : yellowCount > 1 ? 'attention' : 'good';

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Building Assessment
            </CardTitle>
            <CardDescription>
              Aggregate analysis of {units.length} unit{units.length > 1 ? 's' : ''}
            </CardDescription>
          </div>
          <Badge
            variant={
              overallStatus === 'good' ? 'default' :
              overallStatus === 'attention' ? 'secondary' : 'destructive'
            }
          >
            {overallStatus === 'good' ? 'Good' :
             overallStatus === 'attention' ? 'Review' : 'Critical'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Yield */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              <span className="font-medium">Aggregate Yield</span>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {aggregateScores.aggregateYield.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Weighted Average Scores */}
        <div>
          <p className="text-sm font-medium mb-2">Weighted Average (by investment)</p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(aggregateScores.weighted).map(([key, score]) => (
              <div
                key={key}
                className={cn(
                  'p-2 rounded-lg border text-xs',
                  getStatusColor(score.status)
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{key}</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(score.status)}
                    <span className="font-bold">{score.score.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Worst Case Analysis */}
        <div>
          <p className="text-sm font-medium mb-2 flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            Worst Unit Scores
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(aggregateScores.worst).map(([key, score]) => (
              <div
                key={key}
                className={cn(
                  'p-2 rounded-lg border text-xs',
                  getStatusColor(score.status)
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium capitalize">{key}</span>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(score.status)}
                    <span className="font-bold">{score.score.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Per-Unit Yields */}
        <div className="pt-3 border-t">
          <p className="text-sm font-medium mb-2">Unit Yields</p>
          <div className="space-y-1">
            {aggregateScores.unitScores.map((unit, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{unit.unitNumber || `Unit ${index + 1}`}:</span>
                <div className="flex items-center gap-2">
                  <Progress
                    value={unit.grossYield * 10}
                    className="w-20 h-2"
                  />
                  <span className={cn(
                    'font-medium min-w-[40px] text-right',
                    unit.grossYield >= 5 ? 'text-green-600' :
                    unit.grossYield >= 3.5 ? 'text-yellow-600' : 'text-red-600'
                  )}>
                    {unit.grossYield.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Warnings */}
        {redCount > 0 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              {redCount} critical issue{redCount > 1 ? 's' : ''} found. Review unit details for improvements.
            </AlertDescription>
          </Alert>
        )}

        {/* Special Conditions */}
        {(buildingData.historicPreservation || buildingData.propertyDivision) && (
          <div className="pt-3 border-t">
            <p className="text-xs font-medium mb-2">Special Conditions</p>
            <div className="space-y-1">
              {buildingData.historicPreservation && (
                <Badge variant="outline" className="text-xs">
                  Historic Preservation
                </Badge>
              )}
              {buildingData.propertyDivision && (
                <Badge variant="outline" className="text-xs">
                  Property Division Planned
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}