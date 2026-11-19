import { useRef, useState } from "react";

function AsyncActionButton({
  children,
  onClick,
  disabled = false,
  loadingText = "Processing...",
  type = "button",
  className = "",
  ...props
}) {
  const [isProcessing, setIsProcessing] = useState(false);
  const processingRef = useRef(false);

  const handleClick = async (event) => {
    if (processingRef.current || disabled) {
      event.preventDefault();
      return;
    }

    if (!onClick) return;

    processingRef.current = true;
    setIsProcessing(true);
    try {
      await onClick(event);
    } finally {
      processingRef.current = false;
      setIsProcessing(false);
    }
  };

  return (
    <button
      {...props}
      type={type}
      onClick={handleClick}
      disabled={disabled || isProcessing}
      aria-busy={isProcessing}
      className={`${className} disabled:cursor-wait disabled:opacity-60`}
    >
      {isProcessing ? (
        <span role="status" className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
          <span aria-hidden="true" className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          {loadingText}
        </span>
      ) : children}
    </button>
  );
}

export default AsyncActionButton;
