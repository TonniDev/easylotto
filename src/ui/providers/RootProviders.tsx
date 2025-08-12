import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from "./AuthProvider";

export const RootProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <HeroUIProvider className="min-h-full">
      <AuthProvider>
        {children}
      </AuthProvider>
    </HeroUIProvider>
  );
};
