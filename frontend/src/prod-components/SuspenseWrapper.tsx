import React from "react";
const { Suspense } = React;
type ReactNode = React.ReactNode;

export const SuspenseWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen bg-black text-white">Loading...</div>}>
      {children}
    </Suspense>
  );
};
