"use client";

import {
  ConfirmationModal,
  useDocumentInfo,
  useField,
  useFormModified,
  useModal,
} from "@payloadcms/ui";
import { useCallback, useState } from "react";

const ARCHIVE_MODAL_SLUG = "confirm-archive-version";

export const ArchiveButton: React.FC = () => {
  const { id } = useDocumentInfo();
  const { value: archivedAt } = useField<string>({ path: "archivedAt" });
  const { value: status } = useField<string>({ path: "status" });
  const { value: documentId } = useField<string>({ path: "document" });
  const modified = useFormModified();
  const [loading, setLoading] = useState(false);
  const { openModal } = useModal();

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

  if (!id || !isPublished || isArchived || modified) return null;

  return (
    <>
    <button
      type="button"
      className="btn btn--size-medium"
      style={{
        backgroundColor: loading ? undefined : "#dc2626",
        color: loading ? undefined : "#ffffff",
      }}
      disabled={loading}
      onClick={() => openModal(ARCHIVE_MODAL_SLUG)}
    >
      {loading ? "Archiving..." : "Archive"}
    </button>
    <ConfirmationModal
      modalSlug={ARCHIVE_MODAL_SLUG}
      heading="Confirm Archive"
      body="You are archiving this document version. Any services which rely on it will not display anything until a new version is published."
      confirmLabel="Archive"
      confirmingLabel="Archiving..."
      cancelLabel="Cancel"
      onConfirm={handleArchive}
    />
    </>
  );
};
