@component('mail::message')
{{-- Optional branding logo --}}
<p style="text-align: center;">
<img src="https://spx.firstdigit.com.ng/images/fdcLogo.png" alt="{{ config('app.name') }}" style="max-width: 150px; margin: 0 auto 20px;">
</p>

# Order Update from {{ config('app.name') }}

{{-- Dynamic Status Panel --}}
@if(strtolower($order->status) === 'completed')
@component('mail::panel')
<p style="text-align: center; color: #10B981; font-weight: bold; font-size: 1.5em; margin: 0;">
    🎉 Your Order Has Been Completed! 🎉
</p>
@endcomponent
@elseif(strtolower($order->status) === 'pending_confirmation')
@component('mail::panel')
<p style="text-align: center; color: #F59E0B; font-weight: bold; font-size: 1.5em; margin: 0;">
    ⏳ Order Confirmation Needed: #{{ $order->order_number }} ⏳
</p>
@endcomponent
@endif

Hello **{{ $order->user->name ?? 'Customer' }}**,

Your order **#{{ $order->order_number }}** has been updated to:

<p style="font-size: 1.2em; font-weight: bold; color: 
{{ strtolower($order->status) === 'completed' ? '#10B981' : (strtolower($order->status) === 'pending_confirmation' ? '#F59E0B' : '#6B7280') }};">
    {{ ucwords(str_replace('_', ' ', $order->status)) }}
</p>

{{-- Conditional message --}}
@if(strtolower($order->status) === 'completed')
We're thrilled to let you know that your order has been successfully **completed** and is now ready for delivery! Thank you for choosing us.
@elseif(strtolower($order->status) === 'pending_confirmation')
Your order is currently **pending confirmation**. We may require a quick review or additional information from you. Please check the details below and respond as needed.
@endif

---

## 🧾 Order Summary

@component('mail::table')
| Detail           | Value                                   |
| :--------------- | :-------------------------------------- |
| **Order No.**    | {{ $order->order_number }}              |
| **Total Amount** | ₦{{ number_format($order->grand_total, 2) }} |
| **Payment Method** | {{ ucwords(str_replace('_', ' ', $order->payment_method)) }} |
| **Shipping To**  | {{ $order->shipping_address1 }}<br>{{ $order->city }}, {{ $order->state }} {{ $order->zip_code }} |
@endcomponent

---

## 📦 Items Ordered

@if(!empty($orderedItems) && is_array($orderedItems))
@component('mail::table')
| Item                                                                                               | Qty | Price             |
| :-------------------------------------------------------------------------------------------------- |:--:| :---------------- |
@foreach($orderedItems as $item)
| @if(isset($item['image_url'])) <img src="{{ $item['image_url'] }}" width="50" height="50" alt="{{ $item['name'] }}" style="vertical-align: middle; border-radius: 4px; margin-right: 8px;"> @endif {{ $item['name'] }} | {{ $item['qty'] }} | ₦{{ number_format($item['price'], 2) }} |
@endforeach
@endcomponent
@else
<p style="text-align: center; color: #9CA3AF; font-style: italic;">No items listed for this order.</p>
@endif

@component('mail::button', ['url' => url('/user/orders/' . $order->order_number), 'color' => 'primary'])
View Your Full Order
@endcomponent

If you have any questions, feel free to reach out to our support team.

Thanks for shopping with us!  
**{{ config('app.name') }} Team**
@endcomponent
