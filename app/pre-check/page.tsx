'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  Home,
  ArrowRight,
  Info,
  FileText
} from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarTrigger,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { SingleApartmentForm } from '@/components/pre-check/single-apartment-form';
import { MultiFamilyHouseForm } from '@/components/pre-check/multi-family-house-form';

type PropertyType = 'single' | 'mfh' | null;

export default function PreCheckPage() {
  const [propertyType, setPropertyType] = useState<PropertyType>(null);
  const [showForm, setShowForm] = useState(false);

  const handlePropertyTypeSelect = () => {
    if (propertyType) {
      setShowForm(true);
    }
  };

  const handleBack = () => {
    setShowForm(false);
    setPropertyType(null);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex items-center gap-2 px-4 flex-1">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Pre-Check</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {!showForm ? (
            // Property Type Selection
            <div className="max-w-3xl mx-auto w-full">
              <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Property Pre-Check</h1>
                <p className="text-muted-foreground mt-2">
                  Quick assessment tool for property evaluation with instant traffic light analysis
                </p>
              </div>

              <Alert className="mb-6">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  The pre-check form focuses on essential information needed for initial property assessment.
                  Additional details can be added later through the full property forms.
                </AlertDescription>
              </Alert>

              <Card>
                <CardHeader>
                  <CardTitle>Select Property Type</CardTitle>
                  <CardDescription>
                    Choose whether you're evaluating a single apartment or a multi-family house
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <RadioGroup value={propertyType || ''} onValueChange={(value) => setPropertyType(value as PropertyType)}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <label
                        htmlFor="single"
                        className={`
                          relative flex cursor-pointer rounded-lg border p-6
                          ${propertyType === 'single' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}
                        `}
                      >
                        <RadioGroupItem value="single" id="single" className="sr-only" />
                        <div className="flex items-start space-x-4">
                          <Home className={`h-8 w-8 ${propertyType === 'single' ? 'text-primary' : 'text-gray-400'}`} />
                          <div className="flex-1">
                            <h3 className="font-semibold">Single Apartment</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Individual apartment unit (Eigentumswohnung)
                            </p>
                            <ul className="text-xs text-muted-foreground mt-3 space-y-1">
                              <li>• One unit evaluation</li>
                              <li>• Single purchase price</li>
                              <li>• Individual traffic lights</li>
                            </ul>
                          </div>
                        </div>
                      </label>

                      <label
                        htmlFor="mfh"
                        className={`
                          relative flex cursor-pointer rounded-lg border p-6
                          ${propertyType === 'mfh' ? 'border-primary bg-primary/5' : 'border-gray-200 hover:bg-gray-50'}
                        `}
                      >
                        <RadioGroupItem value="mfh" id="mfh" className="sr-only" />
                        <div className="flex items-start space-x-4">
                          <Building2 className={`h-8 w-8 ${propertyType === 'mfh' ? 'text-primary' : 'text-gray-400'}`} />
                          <div className="flex-1">
                            <h3 className="font-semibold">Multi-Family House</h3>
                            <p className="text-sm text-muted-foreground mt-1">
                              Multiple units in one building (Mehrfamilienhaus)
                            </p>
                            <ul className="text-xs text-muted-foreground mt-3 space-y-1">
                              <li>• Multiple unit evaluation</li>
                              <li>• Per-unit pricing</li>
                              <li>• Aggregate analysis</li>
                            </ul>
                          </div>
                        </div>
                      </label>
                    </div>
                  </RadioGroup>

                  <Separator />

                  <div className="flex justify-end">
                    <Button
                      onClick={handlePropertyTypeSelect}
                      disabled={!propertyType}
                      size="lg"
                    >
                      Continue
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                <h3 className="font-semibold flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5" />
                  Required Information for Pre-Check
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Object Data:</p>
                    <ul className="space-y-1">
                      <li>• Address & construction year</li>
                      <li>• Living area & room count</li>
                      <li>• Vacancy status</li>
                      <li>• HOA fees (if applicable)</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Financial Data:</p>
                    <ul className="space-y-1">
                      <li>• Purchase price</li>
                      <li>• Renovation budget</li>
                      <li>• Rental income (current/planned)</li>
                      <li>• Energy certificate class</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Property Form Based on Type
            <div className="max-w-7xl mx-auto w-full">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold tracking-tight">
                    {propertyType === 'single' ? 'Single Apartment' : 'Multi-Family House'} Pre-Check
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Complete the form below for instant traffic light assessment
                  </p>
                </div>
                <Button variant="outline" onClick={handleBack}>
                  Change Property Type
                </Button>
              </div>

              {propertyType === 'single' ? (
                <SingleApartmentForm />
              ) : (
                <MultiFamilyHouseForm />
              )}
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}