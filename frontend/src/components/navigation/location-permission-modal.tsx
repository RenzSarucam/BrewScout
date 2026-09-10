"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface LocationPermissionModalProps {
  open: boolean;
  onAllow: () => void;
  onDismiss: () => void;
}

export function LocationPermissionModal({ open, onAllow, onDismiss }: LocationPermissionModalProps) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onDismiss()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Use your location</DialogTitle>
          <DialogDescription>
            Brew Scout uses your location to find nearby coffee shops and calculate estimated travel routes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onDismiss}>
            Not Now
          </Button>
          <Button onClick={onAllow}>Allow Location</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}