import { NextUIProvider } from "@nextui-org/react";

export const RootProviders = ({ children }: { children: React.ReactNode }) => {
  return <NextUIProvider>{children}</NextUIProvider>;
};
