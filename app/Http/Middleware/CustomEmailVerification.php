<?php

namespace App\Http\Middleware;

use App\Models\User;

use Illuminate\Auth\Events\Verified;
use Illuminate\Foundation\Http\FormRequest;

class CustomEmailVerification extends FormRequest
{

    public function authorize()
    {
       
        $user = User::findOrFail($this->route('id'));


        if (! hash_equals((string) $this->route('hash'), sha1($user->getEmailForVerification()))) {
            return false;
        }

        return true;
    }

}
