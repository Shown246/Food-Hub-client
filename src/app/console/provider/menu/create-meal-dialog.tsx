'use client';

import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCategories } from '@/components/_category.action';
import { createProviderMeal, CreateProviderMealPayload } from '../_actions';
import { Category } from '@/types/meal.type';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  AlertCircle,
  Clock,
  DollarSign,
  Image as ImageIcon,
  Loader2,
  Plus,
  Tag,
  Utensils,
  X,
} from 'lucide-react';

interface CreateMealDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (message: string) => void;
}

const PRESET_DIETARY_TAGS = [
  'halal',
  'vegetarian',
  'vegan',
  'spicy',
  'gluten-free',
  'dairy-free',
  'organic',
  'healthy',
];

export function CreateMealDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateMealDialogProps) {
  const queryClient = useQueryClient();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [preparationTimeMinutes, setPreparationTimeMinutes] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dietaryLabels, setDietaryLabels] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch active categories
  const { data: categoriesResponse, isLoading: loadingCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => getCategories(),
    enabled: open,
  });

  const categories: Category[] = categoriesResponse?.success && Array.isArray(categoriesResponse.data)
    ? categoriesResponse.data
    : [];

  const resetForm = () => {
    setName('');
    setDescription('');
    setPrice('');
    setCategoryId('');
    setPreparationTimeMinutes('');
    setImageUrl('');
    setDietaryLabels([]);
    setCustomTag('');
    setIsAvailable(true);
    setErrorMessage(null);
  };

  const handleClose = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm();
    }
    onOpenChange(newOpen);
  };

  const createMutation = useMutation({
    mutationFn: (payload: CreateProviderMealPayload) => createProviderMeal(payload),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['provider-meals'] });
        resetForm();
        onOpenChange(false);
        onSuccess?.('Meal created successfully!');
      } else {
        setErrorMessage(res.message || 'Failed to create meal.');
      }
    },
    onError: (err: any) => {
      setErrorMessage(err?.message || 'An unexpected error occurred while creating meal.');
    },
  });

  const togglePresetTag = (tag: string) => {
    const normalized = tag.toLowerCase().trim();
    if (dietaryLabels.includes(normalized)) {
      setDietaryLabels(dietaryLabels.filter((t) => t !== normalized));
    } else {
      if (dietaryLabels.length >= 20) return;
      setDietaryLabels([...dietaryLabels, normalized]);
    }
  };

  const addCustomTag = () => {
    const trimmed = customTag.trim().toLowerCase();
    if (!trimmed) return;
    if (trimmed.length > 50) return;
    if (!dietaryLabels.includes(trimmed) && dietaryLabels.length < 20) {
      setDietaryLabels([...dietaryLabels, trimmed]);
    }
    setCustomTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setDietaryLabels(dietaryLabels.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    const trimmedName = name.trim();
    if (!trimmedName) {
      setErrorMessage('Meal name is required.');
      return;
    }
    if (trimmedName.length > 150) {
      setErrorMessage('Meal name cannot exceed 150 characters.');
      return;
    }

    if (!categoryId) {
      setErrorMessage('Please select a category.');
      return;
    }

    const trimmedPrice = price.trim();
    const numPrice = Number(trimmedPrice);
    if (!trimmedPrice || isNaN(numPrice) || numPrice <= 0) {
      setErrorMessage('Price must be a valid positive amount (e.g. 150.00).');
      return;
    }
    // Format price to max 2 decimal places
    const formattedPrice = numPrice.toFixed(2);

    const trimmedDescription = description.trim();
    if (!trimmedDescription) {
      setErrorMessage('Description is required.');
      return;
    }
    if (trimmedDescription.length > 5000) {
      setErrorMessage('Description cannot exceed 5000 characters.');
      return;
    }

    let prepTime: number | null = null;
    if (preparationTimeMinutes.trim()) {
      const parsedTime = parseInt(preparationTimeMinutes.trim(), 10);
      if (isNaN(parsedTime) || parsedTime < 1 || parsedTime > 1440) {
        setErrorMessage('Preparation time must be between 1 and 1440 minutes.');
        return;
      }
      prepTime = parsedTime;
    }

    let validImageUrl: string | null = null;
    if (imageUrl.trim()) {
      try {
        const url = new URL(imageUrl.trim());
        if (url.protocol !== 'http:' && url.protocol !== 'https:') {
          setErrorMessage('Image URL must start with http:// or https://');
          return;
        }
        validImageUrl = imageUrl.trim();
      } catch {
        setErrorMessage('Please enter a valid Image URL.');
        return;
      }
    }

    createMutation.mutate({
      name: trimmedName,
      categoryId,
      price: formattedPrice,
      description: trimmedDescription,
      preparationTimeMinutes: prepTime,
      imageUrl: validImageUrl,
      dietaryLabels: dietaryLabels.length > 0 ? dietaryLabels : undefined,
      isAvailable,
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-3xl bg-card border-border/80 shadow-2xl">
        <DialogHeader className="text-left space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-primary/10 text-primary">
              <Plus className="size-5" />
            </span>
            <DialogTitle className="text-xl font-bold text-foreground">
              Add New Meal
            </DialogTitle>
          </div>
          <DialogDescription className="text-sm text-muted-foreground">
            Create a new dish for your menu. Only you will be able to manage this meal.
          </DialogDescription>
        </DialogHeader>

        {errorMessage && (
          <div className="flex items-start gap-2.5 p-3.5 rounded-xl text-sm font-medium bg-destructive/10 text-destructive border border-destructive/20">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          {/* Meal Name */}
          <div className="space-y-1.5">
            <Label htmlFor="create-name" className="text-xs font-semibold flex items-center gap-1.5">
              <Utensils className="size-3.5 text-muted-foreground" />
              Meal Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="create-name"
              placeholder="e.g. Chicken Biryani, Beef Burger"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={150}
              required
              className="rounded-xl border-border/80 focus-visible:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <Label htmlFor="create-category" className="text-xs font-semibold flex items-center gap-1.5">
                <Tag className="size-3.5 text-muted-foreground" />
                Category <span className="text-destructive">*</span>
              </Label>
              <select
                id="create-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                disabled={loadingCategories}
                className="w-full h-10 rounded-xl border border-border/80 bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary transition-colors disabled:opacity-50"
              >
                <option value="">
                  {loadingCategories ? 'Loading categories...' : 'Select a category'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="space-y-1.5">
              <Label htmlFor="create-price" className="text-xs font-semibold flex items-center gap-1.5">
                <DollarSign className="size-3.5 text-muted-foreground" />
                Price (৳ BDT) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="create-price"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="e.g. 250.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                className="rounded-xl border-border/80 focus-visible:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Preparation Time */}
            <div className="space-y-1.5">
              <Label htmlFor="create-prep-time" className="text-xs font-semibold flex items-center gap-1.5">
                <Clock className="size-3.5 text-muted-foreground" />
                Preparation Time (minutes)
              </Label>
              <Input
                id="create-prep-time"
                type="number"
                min="1"
                max="1440"
                placeholder="e.g. 20"
                value={preparationTimeMinutes}
                onChange={(e) => setPreparationTimeMinutes(e.target.value)}
                className="rounded-xl border-border/80 focus-visible:ring-primary"
              />
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <Label htmlFor="create-image-url" className="text-xs font-semibold flex items-center gap-1.5">
                <ImageIcon className="size-3.5 text-muted-foreground" />
                Image URL (optional)
              </Label>
              <Input
                id="create-image-url"
                type="url"
                placeholder="https://images.example.com/meal.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="rounded-xl border-border/80 focus-visible:ring-primary"
              />
            </div>
          </div>

          {/* Image Preview if provided */}
          {imageUrl.trim() && (
            <div className="p-3 bg-muted/30 rounded-2xl border border-border/60 flex items-center gap-4">
              <div className="relative size-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/80">
                <img
                  src={imageUrl.trim()}
                  alt="Meal preview"
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '';
                  }}
                />
              </div>
              <div className="text-xs text-muted-foreground">
                <p className="font-medium text-foreground">Image Preview</p>
                <p className="truncate max-w-xs">{imageUrl.trim()}</p>
              </div>
            </div>
          )}

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="create-description" className="text-xs font-semibold flex items-center gap-1.5">
              Description <span className="text-destructive">*</span>
            </Label>
            <textarea
              id="create-description"
              rows={3}
              placeholder="Describe the ingredients, flavor, and details of this dish..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={5000}
              required
              className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-sm text-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-primary transition-colors resize-none"
            />
          </div>

          {/* Dietary Labels */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              Dietary Labels
            </Label>
            {/* Presets */}
            <div className="flex flex-wrap gap-1.5">
              {PRESET_DIETARY_TAGS.map((tag) => {
                const isSelected = dietaryLabels.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => togglePresetTag(tag)}
                    className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all capitalize border ${
                      isSelected
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted/50 text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground'
                    }`}
                  >
                    {isSelected && <span className="mr-1">✓</span>}
                    {tag}
                  </button>
                );
              })}
            </div>

            {/* Custom Tag Input */}
            <div className="flex items-center gap-2 pt-1">
              <Input
                placeholder="Add custom tag (e.g. chef's special)"
                value={customTag}
                onChange={(e) => setCustomTag(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addCustomTag();
                  }
                }}
                maxLength={50}
                className="h-8 rounded-lg text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addCustomTag}
                disabled={!customTag.trim()}
                className="h-8 text-xs rounded-lg px-3"
              >
                Add
              </Button>
            </div>

            {/* Selected Tags Display */}
            {dietaryLabels.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {dietaryLabels.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="capitalize text-xs gap-1 py-0.5 px-2.5 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="text-emerald-600 hover:text-destructive transition-colors ml-0.5"
                    >
                      <X className="size-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Initial Availability Toggle */}
          <div className="flex items-center justify-between p-3.5 bg-muted/30 rounded-2xl border border-border/60">
            <div>
              <Label htmlFor="create-is-available" className="text-sm font-semibold text-foreground cursor-pointer">
                Available Immediately
              </Label>
              <p className="text-xs text-muted-foreground">
                When enabled, customers can view and order this meal right away.
              </p>
            </div>
            <input
              id="create-is-available"
              type="checkbox"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
              className="size-5 rounded-md border-border text-primary focus:ring-primary cursor-pointer accent-primary"
            />
          </div>

          <DialogFooter className="pt-3 border-t border-border/40 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleClose(false)}
              disabled={createMutation.isPending}
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="gap-2 font-semibold rounded-xl px-5"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  <span>Create Meal</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
