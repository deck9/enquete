<?php

use Illuminate\Http\Request;
use Illuminate\Routing\Router;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\FormController;
use App\Http\Controllers\Api\ZiggyController;
use App\Http\Controllers\Api\ShowFormController;
use App\Http\Controllers\Api\FormBlockController;
use App\Http\Controllers\Api\FormImagesController;
use App\Http\Controllers\Api\FormSubmitController;
use App\Http\Controllers\Api\FormUploadController;
use App\Http\Controllers\Api\FormWebhookController;
use App\Http\Controllers\Api\PublishFormController;
use App\Http\Controllers\Api\TrashedFormController;
use App\Http\Controllers\Api\DuplicateFormController;
use App\Http\Controllers\Api\UnpublishFormController;
use App\Http\Controllers\Api\FormBlockLogicController;
use App\Http\Controllers\Api\FormSubmissionsController;
use App\Http\Controllers\Api\FormBlockMappingController;
use App\Http\Controllers\Api\CreateFormSessionController;
use App\Http\Controllers\Api\FormBlockSequenceController;
use App\Http\Controllers\Api\GetFormStoryboardController;
use App\Http\Controllers\Api\FormTemplateExportController;
use App\Http\Controllers\Api\FormTemplateImportController;
use App\Http\Controllers\Api\DeleteFormSubmissionController;
use App\Http\Controllers\Api\FormBlockInteractionController;
use App\Http\Controllers\Api\PurgeFormSubmissionsController;
use App\Http\Controllers\Api\FormBlockInteractionSequenceController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

/**
 * Authenticated User
 *
 * Get the authenticated user's details. You can use this to check if your authentication is working.
 *
 * @group Utilities
 *
 * @authenticated
 */
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});

$router->middleware(['check.form.access'])->group(function (Router $router) {
    $router->get('public/forms/{form}', ShowFormController::class)->name('api.public.forms.show');
    $router->get('public/forms/{form}/storyboard', GetFormStoryboardController::class)->name('api.public.forms.storyboard');
    $router->post('public/forms/{form}/session', CreateFormSessionController::class)->name('api.public.forms.session.create');
    $router->post('public/forms/{form}', FormSubmitController::class)->name('api.public.forms.submit');
    $router->post('public/forms/{form}/upload', FormUploadController::class)->name('api.public.forms.file-upload');
});

$router->get('routes', ZiggyController::class);

$router->middleware(['auth:sanctum'])->group(function (Router $router) {
    // Form Routes
    $router->get('forms', [FormController::class, 'index'])->name('api.forms.index');
    $router->post('forms', [FormController::class, 'create'])->name('api.forms.create');
    $router->get('forms/{form}', [FormController::class, 'show'])->name('api.forms.show');
    $router->post('forms/{form}', [FormController::class, 'update'])->name('api.forms.update');
    $router->delete('forms/{form}', [FormController::class, 'delete'])->name('api.forms.delete');

    $router->delete('forms/trashed/{form}', [TrashedFormController::class, 'delete'])->name('api.forms.trashed.delete');
    $router->post('forms/trashed/{form}/restore', [TrashedFormController::class, 'restore'])->name('api.forms.trashed.restore');

    // Form Duplication
    $router->post('forms/{form}/duplicate', DuplicateFormController::class)->name('api.forms.duplicate');

    // Form Webhooks
    $router->get('forms/{form}/webhooks', [FormWebhookController::class, 'index'])->name('api.forms.webhooks.index');
    $router->post('forms/{form}/webhooks', [FormWebhookController::class, 'create'])->name('api.forms.webhooks.create');
    $router->post('forms/{form}/webhooks/{webhook}', [FormWebhookController::class, 'update'])->name('api.forms.webhooks.update');
    $router->delete('forms/{form}/webhooks/{webhook}', [FormWebhookController::class, 'delete'])->name('api.forms.webhooks.delete');

    // Form Publishing Routes
    $router->post('forms/{form}/publish', PublishFormController::class)->name('api.forms.publish');
    $router->post('forms/{form}/unpublish', UnpublishFormController::class)->name('api.forms.unpublish');

    // Form Image Routes
    $router->post('forms/{form}/images', [FormImagesController::class, 'store'])->name('api.forms.images.store');
    $router->delete('forms/{form}/images', [FormImagesController::class, 'delete'])->name('api.forms.images.delete');

    // Block API Routes
    $router->get('{form}/blocks', [FormBlockController::class, 'index'])->name('api.blocks.index');
    $router->post('{form}/blocks', [FormBlockController::class, 'create'])->name('api.blocks.create');
    $router->post('blocks/{block}', [FormBlockController::class, 'update'])->name('api.blocks.update');
    $router->delete('blocks/{block}', [FormBlockController::class, 'delete'])->name('api.blocks.delete');

    // Interaction API Routes
    $router->post('{block}/interactions', [FormBlockInteractionController::class, 'create'])->name('api.interactions.create');
    $router->post('interactions/{interaction}', [FormBlockInteractionController::class, 'update'])->name('api.interactions.update');
    $router->delete('interactions/{interaction}', [FormBlockInteractionController::class, 'delete'])->name('api.interactions.delete');

    // Logic API Routes
    $router->post('{block}/logic', [FormBlockLogicController::class, 'create'])->name('api.logics.create');
    $router->post('logic/{logic}', [FormBlockLogicController::class, 'update'])->name('api.logics.update');
    $router->delete('logic/{logic}', [FormBlockLogicController::class, 'delete'])->name('api.logics.delete');

    // Sequence Routes
    $router->post('{form}/blocks/sequence', FormBlockSequenceController::class)->name('api.blocks.sequence');
    $router->post('{block}/interactions/sequence', FormBlockInteractionSequenceController::class)->name('api.interactions.sequence');

    // Template API Routes
    $router->get('forms/{form}/template-export', FormTemplateExportController::class)->name('api.forms.template-export');
    $router->post('forms/{form}/template-import', FormTemplateImportController::class)->name('api.forms.template-import');

    // Form Submissions API Routes
    $router->get('forms/{form}/submissions', FormSubmissionsController::class)->name('api.forms.submissions');
    $router->delete('forms/{form}/submissions/{session}', DeleteFormSubmissionController::class)->name('api.forms.submissions.delete');
    $router->post('forms/{form}/purge-results', PurgeFormSubmissionsController::class)->name('api.forms.purge-results');

    // Form Block Mapping is just a helper to discover block & interaction type matches
    $router->get('form-blocks/mapping', FormBlockMappingController::class)->name('api.form-blocks.mapping');
});
