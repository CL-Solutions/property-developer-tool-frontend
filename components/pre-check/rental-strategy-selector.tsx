'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Calculator,
  Home,
  Users,
  Plus,
  Trash2,
  Info
} from 'lucide-react';

interface WgRoom {
  name: string;
  size: number;
  rent: number;
}

interface RentalStrategySelectorProps {
  strategy: 'standard' | 'wg';
  onStrategyChange: (strategy: 'standard' | 'wg') => void;
  plannedRent: number | null;
  onPlannedRentChange: (rent: number | null) => void;
  wgRooms?: WgRoom[];
  onWgRoomsChange?: (rooms: WgRoom[]) => void;
  livingArea: number | null;
  disabled?: boolean;
}

export function RentalStrategySelector({
  strategy,
  onStrategyChange,
  plannedRent,
  onPlannedRentChange,
  wgRooms = [],
  onWgRoomsChange,
  livingArea,
  disabled = false
}: RentalStrategySelectorProps) {
  const [rooms, setRooms] = useState<WgRoom[]>(
    wgRooms.length > 0 ? wgRooms : [
      { name: 'Room 1', size: 15, rent: 400 },
      { name: 'Room 2', size: 20, rent: 500 }
    ]
  );

  const handleStrategyChange = (newStrategy: 'standard' | 'wg') => {
    onStrategyChange(newStrategy);
    if (newStrategy === 'wg' && onWgRoomsChange) {
      onWgRoomsChange(rooms);
    }
  };

  const handleRoomChange = (index: number, field: keyof WgRoom, value: string | number) => {
    const updatedRooms = [...rooms];
    updatedRooms[index] = {
      ...updatedRooms[index],
      [field]: field === 'name' ? value : Number(value)
    };
    setRooms(updatedRooms);
    if (onWgRoomsChange) {
      onWgRoomsChange(updatedRooms);
    }
  };

  const addRoom = () => {
    const newRoom = { name: `Room ${rooms.length + 1}`, size: 15, rent: 400 };
    const updatedRooms = [...rooms, newRoom];
    setRooms(updatedRooms);
    if (onWgRoomsChange) {
      onWgRoomsChange(updatedRooms);
    }
  };

  const removeRoom = (index: number) => {
    const updatedRooms = rooms.filter((_, i) => i !== index);
    setRooms(updatedRooms);
    if (onWgRoomsChange) {
      onWgRoomsChange(updatedRooms);
    }
  };

  const totalWgRent = rooms.reduce((sum, room) => sum + room.rent, 0);
  const totalWgSize = rooms.reduce((sum, room) => sum + room.size, 0);

  // Calculate rent per sqm for standard rental
  const rentPerSqm = livingArea && plannedRent ? (plannedRent / livingArea).toFixed(2) : '0';

  // Calculate potential yield increase with WG
  const standardRent = plannedRent || 0;
  const yieldIncrease = standardRent > 0 ? ((totalWgRent - standardRent) / standardRent * 100).toFixed(0) : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Rental Strategy
        </CardTitle>
        <CardDescription>
          Choose between standard rental or WG (shared apartment) configuration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {disabled && (
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              Property is currently rented. Rental strategy applies to future tenancy.
            </AlertDescription>
          </Alert>
        )}

        <RadioGroup
          value={strategy}
          onValueChange={handleStrategyChange}
          disabled={disabled}
        >
          <div className="space-y-4">
            {/* Standard Rental Option */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="standard" id="standard" className="mt-1" />
                <div className="flex-1 space-y-3">
                  <Label htmlFor="standard" className="flex items-center gap-2 cursor-pointer">
                    <Home className="h-4 w-4" />
                    Standard Rental (Normalvermietung)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Rent the entire apartment to a single tenant or family
                  </p>

                  {strategy === 'standard' && !disabled && (
                    <div className="space-y-3 pt-2">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="plannedRent">Monthly Rent (€)</Label>
                          <Input
                            id="plannedRent"
                            type="number"
                            value={plannedRent || ''}
                            onChange={(e) => onPlannedRentChange(e.target.value ? parseFloat(e.target.value) : null)}
                            placeholder="1200"
                          />
                        </div>
                        {livingArea && (
                          <div className="space-y-2">
                            <Label>Rent per m²</Label>
                            <div className="h-10 px-3 py-2 bg-gray-50 rounded-md flex items-center">
                              €{rentPerSqm}/m²
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* WG Rental Option */}
            <div className="border rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <RadioGroupItem value="wg" id="wg" className="mt-1" />
                <div className="flex-1 space-y-3">
                  <Label htmlFor="wg" className="flex items-center gap-2 cursor-pointer">
                    <Users className="h-4 w-4" />
                    WG Rental (Shared Apartment)
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Rent individual rooms to multiple tenants
                  </p>

                  {strategy === 'wg' && !disabled && (
                    <div className="space-y-4 pt-2">
                      {/* WG Room Configuration */}
                      <div className="space-y-3">
                        {rooms.map((room, index) => (
                          <div key={index} className="grid grid-cols-4 gap-2 items-end">
                            <div className="space-y-1">
                              <Label className="text-xs">Room Name</Label>
                              <Input
                                value={room.name}
                                onChange={(e) => handleRoomChange(index, 'name', e.target.value)}
                                placeholder="Room 1"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Size (m²)</Label>
                              <Input
                                type="number"
                                value={room.size}
                                onChange={(e) => handleRoomChange(index, 'size', e.target.value)}
                                placeholder="15"
                              />
                            </div>
                            <div className="space-y-1">
                              <Label className="text-xs">Rent (€)</Label>
                              <Input
                                type="number"
                                value={room.rent}
                                onChange={(e) => handleRoomChange(index, 'rent', e.target.value)}
                                placeholder="400"
                              />
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeRoom(index)}
                              disabled={rooms.length <= 1}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addRoom}
                        className="w-full"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Room
                      </Button>

                      {/* WG Summary */}
                      <div className="p-3 bg-blue-50 rounded-lg space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Total WG Rent:</span>
                          <span className="font-semibold">€{totalWgRent}/month</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Total Room Size:</span>
                          <span>{totalWgSize} m²</span>
                        </div>
                        {livingArea && totalWgSize > livingArea && (
                          <Alert className="mt-2">
                            <AlertDescription className="text-xs">
                              Room sizes exceed total living area!
                            </AlertDescription>
                          </Alert>
                        )}
                        {standardRent > 0 && totalWgRent > standardRent && (
                          <div className="pt-2 border-t">
                            <div className="flex justify-between text-sm text-green-600">
                              <span>Yield Increase:</span>
                              <span className="font-semibold">+{yieldIncrease}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </RadioGroup>
      </CardContent>
    </Card>
  );
}