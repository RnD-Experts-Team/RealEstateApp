<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RolePermissionSeeder extends Seeder
{
    public function run()
    {
        // Static permissions - add/remove as needed
        $permissions = [
            //users
            'users.index',
            'users.create',
            'users.store',
            'users.show',
            'users.edit',
            'users.update',
            'users.destroy',

            //roles
            'roles.index',
            'roles.create',
            'roles.store',
            'roles.show',
            'roles.edit',
            'roles.update',
            'roles.destroy',

            //properties
            'properties.index',
            'properties.create',
            'properties.store',
            'properties.show',
            'properties.edit',
            'properties.update',
            'properties.destroy',

            //units
            'units.index',
            'units.create',
            'units.store',
            'units.show',
            'units.edit',
            'units.update',
            'units.destroy',
            'units.import',

            //payments
            'payments.index',
            'payments.create',
            'payments.store',
            'payments.show',
            'payments.edit',
            'payments.update',
            'payments.destroy',

            //vendor-task-tracker
            'vendor-task-tracker.index',
            'vendor-task-tracker.create',
            'vendor-task-tracker.store',
            'vendor-task-tracker.show',
            'vendor-task-tracker.edit',
            'vendor-task-tracker.update',
            'vendor-task-tracker.destroy',

            //move-in
            'move-in.index',
            'move-in.create',
            'move-in.store',
            'move-in.show',
            'move-in.edit',
            'move-in.update',
            'move-in.destroy',

            //move-out
            'move-out.index',
            'move-out.create',
            'move-out.store',
            'move-out.show',
            'move-out.edit',
            'move-out.update',
            'move-out.destroy',

            //offers-and-renewals
            'offers-and-renewals.index',
            'offers-and-renewals.create',
            'offers-and-renewals.store',
            'offers-and-renewals.show',
            'offers-and-renewals.edit',
            'offers-and-renewals.update',
            'offers-and-renewals.destroy',

            //notices
            'notices.index',
            'notices.create',
            'notices.store',
            'notices.show',
            'notices.edit',
            'notices.update',
            'notices.destroy',

            //notice-and-evictions
            'notice-and-evictions.index',
            'notice-and-evictions.create',
            'notice-and-evictions.store',
            'notice-and-evictions.show',
            'notice-and-evictions.edit',
            'notice-and-evictions.update',
            'notice-and-evictions.destroy',

            //applications
            'applications.index',
            'applications.create',
            'applications.store',
            'applications.show',
            'applications.edit',
            'applications.update',
            'applications.destroy',

            //vendors
            'vendors.index',
            'vendors.create',
            'vendors.store',
            'vendors.show',
            'vendors.edit',
            'vendors.update',
            'vendors.destroy',

            //tenants
            'tenants.index',
            'tenants.create',
            'tenants.store',
            'tenants.show',
            'tenants.edit',
            'tenants.update',
            'tenants.destroy',
            'tenants.import',


            //payment-plans
            'payment-plans.index',
            'payment-plans.create',
            'payment-plans.store',
            'payment-plans.show',
            'payment-plans.edit',
            'payment-plans.update',
            'payment-plans.destroy',

            //cities
            'cities.index',
            'cities.create',
            'cities.store',
            'cities.destroy',

            //all-properties
            'all-properties.index',
            'all-properties.create',
            'all-properties.store',
            'all-properties.show',
            'all-properties.edit',
            'all-properties.update',
            'all-properties.destroy',
            'all-properties.import',

            //tours
            'tour.index',
            'tour.create',
            'tour.edit',
            'tour.destroy',

            //representatives
            'representative.create',
            'representative.edit',
            'representative.destroy',

            //Units Payments
            'unit-payment.index',
            'unit-payment.create',
            'unit-payment.edit',
            'unit-payment.destroy',
        ];

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // Create Super Admin role with all permissions
        $superAdmin = Role::create(['name' => 'Super-Admin']);
        $superAdmin->givePermissionTo(Permission::all());

        $superAdmin = Role::create(['name' => 'None']);
        $superAdmin->givePermissionTo();
        // Assign Super Admin to first user (optional)
        $user = User::first();
        if ($user) {
            $user->assignRole('Super-Admin');
        }
    }
}
