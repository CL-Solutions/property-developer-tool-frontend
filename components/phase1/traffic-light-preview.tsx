"use client";

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Home,
  Zap,
  MapPin,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TrafficLightStatus } from '@/lib/types';

interface TrafficLightPreviewProps {
  // Property data for calculation
  livingArea?: number;
  purchasePrice?: number;
  renovationBudget?: number;
  monthlyRent?: number;
  operationCosts?: {
    landlord?: number;
    tenant?: number;
    reserve?: number;
  };
  energyClass?: string;
  constructionYear?: number;
  city?: string;
  // Display options
  showDetails?: boolean;
  showWarnings?: boolean;
  className?: string;
}

export function TrafficLightPreview({
  livingArea = 0,
  purchasePrice = 0,
  renovationBudget = 0,
  monthlyRent = 0,
  operationCosts = {},
  energyClass,
  constructionYear,
  city = 'Munich',
  showDetails = true,
  showWarnings = true,
  className
}: TrafficLightPreviewProps) {
  // Calculate traffic light scores
  const scores = useMemo(() => {
    // Energy Score
    const energyClassScores: Record<string, number> = {
      'A+': 10, 'A': 9, 'B': 8, 'C': 6, 'D': 4, 'E': 2, 'F': 1, 'G': 0, 'H': 0
    };
    const energyClassScore = energyClass ? (energyClassScores[energyClass] || 0) : 5;

    const age = constructionYear ? new Date().getFullYear() - constructionYear : 0;
    const ageScore = age === 0 ? 5 : age <= 5 ? 10 : age <= 15 ? 8 : age <= 30 ? 6 : age <= 50 ? 4 : 2;

    // Simplified energy score (without consumption data in preview)
    const energyScore = energyClassScore * 0.5 + ageScore * 0.5;

    // Yield Score
    const totalInvestment = purchasePrice + renovationBudget;
    const grossYield = (monthlyRent && totalInvestment) ?
      (monthlyRent * 12 / totalInvestment) * 100 : 0;

    const grossYieldScore = grossYield >= 6 ? 10 :
                           grossYield >= 5 ? 8 :
                           grossYield >= 4 ? 6 :
                           grossYield >= 3 ? 4 :
                           grossYield >= 2 ? 2 : 0;

    // Price per sqm score
    const pricePerSqm = (purchasePrice && livingArea) ? purchasePrice / livingArea : 0;
    const priceScore = city === 'Munich' ?
      (pricePerSqm <= 6000 ? 10 : pricePerSqm <= 8000 ? 6 : 2) :
      (pricePerSqm <= 3500 ? 10 : pricePerSqm <= 5000 ? 6 : 2);

    // Renovation ratio score
    const renovationRatio = (purchasePrice && renovationBudget) ?
      renovationBudget / purchasePrice : 0;
    const renovationScore = renovationRatio <= 0.1 ? 10 :
                           renovationRatio <= 0.2 ? 7 :
                           renovationRatio <= 0.3 ? 4 : 0;

    // Weighted yield score
    const yieldScore = grossYieldScore * 0.5 + priceScore * 0.25 + renovationScore * 0.25;

    // HOA Score
    const totalOperationCosts = (operationCosts.landlord || 0) +
                               (operationCosts.reserve || 0);
    const hoaPerSqm = (livingArea && totalOperationCosts) ?
      totalOperationCosts / livingArea : 0;

    const monthlyFeesScore = hoaPerSqm === 0 ? 5 :
                            hoaPerSqm <= 2 ? 10 :
                            hoaPerSqm <= 4 ? 7 :
                            hoaPerSqm <= 6 ? 4 : 0;

    const reserveScore = (operationCosts.reserve || 0) >= 1 ? 10 :
                        (operationCosts.reserve || 0) >= 0.5 ? 6 : 2;

    // Weighted HOA score
    const hoaScore = monthlyFeesScore * 0.6 + reserveScore * 0.4;

    // Location Score (fixed for Munich)
    const locationScore = city === 'Munich' ? 8.1 : 6;

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
  }, [livingArea, purchasePrice, renovationBudget, monthlyRent, operationCosts, energyClass, constructionYear, city]);

  // Check if we have enough data for calculation
  const hasMinimalData = livingArea > 0 && purchasePrice > 0;

  // Count issues
  const redCount = Object.values(scores).filter(s => s.status === 'red').length;
  const yellowCount = Object.values(scores).filter(s => s.status === 'yellow').length;
  const greenCount = Object.values(scores).filter(s => s.status === 'green').length;

  // Overall assessment
  const overallStatus = redCount > 0 ? 'critical' : yellowCount > 1 ? 'attention' : 'good';

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

  if (!hasMinimalData) {
    return (
      <Card className={cn('', className)}>
        <CardHeader>
          <CardTitle className="text-lg">Pre-Check Assessment Preview</CardTitle>
          <CardDescription>
            Enter property details to see traffic light assessment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Complete the form above to calculate traffic light scores
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Pre-Check Assessment Preview</CardTitle>
            <CardDescription>
              Real-time evaluation based on current data
            </CardDescription>
          </div>
          <Badge
            variant={overallStatus === 'good' ? 'default' :
                    overallStatus === 'attention' ? 'secondary' : 'destructive'}
          >
            {overallStatus === 'good' ? 'Good to proceed' :
             overallStatus === 'attention' ? 'Review needed' : 'Issues found'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Traffic Light Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(scores).map(([key, score]) => (
            <div
              key={key}
              className={cn(
                "p-3 rounded-lg border",
                getStatusColor(score.status)
              )}
            >
              <div className="flex items-center justify-between mb-2">
                {getStatusIcon(score.status)}
                <span className="text-sm font-medium">{score.label}</span>
              </div>
              <div className="text-xl font-bold">
                {score.score.toFixed(1)}/10
              </div>
              {showDetails && (
                <div className="text-xs mt-1">
                  {key === 'yield' && 'value' in score && score.value !== undefined && (
                    <span>Yield: {score.value.toFixed(2)}%</span>
                  )}
                  {key === 'hoa' && 'perSqm' in score && score.perSqm !== undefined && (
                    <span>€{score.perSqm.toFixed(2)}/m²</span>
                  )}
                  {key === 'energy' && energyClass && (
                    <span>Class {energyClass}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="flex items-center justify-around p-3 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{greenCount}</div>
            <div className="text-xs text-gray-600">Optimal</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{yellowCount}</div>
            <div className="text-xs text-gray-600">Attention</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{redCount}</div>
            <div className="text-xs text-gray-600">Critical</div>
          </div>
        </div>

        {/* Warnings */}
        {showWarnings && (redCount > 0 || yellowCount > 1) && (
          <Alert variant={redCount > 0 ? "destructive" : "default"}>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>
              {redCount > 0 ? 'Critical Issues Found' : 'Review Recommended'}
            </AlertTitle>
            <AlertDescription>
              <ul className="list-disc list-inside mt-2 space-y-1">
                {scores.energy.status === 'red' && (
                  <li>Poor energy efficiency may impact marketability</li>
                )}
                {scores.yield.status === 'red' && (
                  <li>Rental yield is below minimum threshold</li>
                )}
                {scores.hoa.status === 'red' && (
                  <li>HOA fees are significantly above market average</li>
                )}
                {scores.yield.status === 'yellow' && (
                  <li>Consider optimizing rental price or purchase costs</li>
                )}
                {scores.energy.status === 'yellow' && (
                  <li>Energy efficiency could be improved with renovation</li>
                )}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Recommendation */}
        {overallStatus === 'good' && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Ready for Pre-Check</AlertTitle>
            <AlertDescription className="text-green-700">
              Property meets initial assessment criteria. Proceed with detailed evaluation.
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}