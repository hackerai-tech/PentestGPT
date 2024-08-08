export interface ChatStarter {
  title: string
  description: string
  chatMessage: string
}

export interface PluginSummary {
  id: number
  name: string
  selectorName: string
  categories: string[]
  value: PluginID
  icon?: string
  invertInDarkMode?: boolean
  description?: string
  githubRepoUrl?: string
  isInstalled: boolean
  isPremium: boolean
  createdAt: string
  starters: ChatStarter[]
}

export interface Plugin {
  id: PluginID
}

export enum PluginID {
  NONE = "none",
  CVEMAP = "cvemap",
  NUCLEI = "nuclei",
  SUBFINDER = "subfinder",
  KATANA = "katana",
  ENHANCED_SEARCH = "enhancedsearch",
  PLUGINS_STORE = "pluginselector",
  // Tools
  PORTSCANNER = "portscanner",
  LINKFINDER = "linkfinder",
  SSLSCANNER = "sslscanner",
  SQLIEXPLOITER = "sqliexploiter",
  WHOIS = "whois",
  WAFDETECTOR = "wafdetector",
  DNSSCANNER = "dnsscanner",
  // Default tools
  WEB_SEARCH = "websearch",
  CODE_INTERPRETER = "codeinterpreter"
}

export const Plugins: Record<PluginID, Plugin> = Object.fromEntries(
  Object.values(PluginID).map(id => [id, { id }])
) as Record<PluginID, Plugin>

export const PluginList = Object.values(Plugins)

type PluginUrls = Record<string, string>

export const pluginUrls: PluginUrls = {
  PENTESTGPT: "https://github.com/hackerai-tech/PentestGPT",
  CVEMAP: "https://github.com/projectdiscovery/cvemap",
  SUBFINDER: "https://github.com/projectdiscovery/subfinder",
  NUCLEI: "https://github.com/projectdiscovery/nuclei",
  KATANA: "https://github.com/projectdiscovery/katana",
  // Tools
  PORTSCANNER: "https://github.com/projectdiscovery/naabu",
  LINKFINDER: "https://github.com/0xsha/GoLinkFinder",
  SSLSCANNER: "https://github.com/drwetter/testssl.sh/",
  SQLIEXPLOITER: "https://github.com/sqlmapproject/sqlmap",
  WHOIS: "https://www.whois.com/whois/",
  WAFDETECTOR: "https://github.com/EnableSecurity/wafw00f",
  DNSSCANNER: "https://github.com/darkoperator/dnsrecon"
}
