// resources/js/Pages/PaymentPlans/index/FiltersCard.tsx
import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import FilterInput from './FilterInput';

interface TenantData {
    id: number;
    full_name: string;
    tenant_id: number;
}

interface FiltersCardProps {
    cities: Array<{ id: number; city: string }>;
    properties: Array<{ id: number; property_name: string }>;
    allUnits: Array<{ id: number; unit_name: string }>;
    tenantsData: TenantData[];
    initialFilters?: {
        city?: string | null;
        property?: string | null;
        unit?: string | null;
        tenant?: string | null;
        is_hidden?: boolean | null;
    };
    perPage: number | string;
}

export default function FiltersCard({ cities, properties, allUnits, tenantsData, initialFilters, perPage }: FiltersCardProps) {
    const [tempFilters, setTempFilters] = useState({
        city: initialFilters?.city ?? '',
        property: initialFilters?.property ?? '',
        unit: initialFilters?.unit ?? '',
        tenant: initialFilters?.tenant ?? '',
        is_hidden: Boolean(initialFilters?.is_hidden) || false,
    });

    const handleTempFilterChange = (key: keyof typeof tempFilters, value: any) => {
        setTempFilters((prev) => ({ ...prev, [key]: value }));
    };

    const handleSearchClick = () => {
        router.get(
            route('payment-plans.index'),
            {
                city: tempFilters.city || undefined,
                property: tempFilters.property || undefined,
                unit: tempFilters.unit || undefined,
                tenant: tempFilters.tenant || undefined,
                is_hidden: tempFilters.is_hidden ? 'true' : undefined, // ✅ only send when true
                per_page: perPage,
                page: 1,
            },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleClearFilters = () => {
        setTempFilters({
            city: '',
            property: '',
            unit: '',
            tenant: '',
            is_hidden: false,
        });

        router.get(route('payment-plans.index'), { per_page: 15, page: 1 }, { preserveState: false });
    };

    const filteredCities = cities.filter((c) => c.city.toLowerCase().includes(tempFilters.city.toLowerCase()));
    const filteredProperties = properties.filter((p) =>
        p.property_name.toLowerCase().includes(tempFilters.property.toLowerCase()),
    );
    const filteredUnits = allUnits.filter((u) => u.unit_name.toLowerCase().includes(tempFilters.unit.toLowerCase()));
    const filteredTenants = tenantsData.filter((t) =>
        t.full_name.toLowerCase().includes(tempFilters.tenant.toLowerCase()),
    );

    return (
        <Card className="bg-card text-card-foreground shadow-lg">
            <CardHeader className="space-y-4">
                {/* Row 1: Inputs + toggle (consistent height & alignment) */}
                <div className="grid grid-cols-1 gap-3 md:grid-cols-6">
                    <div className="md:col-span-1">
                        <FilterInput
                            placeholder="City"
                            value={tempFilters.city}
                            onChange={(value) => handleTempFilterChange('city', value)}
                            options={filteredCities.map((c) => ({ id: c.id, name: c.city }))}
                            onSelect={(item) => handleTempFilterChange('city', item.name)}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <FilterInput
                            placeholder="Property"
                            value={tempFilters.property}
                            onChange={(value) => handleTempFilterChange('property', value)}
                            options={filteredProperties.map((p) => ({ id: p.id, name: p.property_name }))}
                            onSelect={(item) => handleTempFilterChange('property', item.name)}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <FilterInput
                            placeholder="Unit"
                            value={tempFilters.unit}
                            onChange={(value) => handleTempFilterChange('unit', value)}
                            options={filteredUnits.map((u) => ({ id: u.id, name: u.unit_name }))}
                            onSelect={(item) => handleTempFilterChange('unit', item.name)}
                        />
                    </div>

                    <div className="md:col-span-1">
                        <FilterInput
                            placeholder="Tenant"
                            value={tempFilters.tenant}
                            onChange={(value) => handleTempFilterChange('tenant', value)}
                            options={filteredTenants.map((t) => ({ id: t.id, name: t.full_name }))}
                            onSelect={(item) => handleTempFilterChange('tenant', item.name)}
                        />
                    </div>

                    {/* Visible / Hidden toggle */}
                    <div className="md:col-span-2 flex items-center">
                        <div className="w-full flex items-center rounded-md border border-input bg-input p-1 h-10">
                            <Button
                                type="button"
                                variant={tempFilters.is_hidden ? 'outline' : 'default'}
                                size="sm"
                                className="flex-1 h-8"
                                onClick={() => handleTempFilterChange('is_hidden', false)}
                            >
                                Visible
                            </Button>
                            <Button
                                type="button"
                                variant={tempFilters.is_hidden ? 'default' : 'outline'}
                                size="sm"
                                className="flex-1 h-8"
                                onClick={() => handleTempFilterChange('is_hidden', true)}
                            >
                                Hidden
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Row 2: Actions (right aligned on desktop, full width on mobile) */}
                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <Button onClick={handleSearchClick} variant="default" className="w-full sm:w-auto">
                        <Search className="mr-2 h-4 w-4" />
                        Search
                    </Button>

                    <Button onClick={handleClearFilters} variant="outline" className="w-full sm:w-auto">
                        <X className="mr-2 h-4 w-4" />
                        Clear
                    </Button>
                </div>
            </CardHeader>

            {/* Keep CardContent for spacing consistency with the rest of your pages */}
            <CardContent className="pt-0" />
        </Card>
    );
}
