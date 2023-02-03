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
<<<<<<< HEAD
    twitter: "https://twitter.com/heyanonxyz",
    github: "https://github.com/vb7401/heyauthn",
    docs: "https://github.com/vb7401/heyauthn",
=======
    twitter: "https://twitter.com/shadcn",
    github: "https://github.com/vb7401/heyauthn",
    docs: "https://ui.shadcn.com",
>>>>>>> 9364f8bf78dc5c6c196fd18565cdcd39d07157f0
  },
}
