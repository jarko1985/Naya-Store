import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { SERVER_URL } from "@/lib/constants";
import type { ShipmentStatus } from "@/lib/constants";
require("dotenv").config();

ShipmentUpdateEmail.PreviewProps = {
  orderId: crypto.randomUUID(),
  status: "shipped",
  carrier: "UPS",
  trackingNumber: "1Z999AA10123456784",
} satisfies ShipmentUpdateEmailProps;

type ShipmentUpdateEmailProps = {
  orderId: string;
  status: ShipmentStatus;
  carrier?: string | null;
  trackingNumber?: string | null;
};

const COPY: Record<
  Exclude<ShipmentStatus, "pending">,
  { subject: string; heading: string; body: string }
> = {
  shipped: {
    subject: "Your order has shipped",
    heading: "It's on its way!",
    body: "Your order has shipped and is headed your way.",
  },
  out_for_delivery: {
    subject: "Your order is out for delivery",
    heading: "Almost there!",
    body: "Your order is out for delivery and should arrive today.",
  },
  delivered: {
    subject: "Your order has been delivered",
    heading: "Delivered!",
    body: "Your order has been delivered. We hope you love it.",
  },
};

export function shipmentUpdateSubject(status: ShipmentStatus) {
  return COPY[status as Exclude<ShipmentStatus, "pending">]?.subject ?? "Order update";
}

export default function ShipmentUpdateEmail({
  orderId,
  status,
  carrier,
  trackingNumber,
}: ShipmentUpdateEmailProps) {
  const copy = COPY[status as Exclude<ShipmentStatus, "pending">];
  const orderUrl = `${SERVER_URL}/order/${orderId}`;

  return (
    <Html>
      <Preview>{copy.body}</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>{copy.heading}</Heading>
            <Text>{copy.body}</Text>
            <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4">
              <Text className="text-gray-500 mt-0 mb-1">Order</Text>
              <Text className="font-semibold mt-0">{orderId}</Text>
              {(carrier || trackingNumber) && (
                <>
                  <Text className="text-gray-500 mb-1">Tracking</Text>
                  <Text className="font-semibold mt-0">
                    {[carrier, trackingNumber].filter(Boolean).join(" — ")}
                  </Text>
                </>
              )}
              <Button
                href={orderUrl}
                className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold"
              >
                View order
              </Button>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
