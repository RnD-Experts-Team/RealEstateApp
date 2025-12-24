// resources/js/Pages/PaymentPlans/Index.tsx
import AppLayout from '@/layouts/app-layout';
import { PaymentPlan, PaymentPlanIndexProps } from '@/types/PaymentPlan';
import { PropertyInfoWithoutInsurance } from '@/types/PropertyInfoWithoutInsurance';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import PaymentPlanCreateDrawer from './PaymentPlanCreateDrawer';
import PaymentPlanEditDrawer from './PaymentPlanEditDrawer';
import FiltersCard from './index/FiltersCard';
import PageHeader from './index/PageHeader';
import PaymentPlansTable from './index/PaymentPlansTable';

interface TenantData {
    id: number;
    full_name: string;
    tenant_id: number;
}

interface Filters {
    city?: string | null;
    property?: string | null;
    unit?: string | null;
    tenant?: string | null;
    is_hidden?: boolean | null;
}

interface Props extends PaymentPlanIndexProps {
    search?: string | null;
    filters?: Filters;
    perPage?: number | string;
    cities: Array<{ id: number; city: string }>;
    properties: PropertyInfoWithoutInsurance[];
    propertiesByCityId: Record<number, PropertyInfoWithoutInsurance[]>;
    unitsByPropertyId: Record<number, Array<{ id: number; unit_name: string }>>;
    tenantsByUnitId: Record<number, Array<{ id: number; full_name: string; tenant_id: number }>>;
    allUnits: Array<{ id: number; unit_name: string; city_name: string; property_name: string }>;
    tenantsData: TenantData[];
}

export default function Index({
    paymentPlans,
    cities,
    properties,
    propertiesByCityId,
    unitsByPropertyId,
    tenantsByUnitId,
    allUnits,
    tenantsData,
    filters,
    perPage,
    search,
}: Props) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [editDrawerOpen, setEditDrawerOpen] = useState(false);
    const [selectedPaymentPlan, setSelectedPaymentPlan] = useState<PaymentPlan | null>(null);

    const handleEdit = (paymentPlan: PaymentPlan) => {
        setSelectedPaymentPlan(paymentPlan);
        setEditDrawerOpen(true);
    };

    const handleDelete = (paymentPlan: PaymentPlan) => {
        if (!confirm('Are you sure you want to delete this payment plan?')) return;

        router.delete(`/payment-plans/${paymentPlan.id}`, {
            preserveState: true,
            preserveScroll: true,
            data: {
                search: search ?? null,
                city: filters?.city ?? null,
                property: filters?.property ?? null,
                unit: filters?.unit ?? null,
                tenant: filters?.tenant ?? null,
                is_hidden: filters?.is_hidden ? 'true' : null, // ✅ NEW
                per_page: perPage ?? (paymentPlans?.per_page ?? 15),
                page: paymentPlans?.current_page ?? undefined,
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Payment Plans" />

            <div className="min-h-screen bg-background py-12 text-foreground transition-colors">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    <PageHeader paymentPlans={paymentPlans} onAddClick={() => setDrawerOpen(true)} />

                    <FiltersCard
                        cities={cities}
                        properties={properties}
                        allUnits={allUnits}
                        tenantsData={tenantsData}
                        initialFilters={filters}
                        perPage={perPage ?? (paymentPlans?.per_page ?? 15)}
                    />

                    <PaymentPlansTable
                        paymentPlans={paymentPlans}
                        filters={filters}
                        perPage={perPage ?? (paymentPlans?.per_page ?? 15)}
                        search={search}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            <PaymentPlanCreateDrawer
                cities={cities}
                properties={properties}
                propertiesByCityId={propertiesByCityId}
                unitsByPropertyId={unitsByPropertyId}
                tenantsByUnitId={tenantsByUnitId}
                tenantsData={tenantsData}
                open={drawerOpen}
                onOpenChange={setDrawerOpen}
                // Pass current context to preserve state after store/redirect
                search={search}
                filters={filters}
                perPage={perPage ?? (paymentPlans?.per_page ?? 15)}
                currentPage={paymentPlans?.current_page}
                onSuccess={() => {
                    // rely on redirect + preserve state/scroll
                }}
            />

            {selectedPaymentPlan && (
                <PaymentPlanEditDrawer
                    key={selectedPaymentPlan.id}
                    paymentPlan={selectedPaymentPlan}
                    cities={cities}
                    properties={properties}
                    propertiesByCityId={propertiesByCityId}
                    unitsByPropertyId={unitsByPropertyId}
                    tenantsByUnitId={tenantsByUnitId}
                    allUnits={allUnits}
                    tenantsData={tenantsData}
                    open={editDrawerOpen}
                    onOpenChange={setEditDrawerOpen}
                    // Pass current context to preserve state after update/redirect
                    search={search}
                    filters={filters}
                    perPage={perPage ?? (paymentPlans?.per_page ?? 15)}
                    currentPage={paymentPlans?.current_page}
                    onSuccess={() => {
                        setSelectedPaymentPlan(null);
                    }}
                />
            )}
        </AppLayout>
    );
}
