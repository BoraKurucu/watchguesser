"use client";

import { useState, useEffect, useRef } from "react";

export function useTimer(
  initial: number,
  running: boolean,
  onExpire: () => void,
  resetKey: number = 0
) {
  const [timeLeft, setTimeLeft] = useState(initial);
  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  // Single effect: manages reset, countdown, and expiration
  // Using a local variable avoids the stale-state race condition
  // that occurred when two separate effects shared async state.
  useEffect(() => {
    // Always reset display to initial on new round
    setTimeLeft(initial);

    if (!running) return;

    let remaining = initial;

    const id = setInterval(() => {
      remaining -= 1;
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(id);
        onExpireRef.current();
      }
    }, 1000);

    return () => clearInterval(id);
  }, [resetKey, initial, running]);

  return timeLeft;
}
