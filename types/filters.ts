export type Filters = {
  sentiment: string
  model: string
  plugin: string
  rag: string
  reviewed: string
  date: string
}

export type FilterOption = {
  value: string
  label: string
}

export type FilterOptions = {
  [key: string]: FilterOption[]
}
