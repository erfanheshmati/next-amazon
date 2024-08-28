import Image from "next/image";
import Link from "next/link";
import { APP_NAME } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { ShoppingCart, UserIcon } from "lucide-react";

const Header = async () => {
  return (
    <header className="w-full border-b">
      <div className="wrapper flex-between">
        <div className="flex-start">
          <Link href="/" className="flex-start">
            <Image
              src="/assets/icons/logo.svg"
              width={48}
              height={48}
              alt={`${APP_NAME} logo`}
            />
            <span className="font-bold ml-1">{APP_NAME}</span>
          </Link>
        </div>
        <div className="space-x-2">
          <Button asChild variant="ghost">
            <Link href="/cart">
              <ShoppingCart />
              <span className="ml-1">Cart</span>
            </Link>
          </Button>
          <Button asChild>
            <Link href="/login">
              <UserIcon />
              <span className="ml-1">Sign in</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
