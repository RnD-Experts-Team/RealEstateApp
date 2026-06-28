<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class WalkthroughPermissionSeeder extends Seeder
{
    /**
     * Idempotently create walkthrough / safety-inspection permissions and grant
     * them to Super-Admin. Run on an existing database after deploy:
     *   php artisan db:seed --class=WalkthroughPermissionSeeder
     */
    public function run(): void
    {
        $permissions = [
            'walkthrough-settings.index',
            'walkthrough-settings.update',
            'walkthrough-forms.manage',
            'safety-inspections.index',
            'safety-inspections.create',
            'safety-inspections.destroy',
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
