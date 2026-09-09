'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteProviderMeal } from '../_actions';
import { ProviderMeal } from '@/types/meal.type';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, Archive, Loader2, Trash2 } from 'lucide-react';

interface DeleteMealDialogProps {
  meal: ProviderMeal | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (message: string) => void;
}

export function DeleteMealDialog({
  meal,
  open,
  onOpenChange,
  onSuccess,
}: DeleteMealDialogProps) {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const deleteMutation = useMutation({
    mutationFn: () => {
      if (!meal) throw new Error('No meal selected');
      return deleteProviderMeal(meal.id);
    },
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['provider-meals'] });
        onOpenChange(false);
        onSuccess?.(`"${meal?.name}" was archived successfully.`);
      } else {
        setErrorMessage(res.message || 'Failed to archive meal.');
      }
    },
    onError: (err: any) => {
      setErrorMessage(err?.message || 'An unexpected error occurred while deleting meal.');
    },
  });

  const handleDelete = () => {
    setErrorMessage(null);
    deleteMutation.mutate();
  };

  if (!meal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-6 rounded-3xl bg-card border-border/80 shadow-2xl">
        <DialogHeader className="text-left space-y-2">
          <div className="flex items-center gap-3">
            <span className="p-2.5 rounded-2xl bg-destructive/10 text-destructive">
              <Trash2 className="size-5" />
            </span>
            <DialogTitle className="text-lg font-bold text-foreground">
              Delete Meal
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            Are you sure you want to delete <span className="font-semibold text-foreground">&quot;{meal.name}&quot;</span>?
          </DialogDescription>
        </DialogHeader>

        <div className="p-3.5 bg-muted/40 rounded-2xl border border-border/60 text-xs text-muted-foreground space-y-1.5">
          <div className="flex items-center gap-1.5 font-medium text-foreground">
            <Archive className="size-4 text-amber-500 shrink-0" />
            <span>Soft-archive policy</span>
          </div>
          <p>
            This action will mark the meal as archived and automatically set its availability to false. Customers will no longer be able to view or order this dish.
          </p>
          <p className="text-muted-foreground/80">
            You can restore this meal at any time from the <strong>Archived</strong> tab.
          </p>
        </div>

        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        <DialogFooter className="pt-2 gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={deleteMutation.isPending}
            className="rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="gap-2 font-semibold rounded-xl px-5"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Archiving...</span>
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                <span>Archive Meal</span>
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
