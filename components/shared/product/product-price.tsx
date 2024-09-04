import { cn } from "@/lib/utils";

const ProductPrice = ({
  value,
  className,
}: {
  value: number;
  className?: string;
}) => {
  const stringValue = value.toString();
  const [intValue, floatValue] = stringValue.includes(".")
    ? stringValue.split(".")
    : [stringValue, ""];

  return (
    <p className={cn("text-xl", className)}>
      <span>$</span>
      {intValue}
      <span className="text-sm align-super">{floatValue}</span>
    </p>
  );
};

export default ProductPrice;
