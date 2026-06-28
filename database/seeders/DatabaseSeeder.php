<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Permission;
class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        $user=User::factory()->create([
            'name' => 'Test User',
            'email' => 'realestate@example.com',
            'password' => Hash::make('realestate1234'),
        ]);

        $this->call([
        RolePermissionSeeder::class,
        InspectionDefaultSeeder::class,
        WalkthroughDefaultSeeder::class,
        AgreementDefaultSeeder::class,
        ]);

        $user->givePermissionTo(Permission::all());
    }
}
