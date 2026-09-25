"use client";

import React, { useRef, useState } from "react";
import { Button } from "@/lib/ui/components/button";
import { ConfirmationModal } from "./ConfirmationModal";
import { Trash2 } from "lucide-react";

interface DeleteUserButtonProps {
  userId: string;
  onDeleteAction: (formData: FormData) => void;
}

export function DeleteUserButton({ userId, onDeleteAction }: DeleteUserButtonProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
  };

  const handleConfirm = () => {
    setIsOpen(false);
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  return (
    <>
      <form ref={formRef} action={onDeleteAction} className="inline">
        <input type="hidden" name="userId" value={userId} />
        <Button
          type="button"
          variant="destructive"
          size="sm"
          onClick={handleDeleteClick}
        >
          <Trash2 className="size-3.5" />
          Delete
        </Button>
      </form>

      <ConfirmationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title="Confirm User Deletion"
        description="Are you sure you want to delete this user? This action cannot be undone."
        confirmText="Delete User"
        confirmVariant="destructive"
      />
    </>
  );
}
