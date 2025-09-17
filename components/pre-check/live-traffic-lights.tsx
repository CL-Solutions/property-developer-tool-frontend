'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
  Home,
  Zap,
  MapPin,
  Euro,
  Calculator
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrafficLightStatus } from '@/lib/types';

interface LiveTrafficLightsProps {
  livingArea: number | null;
  purchasePrice: number | null;
  renovationBudget: number | null;
  furnishingBudget: number | null;
  monthlyRent: number | null;
  hoaFeesLandlord: number | null;
  hoaFeesReserve: number | null;
  energyClass: string;
  constructionYear: number | null;
  city: string;
  unitId?: string; // For MFH, to distinguish between units
  compact?: boolean; // For mini view in MFH
}

export function LiveTrafficLights({
  livingArea,
  purchasePrice,
  renovationBudget,
  furnishingBudget,
  monthlyRent,
  hoaFeesLandlord,
  hoaFeesReserve,
  energyClass,
  constructionYear,
  city = 'Munich',
  unitId,
  compact = false
}: LiveTrafficLightsProps) {
  const scores = useMemo(() => {
    // Energy Score Calculation
    const energyClassScores: Record<string, number> = {
      'A+': 10, 'A': 9, 'B': 8, 'C': 6, 'D': 4, 'E': 2, 'F': 1, 'G': 0, 'H': 0
    };
    const energyClassScore = energyClass ? (energyClassScores[energyClass] || 0) : 5;

    const age = constructionYear ? new Date().getFullYear() - constructionYear : 0;
    const ageScore = age === 0 ? 5 : age <= 5 ? 10 : age <= 15 ? 8 : age <= 30 ? 6 : age <= 50 ? 4 : 2;

    // Simplified energy score for pre-check (no detailed consumption data)
    const energyScore = energyClassScore * 0.6 + ageScore * 0.4;

    // Yield Score Calculation
    const totalInvestment = (purchasePrice || 0) + (renovationBudget || 0) + (furnishingBudget || 0);
    const grossYield = (monthlyRent && totalInvestment)
      ? ((monthlyRent * 12) / totalInvestment) * 100
      : 0;

    const grossYieldScore =
      grossYield >= 6 ? 10 :
      grossYield >= 5 ? 8 :
      grossYield >= 4 ? 6 :
      grossYield >= 3 ? 4 :
      grossYield >= 2 ? 2 : 0;

    // Price per sqm score
    const pricePerSqm = (purchasePrice && livingArea) ? purchasePrice / livingArea : 0;
    const priceScore = city === 'Munich'
      ? (pricePerSqm <= 6000 ? 10 : pricePerSqm <= 8000 ? 6 : 2)
      : (pricePerSqm <= 3500 ? 10 : pricePerSqm <= 5000 ? 6 : 2);

    // Renovation ratio score
    const renovationRatio = (purchasePrice && renovationBudget)
      ? renovationBudget / purchasePrice
      : 0;
    const renovationScore =
      renovationRatio <= 0.1 ? 10 :
      renovationRatio <= 0.2 ? 7 :
      renovationRatio <= 0.3 ? 4 : 0;

    // Weighted yield score
    const yieldScore = grossYieldScore * 0.5 + priceScore * 0.25 + renovationScore * 0.25;

    // HOA Score Calculation
    const totalHoaFees = (hoaFeesLandlord || 0) + (hoaFeesReserve || 0);
    const hoaPerSqm = (livingArea && totalHoaFees) ? totalHoaFees / livingArea : 0;

    const monthlyFeesScore =
      hoaPerSqm === 0 ? 5 :
      hoaPerSqm <= 2 ? 10 :
      hoaPerSqm <= 4 ? 7 :
      hoaPerSqm <= 6 ? 4 : 0;

    // Simplified HOA score for pre-check
    const hoaScore = monthlyFeesScore;

    // Location Score (simplified for pre-check)
    const locationScore =
      city === 'Munich' ? 8.5 :
      city === 'Berlin' ? 7.5 :
      city === 'Hamburg' ? 7.5 :
      city === 'Frankfurt' ? 7 :
      city === 'Stuttgart' ? 7 :
      city === 'Cologne' ? 6.5 : 6;

    // Convert to traffic light status
    const getStatus = (score: number): TrafficLightStatus => {
      return score >= 7 ? 'green' : score >= 4 ? 'yellow' : 'red';
    };

    return {
      energy: { score: energyScore, status: getStatus(energyScore), label: 'Energy' },
      yield: { score: yieldScore, status: getStatus(yieldScore), label: 'Yield', value: grossYield },
      hoa: { score: hoaScore, status: getStatus(hoaScore), label: 'HOA', perSqm: hoaPerSqm },
      location: { score: locationScore, status: getStatus(locationScore), label: 'Location' }
    };
  }, [livingArea, purchasePrice, renovationBudget, furnishingBudget, monthlyRent, hoaFeesLandlord, hoaFeesReserve, energyClass, constructionYear, city]);

  const getStatusIcon = (status: TrafficLightStatus, size = 'h-5 w-5') => {
    switch (status) {
      case 'green': return <CheckCircle2 className={cn(size, 'text-green-600')} />;
      case 'yellow': return <AlertTriangle className={cn(size, 'text-yellow-600')} />;
      case 'red': return <XCircle className={cn(size, 'text-red-600')} />;
    }
  };

  const getStatusColor = (status: TrafficLightStatus) => {
    switch (status) {
      case 'green': return 'bg-green-100 text-green-800 border-green-200';
      case 'yellow': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'red': return 'bg-red-100 text-red-800 border-red-200';
    }
  };

  const getCategoryIcon = (category: string, size = 'h-4 w-4') => {
    switch (category) {
      case 'Energy': return <Zap className={size} />;
      case 'Yield': return <TrendingUp className={size} />;
      case 'HOA': return <Home className={size} />;
      case 'Location': return <MapPin className={size} />;
      default: return null;
    }
  };

  // Count issues
  const redCount = Object.values(scores).filter(s => s.status === 'red').length;
  const yellowCount = Object.values(scores).filter(s => s.status === 'yellow').length;
  const greenCount = Object.values(scores).filter(s => s.status === 'green').length;

  // Overall assessment
  const overallStatus = redCount > 0 ? 'critical' : yellowCount > 1 ? 'attention' : 'good';
  const averageScore = Object.values(scores).reduce((sum, s) => sum + s.score, 0) / 4;

  // Compact view for MFH units
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {Object.entries(scores).map(([key, score]) => (
          <div
            key={key}
            className={cn(
              'px-2 py-1 rounded-md border flex items-center gap-1',
              getStatusColor(score.status)
            )}
            title={`${score.label}: ${score.score.toFixed(1)}/10`}
          >
            {getCategoryIcon(score.label, 'h-3 w-3')}
            <span className="text-xs font-medium">{score.score.toFixed(0)}</span>
          </div>
        ))}
        {scores.yield.value !== undefined && (
          <Badge variant="outline" className="ml-1">
            {scores.yield.value.toFixed(1)}%
          </Badge>
        )}
      </div>
    );
  }

  // Full view
  return (
    <Card className={unitId ? '' : 'shadow-lg'}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5" />
              Live Assessment
              {unitId && <Badge variant="outline">Unit {unitId}</Badge>}
            </CardTitle>
            <CardDescription>
              Real-time traffic light calculation
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
        {/* Average Score */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Score</span>
            <span className="text-xl font-bold">{averageScore.toFixed(1)}/10</span>
          </div>
          <Progress value={averageScore * 10} className="h-2" />
        </div>

        {/* Individual Traffic Lights */}
        <div className="grid grid-cols-2 gap-3">
          {Object.entries(scores).map(([key, score]) => (
            <div
              key={key}
              className={cn(
                'p-3 rounded-lg border',
                getStatusColor(score.status)
              )}
            >
              <div className="flex items-center justify-between mb-1">
                {getCategoryIcon(score.label)}
                <span className="text-sm font-medium">{score.label}</span>
              </div>
              <div className="flex items-center justify-between">
                {getStatusIcon(score.status, 'h-4 w-4')}
                <span className="text-lg font-bold">
                  {score.score.toFixed(1)}
                </span>
              </div>
              <div className="text-xs mt-1">
                {key === 'yield' && 'value' in score && score.value !== undefined && (
                  <span>Yield: {score.value.toFixed(2)}%</span>
                )}
                {key === 'hoa' && 'perSqm' in score && score.perSqm !== undefined && score.perSqm > 0 && (
                  <span>€{score.perSqm.toFixed(2)}/m²</span>
                )}
                {key === 'energy' && energyClass && (
                  <span>Class {energyClass}</span>
                )}
                {key === 'location' && (
                  <span>{city}</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Financial Metrics */}
        {purchasePrice && monthlyRent && (
          <div className="pt-4 border-t space-y-2">
            <h4 className="text-sm font-medium flex items-center gap-2">
              <Euro className="h-4 w-4" />
              Key Metrics
            </h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-muted-foreground">Investment:</span>
                <p className="font-medium">
                  €{((purchasePrice || 0) + (renovationBudget || 0) + (furnishingBudget || 0)).toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-muted-foreground">Monthly:</span>
                <p className="font-medium">€{monthlyRent.toLocaleString()}</p>
              </div>
              {livingArea && (
                <div>
                  <span className="text-muted-foreground">Price/m²:</span>
                  <p className="font-medium">
                    €{Math.round(purchasePrice / livingArea).toLocaleString()}
                  </p>
                </div>
              )}
              {scores.yield.value !== undefined && (
                <div>
                  <span className="text-muted-foreground">Gross Yield:</span>
                  <p className="font-medium">{scores.yield.value.toFixed(2)}%</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Status Summary */}
        <div className="flex items-center justify-around p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">{greenCount}</div>
            <div className="text-xs text-gray-600">Good</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-600">{yellowCount}</div>
            <div className="text-xs text-gray-600">Attention</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-red-600">{redCount}</div>
            <div className="text-xs text-gray-600">Critical</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}