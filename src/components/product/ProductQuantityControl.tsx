"use client";

interface QuantityControlProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export function ProductQuantityControl({
  quantity,
  onIncrement,
  onDecrement,
  onKeyDown,
}: QuantityControlProps) {
  return (
    <div
      className="p-[6px] py-[7px] rounded-lg border border-border-tertiary gap-4 flex justify-center w-fit items-center"
      tabIndex={0}
      role="spinbutton"
      aria-label="Product quantity selector"
      aria-valuenow={quantity}
      aria-valuemin={1}
      aria-valuemax={99}
      onKeyDown={onKeyDown}
    >
      <button
        onClick={onDecrement}
        className="bg-button-secondary-bg hover:bg-button-secondary-bg-hover rounded-md aspect-square h-[24px] flex items-center justify-center"
        aria-label="Decrease quantity"
      >
        -
      </button>

      <span className="text-sm min-w-[20px] text-center">{quantity}</span>

      <button
        onClick={onIncrement}
        className="bg-button-secondary-bg hover:bg-button-secondary-bg-hover rounded-md aspect-square h-[24px] flex items-center justify-center"
        aria-label="Increase quantity"
      >
        +
      </button>
    </div>
  );
}
