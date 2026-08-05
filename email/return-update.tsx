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
import type { ReturnStatus } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
require("dotenv").config();

ReturnUpdateEmail.PreviewProps = {
  returnId: crypto.randomUUID(),
  orderId: crypto.randomUUID(),
  status: "approved",
} satisfies ReturnUpdateEmailProps;

type ReturnUpdateEmailProps = {
  returnId: string;
  orderId: string;
  status: ReturnStatus;
  refundAmount?: number | null;
  currency?: string;
};

const COPY: Record<ReturnStatus, { subject: string; heading: string; body: string }> = {
  requested: {
    subject: "We've received your return request",
    heading: "Return request received",
    body: "We've received your return request and will review it shortly.",
  },
  approved: {
    subject: "Your return has been approved",
    heading: "Return approved",
    body: "Your return request has been approved. Please follow the return instructions you were given to ship the item(s) back.",
  },
  rejected: {
    subject: "Update on your return request",
    heading: "Return not approved",
    body: "We're unable to approve this return request. Contact support if you have questions.",
  },
  resolved: {
    subject: "Your refund has been issued",
    heading: "Refund issued",
    body: "Your return has been resolved and a refund has been issued.",
  },
};

export function returnUpdateSubject(status: ReturnStatus) {
  return COPY[status]?.subject ?? "Return update";
}

export default function ReturnUpdateEmail({
  returnId,
  orderId,
  status,
  refundAmount,
  currency,
}: ReturnUpdateEmailProps) {
  const copy = COPY[status];
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
              <Text className="text-gray-500 mt-0 mb-1">Return</Text>
              <Text className="font-semibold mt-0">{returnId}</Text>
              <Text className="text-gray-500 mb-1">Order</Text>
              <Text className="font-semibold mt-0">{orderId}</Text>
              {status === "resolved" && refundAmount != null && currency && (
                <>
                  <Text className="text-gray-500 mb-1">Refund amount</Text>
                  <Text className="font-semibold mt-0">
                    {formatCurrency(refundAmount, currency)}
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
