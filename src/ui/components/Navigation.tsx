"use client";

import { useState } from "react";
import { 
  Navbar, 
  NavbarBrand, 
  NavbarContent, 
  NavbarItem, 
  NavbarMenuToggle, 
  NavbarMenu, 
  NavbarMenuItem 
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from "@heroui/dropdown";
import { Avatar } from "@heroui/avatar";
import { useAuth } from "@ui/providers/AuthProvider";

const navigationItems = [
  { name: "Generator", href: "/generator" },
  { name: "Bulk Sets", href: "/generator-sets" },
  { name: "My Games", href: "/my-games" },
  { name: "Statistics", href: "/statistics" },
  { name: "Math Explorer", href: "/possible-combinations" },
  { name: "Winners", href: "/winners-per-state" },
  { name: "Risk Calculator", href: "/education/multi-game-calculator" },
];

export function Navigation() {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isAuthenticated) {
    return null; // Don't show navigation if not authenticated
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <Navbar 
      onMenuOpenChange={setIsMenuOpen}
      className="border-b border-foreground/10"
      maxWidth="full"
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          className="sm:hidden"
        />
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-2">
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              className="text-primary-500"
              fill="currentColor"
            >
              <circle cx="16" cy="16" r="14" className="fill-primary-500" />
              <circle cx="10" cy="10" r="2" className="fill-white" />
              <text x="10" y="12" textAnchor="middle" className="fill-primary-500 text-xs font-bold">7</text>
              <circle cx="22" cy="10" r="2" className="fill-white" />
              <text x="22" y="12" textAnchor="middle" className="fill-primary-500 text-xs font-bold">15</text>
              <circle cx="16" cy="16" r="2" className="fill-white" />
              <text x="16" y="18" textAnchor="middle" className="fill-primary-500 text-xs font-bold">23</text>
              <circle cx="10" cy="22" r="2" className="fill-white" />
              <text x="10" y="24" textAnchor="middle" className="fill-primary-500 text-xs font-bold">11</text>
              <circle cx="22" cy="22" r="2" className="fill-white" />
              <text x="22" y="24" textAnchor="middle" className="fill-primary-500 text-xs font-bold">3</text>
            </svg>
            <span className="font-bold text-xl bg-gradient-to-r from-primary-500 to-secondary-500 bg-clip-text text-transparent">
              EasyLotto
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navigationItems.map((item) => (
          <NavbarItem key={item.href}>
            <Link
              href={item.href}
              className="text-foreground/70 hover:text-foreground transition-colors"
            >
              {item.name}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <Avatar
              as="button"
              className="transition-transform"
              color="primary"
              name={user?.first_name || "User"}
              size="sm"
              src=""
            />
          </DropdownTrigger>
          <DropdownMenu aria-label="Profile Actions" variant="flat">
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">{user?.email}</p>
            </DropdownItem>
            <DropdownItem key="settings">
              Settings
            </DropdownItem>
            <DropdownItem key="help_and_feedback">
              Help & Feedback
            </DropdownItem>
            <DropdownItem key="logout" color="danger" onClick={handleLogout}>
              Log Out
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>

      <NavbarMenu>
        {navigationItems.map((item, index) => (
          <NavbarMenuItem key={`${item.name}-${index}`}>
            <Link
              href={item.href}
              className="w-full text-foreground/70 hover:text-foreground transition-colors"
              size="lg"
            >
              {item.name}
            </Link>
          </NavbarMenuItem>
        ))}
        <NavbarMenuItem>
          <Button
            color="danger"
            variant="flat"
            onClick={handleLogout}
            className="w-full justify-start"
          >
            Log Out
          </Button>
        </NavbarMenuItem>
      </NavbarMenu>
    </Navbar>
  );
}
