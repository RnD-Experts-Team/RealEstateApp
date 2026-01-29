import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, X } from 'lucide-react';
import { useState } from 'react';

interface Props {
    cities: Array<{ id: number; city: string }>;
    onPropertyCreated: (cityId: string, propertyName: string) => void;
    onCancel: () => void;
}

export default function InlinePropertyCreation({ cities, onPropertyCreated, onCancel }: Props) {
    const [cityId, setCityId] = useState<string>('');
    const [propertyName, setPropertyName] = useState<string>('');
    const [errors, setErrors] = useState<{ cityId?: string; propertyName?: string }>({});

    const handleCreate = () => {
        // Validate
        const newErrors: { cityId?: string; propertyName?: string } = {};
        
        if (!cityId) {
            newErrors.cityId = 'Please select a city';
        }
        
        if (!propertyName.trim()) {
            newErrors.propertyName = 'Please enter a property name';
        }
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        
        // Pass data back to parent
        onPropertyCreated(cityId, propertyName);
        
        // Reset form
        setCityId('');
        setPropertyName('');
        setErrors({});
    };

    return (
        <div className="rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">Create New Property</h3>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={onCancel}
                    className="h-6 w-6 p-0"
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="space-y-3">
                {/* City Selection */}
                <div>
                    <Label htmlFor="new-property-city" className="text-sm font-medium dark:text-gray-200">
                        City <span className="text-red-500">*</span>
                    </Label>
                    <Select value={cityId} onValueChange={(value) => {
                        setCityId(value);
                        setErrors(prev => ({ ...prev, cityId: undefined }));
                    }}>
                        <SelectTrigger id="new-property-city" className="bg-white dark:bg-gray-800 dark:border-gray-700">
                            <SelectValue placeholder="Select city" />
                        </SelectTrigger>
                        <SelectContent>
                            {cities.map((city) => (
                                <SelectItem key={city.id} value={city.id.toString()}>
                                    {city.city}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {errors.cityId && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.cityId}</p>
                    )}
                </div>

                {/* Property Name */}
                <div>
                    <Label htmlFor="new-property-name" className="text-sm font-medium dark:text-gray-200">
                        Property Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                        id="new-property-name"
                        value={propertyName}
                        onChange={(e) => {
                            setPropertyName(e.target.value);
                            setErrors(prev => ({ ...prev, propertyName: undefined }));
                        }}
                        placeholder="Enter property name"
                        className="bg-white dark:bg-gray-800 dark:border-gray-700"
                    />
                    {errors.propertyName && (
                        <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.propertyName}</p>
                    )}
                </div>

                <Button
                    type="button"
                    onClick={handleCreate}
                    size="sm"
                    className="w-full"
                >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Property
                </Button>
            </div>
        </div>
    );
}
