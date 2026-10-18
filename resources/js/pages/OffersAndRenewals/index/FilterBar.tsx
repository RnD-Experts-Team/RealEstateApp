import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeaseFilter, OfferFilters } from '@/types/OfferRenewal';
import { Search, X, ChevronDown } from 'lucide-react';

interface FilterBarProps {
  cities: string[];
  properties: string[];
  units: string[];
  tenants: string[];
  tempFilters: OfferFilters;
  onTempFiltersChange: (filters: OfferFilters) => void;
  onSearch: () => void;
  onClear: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  cities,
  properties,
  units,
  tenants,
  tempFilters,
  onTempFiltersChange,
  onSearch,
  onClear,
}) => {
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showPropertyDropdown, setShowPropertyDropdown] = useState(false);
  const [showUnitDropdown, setShowUnitDropdown] = useState(false);
  const [showTenantDropdown, setShowTenantDropdown] = useState(false);

  const cityDropdownRef = useRef<HTMLDivElement>(null);
  const propertyDropdownRef = useRef<HTMLDivElement>(null);
  const unitDropdownRef = useRef<HTMLDivElement>(null);
  const tenantDropdownRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const propertyInputRef = useRef<HTMLInputElement>(null);
  const unitInputRef = useRef<HTMLInputElement>(null);
  const tenantInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        cityDropdownRef.current &&
        !cityDropdownRef.current.contains(event.target as Node) &&
        cityInputRef.current &&
        !cityInputRef.current.contains(event.target as Node)
      ) {
        setShowCityDropdown(false);
      }
      if (
        propertyDropdownRef.current &&
        !propertyDropdownRef.current.contains(event.target as Node) &&
        propertyInputRef.current &&
        !propertyInputRef.current.contains(event.target as Node)
      ) {
        setShowPropertyDropdown(false);
      }
      if (
        unitDropdownRef.current &&
        !unitDropdownRef.current.contains(event.target as Node) &&
        unitInputRef.current &&
        !unitInputRef.current.contains(event.target as Node)
      ) {
        setShowUnitDropdown(false);
      }
      if (
        tenantDropdownRef.current &&
        !tenantDropdownRef.current.contains(event.target as Node) &&
        tenantInputRef.current &&
        !tenantInputRef.current.contains(event.target as Node)
      ) {
        setShowTenantDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCitySelect = (city: string) => {
    onTempFiltersChange({ 
      ...tempFilters, 
      city,
    });
    setShowCityDropdown(false);
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onTempFiltersChange({ 
      ...tempFilters, 
      city: value,
    });
    setShowCityDropdown(value.length > 0);
  };

  const handlePropertyInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onTempFiltersChange({ 
      ...tempFilters, 
      property: value,
    });
    setShowPropertyDropdown(value.length > 0);
  };

  const handlePropertySelect = (property: string) => {
    onTempFiltersChange({ 
      ...tempFilters, 
      property,
    });
    setShowPropertyDropdown(false);
  };

  const handleUnitInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onTempFiltersChange({ 
      ...tempFilters, 
      unit: value,
    });
    setShowUnitDropdown(value.length > 0);
  };

  const handleUnitSelect = (unit: string) => {
    onTempFiltersChange({ 
      ...tempFilters, 
      unit,
    });
    setShowUnitDropdown(false);
  };

  const handleTenantInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    onTempFiltersChange({ 
      ...tempFilters, 
      tenant: value,
    });
    setShowTenantDropdown(value.length > 0);
  };

  const handleTenantSelect = (tenant: string) => {
    onTempFiltersChange({ 
      ...tempFilters, 
      tenant,
    });
    setShowTenantDropdown(false);
  };

  const filteredCities = cities.filter((city) => 
    city?.toLowerCase().includes(tempFilters.city.toLowerCase())
  );

  const filteredProperties = properties.filter((property) => 
    property?.toLowerCase().includes(tempFilters.property.toLowerCase())
  );

  const filteredUnits = units.filter(unit =>
    unit?.toLowerCase().includes(tempFilters.unit.toLowerCase())
  );

  const filteredTenants = tenants.filter(tenant =>
    tenant?.toLowerCase().includes(tempFilters.tenant.toLowerCase())
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-4 lg:grid-cols-7">
      {/* City Filter with Autocomplete */}
      <div className="relative">
        <Input
          ref={cityInputRef}
          type="text"
          placeholder="City"
          value={tempFilters.city}
          onChange={handleCityInputChange}
          onFocus={() => setShowCityDropdown(true)}
          className="text-input-foreground bg-input pr-8"
        />
        <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        {showCityDropdown && filteredCities.length > 0 && (
          <div
            ref={cityDropdownRef}
            className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
          >
            {filteredCities.map((city, idx) => (
              <div
                key={idx}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleCitySelect(city)}
              >
                {city}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Property Filter with Autocomplete */}
      <div className="relative">
        <Input
          ref={propertyInputRef}
          type="text"
          placeholder="Property"
          value={tempFilters.property}
          onChange={handlePropertyInputChange}
          onFocus={() => setShowPropertyDropdown(true)}
          className="text-input-foreground bg-input pr-8"
        />
        <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        {showPropertyDropdown && filteredProperties.length > 0 && (
          <div
            ref={propertyDropdownRef}
            className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
          >
            {filteredProperties.map((property, idx) => (
              <div
                key={idx}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => handlePropertySelect(property)}
              >
                {property}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Unit Filter with Autocomplete */}
      <div className="relative">
        <Input
          ref={unitInputRef}
          type="text"
          placeholder="Unit"
          value={tempFilters.unit}
          onChange={handleUnitInputChange}
          onFocus={() => setShowUnitDropdown(true)}
          className="text-input-foreground bg-input pr-8"
        />
        <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        {showUnitDropdown && filteredUnits.length > 0 && (
          <div
            ref={unitDropdownRef}
            className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
          >
            {filteredUnits.map((unit, idx) => (
              <div
                key={idx}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleUnitSelect(unit)}
              >
                {unit}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tenant Filter with Autocomplete */}
      <div className="relative">
        <Input
          ref={tenantInputRef}
          type="text"
          placeholder="Tenant"
          value={tempFilters.tenant}
          onChange={handleTenantInputChange}
          onFocus={() => setShowTenantDropdown(true)}
          className="text-input-foreground bg-input pr-8"
        />
        <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

        {showTenantDropdown && filteredTenants.length > 0 && (
          <div
            ref={tenantDropdownRef}
            className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
          >
            {filteredTenants.map((tenant, idx) => (
              <div
                key={idx}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                onClick={() => handleTenantSelect(tenant)}
              >
                {tenant}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lease signed filter (Radix Select can't use '' as a value, so 'all' stands in for no filter) */}
      <Select
        value={tempFilters.lease || 'all'}
        onValueChange={(value) =>
          onTempFiltersChange({ ...tempFilters, lease: value === 'all' ? '' : (value as LeaseFilter) })
        }
      >
        <SelectTrigger className="bg-input text-input-foreground">
          <SelectValue placeholder="Lease" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Lease: All</SelectItem>
          <SelectItem value="signed">Lease: Signed</SelectItem>
          <SelectItem value="unsigned">Lease: Not signed</SelectItem>
        </SelectContent>
      </Select>

      {/* Visible / Hidden toggle */}
      <div className="flex h-10 w-full items-center rounded-md border border-input bg-input p-1">
        <Button
          type="button"
          variant={tempFilters.is_hidden ? 'outline' : 'default'}
          size="sm"
          className="h-8 flex-1"
          onClick={() => onTempFiltersChange({ ...tempFilters, is_hidden: false })}
        >
          Visible
        </Button>
        <Button
          type="button"
          variant={tempFilters.is_hidden ? 'default' : 'outline'}
          size="sm"
          className="h-8 flex-1"
          onClick={() => onTempFiltersChange({ ...tempFilters, is_hidden: true })}
        >
          Hidden
        </Button>
      </div>

      {/* Search and Clear Buttons */}
      <div className="flex gap-2">
        <Button onClick={onSearch} variant="default" className="flex items-center">
          <Search className="mr-2 h-4 w-4" />
          Search
        </Button>
        <Button onClick={onClear} variant="outline" className="flex items-center">
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      </div>
    </div>
  );
};
