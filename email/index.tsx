import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import { SENDER_EMAIL, APP_NAME } from '@/lib/constants';
import { Order } from '@/types';
import PurchaseReceiptEmail from './purchase-receipt';
import BackInStockEmail from './back-in-stock';

// Gmail SMTP via an App Password (see GMAIL_APP_PASSWORD in .env) — the "from"
// address must be this same Gmail account, Gmail rejects arbitrary senders.
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SENDER_EMAIL,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendPurchaseReceipt = async ({ order }: { order: Order }) => {
  const html = await render(<PurchaseReceiptEmail order={order} />);
  await transporter.sendMail({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: order.user.email,
    subject: `Order Confirmation ${order.id}`,
    html,
  });
};

export const sendBackInStockAlert = async ({
  email,
  product,
}: {
  email: string;
  product: { name: string; slug: string; images: string[]; price: string };
}) => {
  const html = await render(<BackInStockEmail product={product} />);
  await transporter.sendMail({
    from: `${APP_NAME} <${SENDER_EMAIL}>`,
    to: email,
    subject: `${product.name} is back in stock!`,
    html,
  });
};
