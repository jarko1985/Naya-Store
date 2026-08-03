import Menu from "./menu";
import CategoryDrawer from "./category-drawer";
import Search from "./search";
import Logo from "@/components/shared/logo";
import { getMyCart } from "@/lib/actions/cart.actions";
import { CartItem } from "@/types";

const Header = async () => {
  const cart = await getMyCart();
  const cartCount = cart
    ? (cart.items as CartItem[]).reduce((acc, item) => acc + item.qty, 0)
    : 0;

  return (
    <header className="w-full border-b shadow-sm z-20 bg-white">
      <div className="wrapper flex-between">
        <div className="flex-start">
          <CategoryDrawer />
          <Logo size="sm" className="ml-4" />
        </div>
        <div className="hidden md:block">
          <Search />
        </div>
        <Menu cartCount={cartCount} />
      </div>
    </header>
  );
};

export default Header;
