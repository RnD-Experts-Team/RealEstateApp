import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radioGroup';
import { MoveOutFormData } from '@/types/move-out';

interface MoveOutStatusFieldsProps {
    data: MoveOutFormData;
    errors: Partial<Record<keyof MoveOutFormData, string>>;
    onDataChange: <K extends keyof MoveOutFormData>(field: K, value: MoveOutFormData[K]) => void;
}

export function MoveOutStatusFields({ data, errors, onDataChange }: MoveOutStatusFieldsProps) {
    return (
        <>
            {/* Cleaning */}
            <div className="rounded-lg border-l-4 border-l-violet-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="cleaning" className="text-base font-semibold">
                        Cleaning
                    </Label>
                </div>
                <RadioGroup
                    value={data.cleaning}
                    onValueChange={(value) => onDataChange('cleaning', value as '' | 'cleaned' | 'uncleaned')}
                    name="cleaning"
                    options={[
                        { value: 'cleaned', label: 'Cleaned' },
                        { value: 'uncleaned', label: 'Uncleaned' },
                    ]}
                />
                {errors.cleaning && <p className="mt-1 text-sm text-red-600">{errors.cleaning}</p>}
            </div>

            {/* List the Unit */}
            <div className="rounded-lg border-l-4 border-l-rose-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="list_the_unit" className="text-base font-semibold">
                        List the Unit
                    </Label>
                </div>
                <Input
                    id="list_the_unit"
                    value={data.list_the_unit}
                    onChange={(e) => onDataChange('list_the_unit', e.target.value)}
                    placeholder="Enter unit listing details"
                />
                {errors.list_the_unit && <p className="mt-1 text-sm text-red-600">{errors.list_the_unit}</p>}
            </div>

            {/* Renter */}
            <div className="rounded-lg border-l-4 border-l-sky-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="renter" className="text-base font-semibold">
                        Renter
                    </Label>
                </div>
                <RadioGroup
                    value={data.renter}
                    onValueChange={(value) => onDataChange('renter', value as '' | 'Yes' | 'No')}
                    name="renter"
                    options={[
                        { value: 'Yes', label: 'Yes' },
                        { value: 'No', label: 'No' },
                    ]}
                />
                {errors.renter && <p className="mt-1 text-sm text-red-600">{errors.renter}</p>}
            </div>

            {/* Move Out Form */}
            <div className="rounded-lg border-l-4 border-l-fuchsia-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="move_out_form" className="text-base font-semibold">
                        Move Out Form
                    </Label>
                </div>
                <RadioGroup
                    value={data.move_out_form}
                    onValueChange={(value) => onDataChange('move_out_form', value as '' | 'filled' | 'not filled')}
                    name="move_out_form"
                    options={[
                        { value: 'filled', label: 'Filled' },
                        { value: 'not filled', label: 'Not Filled' },
                    ]}
                />
                {errors.move_out_form && <p className="mt-1 text-sm text-red-600">{errors.move_out_form}</p>}
            </div>

            {/* Got Pics */}
            <div className="rounded-lg border-l-4 border-l-emerald-500 p-4">
                <div className="mb-2">
                    <Label htmlFor="got_pics" className="text-base font-semibold">
                        Got Pics
                    </Label>
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="got_pics"
                        checked={data.got_pics}
                        onChange={(e) => onDataChange('got_pics', e.target.checked)}
                        className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="got_pics" className="text-sm cursor-pointer">
                        Pictures taken of the unit
                    </label>
                </div>
                {(errors as any).got_pics && <p className="mt-1 text-sm text-red-600">{(errors as any).got_pics}</p>}
            </div>
        </>
    );
}
