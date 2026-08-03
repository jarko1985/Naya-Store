import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/constants";

const badges = [
  { icon: Truck, label: `Free shipping over $${FREE_SHIPPING_THRESHOLD}` },
  { icon: ShieldCheck, label: "Secure payment" },
  { icon: RotateCcw, label: "Easy 28-day returns" },
  { icon: Headphones, label: "24×7 support" },
];

const TrustBadgeRow = ({ className }: { className?: string }) => {
  return (
    <div
      className={cn(
        "grid grid-cols-2 sm:grid-cols-4 gap-3 opacity-80",
        className,
      )}
    >
      {badges.map(({ icon: Icon, label }) => (
        <div
          key={label}
          className="flex items-center gap-2.5 rounded-xl border bg-card p-3 text-sm shadow-sm transition-shadow hover:shadow-md text-slate-800"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="w-4 h-4" strokeWidth={1.5} />
          </span>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
};

export default TrustBadgeRow;
