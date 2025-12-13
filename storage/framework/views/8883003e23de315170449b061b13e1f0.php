<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>POS Sale Notification</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa;">
        <tr>
            <td align="center" style="padding: 40px 0;">
                <table role="presentation" style="width: 600px; border-collapse: collapse; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); overflow: hidden;">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                                💰 POS Sale Alert
                            </h1>
                            <p style="margin: 10px 0 0 0; color: #ffe6f0; font-size: 16px;">
                                <?php echo e($order->order_number); ?>

                            </p>
                        </td>
                    </tr>

                    <!-- Status Badge -->
                    <tr>
                        <td style="padding: 30px 30px 0 30px; text-align: center;">
                            <div style="display: inline-block; background-color: <?php echo e($statusColor); ?>; color: #ffffff; padding: 12px 30px; border-radius: 25px; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
                                <?php echo e($statusLabel); ?>

                            </div>
                        </td>
                    </tr>

                    <!-- Cashier Information (Highlighted) -->
                    <tr>
                        <td style="padding: 30px;">
                            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px; padding: 25px; text-align: center; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                                <h3 style="margin: 0 0 15px 0; color: #ffffff; font-size: 16px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">
                                    👤 Processed By
                                </h3>
                                <p style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 700;">
                                    <?php echo e($cashierName); ?>

                                </p>
                                <?php if($cashier): ?>
                                <p style="margin: 10px 0 0 0; color: #e0d4ff; font-size: 15px;">
                                    <?php echo e($cashierEmail); ?>

                                </p>
                                <?php endif; ?>
                            </div>
                        </td>
                    </tr>

                    <!-- Location & Sale Details -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 15px; background-color: #fff8e1; border-radius: 8px; border-left: 4px solid #ffc107;">
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <span style="display: inline-block; color: #f57c00; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                                                        📍 Sale Location
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 8px 0;">
                                                    <p style="margin: 0; color: #2c3e50; font-size: 18px; font-weight: 700;">
                                                        <?php echo e($order->location ? $order->location->name : 'N/A'); ?>

                                                    </p>
                                                    <?php if($order->location && $order->location->address): ?>
                                                    <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 14px;">
                                                        <?php echo e($order->location->address); ?>

                                                    </p>
                                                    <?php endif; ?>
                                                    <?php if($order->location && $order->location->phone): ?>
                                                    <p style="margin: 5px 0 0 0; color: #6c757d; font-size: 14px;">
                                                        📞 <?php echo e($order->location->phone); ?>

                                                    </p>
                                                    <?php endif; ?>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Customer Details -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px; font-weight: 700;">Customer Information</h3>
                            <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 15px; background-color: #f8f9fc; border-radius: 8px;">
                                        <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                            <tr>
                                                <td style="padding: 8px 0; color: #6c757d; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                    Customer Name
                                                </td>
                                                <td style="padding: 8px 0; color: #2c3e50; font-size: 15px; font-weight: 600; text-align: right;">
                                                    <?php echo e($order->full_name ?? 'Walk-in Customer'); ?>

                                                </td>
                                            </tr>
                                            <?php if($order->email): ?>
                                            <tr>
                                                <td style="padding: 8px 0; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                    Email
                                                </td>
                                                <td style="padding: 8px 0; border-top: 1px solid #e9ecef; color: #2c3e50; font-size: 15px; text-align: right;">
                                                    <?php echo e($order->email); ?>

                                                </td>
                                            </tr>
                                            <?php endif; ?>
                                            <?php if($order->phone): ?>
                                            <tr>
                                                <td style="padding: 8px 0; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                    Phone
                                                </td>
                                                <td style="padding: 8px 0; border-top: 1px solid #e9ecef; color: #2c3e50; font-size: 15px; text-align: right;">
                                                    <?php echo e($order->phone); ?>

                                                </td>
                                            </tr>
                                            <?php endif; ?>
                                            <tr>
                                                <td style="padding: 8px 0; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                    Payment Method
                                                </td>
                                                <td style="padding: 8px 0; border-top: 1px solid #e9ecef; color: #2c3e50; font-size: 15px; text-align: right;">
                                                    <span style="background-color: #e7f3ff; color: #0066cc; padding: 4px 12px; border-radius: 12px; font-size: 13px; font-weight: 600;">
                                                        <?php echo e(strtoupper(str_replace('_', ' ', $order->payment_method))); ?>

                                                    </span>
                                                </td>
                                            </tr>
                                            <?php if($order->amount_paid > 0): ?>
                                            <tr>
                                                <td style="padding: 8px 0; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">
                                                    Amount Paid
                                                </td>
                                                <td style="padding: 8px 0; border-top: 1px solid #e9ecef; color: #28a745; font-size: 15px; font-weight: 700; text-align: right;">
                                                    ₦<?php echo e(number_format($order->amount_paid, 2)); ?>

                                                </td>
                                            </tr>
                                            <?php endif; ?>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Order Items -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 18px; font-weight: 700;">Order Items</h3>
                            <table role="presentation" style="width: 100%; border-collapse: collapse; border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">
                                <thead>
                                    <tr style="background-color: #f8f9fc;">
                                        <th style="padding: 12px; text-align: left; color: #6c757d; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e9ecef;">Product</th>
                                        <th style="padding: 12px; text-align: center; color: #6c757d; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e9ecef;">Qty</th>
                                        <th style="padding: 12px; text-align: right; color: #6c757d; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e9ecef;">Price</th>
                                        <th style="padding: 12px; text-align: right; color: #6c757d; font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #e9ecef;">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <?php $__currentLoopData = $items; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $item): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                                    <tr>
                                        <td style="padding: 12px; color: #2c3e50; font-size: 14px; border-bottom: 1px solid #e9ecef;"><?php echo e($item['name']); ?></td>
                                        <td style="padding: 12px; text-align: center; color: #2c3e50; font-size: 14px; border-bottom: 1px solid #e9ecef;"><?php echo e($item['qty']); ?></td>
                                        <td style="padding: 12px; text-align: right; color: #2c3e50; font-size: 14px; border-bottom: 1px solid #e9ecef;">₦<?php echo e(number_format($item['price'], 2)); ?></td>
                                        <td style="padding: 12px; text-align: right; color: #2c3e50; font-size: 14px; font-weight: 600; border-bottom: 1px solid #e9ecef;">₦<?php echo e(number_format($item['price'] * $item['qty'], 2)); ?></td>
                                    </tr>
                                    <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
                                </tbody>
                            </table>
                        </td>
                    </tr>

                    <!-- Order Summary -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <table role="presentation" style="width: 100%; border-collapse: collapse; background: linear-gradient(135deg, #ffeaa7 0%, #fdcb6e 100%); border-radius: 8px; padding: 20px; box-shadow: 0 3px 10px rgba(253, 203, 110, 0.3);">
                                <tr>
                                    <td style="padding: 8px 15px; color: #2d3436; font-size: 15px;">Subtotal</td>
                                    <td style="padding: 8px 15px; text-align: right; color: #2d3436; font-size: 15px; font-weight: 600;">₦<?php echo e(number_format($order->subtotal, 2)); ?></td>
                                </tr>
                                <?php if($order->discount_amount > 0): ?>
                                <tr>
                                    <td style="padding: 8px 15px; color: #d63031; font-size: 15px; font-weight: 600;">Discount Applied</td>
                                    <td style="padding: 8px 15px; text-align: right; color: #d63031; font-size: 15px; font-weight: 700;">- ₦<?php echo e(number_format($order->discount_amount, 2)); ?></td>
                                </tr>
                                <?php endif; ?>
                                <tr>
                                    <td style="padding: 15px 15px 8px 15px; border-top: 2px solid #dfe6e9; color: #2d3436; font-size: 20px; font-weight: 700;">Grand Total</td>
                                    <td style="padding: 15px 15px 8px 15px; border-top: 2px solid #dfe6e9; text-align: right; color: #00b894; font-size: 24px; font-weight: 700;">₦<?php echo e(number_format($order->grand_total, 2)); ?></td>
                                </tr>
                            </table>
                        </td>
                    </tr>

                    <!-- Sale Timestamp -->
                    <tr>
                        <td style="padding: 0 30px 30px 30px;">
                            <div style="background-color: #e3f2fd; border-left: 4px solid #2196f3; padding: 15px; border-radius: 8px;">
                                <p style="margin: 0; color: #1565c0; font-size: 14px;">
                                    <strong>⏰ Sale Completed:</strong> <?php echo e($order->created_at->format('F j, Y g:i A')); ?>

                                </p>
                            </div>
                        </td>
                    </tr>

                    <!-- Action Button -->
                    <tr>
                        <td style="padding: 0 30px 40px 30px; text-align: center;">
                            <a href="<?php echo e($adminUrl); ?>" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 30px; font-size: 16px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(245, 87, 108, 0.4); transition: all 0.3s ease;">
                                View Full Details
                            </a>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="background-color: #f8f9fc; padding: 30px; text-align: center; border-top: 1px solid #e9ecef;">
                            <p style="margin: 0 0 10px 0; color: #6c757d; font-size: 14px; line-height: 1.6;">
                                ⚡ This is a priority notification sent exclusively to super administrators for POS sales tracking and oversight.
                            </p>
                            <p style="margin: 0; color: #adb5bd; font-size: 13px;">
                                © <?php echo e(date('Y')); ?> SPX Admin Panel. All rights reserved.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html><?php /**PATH C:\Users\Admin\Desktop\Sites\Ecom\resources\views/emails/super-admin-pos-notification.blade.php ENDPATH**/ ?>