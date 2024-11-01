<?php

namespace Database\Factories;

use App\Models\FormBlock;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\FormBlockLogic>
 */
class FormBlockLogicFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->name(),
            'action' => 'hide',
            'evaluate' => 'before',
            'conditions' => [
                [
                    'source' => $this->faker->uuid,
                    'operator' => 'equals',
                    'value' => 'test',
                    'chainOperator' => 'and',
                ]
            ],
            'action_payload' => [],
            'form_block_id' => FormBlock::factory(),
        ];
    }
}
