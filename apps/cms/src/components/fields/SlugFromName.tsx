"use client";

import { useField } from "@payloadcms/ui";
import { TextFieldClientProps } from "payload";
import { useEffect } from "react";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export const SlugFromName: React.FC<TextFieldClientProps> = ({ field, path }) => {
  const { value: id, setValue: setId } = useField<string>({ path });
  const { value: name } = useField<string>({ path: "name" });

  useEffect(() => {
    setId(name ? slugify(name) : "");
  }, [name, setId]);

  return (
    <div className="field-type text">
      <label className="field-label">
        {typeof field.label === "string" ? field.label : "ID"}
      </label>
      <input
        type="text"
        className="field-type__input"
        style={{ width: "100%" }}
        value={id ?? ""}
        readOnly
        disabled
      />
    </div>
  );
};
