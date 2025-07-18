'use client'

import { Search } from "lucide-react"
import { useState, useMemo } from "react"
// import Link from "next/link" // Remove unused import
import { useRouter } from "next/navigation"
import { Label } from "@/components/ui/label"
import { SidebarInput } from "@/components/ui/sidebar"
import { menuData } from "@/components/layout/app-sidebar"

// Define a type for the flattened menu items
interface MenuItem {
  title: string
  url: string
  icon?: React.ElementType
  group: string | null
}
// Define a type for group items
interface GroupWithItems {
  title: string
  url: string
  icon?: React.ElementType
  items: Array<{ title: string; url: string; icon?: React.ElementType }>
}
interface GroupWithoutItems {
  title: string
  url: string
  icon?: React.ElementType
}
type Group = GroupWithItems | GroupWithoutItems

function hasItems(group: Group): group is GroupWithItems {
  return Array.isArray((group as GroupWithItems).items)
}

export function SearchForm({ className, ...props }: React.ComponentProps<"form">) {
  const [query, setQuery] = useState("")
  const [showResults, setShowResults] = useState(false)
  const router = useRouter()

  // Flatten all menu and submenu items
  const allMenus = useMemo(() => {
    const flatten: MenuItem[] = []
    // Main nav
    menuData.mainNav.forEach(item => {
      flatten.push({
        title: item.title,
        url: item.url,
        icon: item.icon,
        group: null,
      })
    })
    // Master, Project, Account navs
    const navGroups: Array<keyof typeof menuData> = ["masterNav", "projectNav", "accountNav"]
    navGroups.forEach(groupKey => {
      menuData[groupKey]?.forEach((group: Group) => {
        if (hasItems(group)) {
          group.items.forEach((sub) => {
            flatten.push({
              title: sub.title,
              url: sub.url,
              icon: sub.icon,
              group: group.title,
            })
          })
        } else {
          flatten.push({
            title: group.title,
            url: group.url,
            icon: group.icon,
            group: null,
          })
        }
      })
    })
    return flatten
  }, [])

  // Filtered results
  const results = useMemo(() => {
    if (!query) return []
    return allMenus.filter(item =>
      item.title.toLowerCase().includes(query.toLowerCase())
    )
  }, [query, allMenus])

  const handleSelect = (url: string) => {
    setShowResults(false)
    setQuery("")
    router.push(url)
  }

  // Type guard for icon rendering
  function isComponentType(icon: unknown): icon is React.ElementType {
    return typeof icon === "function" || typeof icon === "object"
  }

  return (
    <div className="relative w-full" onBlur={() => setTimeout(() => setShowResults(false), 100)}>
      <form
        {...props}
        className={className}
        autoComplete="off"
        onSubmit={e => {
          e.preventDefault()
          if (results.length > 0) handleSelect(results[0].url)
        }}
      >
        <div className="relative">
          <Label htmlFor="search" className="sr-only">
            Search
          </Label>
          <SidebarInput
            id="search"
            placeholder="Type to search menus..."
            className="h-8 pl-7"
            value={query}
            onChange={e => {
              setQuery(e.target.value)
              setShowResults(true)
            }}
            onFocus={() => setShowResults(true)}
            autoComplete="off"
          />
          <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 opacity-50 select-none" />
        </div>
      </form>
      {showResults && query && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md bg-gray-950 shadow-lg border max-h-64 overflow-auto">
          {results.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.url}
                className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-800"
                onMouseDown={e => {
                  e.preventDefault()
                  handleSelect(item.url)
                }}
              >
                {isComponentType(Icon) && <Icon className="h-4 w-4 text-gray-300" />}
                <span className="font-medium text-white">{item.title}</span>
                {item.group && (
                  <span className="ml-auto text-xs text-gray-400">{item.group}</span>
                )}
              </button>
            )
          })}
        </div>
      )}
      {showResults && query && results.length === 0 && (
        <div className="absolute z-50 mt-1 w-full rounded-md bg-gray-800 shadow-lg border px-3 py-2 text-gray-400">
          No menu found
        </div>
      )}
    </div>
  )
}
