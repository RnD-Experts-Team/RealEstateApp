<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PropertyInfoController;
use App\Http\Controllers\PropertyInfoWithoutInsuranceController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\VendorInfoController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\UnitController;
use App\Http\Controllers\PaymentController;
use App\Http\Controllers\VendorTaskTrackerController;
use App\Http\Controllers\MoveInController;
use App\Http\Controllers\MoveOutController;
use App\Http\Controllers\NoticeController;
use App\Http\Controllers\OffersAndRenewalController;
use App\Http\Controllers\NoticeAndEvictionController;
use App\Http\Controllers\CityController;
use App\Http\Controllers\PaymentPlanController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\DashboardController;
use Inertia\Inertia;
use App\Http\Controllers\TourController;
use App\Http\Controllers\UnitPaymentController;
use App\Http\Controllers\InspectionSettingController;
use App\Http\Controllers\InspectionFormController;
use App\Http\Controllers\WalkthroughSettingController;
use App\Http\Controllers\WalkthroughFormController;
use App\Http\Controllers\AgreementTypeController;
use App\Http\Controllers\AgreementController;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::resource('roles', RoleController::class);

    // Main dashboard page - handles all states
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Optional: Specific routes for direct linking with parameters
    Route::get('/dashboard/city/{city_id}', [DashboardController::class, 'getProperties'])->name('dashboard.properties');
    Route::get('/dashboard/city/{city_id}/property/{property_id}', [DashboardController::class, 'getUnits'])->name('dashboard.units');
    Route::get('/dashboard/city/{city_id}/property/{property_id}/unit/{unit_id}', [DashboardController::class, 'getUnitInfo'])->name('dashboard.unit-info');

    /**
     * properties-info CRUD & other resource routes
     */
    Route::resource('properties-info', PropertyInfoController::class)->except(['create', 'edit', 'update']);
    Route::post('/properties-info/{properties_info}', [PropertyInfoController::class, 'update'])
        ->name('properties-info.update');

    // Insurance Representatives
    Route::post('/insurance-representatives', [PropertyInfoController::class, 'storeRep'])
        ->name('insurance-representatives.store');
    Route::put('/insurance-representatives/{rep}', [PropertyInfoController::class, 'updateRep'])
        ->name('insurance-representatives.update');
    Route::delete('/insurance-representatives/{rep}', [PropertyInfoController::class, 'deleteRep'])
        ->name('insurance-representatives.destroy');
    Route::post('/insurance-representatives/{id}/restore', [PropertyInfoController::class, 'restoreRep'])
        ->name('insurance-representatives.restore');

    // Notice & Evictions
    Route::resource('notice_and_evictions', NoticeAndEvictionController::class)->except(['create', 'edit', 'update']);
    Route::post('/notice_and_evictions/{notice_and_eviction}', [NoticeAndEvictionController::class, 'update'])
        ->name('notice_and_evictions.update');
    Route::patch('/notice_and_evictions/{notice_and_eviction}/hide', [NoticeAndEvictionController::class, 'hide'])
        ->name('notice_and_evictions.hide');
    Route::patch('/notice_and_evictions/{notice_and_eviction}/unhide', [NoticeAndEvictionController::class, 'unhide'])
        ->name('notice_and_evictions.unhide');

    /**
     * Applications filters
     */
    Route::get('applications/status/{status}', [ApplicationController::class, 'byStatus'])
        ->name('applications.by-status');
    Route::get('applications/stage/{stage}', [ApplicationController::class, 'byStage'])
        ->name('applications.by-stage');

    /**
     * Small helper APIs used by various pages (kept under /api but in web.php with auth)
     * NOTE: Avoid duplicating the same path/controller combo.
     */
    Route::get('/api/properties-by-city', [ApplicationController::class, 'getPropertiesByCity'])
        ->name('api.properties-by-city');

    // Keep only ONE units-by-property helper route
    Route::get('/api/units-by-property', [TenantController::class, 'getUnitsByProperty'])
        ->name('api.units-by-property');

    /**
     * Tenants helper APIs for autocomplete
     */
    Route::get('/api/tenants/cities', [TenantController::class, 'getCitiesForAutocomplete'])
        ->name('api.tenants.cities');
    Route::get('/api/tenants/properties', [TenantController::class, 'getPropertiesForAutocomplete'])
        ->name('api.tenants.properties');

    // Property Info Without Insurance
    Route::resource('all-properties', PropertyInfoWithoutInsuranceController::class);
    Route::get('/api/all-properties/by-city/{city}', [PropertyInfoWithoutInsuranceController::class, 'getByCity'])
        ->name('api.all-properties.by-city');

    Route::get('/all-properties/import', [PropertyInfoWithoutInsuranceController::class, 'showImport'])
        ->name('all-properties.import');
    Route::post('/all-properties/import', [PropertyInfoWithoutInsuranceController::class, 'import'])
        ->name('all-properties.import.store');

    // Units import
    Route::get('/units/import', [UnitController::class, 'showImport'])
        ->name('units.import.show');
    Route::post('/units/import', [UnitController::class, 'import'])
        ->name('units.import');

    // Tenants
    Route::resource('tenants', TenantController::class);
    Route::patch('/tenants/{tenant}/archive', [TenantController::class, 'archive'])
        ->name('tenants.archive')
        ->middleware('permission:tenants.destroy');

    /**
     * Additional tenant helper & import routes
     */
    Route::get('tenants/units-by-property', [TenantController::class, 'getUnitsByProperty'])
        ->name('tenants.units-by-property');

    Route::get('tenants/import/form', [TenantController::class, 'import'])
        ->name('tenants.import');

    Route::post('tenants/import/process', [TenantController::class, 'processImport'])
        ->name('tenants.import.process');

    Route::get('tenants/import/template', [TenantController::class, 'downloadTemplate'])
        ->name('tenants.import.template');

    // Units
    Route::get('/units/vacant', [UnitController::class, 'vacant'])->name('units.vacant');
    Route::resource('units', UnitController::class);

    // Payments
    Route::resource('payments', PaymentController::class);

    // Payment hide/unhide actions - separate routes similar to archive pattern
    Route::patch('/payments/{payment}/hide', [PaymentController::class, 'hide'])
        ->name('payments.hide');
    Route::patch('/payments/{payment}/unhide', [PaymentController::class, 'unhide'])
        ->name('payments.unhide');

    // Vendor Task Tracker
    Route::resource('vendor-task-tracker', VendorTaskTrackerController::class);
    Route::patch('/vendor-task-tracker/{vendorTaskTracker}/hide', [VendorTaskTrackerController::class, 'hide'])
        ->name('vendor-task-tracker.hide');
    Route::patch('/vendor-task-tracker/{vendorTaskTracker}/unhide', [VendorTaskTrackerController::class, 'unhide'])
        ->name('vendor-task-tracker.unhide');

    // Move In
    Route::resource('move-in', MoveInController::class)->except(['create', 'edit', 'show']);

    Route::patch('/move-in/{moveIn}/hide', [MoveInController::class, 'hide'])->name('move-in.hide');
    Route::patch('/move-in/{moveIn}/unhide', [MoveInController::class, 'unhide'])->name('move-in.unhide');

    // Demo route for MoveIn Drawer component
    Route::get('move-in-drawer-demo', function () {
        $units = ['Unit 101', 'Unit 102', 'Unit 201', 'Unit 202', 'Unit 301'];
        return Inertia::render('MoveInDrawerDemo', [
            'units' => $units,
        ]);
    })->name('move-in-drawer-demo');

    // Move Out
    Route::resource('move-out', MoveOutController::class);
    Route::patch('move-out/{moveOut}/hide', [MoveOutController::class, 'hide'])
        ->name('move-out.hide');
    Route::patch('move-out/{moveOut}/unhide', [MoveOutController::class, 'unhide'])
        ->name('move-out.unhide');

    // Offers & Renewals
    Route::resource('offers_and_renewals', OffersAndRenewalController::class);

    // Notices
    Route::resource('notices', NoticeController::class);

    // Applications
    Route::resource('applications', ApplicationController::class);
    Route::patch('/applications/{application}/hide', [ApplicationController::class, 'hide'])
        ->name('applications.hide');
    Route::patch('/applications/{application}/unhide', [ApplicationController::class, 'unhide'])
        ->name('applications.unhide');
    Route::get('/applications/{application}/download/{index}', [ApplicationController::class, 'downloadAttachment'])
        ->name('applications.download');

    // Vendors
    Route::resource('vendors', VendorInfoController::class);

    // Payment Plans
    Route::resource('payment-plans', PaymentPlanController::class);
    Route::patch('/payment-plans/{payment_plan}/hide', [PaymentPlanController::class, 'hide'])
        ->name('payment-plans.hide');
    Route::patch('/payment-plans/{payment_plan}/unhide', [PaymentPlanController::class, 'unhide'])
        ->name('payment-plans.unhide');

    // Cities
    Route::get('cities', [CityController::class, 'index'])->name('cities.index');
    Route::post('cities', [CityController::class, 'store'])->name('cities.store');
    Route::delete('cities/{city}', [CityController::class, 'destroy'])->name('cities.destroy');

    // Users
    Route::resource('users', UserController::class);


    Route::get('tours', [TourController::class, 'index'])->name('tours.index');

    Route::post('tours', [TourController::class, 'storeTour'])->name('tours.store');
    Route::put('tours/{tour}', [TourController::class, 'updateTour'])->name('tours.update');
    Route::delete('tours/{tour}', [TourController::class, 'deleteTour'])->name('tours.destroy');
    Route::post('tours/{tour}/hide', [TourController::class, 'hideTour'])->name('tours.hide');
    Route::post('tours/{tour}/unhide', [TourController::class, 'unhideTour'])->name('tours.unhide');

    Route::post('representatives', [TourController::class, 'storeRep'])->name('representatives.store');
    Route::put('representatives/{representative}', [TourController::class, 'updateRep'])->name('representatives.update');
    Route::delete('representatives/{representative}', [TourController::class, 'deleteRep'])->name('representatives.destroy');
    Route::post('representatives/{id}/restore', [TourController::class, 'restoreRep'])->name('representatives.restore');

    Route::get('reports', [UnitPaymentController::class, 'index'])->name('reports.index');

    Route::post('reports', [UnitPaymentController::class, 'store'])->name('reports.store');
    Route::put('reports/{unitPayment}', [UnitPaymentController::class, 'update'])->name('reports.update');
    Route::delete('reports/{unitPayment}', [UnitPaymentController::class, 'destroy'])->name('reports.destroy');

    Route::post('reports/{unitPayment}/hide', [UnitPaymentController::class, 'hide'])->name('reports.hide');
    Route::post('reports/{unitPayment}/unhide', [UnitPaymentController::class, 'unhide'])->name('reports.unhide');

    /**
     * Inspection form settings (staff-configurable template: sections, items, settings)
     */
    Route::get('inspection-settings', [InspectionSettingController::class, 'index'])->name('inspection-settings.index');
    Route::put('inspection-settings', [InspectionSettingController::class, 'updateSettings'])->name('inspection-settings.update');
    Route::post('inspection-settings/sections', [InspectionSettingController::class, 'storeSection'])->name('inspection-settings.sections.store');
    Route::put('inspection-settings/sections/{section}', [InspectionSettingController::class, 'updateSection'])->name('inspection-settings.sections.update');
    Route::delete('inspection-settings/sections/{section}', [InspectionSettingController::class, 'destroySection'])->name('inspection-settings.sections.destroy');
    Route::post('inspection-settings/items', [InspectionSettingController::class, 'storeItem'])->name('inspection-settings.items.store');
    Route::put('inspection-settings/items/{item}', [InspectionSettingController::class, 'updateItem'])->name('inspection-settings.items.update');
    Route::delete('inspection-settings/items/{item}', [InspectionSettingController::class, 'destroyItem'])->name('inspection-settings.items.destroy');

    /**
     * Inspection forms (staff side): generate the signed tenant link, view a filled form, download PDF
     */
    Route::post('inspections/generate', [InspectionFormController::class, 'generate'])->name('inspections.generate');
    Route::get('inspections/{form}', [InspectionFormController::class, 'show'])->name('inspections.show');
    Route::get('inspections/{form}/pdf', [InspectionFormController::class, 'pdf'])->name('inspections.pdf');
    Route::post('inspections/{form}/reset', [InspectionFormController::class, 'reset'])->name('inspections.reset');

    /**
     * Walkthrough & Safety-Inspection form settings (typed-field builder, per kind)
     */
    Route::get('walkthrough-settings', [WalkthroughSettingController::class, 'index'])->name('walkthrough-settings.index');
    Route::put('walkthrough-settings', [WalkthroughSettingController::class, 'updateSettings'])->name('walkthrough-settings.update');
    Route::post('walkthrough-settings/fields', [WalkthroughSettingController::class, 'storeField'])->name('walkthrough-settings.fields.store');
    Route::put('walkthrough-settings/fields/{field}', [WalkthroughSettingController::class, 'updateField'])->name('walkthrough-settings.fields.update');
    Route::delete('walkthrough-settings/fields/{field}', [WalkthroughSettingController::class, 'destroyField'])->name('walkthrough-settings.fields.destroy');
    Route::post('walkthrough-settings/options', [WalkthroughSettingController::class, 'storeOption'])->name('walkthrough-settings.options.store');
    Route::put('walkthrough-settings/options/{option}', [WalkthroughSettingController::class, 'updateOption'])->name('walkthrough-settings.options.update');
    Route::delete('walkthrough-settings/options/{option}', [WalkthroughSettingController::class, 'destroyOption'])->name('walkthrough-settings.options.destroy');

    /**
     * Walkthrough (move-out) staff side: generate signed link, view, PDF
     */
    Route::post('walkthroughs/generate', [WalkthroughFormController::class, 'generate'])->name('walkthroughs.generate');
    Route::get('walkthroughs/{form}', [WalkthroughFormController::class, 'show'])->name('walkthroughs.show');
    Route::get('walkthroughs/{form}/pdf', [WalkthroughFormController::class, 'pdf'])->name('walkthroughs.pdf');
    Route::post('walkthroughs/{form}/reset', [WalkthroughFormController::class, 'resetForm'])->name('walkthroughs.reset');

    /**
     * Safety Inspections (standalone, per unit) — dedicated page
     */
    Route::get('safety-inspections', [WalkthroughFormController::class, 'safetyIndex'])->name('safety-inspections.index');
    Route::post('safety-inspections', [WalkthroughFormController::class, 'safetyStore'])->name('safety-inspections.store');
    Route::delete('safety-inspections/{form}', [WalkthroughFormController::class, 'safetyDestroy'])->name('safety-inspections.destroy');

    /**
     * Agreement types (configurable lease templates: clauses, options, variables)
     */
    Route::get('agreement-types', [AgreementTypeController::class, 'index'])->name('agreement-types.index');
    Route::post('agreement-types', [AgreementTypeController::class, 'store'])->name('agreement-types.store');
    Route::get('agreement-types/{agreementType}/edit', [AgreementTypeController::class, 'edit'])->name('agreement-types.edit');
    Route::put('agreement-types/{agreementType}', [AgreementTypeController::class, 'update'])->name('agreement-types.update');
    Route::delete('agreement-types/{agreementType}', [AgreementTypeController::class, 'destroy'])->name('agreement-types.destroy');
    Route::post('agreement-clauses', [AgreementTypeController::class, 'storeClause'])->name('agreement-clauses.store');
    Route::put('agreement-clauses/{clause}', [AgreementTypeController::class, 'updateClause'])->name('agreement-clauses.update');
    Route::delete('agreement-clauses/{clause}', [AgreementTypeController::class, 'destroyClause'])->name('agreement-clauses.destroy');
    Route::post('agreement-options', [AgreementTypeController::class, 'storeOption'])->name('agreement-options.store');
    Route::put('agreement-options/{option}', [AgreementTypeController::class, 'updateOption'])->name('agreement-options.update');
    Route::delete('agreement-options/{option}', [AgreementTypeController::class, 'destroyOption'])->name('agreement-options.destroy');
    Route::post('agreement-variables', [AgreementTypeController::class, 'storeVariable'])->name('agreement-variables.store');
    Route::put('agreement-variables/{variable}', [AgreementTypeController::class, 'updateVariable'])->name('agreement-variables.update');
    Route::delete('agreement-variables/{variable}', [AgreementTypeController::class, 'destroyVariable'])->name('agreement-variables.destroy');

    /**
     * Agreements (instances created from a type)
     */
    Route::get('agreements', [AgreementController::class, 'index'])->name('agreements.index');
    Route::post('agreements', [AgreementController::class, 'store'])->name('agreements.store');
    Route::get('agreements/{agreement}/edit', [AgreementController::class, 'edit'])->name('agreements.edit');
    Route::put('agreements/{agreement}', [AgreementController::class, 'update'])->name('agreements.update');
    Route::delete('agreements/{agreement}', [AgreementController::class, 'destroy'])->name('agreements.destroy');
    Route::post('agreements/{agreement}/link', [AgreementController::class, 'generateLink'])->name('agreements.link');
    Route::post('agreements/{agreement}/agent-sign', [AgreementController::class, 'agentSign'])->name('agreements.agent-sign');
    Route::get('agreements/{agreement}/pdf', [AgreementController::class, 'pdf'])->name('agreements.pdf');
});

/**
 * Tenant-facing inspection form (no login) — protected by signed URLs.
 * The link stays valid so the tenant can re-edit after submitting.
 */
Route::get('inspection/{form}', [InspectionFormController::class, 'fill'])
    ->middleware('signed')
    ->name('inspection.fill');
Route::post('inspection/{form}', [InspectionFormController::class, 'submit'])
    ->middleware('signed')
    ->name('inspection.submit');

/**
 * Walkthrough / Safety-Inspection forms filled by representatives via signed URLs (no login).
 */
Route::get('walkthrough/{form}', [WalkthroughFormController::class, 'fill'])
    ->middleware('signed')
    ->name('walkthrough.fill');
Route::post('walkthrough/{form}', [WalkthroughFormController::class, 'submit'])
    ->middleware('signed')
    ->name('walkthrough.submit');

/**
 * Owner-facing agreement signing via signed URLs (no login).
 */
Route::get('agreement/{agreement}', [AgreementController::class, 'sign'])
    ->middleware('signed')
    ->name('agreement.sign');
Route::post('agreement/{agreement}', [AgreementController::class, 'submitSignature'])
    ->middleware('signed')
    ->name('agreement.submit-signature');

// Additional route files
require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
