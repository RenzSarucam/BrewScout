<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_register(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Jane Barista',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $response->assertStatus(201)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'jane@example.com')
            ->assertJsonPath('data.role', 'user');

        $this->assertDatabaseHas('users', ['email' => 'jane@example.com']);
    }

    public function test_registration_requires_matching_password_confirmation(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'Jane Barista',
            'email' => 'jane@example.com',
            'password' => 'password123',
            'password_confirmation' => 'nope',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }

    public function test_a_user_can_login_with_correct_credentials(): void
    {
        $user = User::factory()->create([
            'email' => 'jane@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'jane@example.com',
            'password' => 'password123',
        ]);

        $response->assertStatus(200)->assertJsonPath('data.id', $user->id);
        $this->assertAuthenticatedAs($user);
    }

    public function test_login_fails_with_incorrect_credentials(): void
    {
        User::factory()->create([
            'email' => 'jane@example.com',
            'password' => 'password123',
        ]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'jane@example.com',
            'password' => 'wrong-password',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
        $this->assertGuest();
    }

    public function test_an_authenticated_user_can_fetch_their_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->getJson('/api/v1/auth/me');

        $response->assertStatus(200)->assertJsonPath('data.id', $user->id);
    }

    public function test_a_guest_cannot_fetch_the_profile_endpoint(): void
    {
        $response = $this->getJson('/api/v1/auth/me');

        $response->assertStatus(401)->assertJsonPath('success', false);
    }

    public function test_an_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/v1/auth/logout');

        $response->assertStatus(200)->assertJsonPath('success', true);
    }

    public function test_a_guest_cannot_update_their_profile(): void
    {
        $this->putJson('/api/v1/auth/me', ['name' => 'New Name'])->assertStatus(401);
    }

    public function test_a_user_can_update_their_name(): void
    {
        $user = User::factory()->create(['name' => 'Old Name']);

        $response = $this->actingAs($user)->putJson('/api/v1/auth/me', ['name' => 'New Name']);

        $response->assertStatus(200)->assertJsonPath('data.name', 'New Name');
        $this->assertDatabaseHas('users', ['id' => $user->id, 'name' => 'New Name']);
    }

    public function test_updating_the_profile_requires_a_name(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->putJson('/api/v1/auth/me', ['name' => ''])->assertStatus(422);
    }

    public function test_a_guest_cannot_update_their_password(): void
    {
        $this->putJson('/api/v1/auth/me/password', [
            'current_password' => 'password',
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ])->assertStatus(401);
    }

    public function test_a_user_can_change_their_password(): void
    {
        $user = User::factory()->create(['password' => 'old-password123']);

        $response = $this->actingAs($user)->putJson('/api/v1/auth/me/password', [
            'current_password' => 'old-password123',
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ]);

        $response->assertStatus(200)->assertJsonPath('success', true);
        $this->assertTrue(Hash::check('new-password123', $user->fresh()->password));
    }

    public function test_changing_the_password_requires_the_correct_current_password(): void
    {
        $user = User::factory()->create(['password' => 'old-password123']);

        $response = $this->actingAs($user)->putJson('/api/v1/auth/me/password', [
            'current_password' => 'wrong-password',
            'password' => 'new-password123',
            'password_confirmation' => 'new-password123',
        ]);

        $response->assertStatus(422)->assertJsonPath('success', false);
    }
}
