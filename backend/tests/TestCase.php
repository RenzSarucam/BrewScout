<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Requests from the SPA's origin are treated as "stateful" by Sanctum,
        // which is what starts the session for cookie-based auth. Mirror that here.
        $this->withHeader('Referer', config('app.frontend_url'));
    }
}
