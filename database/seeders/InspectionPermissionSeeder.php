<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class InspectionPermissionSeeder extends Seeder
{
    /**
     * Idempotently create the inspection permissions and grant them to
     * the Super-Admin role. Run this on an existing database after deploy:
     *   php artisan db:seed --class=InspectionPermissionSeeder
     */
    public function run(): void
    {
        $permissions = [
            'inspection-settings.index',
            'inspection-settings.update',
            'inspection-forms.manage',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission, 'guard_name' => 'web']);
        }

        $superAdmin = Role::where('name', 'Super-Admin')->first();
        if ($superAdmin) {
            $superAdmin->givePermissionTo($permissions);
        }
    }
}
