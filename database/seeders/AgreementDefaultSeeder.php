<?php

namespace Database\Seeders;

use App\Models\AgreementClause;
use App\Models\AgreementClauseOption;
use App\Models\AgreementType;
use App\Models\AgreementVariable;
use Illuminate\Database\Seeder;

class AgreementDefaultSeeder extends Seeder
{
    /**
     * Seed one editable starter agreement type so staff have a working example.
     * Safe to re-run: only seeds when no agreement types exist yet.
     */
    public function run(): void
    {
        if (AgreementType::query()->withArchived()->exists()) {
            return;
        }

        $type = AgreementType::create(['name' => 'Ohio Property Management Agreement']);

        // Per-type constants (the agent / company info — same on every agreement of this type).
        $perType = [
            ['key' => 'agent_name', 'label' => 'Agent / Company Name', 'value' => 'Property Experts Realty'],
            ['key' => 'brokerage', 'label' => 'Brokerage', 'value' => 'PE Realty LLC'],
        ];
        // Per-agreement fields (filled each time).
        $perAgreement = [
            ['key' => 'owner_name', 'label' => 'Owner Name', 'input_type' => 'text', 'required' => true],
            ['key' => 'owner_address', 'label' => 'Owner Address', 'input_type' => 'long_text', 'required' => true],
            ['key' => 'property_address', 'label' => 'Property Address', 'input_type' => 'long_text', 'required' => true],
            ['key' => 'commencement_date', 'label' => 'Commencement Date', 'input_type' => 'date', 'required' => true],
            ['key' => 'end_date', 'label' => 'End Date (fixed term)', 'input_type' => 'date', 'required' => false],
            ['key' => 'management_fee', 'label' => 'Management Fee (%)', 'input_type' => 'text', 'required' => false],
        ];

        $sort = 0;
        foreach ($perType as $v) {
            AgreementVariable::create([
                'agreement_type_id' => $type->id,
                'key' => $v['key'],
                'label' => $v['label'],
                'input_type' => 'text',
                'scope' => 'per_type',
                'value' => $v['value'],
                'required' => false,
                'sort_order' => $sort++,
            ]);
        }
        foreach ($perAgreement as $v) {
            AgreementVariable::create([
                'agreement_type_id' => $type->id,
                'key' => $v['key'],
                'label' => $v['label'],
                'input_type' => $v['input_type'],
                'scope' => 'per_agreement',
                'required' => $v['required'],
                'sort_order' => $sort++,
            ]);
        }

        // Clauses
        $parties = AgreementClause::create([
            'agreement_type_id' => $type->id,
            'title' => 'Parties',
            'kind' => 'standard',
            'sort_order' => 0,
            'body' => '<p>This Property Management Agreement is entered into between <strong>{{owner_name}}</strong> '
                . '("Owner"), of {{owner_address}}, and <strong>{{agent_name}}</strong> ("Agent"), a licensed real '
                . 'estate broker with {{brokerage}}, for the property located at {{property_address}}.</p>',
        ]);

        AgreementClause::create([
            'agreement_type_id' => $type->id,
            'title' => 'Appointment of Agent',
            'kind' => 'standard',
            'sort_order' => 1,
            'body' => '<p>The Owner hereby appoints the Agent as the sole and exclusive manager of the property, '
                . 'and the Agent accepts the appointment, subject to the terms of this Agreement. The Owner shall '
                . 'pay the Agent a management fee of {{management_fee}}% of collected rents.</p>',
        ]);

        $term = AgreementClause::create([
            'agreement_type_id' => $type->id,
            'title' => 'Term',
            'kind' => 'options',
            'sort_order' => 2,
            'body' => null,
        ]);

        AgreementClauseOption::create([
            'agreement_clause_id' => $term->id,
            'label' => 'Fixed period',
            'sort_order' => 0,
            'body' => '<p>This Agreement begins on {{commencement_date}} and continues for a fixed term, ending on '
                . '{{end_date}}, unless terminated earlier in accordance with this Agreement.</p>',
        ]);
        AgreementClauseOption::create([
            'agreement_clause_id' => $term->id,
            'label' => 'Month-to-month',
            'sort_order' => 1,
            'body' => '<p>This Agreement begins on {{commencement_date}} and continues on a month-to-month basis '
                . 'until terminated by either party upon thirty (30) days written notice.</p>',
        ]);

        // touch to avoid unused-variable lint
        $parties->touch();
    }
}
