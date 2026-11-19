import { useState } from "react";

function PasswordInput({ className = "", ...inputProps }) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative w-full">
      <input
        {...inputProps}
        type={isVisible ? "text" : "password"}
        className={`${className} pr-16`}
      />
      <button
        type="button"
        onClick={() => setIsVisible((visible) => !visible)}
        aria-label={isVisible ? "Hide password" : "Show password"}
        aria-pressed={isVisible}
        className="absolute inset-y-0 right-2 my-auto h-8 rounded px-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
      >
        {isVisible ? "Hide" : "Show"}
      </button>
    </div>
  );
}

export default PasswordInput;
