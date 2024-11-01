<?php

use App\Models\FormBlock;
use App\Models\FormBlockInteraction;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('each block interaction has a sequence', function () {
    $block = FormBlock::factory()->create();
    $interactions = FormBlockInteraction::factory()->count(3)->create([
        'form_block_id' => $block->id,
    ]);

    $this->assertEquals(0, $interactions[0]->sequence);
    $this->assertEquals(1, $interactions[1]->sequence);
    $this->assertEquals(2, $interactions[2]->sequence);
});

test('can update the block interactions sequence', function () {
    $block = FormBlock::factory()->create();
    $interactions = FormBlockInteraction::factory()->count(3)->create([
        'form_block_id' => $block->id,
    ]);

    $response = $this->actingAs($block->form->user)
        ->json('POST', route('api.interactions.sequence', ['block' => $block->id]), [
            'sequence' => [
                $interactions[2]->id,
                $interactions[0]->id,
                $interactions[1]->id,
            ],
        ]);
    $response->assertStatus(204);

    // refresh from db
    $interactions = $interactions->fresh();

    $this->assertEquals(0, $interactions[2]->sequence);
    $this->assertEquals(1, $interactions[0]->sequence);
    $this->assertEquals(2, $interactions[1]->sequence);
});

test('deleting an interaction updates sequence on remaining interactions', function () {
    $this->withoutExceptionHandling();

    $block = FormBlock::factory()->create();
    $interactions = FormBlockInteraction::factory()->count(3)->create([
        'form_block_id' => $block->id,
    ]);

    // delete the second interaction
    $this->actingAs($block->form->user)
        ->json('DELETE', route('api.interactions.delete', $interactions[1]->id))
        ->assertStatus(200);

    // refresh from db
    $interactions = $block->formBlockInteractions()->get();

    $this->assertCount(2, $interactions);
    $this->assertEquals(0, $interactions[0]->sequence);
    $this->assertEquals(1, $interactions[1]->sequence);
});
