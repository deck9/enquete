<?php

use App\Models\FormBlock;
use App\Models\FormBlockLogic;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('can create a rule for a form block', function () {
    $firstBlock = FormBlock::factory()->create();
    $block = FormBlock::factory()->for($firstBlock->form)->create();

    $response = $this->actingAs($block->form->user)
        ->json('post', route('api.logics.create', $block->id), [
            'name' => 'Test Rule',
            'conditions' => [
                [
                    'source' => $firstBlock->uuid,
                    'operator' => 'equals',
                    'value' => 'test',
                    'chainOperator' => 'and',
                ]
            ],
            'action' => 'hide',
            'evaluate' => 'before',
        ]);

    $response->assertStatus(201);
});

test('can update an existing form block logic', function () {
    $logic = FormBlockLogic::factory()->create();
    $block = FormBlock::factory()->for($logic->formBlock->form)->create();

    $this->actingAs($logic->formBlock->form->user)
        ->json('post', route('api.logics.update', $logic->id), [
            'name' => 'Test Rule',
            'conditions' => [
                [
                    'source' => $block->uuid,
                    'operator' => 'equals',
                    'value' => 'test',
                    'chainOperator' => 'and',
                ]
            ],
            'action' => 'hide',
            'evaluate' => 'before',
        ])->assertStatus(200);

    $logic->refresh();

    $this->assertEquals('Test Rule', $logic->name);
    $this->assertEquals('hide', $logic->action);
    $this->assertEquals('before', $logic->evaluate);
    $this->assertCount(1, $logic->conditions);
    $this->assertEquals($block->uuid, $logic->conditions[0]['source']);
});


test('can delete a logic rule', function () {
    $logic = FormBlockLogic::factory()->create();

    $this->actingAs($logic->formBlock->form->user)
        ->json('DELETE', route('api.logics.delete', $logic->id))
        ->assertStatus(200);

    $this->assertNull($logic->fresh());
});
