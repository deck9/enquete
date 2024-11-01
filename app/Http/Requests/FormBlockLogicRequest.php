<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FormBlockLogicRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'conditions' => 'required|array',
            'conditions.*.source' => 'required|string',
            'conditions.*.operator' => 'required|string|in:equals,equalsNot,contains,containsNot,isLowerThan,isGreaterThan',
            'conditions.*.value' => 'required|string',
            'conditions.*.chainOperator' => 'required|string|in:and,or',
            'action' => 'required|string|in:hide,show,goto',
            'action_payload' => 'nullable|string',
            'evaluate' => 'required|string|in:before,after',
        ];
    }

    public function messages()
    {
        return [
            'name.required' => 'The name is required.',
            'conditions.required' => 'At least one condition is required.',
            'conditions.*.source.required' => 'The source block for your #:position condition is required.',
            'conditions.*.value.required' => 'The value for your #:position condition is required.',
            'conditions.*.operator.required' => 'The operator for the #:position condition is required.',
            'conditions.*.chainOperator.required' => 'The chain operator for the #:position condition is required.',
            'action.required' => 'The action is required.',
            'evaluate.required' => 'The evaluate is required.',
        ];
    }
}
