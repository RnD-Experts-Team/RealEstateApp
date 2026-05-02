import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Drawer, DrawerContent, DrawerFooter } from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useForm } from '@inertiajs/react';
import { format } from 'date-fns';
import { AlertTriangle, CalendarIcon, Clock3 } from 'lucide-react';
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

interface Representative {
    id: number;
    name: string;
    deleted_at?: string | null;
}

interface Tour {
    id: number;
    prospect: string;
    phone: string;
    email?: string | null;
    date: string;
    time: string;
    note?: string | null;
    is_hidden: boolean;
    confirmed: boolean;
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
    representative?: Representative | null;
}

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    tour?: Tour | null;
    representatives: Representative[];
    cities: CityOption[];
    properties: PropertyOption[];
    units: UnitOption[];
}

interface TourDatePickerFieldProps {
    label: string;
    value?: string;
    onChange: (value: string) => void;
    error?: string;
}

function TourDatePickerField({ label, value, onChange, error }: TourDatePickerFieldProps) {
    const selectedDate = value
        ? (() => {
              // Parse date string as local date (YYYY-MM-DD format)
              const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
              if (match) {
                  return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
              }
              return undefined;
          })()
        : undefined;

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

interface TourTimePickerFieldProps {
    label: string;
    value?: string;
    onChange: (value: string) => void;
    error?: string;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

function toDisplayTime(value?: string) {
    if (!value) return 'Pick a time';

    const match = /^(\d{2}):(\d{2})/.exec(value);
    if (!match) return value;

    let hour = Number(match[1]);
    const minute = match[2];
    const meridiem = hour >= 12 ? 'PM' : 'AM';

    hour = hour % 12 || 12;

    return `${String(hour).padStart(2, '0')}:${minute} ${meridiem}`;
}

function to24Hour(hour12: string, minute: string, meridiem: string) {
    let hour = Number(hour12);

    if (meridiem === 'AM' && hour === 12) hour = 0;
    if (meridiem === 'PM' && hour !== 12) hour += 12;

    return `${String(hour).padStart(2, '0')}:${minute}`;
}

function TourTimePickerField({ label, value, onChange, error }: TourTimePickerFieldProps) {
    const parsed = useMemo(() => {
        if (!value) return { hour: '09', minute: '00', meridiem: 'AM' };

        const match = /^(\d{2}):(\d{2})/.exec(value);
        if (!match) return { hour: '09', minute: '00', meridiem: 'AM' };

        let hour = Number(match[1]);
        const minute = match[2];
        const meridiem = hour >= 12 ? 'PM' : 'AM';

        hour = hour % 12 || 12;

        return {
            hour: String(hour).padStart(2, '0'),
            minute,
            meridiem,
        };
    }, [value]);

    const [hour, setHour] = useState(parsed.hour);
    const [minute, setMinute] = useState(parsed.minute);
    const [meridiem, setMeridiem] = useState(parsed.meridiem);

    useEffect(() => {
        setHour(parsed.hour);
        setMinute(parsed.minute);
        setMeridiem(parsed.meridiem);
    }, [parsed.hour, parsed.minute, parsed.meridiem]);

    return (
        <div className="space-y-2">
            <Label>{label}</Label>
            <Popover>
                <PopoverTrigger asChild>
                    <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                        <Clock3 className="mr-2 h-4 w-4" />
                        {toDisplayTime(value)}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72" align="start">
                    <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-2">
                            <select
                                value={hour}
                                onChange={(e) => {
                                    const nextHour = e.target.value;
                                    setHour(nextHour);
                                    onChange(to24Hour(nextHour, minute, meridiem));
                                }}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {HOURS.map((h) => (
                                    <option key={h} value={h}>
                                        {h}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={minute}
                                onChange={(e) => {
                                    const nextMinute = e.target.value;
                                    setMinute(nextMinute);
                                    onChange(to24Hour(hour, nextMinute, meridiem));
                                }}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                {MINUTES.map((m) => (
                                    <option key={m} value={m}>
                                        {m}
                                    </option>
                                ))}
                            </select>

                            <select
                                value={meridiem}
                                onChange={(e) => {
                                    const nextMeridiem = e.target.value;
                                    setMeridiem(nextMeridiem);
                                    onChange(to24Hour(hour, minute, nextMeridiem));
                                }}
                                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                            >
                                <option value="AM">AM</option>
                                <option value="PM">PM</option>
                            </select>
                        </div>

                        <div className="text-xs text-muted-foreground">Saved as {to24Hour(hour, minute, meridiem)}</div>
                    </div>
                </PopoverContent>
            </Popover>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}

export default function TourDrawer({ open, onOpenChange, tour, representatives, cities, properties, units }: Props) {
    const isEdit = !!tour;

    const currentRepresentativeId = tour?.representative?.id ?? null;
    const currentRepresentativeDeleted = !!tour?.representative?.deleted_at;

    const selectableRepresentatives = useMemo(() => {
        return representatives.filter((rep) => {
            const isActive = !rep.deleted_at;
            const isCurrentDeletedRep = currentRepresentativeDeleted && currentRepresentativeId === rep.id;

            return isActive || isCurrentDeletedRep;
        });
    }, [representatives, currentRepresentativeDeleted, currentRepresentativeId]);

    const initialCityId = tour?.unit?.property?.city?.id ? String(tour.unit.property.city.id) : '';
    const initialPropertyId = tour?.unit?.property?.id ? String(tour.unit.property.id) : '';
    const initialUnitId = tour?.unit?.id ? String(tour.unit.id) : '';
    const initialRepresentativeId = tour?.representative?.id ? String(tour.representative.id) : '';

    const [selectedCityId, setSelectedCityId] = useState(initialCityId);
    const [selectedPropertyId, setSelectedPropertyId] = useState(initialPropertyId);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        unit_id: initialUnitId,
        representative_id: initialRepresentativeId,
        prospect: tour?.prospect || '',
        phone: tour?.phone || '',
        email: tour?.email || '',
        date: tour?.date || '',
        time: tour?.time ? String(tour.time).slice(0, 5) : '',
        note: tour?.note || '',
        confirmed: tour?.confirmed || false,
    });

    useEffect(() => {
        const nextCityId = tour?.unit?.property?.city?.id ? String(tour.unit.property.city.id) : '';
        const nextPropertyId = tour?.unit?.property?.id ? String(tour.unit.property.id) : '';
        const nextUnitId = tour?.unit?.id ? String(tour.unit.id) : '';
        const nextRepresentativeId = tour?.representative?.id ? String(tour.representative.id) : '';

        setSelectedCityId(nextCityId);
        setSelectedPropertyId(nextPropertyId);

        setData({
            unit_id: nextUnitId,
            representative_id: nextRepresentativeId,
            prospect: tour?.prospect || '',
            phone: tour?.phone || '',
            email: tour?.email || '',
            date: tour?.date || '',
            time: tour?.time ? String(tour.time).slice(0, 5) : '',
            note: tour?.note || '',
            confirmed: tour?.confirmed || false,
        });
    }, [tour, setData]);

    const availableProperties = useMemo(() => {
        if (!selectedCityId) return [];
        return properties.filter((property) => String(property.city_id) === String(selectedCityId));
    }, [properties, selectedCityId]);

    const availableUnits = useMemo(() => {
        if (!selectedPropertyId) return [];
        return units.filter((unit) => String(unit.property_id) === String(selectedPropertyId));
    }, [units, selectedPropertyId]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit && tour) {
            put(route('tours.update', tour.id), {
                preserveScroll: true,
                preserveState: true,
                onSuccess: () => onOpenChange(false),
            });
            return;
        }

        post(route('tours.store'), {
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
            <DrawerContent size="half" title={isEdit ? `Edit Tour #${tour?.id}` : 'Create Tour'}>
                <div className="flex h-full flex-col">
                    <div className="flex-1 overflow-auto p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {isEdit && currentRepresentativeDeleted && (
                                <div className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100">
                                    <div className="flex items-start gap-2">
                                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                                        <div>
                                            This tour is currently linked to a deleted representative. You can keep this representative for this tour,
                                            or reassign it to an active representative.
                                        </div>
                                    </div>
                                </div>
                            )}

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

                            <div className="space-y-2">
                                <Label htmlFor="representative_id">Representative</Label>
                                <select
                                    id="representative_id"
                                    value={data.representative_id}
                                    onChange={(e) => setData('representative_id', e.target.value)}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Select representative</option>
                                    {selectableRepresentatives.map((rep) => (
                                        <option key={rep.id} value={String(rep.id)}>
                                            {rep.name}
                                            {rep.deleted_at ? ' (Deleted - currently assigned)' : ''}
                                        </option>
                                    ))}
                                </select>
                                {errors.representative_id && <p className="text-sm text-destructive">{errors.representative_id}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="prospect">Prospect</Label>
                                <Input
                                    id="prospect"
                                    value={data.prospect}
                                    onChange={(e) => setData('prospect', e.target.value)}
                                    placeholder="Prospect name"
                                />
                                {errors.prospect && <p className="text-sm text-destructive">{errors.prospect}</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Phone</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Phone number"
                                    />
                                    {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={data.email}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Email address"
                                    />
                                    {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                <TourDatePickerField
                                    label="Date"
                                    value={data.date}
                                    onChange={(value) => setData('date', value)}
                                    error={errors.date}
                                />

                                <TourTimePickerField
                                    label="Time"
                                    value={data.time}
                                    onChange={(value) => setData('time', value)}
                                    error={errors.time}
                                />
                            </div>

                            <div className="flex items-center gap-3 rounded-md border border-input bg-background px-3 py-2">
                                <input
                                    type="checkbox"
                                    id="confirmed"
                                    checked={data.confirmed}
                                    onChange={(e) => setData('confirmed', e.target.checked)}
                                    className="h-4 w-4 rounded border-input"
                                />
                                <Label htmlFor="confirmed" className="flex-1 cursor-pointer">
                                    Tour Confirmed
                                </Label>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="note">Note</Label>
                                <textarea
                                    id="note"
                                    value={data.note}
                                    onChange={(e) => setData('note', e.target.value)}
                                    placeholder="Additional notes..."
                                    rows={4}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                />
                                {errors.note && <p className="text-sm text-destructive">{errors.note}</p>}
                            </div>
                        </form>
                    </div>

                    <DrawerFooter>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={handleCancel} className="flex-1">
                                Cancel
                            </Button>
                            <Button type="submit" onClick={handleSubmit} disabled={processing} className="flex-1">
                                {processing ? (isEdit ? 'Updating...' : 'Creating...') : isEdit ? 'Update Tour' : 'Create Tour'}
                            </Button>
                        </div>
                    </DrawerFooter>
                </div>
            </DrawerContent>
        </Drawer>
    );
}
