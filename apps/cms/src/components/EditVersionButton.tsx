"use client";

import {
  ConfirmationModal,
  useDocumentInfo,
  useField,
  useFormModified,
  useModal,
} from "@payloadcms/ui";
import { useCallback, useEffect, useState } from "react";

const EDIT_MODAL_SLUG = "confirm-edit-version";

export const EditVersionButton: React.FC = () => {
  const { id } = useDocumentInfo();
  const { value: publishedAt } = useField<string>({ path: "publishedAt" });
  const { value: archivedAt } = useField<string>({ path: "archivedAt" });
  const modified = useFormModified();
  const [loading, setLoading] = useState(false);
  const [hasStatements, setHasStatements] = useState(false);
  const { openModal } = useModal();

  const isPublished = Boolean(publishedAt) && !Boolean(archivedAt);
  const isArchived = Boolean(archivedAt);
  const isDraft = !Boolean(publishedAt) && !Boolean(archivedAt);

  useEffect(() => {
    if (!id || isDraft) return;

    fetch(`/api/statements?where[version][equals]=${id}&limit=1`)
      .then((res) => res.json())
      .then((data) => setHasStatements(data.totalDocs > 0))
      .catch(() => setHasStatements(false));
  }, [id, isDraft]);

  const handleEdit = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/versions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publishedAt: null, archivedAt: null }),
      });
      if (!res.ok) throw new Error(`Failed to revert version to draft: ${res.status}`);

      window.location.reload();
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [id]);

  if (!id || isDraft || modified) return null;

  return (
    <>
      <button
        type="button"
        className="btn btn--size-medium"
        style={{
          backgroundColor: loading || hasStatements ? undefined : "#000000",
          color: loading || hasStatements ? undefined : "#ffffff",
        }}
        disabled={loading || hasStatements}
        title={
          hasStatements
            ? "This version has associated consent records and cannot be reverted to draft."
            : undefined
        }
        onClick={() => openModal(EDIT_MODAL_SLUG)}
      >
        {loading ? "Reverting..." : "Edit"}
      </button>
      <ConfirmationModal
        modalSlug={EDIT_MODAL_SLUG}
        heading="Confirm Revert to Draft"
        body="You are about to revert this version back to draft. It will no longer be published or archived."
        confirmLabel="Revert to Draft"
        confirmingLabel="Reverting..."
        cancelLabel="Cancel"
        onConfirm={handleEdit}
      />
    </>
  );
};
