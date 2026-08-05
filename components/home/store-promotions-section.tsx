"use client";

import {
  Truck,
  ShieldCheck,
  Gift,
  Award,
  Zap,
  Users,
  type LucideIcon,
} from "lucide-react";
import Image from "next/image";
import ScrollStack, { ScrollStackItem } from "@/components/ScrollStack";
import { RETURN_WINDOW_DAYS } from "@/lib/constants";

type Promotion = {
  icon: LucideIcon;
  title: string;
  description: string;
  image: string;
};

const promotions: Promotion[] = [
  {
    icon: Truck,
    title: "Free Shipping",
    description:
      "Enjoy free shipping on all orders over $100 — no code needed, applied automatically at checkout.",
    image: "/images/banners/stack1.jpg",
  },
  {
    icon: ShieldCheck,
    title: `${RETURN_WINDOW_DAYS}-Day Returns`,
    description: `Not in love with it? Return any item within ${RETURN_WINDOW_DAYS} days for a full refund, hassle-free.`,
    image: "/images/banners/stack2.jpg",
  },
  {
    icon: Gift,
    title: "Welcome Offer",
    description:
      "New here? Sign up and get 15% off your first order, delivered straight to your inbox.",
    image: "/images/banners/stack3.jpg",
  },
];

const StorePromotionsSection = () => {
  return (
    <section className="relative mb-12 opacity-85">
      <div className="text-center mb-4">
        <h2 className="text-2xl md:text-3xl font-bold">Why Shop With Us</h2>
        <p className="text-sm text-muted-foreground mt-2">
          A few perks that come with every order
        </p>
      </div>
      <ScrollStack
        useWindowScroll
        itemDistance={15}
        itemScale={0.02}
        itemStackDistance={5}
        baseScale={0.88}
        rotationAmount={0.6}
      >
        {promotions.map(({ icon: Icon, title, description, image }) => (
          <ScrollStackItem
            key={title}
            itemClassName="border border-white/10 text-white overflow-hidden"
          >
            <Image
              src={image}
              alt={title}
              fill
              className="object-cover -z-20"
              sizes="(max-width: 768px) 100vw, 800px"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-[#0f172a]/60 to-[#0f172a]/20 -z-10" />
            <div className="relative h-full flex flex-col justify-center">
              <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mb-4 backdrop-blur-sm">
                <Icon className="w-6 h-6" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold mb-2">{title}</h3>
              <p className="text-gray-200 max-w-lg">{description}</p>
            </div>
          </ScrollStackItem>
        ))}
      </ScrollStack>
    </section>
  );
};

export default StorePromotionsSection;
