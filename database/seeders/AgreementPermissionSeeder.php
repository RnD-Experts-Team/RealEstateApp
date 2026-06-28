<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class AgreementPermissionSeeder extends Seeder
{
    /**
     * Idempotently create agreement permissions and grant them to Super-Admin.
     *   php artisan db:seed --class=AgreementPermissionSeeder
     */
    public function run(): void
    {
        $permissions = [
            'agreement-types.index',
            'agreement-types.update',
            'agreements.index',
            'agreements.create',
            'agreements.update',
            'agreements.destroy',
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
