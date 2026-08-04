import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { formatCurrency } from "@/lib/utils";
import { SERVER_URL } from "@/lib/constants";
import sampleData from "@/db/sample-data";
require("dotenv").config();

BackInStockEmail.PreviewProps = {
  product: {
    name: sampleData.products[0].name,
    slug: sampleData.products[0].slug,
    images: sampleData.products[0].images,
    price: sampleData.products[0].price.toString(),
  },
} satisfies BackInStockEmailProps;

type BackInStockEmailProps = {
  product: {
    name: string;
    slug: string;
    images: string[];
    price: string;
  };
};

export default function BackInStockEmail({ product }: BackInStockEmailProps) {
  const productUrl = `${`https://naya-store.vercel.app`}/product/${product.slug}`;

  return (
    <Html>
      <Preview>{product.name} is back in stock</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-white">
          <Container className="max-w-xl">
            <Heading>Good news — it&apos;s back!</Heading>
            <Text>
              {product.name} is back in stock. Grab it before it sells out
              again.
            </Text>
            <Section className="border border-solid border-gray-500 rounded-lg p-4 md:p-6 my-4 text-center">
              <Img
                width="160"
                alt={product.name}
                className="rounded mx-auto"
                src={
                  product.images[0]?.startsWith("/")
                    ? `${SERVER_URL}${product.images[0]}`
                    : product.images[0]
                }
              />
              <Text className="text-lg font-semibold mb-0">{product.name}</Text>
              <Text className="text-gray-500 mt-0">
                {formatCurrency(product.price)}
              </Text>
              <Button
                href={productUrl}
                className="bg-black text-white px-6 py-3 rounded-full text-sm font-semibold"
              >
                Shop now
              </Button>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
