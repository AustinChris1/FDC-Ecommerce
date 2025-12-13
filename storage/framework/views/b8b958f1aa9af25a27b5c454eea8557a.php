<?php $__env->startComponent('mail::message'); ?>

<p style="text-align: center;">
<img src="https://spx.firstdigit.com.ng/images/fdcLogo.png" alt="<?php echo e(config('app.name')); ?>" style="max-width: 150px; margin: 0 auto 20px;">
</p>

# Order Update from <?php echo e(config('app.name')); ?>



<?php if(strtolower($order->status) === 'completed'): ?>
<?php $__env->startComponent('mail::panel'); ?>
<p style="text-align: center; color: #10B981; font-weight: bold; font-size: 1.5em; margin: 0;">
    🎉 Your Order Has Been Completed! 🎉
</p>
<?php echo $__env->renderComponent(); ?>
<?php elseif(strtolower($order->status) === 'pending_confirmation'): ?>
<?php $__env->startComponent('mail::panel'); ?>
<p style="text-align: center; color: #F59E0B; font-weight: bold; font-size: 1.5em; margin: 0;">
    ⏳ Order Confirmation Needed: #<?php echo e($order->order_number); ?> ⏳
</p>
<?php echo $__env->renderComponent(); ?>
<?php endif; ?>

Hello **<?php echo e($order->user->name ?? 'Customer'); ?>**,

Your order **#<?php echo e($order->order_number); ?>** has been updated to:

<p style="font-size: 1.2em; font-weight: bold; color: 
<?php echo e(strtolower($order->status) === 'completed' ? '#10B981' : (strtolower($order->status) === 'pending_confirmation' ? '#F59E0B' : '#6B7280')); ?>;">
    <?php echo e(ucwords(str_replace('_', ' ', $order->status))); ?>

</p>


<?php if(strtolower($order->status) === 'completed'): ?>
We're thrilled to let you know that your order has been successfully **completed** and is now ready for delivery! Thank you for choosing us.
<?php elseif(strtolower($order->status) === 'pending_confirmation'): ?>
Your order is currently **pending confirmation**. We may require a quick review or additional information from you. Please check the details below and respond as needed.
<?php endif; ?>

---

## 🧾 Order Summary

<?php $__env->startComponent('mail::table'); ?>
| Detail           | Value                                   |
| :--------------- | :-------------------------------------- |
| **Order No.**    | <?php echo e($order->order_number); ?>              |
| **Total Amount** | ₦<?php echo e(number_format($order->grand_total, 2)); ?> |
| **Payment Method** | <?php echo e(ucwords(str_replace('_', ' ', $order->payment_method))); ?> |
| **Shipping To**  | <?php echo e($order->shipping_address1); ?><br><?php echo e($order->city); ?>, <?php echo e($order->state); ?> <?php echo e($order->zip_code); ?> |
<?php echo $__env->renderComponent(); ?>

---

## 📦 Items Ordered

<?php if(!empty($orderedItems) && is_array($orderedItems)): ?>
<?php $__env->startComponent('mail::table'); ?>
| Item                                                                                               | Qty | Price             |
| :-------------------------------------------------------------------------------------------------- |:--:| :---------------- |
<?php $__currentLoopData = $orderedItems; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
| <?php if(isset($item['image_url'])): ?> <img src="<?php echo e($item['image_url']); ?>" width="50" height="50" alt="<?php echo e($item['name']); ?>" style="vertical-align: middle; border-radius: 4px; margin-right: 8px;"> <?php endif; ?> <?php echo e($item['name']); ?> | <?php echo e($item['qty']); ?> | ₦<?php echo e(number_format($item['price'], 2)); ?> |
<?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
<?php echo $__env->renderComponent(); ?>
<?php else: ?>
<p style="text-align: center; color: #9CA3AF; font-style: italic;">No items listed for this order.</p>
<?php endif; ?>

<?php $__env->startComponent('mail::button', ['url' => url('/user/orders/' . $order->order_number), 'color' => 'primary']); ?>
View Your Full Order
<?php echo $__env->renderComponent(); ?>

If you have any questions, feel free to reach out to our support team.

Thanks for shopping with us!  
**<?php echo e(config('app.name')); ?> Team**
<?php echo $__env->renderComponent(); ?>
<?php /**PATH C:\Users\Admin\Desktop\Sites\Ecom\resources\views/emails/orders/status_update.blade.php ENDPATH**/ ?>