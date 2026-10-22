import { useState, useEffect } from "react";

function DelayedFallback({ delay = 300, message = "Loading content..." }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  if (!show) return null;

  return (
    <div className="fallback-container">
      <div className="spinner"></div>
      <p className="loading-text">{message}</p>
    </div>
  );
}

export default DelayedFallback;
