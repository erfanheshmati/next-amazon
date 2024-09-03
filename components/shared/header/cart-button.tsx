import { ShoppingCart } from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMyCart } from "@/lib/actions/cart.actions";

export default async function CartButton() {
  const cart = await getMyCart();

  return (
    <Button asChild variant="ghost">
      <Link href="/cart" className="relative">
        <ShoppingCart />
        {cart && cart.items.length > 0 && (
          <Badge className="absolute top-0 right-0 w-6 h-5 flex justify-center items-center">
            {cart.items.reduce((a, c) => a + c.qty, 0)}
          </Badge>
        )}
      </Link>
    </Button>
  );
}
