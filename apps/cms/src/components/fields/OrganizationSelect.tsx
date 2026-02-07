"use client";

import { useField } from "@payloadcms/ui";
import { TextFieldClientProps } from "payload";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface Organization {
  id: string;
  name: string;
  retirementDate: string | null;
}

interface Option {
  value: string;
  label: string;
}

const API_URL = "https://public-bodies.dev.api.gov.bc.ca/PublicBodies/names";

export const OrganizationSelect: React.FC<TextFieldClientProps> = ({
  field,
  path,
}) => {
  const { value, setValue } = useField<string>({ path });
  const [options, setOptions] = useState<Option[]>([]);
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const cachedOptions = useRef<Option[]>([]);

  useEffect(() => {
    if (cachedOptions.current.length > 0) {
      setOptions(cachedOptions.current);
      return;
    }

    setLoading(true);
    fetch(API_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        const items: Organization[] = data.payload ?? [];
        // Dedupe by name, preferring the entry with a null retirementDate
        const byName = new Map<string, Organization>();
        for (const item of items) {
          const existing = byName.get(item.name);
          if (
            !existing ||
            (existing.retirementDate != null && item.retirementDate == null)
          ) {
            byName.set(item.name, item);
          }
        }
        const opts = Array.from(byName.values()).map((item) => ({
          value: item.id,
          label: item.name,
        }));
        opts.sort((a, b) => a.label.localeCompare(b.label));
        cachedOptions.current = opts;
        setOptions(opts);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const term = search.toLowerCase();
    return term
      ? options.filter((o) => o.label.toLowerCase().includes(term))
      : options;
  }, [search, options]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selectedLabel = options.find((o) => o.value === value)?.label ?? "";

  const handleSelect = useCallback(
    (opt: Option) => {
      setValue(opt.value);
      setSearch("");
      setIsOpen(false);
    },
    [setValue],
  );

  const handleClear = useCallback(() => {
    setValue("");
    setSearch("");
  }, [setValue]);

  return (
    <div className="field-type text" ref={containerRef}>
      <label className="field-label">
        {typeof field.label === "string" ? field.label : field.name}
      </label>

      {error && (
        <div style={{ color: "var(--theme-error-500)", marginBottom: 8 }}>
          Failed to load organizations: {error}
        </div>
      )}

      <div style={{ position: "relative" }}>
        <input
          type="text"
          className="field-type__input"
          style={{ width: "100%" }}
          placeholder={
            loading ? "Loading organizations..." : "Search organizations..."
          }
          value={isOpen ? search : selectedLabel}
          onChange={(e) => {
            setSearch(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            setSearch("");
          }}
          disabled={loading}
        />

        {value && !isOpen && (
          <button
            type="button"
            onClick={handleClear}
            style={{
              position: "absolute",
              right: 8,
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: 16,
              color: "var(--theme-elevation-500)",
            }}
            aria-label="Clear selection"
          >
            ×
          </button>
        )}

        {isOpen && (
          <ul
            style={{
              position: "absolute",
              zIndex: 100,
              top: "100%",
              left: 0,
              right: 0,
              maxHeight: 250,
              overflowY: "auto",
              margin: 0,
              padding: 0,
              listStyle: "none",
              background: "var(--theme-elevation-0)",
              border: "1px solid var(--theme-elevation-150)",
              borderRadius: 4,
            }}
          >
            {filtered.length === 0 && (
              <li
                style={{
                  padding: "8px 12px",
                  color: "var(--theme-elevation-500)",
                }}
              >
                No results
              </li>
            )}
            {filtered.map((opt) => (
              <li
                key={opt.value}
                onClick={() => handleSelect(opt)}
                style={{
                  padding: "8px 12px",
                  cursor: "pointer",
                  background:
                    opt.value === value
                      ? "var(--theme-elevation-100)"
                      : "transparent",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background =
                    "var(--theme-elevation-100)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background =
                    opt.value === value
                      ? "var(--theme-elevation-100)"
                      : "transparent")
                }
              >
                {opt.label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
