import Image from "next/image";
import Link from "next/link";

import { Card, CardContent, CardHeader } from "@/components/ui/card";

const ProductCard = ({ product }: { product: any }) => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="p-0 items-center">
        <Link href={`/product/${product.slug}`}>
          <Image
            alt={product.name}
            className="aspect-square object-cover rounded-t"
            height={300}
            src={product.images![0]}
            width={300}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-3 grid gap-3">
        <div>
          <p className="text-xs bg-gray-100 w-fit rounded px-2 py-1">
            {product.brand}
          </p>
        </div>
        <div>
          <Link href={`/product/${product.slug}`}>
            <h2 className="text-sm text-muted-foreground line-clamp-1">
              {product.name}
            </h2>
          </Link>
        </div>
        <div className="flex-between gap-4">
          <p>{product.rating} stars</p>
          {product.stock > 0 ? (
            <p className="font-semibold">${product.price}</p>
          ) : (
            <p className="text-destructive text-sm">out of stock</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCard;
