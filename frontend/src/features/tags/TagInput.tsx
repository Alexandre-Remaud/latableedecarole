import { useState, useRef, useCallback } from "react"

type Props = {
  value: string[]
  onChange: (tags: string[]) => void
  suggestions?: string[]
  maxTags?: number
}

export default function TagInput({
  value,
  onChange,
  suggestions = [],
  maxTags = 10
}: Props) {
  const [input, setInput] = useState("")
  const [open, setOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = suggestions
    .filter(
      (s) => s.toLowerCase().includes(input.toLowerCase()) && !value.includes(s)
    )
    .slice(0, 8)

  const addTag = useCallback(
    (tag: string) => {
      const trimmed = tag.trim()
      if (!trimmed || value.includes(trimmed) || value.length >= maxTags) return
      onChange([...value, trimmed])
      setInput("")
      setOpen(false)
    },
    [value, onChange, maxTags]
  )

  const removeTag = useCallback(
    (tag: string) => {
      onChange(value.filter((t) => t !== tag))
    },
    [value, onChange]
  )

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(input)
    } else if (e.key === "Backspace" && input === "" && value.length > 0) {
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div className="relative">
      <div
        className="input-field min-h-[42px] flex flex-wrap gap-1.5 cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2 py-0.5 bg-warm-100 text-warm-700 text-sm rounded-full"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:text-warm-900 leading-none"
              aria-label={`Supprimer ${tag}`}
            >
              ×
            </button>
          </span>
        ))}
        {value.length < maxTags && (
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => {
              setInput(e.target.value)
              setOpen(true)
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
            className="flex-1 min-w-[120px] outline-none bg-transparent text-sm"
            placeholder={value.length === 0 ? "Ajouter un tag..." : ""}
          />
        )}
      </div>
      {open && input.length > 0 && filtered.length > 0 && (
        <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {filtered.map((s) => (
            <li key={s}>
              <button
                type="button"
                className="w-full text-left px-3 py-2 text-sm hover:bg-warm-50 text-gray-700"
                onMouseDown={() => addTag(s)}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
