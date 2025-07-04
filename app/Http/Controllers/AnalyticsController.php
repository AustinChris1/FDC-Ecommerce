<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Visit;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AnalyticsController extends Controller
{
    public function dashboard()
    {
        $startDate = date('Y-m-d H:i:s', strtotime('-6 days midnight'));

        // Fetch all visits within the last 7 days (including today) using Eloquent
        $recentVisits = Visit::where('visited_at', '>=', $startDate)
            ->get();

        // Consider a reasonable time frame (e.g., last 30/90 days) for allVisits
        // if your 'visits' table is very large to prevent performance issues.
        // For now, it fetches all, which might be slow on large datasets.
        $allVisits = Visit::all();

        // 1. Visitors by day (last 7 days)
        $visitorsPerDayRaw = [];
        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-$i days"));
            $visitorsPerDayRaw[$date] = 0; // Initialize all 7 days to 0
        }
        foreach ($recentVisits as $visit) {
            $date = date('Y-m-d', strtotime($visit->visited_at));
            $visitorsPerDayRaw[$date]++;
        }
        $visitorsPerDay = collect($visitorsPerDayRaw)->map(function ($count, $date) {
            return ['date' => $date, 'count' => $count];
        })->values()->all();


        // 2. Top Locations (Countries)
        $locationsRaw = [];
        foreach ($allVisits as $visit) {
            $country = $visit->country ?? 'Unknown';
            $locationsRaw[$country] = ($locationsRaw[$country] ?? 0) + 1;
        }
        $topLocations = collect($locationsRaw)
            ->map(function ($count, $location) {
                return ['location' => $location, 'count' => $count];
            })
            ->sortByDesc('count')
            ->take(5)
            ->values()
            ->all();

        // 3. Most Active Hours
        $activeHoursRaw = [];
        foreach ($recentVisits as $visit) {
            $hour = date('H', strtotime($visit->visited_at));
            $activeHoursRaw[$hour] = ($activeHoursRaw[$hour] ?? 0) + 1;
        }
        $mostActiveHours = collect($activeHoursRaw)
            ->map(function ($count, $hour) {
                return ['hour' => (int)$hour, 'count' => $count];
            })
            ->sortBy('hour')
            ->values()
            ->all();

        // --- Existing Metrics ---

        // 4. Total Unique IPs
        $totalUniqueIPs = $allVisits->unique('ip')->count();

        // 5. Top Cities
        $citiesRaw = [];
        foreach ($allVisits as $visit) {
            $city = $visit->city ?? 'Unknown';
            $citiesRaw[$city] = ($citiesRaw[$city] ?? 0) + 1;
        }
        $topCities = collect($citiesRaw)
            ->map(function ($count, $city) {
                return ['city' => $city, 'count' => $count];
            })
            ->sortByDesc('count')
            ->take(5)
            ->values()
            ->all();

        // 6. Top Devices (still based on full User-Agent, but can be improved with parsing)
        $devicesRaw = [];
        foreach ($allVisits as $visit) {
            // Note: This still uses the raw 'device' (User-Agent) from the DB.
            // If you want parsed device names for this dashboard widget,
            // you'd need to either store the parsed name in the DB, or parse it here for each visit.
            $device = $visit->device ?? 'Unknown';
            $devicesRaw[$device] = ($devicesRaw[$device] ?? 0) + 1;
        }
        $topDevices = collect($devicesRaw)
            ->map(function ($count, $device) {
                return ['device' => $device, 'count' => $count];
            })
            ->sortByDesc('count')
            ->take(5)
            ->values()
            ->all();

        // 7. Top Platforms (now stores device name/model from the updated trackVisitor)
        $platformsRaw = [];
        foreach ($allVisits as $visit) {
            // This now uses the 'platform' column, which will store "Device Name (Model)"
            $platform = $visit->platform ?? 'Unknown';
            $platformsRaw[$platform] = ($platformsRaw[$platform] ?? 0) + 1;
        }
        $topPlatforms = collect($platformsRaw)
            ->map(function ($count, $platform) {
                return ['platform' => $platform, 'count' => $count];
            })
            ->sortByDesc('count')
            ->take(5)
            ->values()
            ->all();

        return response()->json([
            'visitors_per_day' => $visitorsPerDay,
            'top_locations' => $topLocations,
            'most_active_hours' => $mostActiveHours,
            'total_visits' => count($recentVisits),
            'total_unique_ips' => $totalUniqueIPs,
            'top_cities' => $topCities,
            'top_devices' => $topDevices,
            'top_platforms' => $topPlatforms,
        ]);
    }


    public function trackVisitor(Request $request)
    {
        $ip = $request->ip();
        $userAgent = $request->header('User-Agent');

        $country = 'Unknown';
        $city = 'Unknown';
        // Define the window for unique visits (e.g., 24 hours)
        $uniqueVisitorWindowHours = 24;

        // Check if this IP has visited recently
        $recentVisit = Visit::where('ip', $ip)
            ->where('created_at', '>=', now()->subHours($uniqueVisitorWindowHours))
            ->first();

        if ($recentVisit) {
            Log::info("Visitor from IP {$ip} already tracked within the last {$uniqueVisitorWindowHours} hours. Skipping.");
            return response()->json(['message' => 'Visitor already tracked recently'], 200);
        }
        try {
            $geo = Http::timeout(3)->get("https://ipapi.co/{$ip}/json")->json();
            $country = $geo['country_name'] ?? 'Unknown';
            $city = $geo['city'] ?? 'Unknown';
        } catch (\Exception $e) {
            Log::error("GeoIP lookup failed for IP: {$ip}.");
        }

        $platformInfo = 'Unknown Platform';
        $deviceName = 'Unknown Device';
        $deviceModel = '';
        $osName = 'Unknown OS';
        $osVersion = '';
        $browserName = 'Unknown Browser';
        $browserVersion = '';

        // --- OS Detection ---
        if (preg_match('/Windows NT (\d+\.\d+)/i', $userAgent, $matches)) {
            $osName = 'Windows';
            if ($matches[1] == '10.0') $osVersion = '10/11';
            elseif ($matches[1] == '6.3') $osVersion = '8.1';
            elseif ($matches[1] == '6.2') $osVersion = '8';
            elseif ($matches[1] == '6.1') $osVersion = '7';
            else $osVersion = $matches[1];
        } elseif (preg_match('/Macintosh; Intel Mac OS X (\d+_\d+_\d+)/i', $userAgent, $matches)) {
            $osName = 'macOS';
            $osVersion = str_replace('_', '.', $matches[1]);
        } elseif (preg_match('/Linux/i', $userAgent) && !preg_match('/Android/i', $userAgent)) {
            $osName = 'Linux';
            // Specific Linux distro parsing would be much more complex.
        } elseif (preg_match('/Android (\d+\.\d+)/i', $userAgent, $matches)) {
            $osName = 'Android';
            $osVersion = $matches[1];
            // Try to get Android device model (very difficult without a large database)
            if (preg_match('/Android.*?;\s*([^\);]+)/i', $userAgent, $modelMatches)) {
                $deviceModel = trim($modelMatches[1]);
            }
            if (preg_match('/Mobile|Mobi|Tablet/i', $userAgent)) {
                $deviceName = 'Android ' . (stripos($userAgent, 'tablet') !== false ? 'Tablet' : 'Phone');
            }
        } elseif (preg_match('/iPad|iPhone|iPod/i', $userAgent, $deviceTypeMatches)) {
            $osName = 'iOS';
            if (preg_match('/CPU (iPhone|iPad) OS (\d+_\d+)/i', $userAgent, $osMatches)) {
                $osVersion = str_replace('_', '.', $osMatches[2]);
            }
            $deviceName = $deviceTypeMatches[0]; // e.g., iPhone, iPad, iPod
            // For iOS models, User-Agent typically doesn't give "iPhone 13", just "iPhone"
            // More specific models would require a lookup table or more complex regex
            if (preg_match('/\((iPhone|iPad); CPU OS (\d+_\d+(?:_\d+)?).*?\)/i', $userAgent, $modelIdentifierMatches)) {
                $deviceModel = $modelIdentifierMatches[1];
            }
        } elseif (preg_match('/CrOS/i', $userAgent)) {
            $osName = 'Chrome OS';
            if (preg_match('/CrOS ([^\s]+)/i', $userAgent, $matches)) {
                $osVersion = $matches[1];
            }
            $deviceName = 'Chromebook';
        }

        // --- Browser Detection ---
        if (preg_match('/(Chrome|CriOS)\/(\d+\.\d+)/i', $userAgent, $matches)) {
            $browserName = 'Chrome';
            $browserVersion = $matches[2];
        } elseif (preg_match('/Firefox\/(\d+\.\d+)/i', $userAgent, $matches)) {
            $browserName = 'Firefox';
            $browserVersion = $matches[1];
        } elseif (preg_match('/(Safari)\/(\d+\.\d+)/i', $userAgent, $matches) && !preg_match('/Chrome/i', $userAgent)) {
            $browserName = 'Safari';
            $browserVersion = $matches[2];
        } elseif (preg_match('/Edge\/(\d+\.\d+)/i', $userAgent, $matches)) {
            $browserName = 'Edge';
            $browserVersion = $matches[1];
        } elseif (preg_match('/MSIE|Trident/i', $userAgent)) {
            $browserName = 'Internet Explorer';
            if (preg_match('/MSIE (\d+\.\d+)/i', $userAgent, $matches)) {
                $browserVersion = $matches[1];
            } elseif (preg_match('/rv:(\d+\.\d+)/i', $userAgent, $matches)) { // IE 11+
                $browserVersion = $matches[1];
            }
        }

        // --- Device Type & PlatformInfo Construction ---
        if (stripos($userAgent, 'bot') !== false || stripos($userAgent, 'crawler') !== false || stripos($userAgent, 'spider') !== false) {
            $platformInfo = 'Robot/Crawler';
            if (preg_match('/(Googlebot|Bingbot|Slurp|DuckDuckBot)/i', $userAgent, $matches)) {
                $platformInfo .= ' (' . $matches[1] . ')';
            }
        } elseif ($osName !== 'Unknown OS') {
            $platformInfo = $osName;
            if (!empty($osVersion)) {
                $platformInfo .= ' ' . $osVersion;
            }
            if (!empty($deviceName) && $deviceName !== 'Unknown Device' && stripos($platformInfo, $deviceName) === false) {
                // Add device name if it's specific and not already implied by OS
                $platformInfo .= ' (' . $deviceName;
                if (!empty($deviceModel) && stripos($platformInfo, $deviceModel) === false) {
                    $platformInfo .= ' ' . $deviceModel;
                }
                $platformInfo .= ')';
            } elseif (!empty($deviceModel) && stripos($platformInfo, $deviceModel) === false) {
                // If no specific deviceName but a model exists
                $platformInfo .= ' (' . $deviceModel . ')';
            }

            // Refine device name for generic OS if a more specific one wasn't found
            if ($osName === 'Windows' || $osName === 'macOS' || $osName === 'Linux' || $osName === 'Chrome OS') {
                $deviceName = 'Desktop';
            } elseif (stripos($userAgent, 'Mobile') !== false || stripos($userAgent, 'Android') !== false || stripos($userAgent, 'iPhone') !== false) {
                $deviceName = 'Mobile Phone';
            } elseif (stripos($userAgent, 'Tablet') !== false || stripos($userAgent, 'iPad') !== false) {
                $deviceName = 'Tablet';
            }
        }

        // Final fallback for platformInfo if still generic
        if ($platformInfo === 'Unknown Platform') {
            if (preg_match('/Mobile|Mobi/i', $userAgent)) {
                $platformInfo = 'Mobile Device';
            } elseif (preg_match('/Tablet/i', $userAgent)) {
                $platformInfo = 'Tablet Device';
            } else {
                $platformInfo = 'Desktop Device';
            }
        }

        Visit::create([
            'ip' => $ip,
            'country' => $country,
            'city' => $city,
            'device' => $deviceName .' '. $deviceModel, 
            'platform' => $platformInfo, 
            'visited_at' => date('Y-m-d H:i:s'),
        ]);

        return response()->json(['message' => 'Visitor tracked successfully'], 200);
    }
}
