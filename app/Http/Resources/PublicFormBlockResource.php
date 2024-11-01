<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\PublicFormBlockLogicResource;

class PublicFormBlockResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return array|\Illuminate\Contracts\Support\Arrayable|\JsonSerializable
     */
    public function toArray($request)
    {
        $logics = $this->formBlockLogics;
        $interactions = $this->activeInteractions;

        if ($this->options && $this->options['randomize_responses'] === true) {
            $interactions = $this->activeInteractions->filter(fn ($value) => $value->name !== 'alt_response')->shuffle();

            $customResponse = $this->activeInteractions->filter(fn ($value) => $value->name === 'alt_response')->first();

            if ($customResponse) {
                $interactions[] = $customResponse;
            }
        }

        return [
            'id' => $this->uuid,
            'type' => $this->type->value,
            'title' => $this->title,
            'message' => $this->message,
            'is_required' => $this->is_required,
            'parent_block' => $this->parent_block,
            'interactions' => PublicFormBlockInteractionResource::collection($interactions),
            'logics' => PublicFormBlockLogicResource::collection($logics),
        ];
    }
}
