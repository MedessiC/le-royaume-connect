import axios from 'axios';
import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query } from '../db/connection.js';
import logger from '../utils/logger.js';
import { PaymentRequest } from '../utils/validation.js';
import { AuthRequest } from '../middleware/auth.js';

const FEEPAY_API_KEY = process.env.FEEPAY_API_KEY;
const FEEPAY_SHOP_ID = process.env.FEEPAY_SHOP_ID;

const FEEPAY_ENDPOINTS = {
  mtn: 'https://api-v2.feexpay.me/api/transactions/public/requesttopay/mtn',
  moov: 'https://api-v2.feexpay.me/api/transactions/public/requesttopay/moov',
  celtiis: 'https://api-v2.feexpay.me/api/transactions/public/requesttopay/celtiis_bj',
};

export async function createPayment(
  req: AuthRequest,
  res: Response
) {
  const paymentId = uuidv4();
  const userId = req.user?.id;

  try {
    const {
      phoneNumber,
      amount,
      network,
      description = 'Donation MILLENIUM',
      firstName,
      lastName,
    } = req.body as PaymentRequest;

    // Create payment record in database
    const paymentResult = await query(
      `INSERT INTO payments (
        id, user_id, phone_number, amount, network, 
        status, description, first_name, last_name
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        paymentId,
        userId,
        phoneNumber,
        amount,
        network,
        'pending',
        description,
        firstName || null,
        lastName || null,
      ]
    );

    logger.info(`Payment created: ${paymentId} for user ${userId}`);

    // Call FeePay API
    const feepayResponse = await axios.post(
      FEEPAY_ENDPOINTS[network as keyof typeof FEEPAY_ENDPOINTS],
      {
        phone: phoneNumber,
        amount: amount,
        description: description,
        shopId: FEEPAY_SHOP_ID,
        reference: paymentId,
        callback_url: `${process.env.API_URL}/api/payments/${paymentId}/webhook`,
      },
      {
        headers: {
          'FEEPAY-AUTH': FEEPAY_API_KEY,
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    // Update payment with FeePay transaction ID
    await query(
      'UPDATE payments SET feepay_transaction_id = $1 WHERE id = $2',
      [feepayResponse.data.transactionId, paymentId]
    );

    logger.info(`FeePay transaction created: ${feepayResponse.data.transactionId}`);

    res.status(201).json({
      paymentId,
      feepayTransactionId: feepayResponse.data.transactionId,
      status: 'pending',
      ...feepayResponse.data,
    });
  } catch (error: any) {
    logger.error(`Payment creation failed: ${paymentId}`, error);

    // Update payment status to failed
    if (paymentId) {
      await query(
        'UPDATE payments SET status = $1 WHERE id = $2',
        ['failed', paymentId]
      ).catch(e => logger.error('Failed to update payment status', e));
    }

    if (error.response?.status === 400) {
      return res.status(400).json({
        error: error.response.data?.message || 'Invalid payment parameters',
        code: error.response.data?.code,
      });
    }

    if (error.code === 'ECONNABORTED') {
      return res.status(503).json({
        error: 'Payment service timeout. Please try again.',
      });
    }

    res.status(500).json({
      error: 'Failed to process payment',
      paymentId,
    });
  }
}

export async function getPaymentStatus(
  req: AuthRequest,
  res: Response
) {
  try {
    const { paymentId } = req.params;
    const userId = req.user?.id;

    const result = await query(
      `SELECT * FROM payments 
       WHERE id = $1 AND user_id = $2`,
      [paymentId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    const payment = result.rows[0];

    // If pending, check status with FeePay
    if (payment.status === 'pending' && payment.feepay_transaction_id) {
      try {
        const feepayStatus = await axios.get(
          `https://api-v2.feexpay.me/api/transactions/public/${payment.feepay_transaction_id}`,
          {
            headers: { 'FEEPAY-AUTH': FEEPAY_API_KEY },
            timeout: 5000,
          }
        );

        // Update payment status if changed
        if (feepayStatus.data.status !== payment.status) {
          await query(
            'UPDATE payments SET status = $1, updated_at = NOW() WHERE id = $2',
            [feepayStatus.data.status, paymentId]
          );
          payment.status = feepayStatus.data.status;
        }
      } catch (error) {
        logger.warn(`Failed to fetch FeePay status for ${paymentId}`, error);
      }
    }

    res.json(payment);
  } catch (error) {
    logger.error('Get payment status error:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
}

export async function webhookPaymentStatus(
  req: any,
  res: Response
) {
  try {
    const { paymentId } = req.params;
    const { status, transactionId } = req.body;

    // Verify webhook source (you should add signature verification)
    if (!transactionId) {
      return res.status(400).json({ error: 'Invalid webhook payload' });
    }

    // Update payment status
    await query(
      `UPDATE payments 
       SET status = $1, feepay_transaction_id = $2, updated_at = NOW() 
       WHERE id = $3`,
      [status, transactionId, paymentId]
    );

    logger.info(`Payment ${paymentId} status updated to ${status}`);

    res.json({ success: true });
  } catch (error) {
    logger.error('Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
}

export async function getPaymentHistory(
  req: AuthRequest,
  res: Response
) {
  try {
    const userId = req.user?.id;
    const { limit = 10, offset = 0 } = req.query;

    const result = await query(
      `SELECT * FROM payments 
       WHERE user_id = $1 
       ORDER BY created_at DESC 
       LIMIT $2 OFFSET $3`,
      [userId, parseInt(limit as string), parseInt(offset as string)]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM payments WHERE user_id = $1',
      [userId]
    );

    res.json({
      payments: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit: parseInt(limit as string),
      offset: parseInt(offset as string),
    });
  } catch (error) {
    logger.error('Get payment history error:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
}
