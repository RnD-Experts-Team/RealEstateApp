import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { format, parseISO } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';

interface CityOption {
    id: number;
    city: string;
}

interface PropertyOption {
    id: number;
    property_name: string;
    city_id: number;
}

interface UnitOption {
    id: number;
    unit_name: string;
    property_id: number;
}

interface Payment {
    id: number;
    unit_id: number;
    type: 'Checks' | 'Credit Card' | 'Zelle';
    amount: string;
    date: string;
    to_whom: string;
    description?: string | null;
    order_id?: string | null;
    is_hidden: boolean;
    unit?: {
        id: number;
        unit_name?: string | null;
        property?: {
            id: number;
            property_name?: string | null;
            city?: {
                id: number;
                city?: string | null;
            } | null;
        } | null;
    } | null;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    payment?: Payment | null;
    cities: CityOption[];
    properties: PropertyOption[];
    units: UnitOption[];
    types: string[];
}

function PaymentDatePickerField({
    label,
    value,
    onChange,
    error,
}: {
    label: string;
    value?: string;
    onChange: (value: string) => void;
    error?: string;
}) {
    const selectedDate = value ? parseISO(value) : undefined;

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        type="button"
                        variant="outline"
                        className={cn('w-full justify-start text-left font-normal', !value && 'text-muted-foreground')}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {value ? format(selectedDate!, 'PPP') : 'Pick a date'}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => {
                            if (!date) return;
                            const yyyy = date.getFullYear();
                            const mm = String(date.getMonth() + 1).padStart(2, '0');
                            const dd = String(date.getDate()).padStart(2, '0');
                            onChange(`${yyyy}-${mm}-${dd}`);
                        }}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}

export default function PaymentDrawer({ open, onOpenChange, payment, cities, properties, units, types }: Props) {
    const isEdit = !!payment;

    const initialCityId = payment?.unit?.property?.city?.id ? String(payment.unit.property.city.id) : '';
    const initialPropertyId = payment?.unit?.property?.id ? String(payment.unit.property.id) : '';
    const initialUnitId = payment?.unit?.id ? String(payment.unit.id) : '';

    const [selectedCityId, setSelectedCityId] = useState(initialCityId);
    const [selectedPropertyId, setSelectedPropertyId] = useState(initialPropertyId);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        unit_id: initialUnitId,
        type: payment?.type || 'Checks',
        amount: payment?.amount || '',
        date: payment?.date || '',
        to_whom: payment?.to_whom || '',
        description: payment?.description || '',
        order_id: payment?.order_id || '',
    });

    useEffect(() => {
        const nextCityId = payment?.unit?.property?.city?.id ? String(payment.unit.property.city.id) : '';
        const nextPropertyId = payment?.unit?.property?.id ? String(payment.unit.property.id) : '';
        const nextUnitId = payment?.unit?.id ? String(payment.unit.id) : '';

        setSelectedCityId(nextCityId);
        setSelectedPropertyId(nextPropertyId);

        setData({
            unit_id: nextUnitId,
            type: payment?.type || 'Checks',
            amount: payment?.amount || '',
            date: payment?.date || '',
            to_whom: payment?.to_whom || '',
            description: payment?.description || '',
            order_id: payment?.order_id || '',
        });
    }, [payment, setData]);

    const availableProperties = useMemo(() => {
        if (!selectedCityId) return [];
        return properties.filter((property) => String(property.city_id) === String(selectedCityId));
    }, [properties, selectedCityId]);

    const availableUnits = useMemo(() => {
        if (!selectedPropertyId) return [];
        return units.filter((unit) => String(unit.property_id) === String(selectedPropertyId));
    }, [units, selectedPropertyId]);

    const isCreditCard = data.type === 'Credit Card';

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && payment) {
            put(route('unit-payments.update', payment.id), {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => onOpenChange(false),
            });
            return;
        }

        post(route('unit-payments.store'), {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                reset();
                setSelectedCityId('');
                setSelectedPropertyId('');
                onOpenChange(false);
            },
        });
    };

    const handleCancel = () => {
        reset();
        setSelectedCityId(initialCityId);
        setSelectedPropertyId(initialPropertyId);
        onOpenChange(false);
    };

    return (
        <Drawer open={open} onOpenChange={onOpenChange} modal={false}>
            <DrawerContent size="half" title={isEdit ? `Edit Payment #${payment?.id}` : 'Create Payment'}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="city_id">City</Label>
                                    <select
                                        id="city_id"
                                        value={selectedCityId}
                                        onChange={(e) => {
                                            setSelectedCityId(e.target.value);
                                            setSelectedPropertyId('');
                                            setData('unit_id', '');
                                        }}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="">Select city</option>
                                        {cities.map((city) => (
                                            <option key={city.id} value={String(city.id)}>
                                                {city.city}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="property_id">Property</Label>
                                    <select
                                        id="property_id"
                                        value={selectedPropertyId}
                                        onChange={(e) => {
                                            setSelectedPropertyId(e.target.value);
                                            setData('unit_id', '');
                                        }}
                                        disabled={!selectedCityId}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                                    >
                                        <option value="">Select property</option>
                                        {availableProperties.map((property) => (
                                            <option key={property.id} value={String(property.id)}>
                                                {property.property_name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="unit_id">Unit</Label>
                                    <select
                                        id="unit_id"
                                        value={data.unit_id}
                                        onChange={(e) => setData('unit_id', e.target.value)}
                                        disabled={!selectedPropertyId}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm disabled:opacity-50"
                                    >
                                        <option value="">Select unit</option>
                                        {availableUnits.map((unit) => (
                                            <option key={unit.id} value={String(unit.id)}>
                                                {unit.unit_name}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.unit_id && <p className="text-sm text-destructive">{errors.unit_id}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="type">Payment Type</Label>
                                    <select
                                        id="type"
                                        value={data.type}
                                        onChange={(e) => {
                                            const nextType = e.target.value;
                                            setData('type', nextType);
                                            if (nextType !== 'Credit Card') {
                                                setData('order_id', '');
                                            }
                                        }}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        {types.map((type) => (
                                            <option key={type} value={type}>
                                                {type}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.type && <p className="text-sm text-destructive">{errors.type}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="amount">Amount</Label>
                                    <Input
                                        id="amount"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={data.amount}
                                        onChange={(e) => setData('amount', e.target.value)}
                                        placeholder="0.00"
                                    />
                                    {errors.amount && <p className="text-sm text-destructive">{errors.amount}</p>}
                                </div>

                                <PaymentDatePickerField
                                    label="Date"
                                    value={data.date}
                                    onChange={(value) => setData('date', value)}
                                    error={errors.date}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="to_whom">To Whom</Label>
                                <Input id="to_whom" value={data.to_whom} onChange={(e) => setData('to_whom', e.target.value)} placeholder="Payee" />
                                {errors.to_whom && <p className="text-sm text-destructive">{errors.to_whom}</p>}
                            </div>

                            {isCreditCard && (
                                <div className="space-y-2">
                                    <Label htmlFor="order_id">Order ID</Label>
                                    <Input
                                        id="order_id"
                                        value={data.order_id}
                                        onChange={(e) => setData('order_id', e.target.value)}
                                        placeholder="Credit card order ID"
                                    />
                                    {errors.order_id && <p className="text-sm text-destructive">{errors.order_id}</p>}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Additional details..."
                                    rows={4}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                                {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                            </div>
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" onClick={handleSubmit} disabled={processing} className="flex-1">
                                {processing ? (isEdit ? 'Updating...' : 'Creating...') : isEdit ? 'Update Payment' : 'Create Payment'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
