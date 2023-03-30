<?php

namespace App\Jobs;

use App\Models\FormSession;
use Illuminate\Bus\Queueable;
use App\Models\FormIntegration;
use Illuminate\Pipeline\Pipeline;
use Illuminate\Support\Facades\Http;
use Illuminate\Queue\SerializesModels;
use App\Pipes\MergeResponsesIntoSession;
use Illuminate\Queue\InteractsWithQueue;
use App\Http\Resources\FormSessionResource;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;

class CallWebhookJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $session;
    public $integration;

    /**
     * Create a new job instance.
     *
     * @return void
     */
    public function __construct(FormSession $session, FormIntegration $integration)
    {
        $this->session = $session;
        $this->integration = $integration;
    }

    /**
     * Execute the job.
     *
     * @return void
     */
    public function handle()
    {
        $payload = app(Pipeline::class)
            ->send(FormSessionResource::make($this->session)->resolve())
            ->through([
                MergeResponsesIntoSession::class
            ])
            ->thenReturn();

        $response = Http::send($this->integration->webhook_method, $this->integration->webhook_url, [
            'form_params' => $payload,
            'headers' => array_merge([
                'Content-Type' => 'application/json',
            ], $this->integration->headers)
        ]);

        // TODO: we need to somehow track status of the webhook submit in a new table with relation to the session and the integration
    }
}