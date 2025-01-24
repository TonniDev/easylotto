import { HeroUIProvider } from "@heroui/react";

export const RootProviders = ({ children }: { children: React.ReactNode }) => {
  return <HeroUIProvider>{children}</HeroUIProvider>;
};
