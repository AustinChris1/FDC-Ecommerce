<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Team;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Validator;

class TeamController extends Controller
{
    //

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'image' => 'required|image|mimes:jpg,jpeg,png|max:2048',   // Validate image as a file
        ]);

        if ($validator->fails()) {
            return response()->json([
                'status' => 422,
                'errors' => $validator->messages(),
            ], 422);
        } else {
            $Team = new Team();

            $Team->name = trim($request->input('name'));
            $Team->role = trim($request->input('role'));

            $Team->status = $request->input('status') == true ? 1 : 0;
            // Handle first image upload
            if ($request->hasFile('image')) {
                $image = $request->file('image');
                $name = time() . '.' . $image->getClientOriginalExtension(); // Fixed extension concatenation
                $destinationPath = 'uploads/teams';
                $image->move($destinationPath, $name);
                $newName1 = $destinationPath . "/" . $name;
                $Team->image = $newName1;
            }

            $Team->save();

            return response()->json([
                'status' => 200,
                'message' => 'Team stored successfully',
            ], 200);
        }
    }

    public function index()
    {
        $teams = Team::all();
        if($teams){
        return response()->json([
            'status' => 200,
            'teams' => $teams
        ], 200);
    } else {
        return response()->json([
            'status' => 404,
            'message' => 'Team not found',
        ]);
    }

    }

    public function edit($id)
    {
        $team = Team::find($id);
        return response()->json([
            'team' => $team
        ], 200);
    }

    public function update(Request $request, $id)
    {
        $team = Team::find($id);
        if ($team) {
            // Handle first image upload
            if ($request->hasFile('image')) {
                $path = $team->image;
                if (File::exists($path)) {
                    File::delete($path);
                }
                $image = $request->file('image');
                $name = time() . '.' . $image->getClientOriginalExtension(); // Fixed extension concatenation
                $destinationPath = 'uploads/teams';
                $image->move($destinationPath, $name);
                $newName1 = $destinationPath . "/" . $name;
                $team->image = $newName1;
            }

            $team->name = $request->name;
            $team->role = $request->role;
            $team->status = $request->status;
            $team->save();

            return response()->json([
                'status' => 200,
                'message' => 'Team updated successfully'
            ], 200);
        } else {
            return response()->json([
                'status' => 404,
                'message' => 'Product not found',
            ], 404);
        }
    }

    public function destroy($id)
    {
        $team = Team::find($id);
        if ($team) {
            $team->delete();
            return response()->json([
                'message' => 'Team deleted successfully'
            ], 200);
        } else {
            return response()->json([
                'message' => 'Team not found'
            ], 404);
        }
    }
}
