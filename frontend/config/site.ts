import { NavItem } from "@/types/nav"

interface SiteConfig {
  name: string
  description: string
  mainNav: NavItem[]
  links: {
    twitter: string
    github: string
    docs: string
  }
}

export const siteConfig: SiteConfig = {
  name: "heyauthn!",
  description: "",
  mainNav: [
    {
      title: "",
      href: "",
    },
  ],
  links: {
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/vb7401/heyauthn",
    docs: "https://ui.shadcn.com",
  },
}
