"use client";

import { PopupList, useDocumentInfo, useField } from "@payloadcms/ui";
import { useCallback, useEffect, useState } from "react";

export const CreateNewVersionMenuItem: React.FC = () => {
  const { id } = useDocumentInfo();
  const { value: documentId } = useField<string>({ path: "document" });
  const { value: content } = useField({ path: "content" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Hide the default "Create New" button since we replace it
    const style = document.createElement("style");
    style.textContent = "#action-create { display: none; }";
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handleCreateNew = useCallback(async () => {
    if (!documentId || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/versions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document: documentId,
          content,
        }),
      });
      if (!res.ok) throw new Error(`Failed to create version: ${res.status}`);

      window.location.href = `/admin/collections/documents/${documentId}`;
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [documentId, content, loading]);

  if (!id) return null;

  return (
    <PopupList.ButtonGroup>
      <PopupList.Button onClick={handleCreateNew} disabled={loading}>
        {loading ? "Creating..." : "Create New Version"}
      </PopupList.Button>
    </PopupList.ButtonGroup>
  );
};
