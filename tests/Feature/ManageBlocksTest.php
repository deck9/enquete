<?php

use App\Models\Form;
use App\Models\User;
use Hashids\Hashids;
use App\Models\FormBlock;
use App\Enums\FormBlockType;
use App\Events\FormBlocksUpdated;
use Illuminate\Support\Facades\Event;
use Database\Seeders\SimpleFormSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;

uses(RefreshDatabase::class);

test('can_create_new_blocks', function () {
    $form = Form::factory()->create();

    $response = $this->actingAs($form->user)
        ->json('post', route('api.blocks.create', $form->uuid))
        ->assertSuccessful();

    $block = FormBlock::get()->last();
    $hashed = (new Hashids())->encode($block->id);

    $this->assertEquals($hashed, $response->json('uuid'));
    $this->assertEquals($form->id, $response->json('form_id'));
    $this->assertEquals($block->type, FormBlockType::none);
});

test('can_create_a_new_block_of_type_group', function () {
    $form = Form::factory()->create();

    $response = $this->actingAs($form->user)
        ->json('post', route('api.blocks.create', $form->uuid), [
            'type' => 'group'
        ])
        ->assertSuccessful();

    $block = FormBlock::get()->last();
    $hashed = (new Hashids())->encode($block->id);

    $this->assertEquals($hashed, $response->json('uuid'));
    $this->assertEquals($form->id, $response->json('form_id'));
    $this->assertEquals($block->type, FormBlockType::group);
});

test('can_only_create_blocks_for_forms_that_a_user_owns', function () {
    /** @var User $otherUser */
    $otherUser = User::factory()->create([]);
    $form = Form::factory()->create();

    $this->actingAs($otherUser)
        ->json('post', route('api.blocks.create', $form))
        ->assertStatus(403);
    ;
});

test('can_get_blocks_related_to_a_form', function () {
    $form = Form::factory()->create();

    FormBlock::factory()->count(5)->create([
        'form_id' => $form->id,
    ]);

    $response = $this->actingAs($form->user)
        ->json('get', route('api.blocks.index', $form->uuid));

    $response->assertStatus(200);
    $this->assertCount(5, $response->json());
});

test('can_get_blocks_with_results_loaded', function () {
    $this->seed(SimpleFormSeeder::class);
    $form = Form::first();

    $response = $this->actingAs($form->user)
        ->json('get', route('api.blocks.index', $form->uuid), [
            'includeSubmissions' => 'true',
        ]);

    $this->assertEquals(5, $response->json('1.session_count'));
    $this->assertEquals(5, $response->json('2.session_count'));
    $this->assertEquals(5, $response->json('3.session_count'));
    $this->assertNotNull($response->json('1.interactions.0.responses_count'));
    $this->assertNotNull($response->json('2.interactions.0.responses_count'));
});

test('can_update_existing_blocks', function () {
    $block = FormBlock::factory()->create([
        'message' => 'Hey there',
        'type' => FormBlockType::none,
    ]);

    $response = $this->actingAs($block->form->user)
        ->json('post', route('api.blocks.update', $block->id), [
            'message' => 'Ok?',
            'type' => FormBlockType::radio,
        ])->assertSuccessful();

    $this->assertEquals('Ok?', $response->json('message'));
    $this->assertEquals(FormBlockType::radio->value, $response->json('type'));
});

test('can_update_a_block_with_a_empty_message', function () {
    $block = FormBlock::factory()->create([
        'message' => 'Test Message',
        'type' => FormBlockType::none,
    ]);

    $response = $this->actingAs($block->form->user)
        ->json('post', route('api.blocks.update', $block->id), [
            'message' => null,
            'type' => FormBlockType::radio,
        ])->assertSuccessful();

    $this->assertNull($response->json('message'));
    $this->assertEquals(FormBlockType::radio->value, $response->json('type'));
});

test('cannot_create_or_update_blocks_of_not_owned_form', function () {
    /** @var User $otherUser */
    $otherUser = User::factory()->create();

    $block = FormBlock::factory()->create([
        'message' => 'Hey there',
        'type' => FormBlockType::none,
    ]);

    $this->actingAs($otherUser)
        ->json('post', route('api.blocks.create', $block->form->uuid))
        ->assertStatus(403);

    $this->actingAs($otherUser)
        ->json('post', route('api.blocks.update', $block->id), [
            'message' => 'Ok?',
            'type' => FormBlockType::radio,
        ])
        ->assertStatus(403);

    $this->assertEquals('Hey there', $block->fresh()->message);
    $this->assertEquals(FormBlockType::none, $block->fresh()->type);
});

test('when_blocks_are_updated_an_event_is_fired', function () {
    Event::fake();

    $block = FormBlock::factory()->create([
        'message' => 'Hey there',
        'type' => FormBlockType::none,
    ]);

    $this->actingAs($block->form->user)
        ->json('post', route('api.blocks.update', $block->id), [
            'message' => 'Ok?',
            'type' => FormBlockType::radio,
        ]);

    Event::assertDispatched(FormBlocksUpdated::class, function ($event) use ($block) {
        return $event->form->id === $block->form->id;
    });
});

test('can_delete_a_block', function () {
    $block = FormBlock::factory()->create();

    $this->actingAs($block->form->user)
        ->json('DELETE', route('api.blocks.delete', $block->id))
        ->assertSuccessful();

    $this->assertNull($block->fresh());
});

test('cannot_delete_blocks_of_other_users', function () {
    /** @var User $otherUser */
    $otherUser = User::factory()->create();
    $block = FormBlock::factory()->create();

    $this->actingAs($otherUser)
        ->json('DELETE', route('api.blocks.delete', $block->id))
        ->assertStatus(403);

    $this->assertNotNull($block->fresh());
});

test('can_set_a_title_for_the_results_view', function () {
    $block = FormBlock::factory()->create();

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), [
            'title' => 'This is a block title',
        ]);

    $this->assertEquals('This is a block title', $block->fresh()->title);
});

test('can_remove_a_title_for_the_results_view', function () {
    $block = FormBlock::factory()->create([
        'title' => 'Title is set',
    ]);

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), ['title' => null]);

    $this->assertNull($block->fresh()->title);
});

test('can_make_a_block_required_for_form_user', function () {
    $block = FormBlock::factory()->create();

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), ['is_required' => true]);

    $this->assertTrue($block->fresh()->is_required);

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), ['is_required' => false]);

    $this->assertFalse($block->fresh()->is_required);
});

test('can_save_information_in_an_options_field', function () {
    $block = FormBlock::factory()->create();

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), [
            'options' => [
                'title' => 'Test Title',
                'activities' => [],
            ],
        ]);

    $this->assertEquals('Test Title', $block->fresh()->options['title']);
});


it('can disable and enable a form block', function () {
    $block = FormBlock::factory()->create([
        'is_disabled' => false
    ]);

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), [
            'is_disabled' => true
        ]);

    expect($block->fresh()->is_disabled)->toBeTrue();

    $this->actingAs($block->form->user)
        ->json('POST', route('api.blocks.update', $block->id), [
            'is_disabled' => false
        ]);

    expect($block->fresh()->is_disabled)->toBeFalse();
});
