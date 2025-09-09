"use client"

import { IUserGroupLookup } from "@/interfaces/lookup"
import Select from "react-select"

import { cn } from "@/lib/utils"
import { useUserGroupLookup } from "@/hooks/use-lookup"

import { Label } from "../ui/label"

interface FieldOption {
  value: string
  label: string
}

export default function UserGroupAutocomplete({
  label,
  className,
  isRequired = false,
  onChangeEvent,
}: {
  label?: string
  className?: string
  isRequired?: boolean
  onChangeEvent?: (selectedOption: IUserGroupLookup | null) => void
}) {
  const { data: userGroups = [] } = useUserGroupLookup()
  const options: FieldOption[] = userGroups.map(
    (userGroup: IUserGroupLookup) => ({
      value: userGroup.userGroupId.toString(),
      label: userGroup.userGroupName,
    })
  )

  const handleChange = (option: FieldOption | null) => {
    if (onChangeEvent) {
      const selectedUserGroup = option
        ? userGroups.find(
            (u: IUserGroupLookup) => u.userGroupId.toString() === option.value
          ) || null
        : null
      onChangeEvent(selectedUserGroup)
    }
  }

  return (
    <div className={cn("flex flex-1 flex-col gap-1", className)}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {isRequired && <span className="ml-1 text-red-500">*</span>}
        </Label>
      )}
      <Select<FieldOption, false>
        options={options}
        onChange={handleChange}
        isClearable={true}
        isSearchable={true}
        placeholder="Select UserGroup..."
        classNames={{
          control: () =>
            cn(
              "border-input bg-background text-foreground placeholder:text-muted-foreground",
              "flex h-9 w-full items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs transition-[color,box-shadow] outline-none",
              "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "dark:bg-input/30 dark:hover:bg-input/50"
            ),
          menu: () =>
            cn(
              "bg-popover text-popover-foreground",
              "relative z-[9999] min-w-[8rem] overflow-hidden rounded-md border shadow-md animate-in fade-in-80",
              "mt-1"
            ),
          menuList: () => cn("p-1 overflow-auto"),
          option: (state: { isFocused: boolean; isSelected: boolean }) =>
            cn(
              "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none",
              state.isFocused && "bg-accent text-accent-foreground",
              state.isSelected && "bg-accent text-accent-foreground"
            ),
          placeholder: () => cn("text-muted-foreground"),
          singleValue: () => cn("text-foreground text-sm truncate"),
          valueContainer: () => cn("px-0 py-0 gap-1 flex-1 items-center"),
          input: () =>
            cn(
              "text-foreground placeholder:text-muted-foreground m-0 p-0 flex-1 min-w-0 truncate"
            ),
          indicatorSeparator: () => cn("hidden"),
          clearIndicator: () =>
            cn("text-muted-foreground hover:text-foreground p-1 rounded-sm"),
          dropdownIndicator: () => cn("text-muted-foreground p-1 rounded-sm"),
          multiValue: () => cn("bg-accent rounded-sm m-1 overflow-hidden"),
          multiValueLabel: () => cn("py-0.5 pl-2 pr-1 text-sm"),
          multiValueRemove: () =>
            cn(
              "hover:bg-destructive/90 hover:text-destructive-foreground px-1 rounded-sm"
            ),
        }}
        loadingMessage={() => "Loading userGroups..."}
      />
    </div>
  )
}
