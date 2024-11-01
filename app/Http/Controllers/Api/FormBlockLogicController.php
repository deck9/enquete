<?php

namespace App\Http\Controllers\Api;

use App\Models\FormBlock;
use App\Models\FormBlockLogic;
use App\Http\Controllers\Controller;
use App\Http\Requests\FormBlockLogicRequest;

class FormBlockLogicController extends Controller
{
    public function create(FormBlockLogicRequest $request, FormBlock $block)
    {
        return response()->json($block->formBlockLogics()->create($request->validated()), 201);
    }

    public function update(FormBlockLogicRequest $request, FormBlockLogic $logic)
    {
        return response()->json($logic->update($request->validated()));
    }

    public function delete(FormBlockLogic $logic)
    {
        $logic->delete();

        return response()->json(null, 200);
    }
}
