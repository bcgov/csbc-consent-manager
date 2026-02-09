"use client";

import { useDocumentInfo, useField } from "@payloadcms/ui";
import { useCallback, useState } from "react";

export const ArchiveButton: React.FC = () => {
  const { id } = useDocumentInfo();
  if (!id) return null;
  const { value: archivedAt } = useField<string>({ path: "archivedAt" });
  const { value: status } = useField<string>({ path: "status" });
  const { value: documentId } = useField<string>({ path: "document" });
  const [loading, setLoading] = useState(false);

  const isArchived = Boolean(archivedAt);
  const isPublished = status === "published";

  const handleArchive = useCallback(async () => {
    if (!id || isArchived) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/versions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ archivedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error(`Failed to archive version: ${res.status}`);

      if (documentId) {
        const docRes = await fetch(`/api/documents/${documentId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publishedVersion: null }),
        });
        if (!docRes.ok)
          throw new Error(`Failed to update document: ${docRes.status}`);
      }

      window.location.reload();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [id, isArchived, documentId]);

  return (
    <button
      type="button"
      className="btn btn--style-secondary btn--size-medium"
      disabled={isArchived || !isPublished || loading || !id}
      onClick={handleArchive}
    >
      {loading ? "Archiving..." : "Archive"}
    </button>
  );
};
