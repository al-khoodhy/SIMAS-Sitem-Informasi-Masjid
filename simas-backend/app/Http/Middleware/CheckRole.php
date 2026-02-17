<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckRole
{
    /**
     * Handle an incoming request.
     * $roles berisi daftar role yang diizinkan, dipisahkan koma.
     */
    public function handle(Request $request, Closure $next, ...$roles)
    {
        // Pastikan user sudah login
        if (!$request->user()) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        // Cek apakah role user saat ini ada di dalam daftar role yang diizinkan
        if (!in_array($request->user()->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Akses ditolak! Anda tidak memiliki hak akses ke fitur ini.'
            ], 403); // 403 Forbidden
        }

        return $next($request);
    }
}