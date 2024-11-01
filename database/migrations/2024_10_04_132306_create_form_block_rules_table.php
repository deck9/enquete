<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class () extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('form_block_logics', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->char('uuid', 36);
            $table->string('name');
            $table->json('conditions');
            $table->string('action');
            $table->json('actionPayload')->nullable();
            $table->string('evaluate')->default('before');
            $table->unsignedBigInteger('form_block_id');
            $table->timestamps();
        });
    }
};
