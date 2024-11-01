<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PublicFormBlockLogicResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->uuid,
            'name' => $this->name,
            'action' => $this->action,
            'evaluate' => $this->evaluate,
            'conditions' => $this->conditions,
            'action_payload' => $this->action_payload,
        ];
    }
}
