"use client";

import { useEffect, useState } from "react";
import Button from "@mui/material/Button";

export default function Page() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    console.log("count", count);
  }, [count]);
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      hihi {count}
      <Button
        variant="contained"
        onClick={() => setCount(count + 1)}
      >click</Button>
      
    </div>
  );
}
