import {
  Scale,
  Landmark,
  DoorOpen,
  Heart,
  Users,
  Network,
  Phone,
  MessageSquare,
  Share2,
  Shield,
  Home,
  HeartPulse,
  Wallet,
  Ear,
  ClipboardList,
  PersonStanding,
  HelpCircle,
} from 'lucide-vue-next';
import type { Component } from 'vue';

// String-keyed registry of every Lucide icon used across the card grids
// (Services / Partners / Home / Resources) and process step blocks.
// Sanity docs store the string key (e.g. "Scale", "DoorOpen") and the
// template renders the component. Add a new key here when adding a new
// icon to any grid or block.
export const lucideIconMap: Record<string, Component> = {
  Scale,
  Landmark,
  DoorOpen,
  Heart,
  Users,
  Network,
  Phone,
  MessageSquare,
  Share2,
  Shield,
  Home,
  HeartPulse,
  Wallet,
  Ear,
  ClipboardList,
  PersonStanding,
};

export const FALLBACK_ICON: Component = HelpCircle;

export function getLucideIcon(name: string | null | undefined): Component {
  if (!name) return FALLBACK_ICON;
  return lucideIconMap[name] || FALLBACK_ICON;
}
