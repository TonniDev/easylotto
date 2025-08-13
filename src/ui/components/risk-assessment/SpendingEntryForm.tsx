'use client';

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Input,
  Select,
  SelectItem,
  Textarea,
  Button,
  DatePicker,
  Chip,
} from '@heroui/react';
import { AddSpendingRequest, SpendingCategory } from '@lib/definitions/riskAssessment';
import { parseDate } from '@internationalized/date';

interface SpendingEntryFormProps {
  onSubmit: (data: AddSpendingRequest) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
  className?: string;
}

/**
 * Spending categories with descriptions
 */
const SPENDING_CATEGORIES: {
  value: SpendingCategory;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: 'lottery',
    label: 'Lottery',
    description: 'Lottery tickets, games, and gambling',
    icon: '🎲',
  },
  {
    value: 'investment',
    label: 'Investment',
    description: 'Stocks, bonds, savings, and investments',
    icon: '📈',
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Other entertainment or discretionary spending',
    icon: '🛍️',
  },
];

/**
 * Common lottery game types
 */
const LOTTERY_GAME_TYPES = [
  { value: 'lotofacil', label: 'Lotofácil' },
  { value: 'mega_sena', label: 'Mega-Sena' },
  { value: 'quina', label: 'Quina' },
  { value: 'lotomania', label: 'Lotomania' },
  { value: 'dupla_sena', label: 'Dupla Sena' },
  { value: 'timemania', label: 'Timemania' },
  { value: 'dia_de_sorte', label: 'Dia de Sorte' },
  { value: 'other', label: 'Other' },
];

/**
 * Form for adding new spending entries
 */
export const SpendingEntryForm: React.FC<SpendingEntryFormProps> = ({
  onSubmit,
  onCancel,
  isLoading = false,
  className = '',
}) => {
  const [formData, setFormData] = useState<Partial<AddSpendingRequest>>({
    amount: undefined,
    date: new Date().toISOString(),
    category: 'lottery',
    description: '',
    gameType: '',
    gamesCount: undefined,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Handle form field changes
   */
  const handleFieldChange = (field: keyof AddSpendingRequest, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.amount || formData.amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (formData.amount && formData.amount > 100000) {
      newErrors.amount = 'Amount cannot exceed R$ 100,000';
    }

    if (!formData.date) {
      newErrors.date = 'Date is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (formData.gamesCount && formData.gamesCount <= 0) {
      newErrors.gamesCount = 'Games count must be greater than 0';
    }

    if (formData.gamesCount && formData.gamesCount > 1000) {
      newErrors.gamesCount = 'Games count cannot exceed 1,000';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit({
        amount: formData.amount!,
        date: formData.date!,
        category: formData.category as SpendingCategory,
        description: formData.description || undefined,
        gameType: formData.gameType || undefined,
        gamesCount: formData.gamesCount || undefined,
      });

      // Reset form on success
      setFormData({
        amount: undefined,
        date: new Date().toISOString(),
        category: 'lottery',
        description: '',
        gameType: '',
        gamesCount: undefined,
      });
    } catch (error) {
      console.error('Error submitting spending entry:', error);
    }
  };

  /**
   * Calculate estimated cost per game
   */
  const getEstimatedCostPerGame = () => {
    if (!formData.amount || !formData.gamesCount || formData.gamesCount === 0) {
      return null;
    }
    return formData.amount / formData.gamesCount;
  };

  const costPerGame = getEstimatedCostPerGame();
  const selectedCategory = SPENDING_CATEGORIES.find(cat => cat.value === formData.category);

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-2xl">💰</span>
          <h2 className="text-lg font-semibold">Add Spending Entry</h2>
        </div>
      </CardHeader>
      <CardBody>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <Input
            label="Amount"
            placeholder="0.00"
            type="number"
            step="0.01"
            min="0.01"
            max="100000"
            value={formData.amount?.toString() || ''}
            onChange={(e) => handleFieldChange('amount', parseFloat(e.target.value) || undefined)}
            startContent="R$"
            isInvalid={!!errors.amount}
            errorMessage={errors.amount}
            isRequired
          />

          {/* Date */}
          <DatePicker
            label="Date"
            value={formData.date ? parseDate(formData.date.split('T')[0]) : null}
            onChange={(date) => handleFieldChange('date', date?.toString() + 'T00:00:00.000Z')}
            isInvalid={!!errors.date}
            errorMessage={errors.date}
            isRequired
          />

          {/* Category */}
          <Select
            label="Category"
            placeholder="Select spending category"
            selectedKeys={formData.category ? [formData.category] : []}
            onSelectionChange={(keys) => {
              const category = Array.from(keys)[0] as SpendingCategory;
              handleFieldChange('category', category);
            }}
            isInvalid={!!errors.category}
            errorMessage={errors.category}
            isRequired
          >
            {SPENDING_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                <div className="flex items-center gap-2">
                  <span>{category.icon}</span>
                  <div>
                    <div className="font-medium">{category.label}</div>
                    <div className="text-xs text-foreground-500">{category.description}</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </Select>

          {/* Category-specific fields */}
          {selectedCategory && (
            <div className="p-3 rounded-lg bg-default/30 border border-default/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{selectedCategory.icon}</span>
                <span className="text-sm font-medium">{selectedCategory.label} Details</span>
              </div>

              {formData.category === 'lottery' && (
                <div className="space-y-3">
                  <Select
                    label="Game Type"
                    placeholder="Select lottery game"
                    selectedKeys={formData.gameType ? [formData.gameType] : []}
                    onSelectionChange={(keys) => {
                      const gameType = Array.from(keys)[0] as string;
                      handleFieldChange('gameType', gameType);
                    }}
                  >
                    {LOTTERY_GAME_TYPES.map((game) => (
                      <SelectItem key={game.value} value={game.value}>
                        {game.label}
                      </SelectItem>
                    ))}
                  </Select>

                  <Input
                    label="Number of Games"
                    placeholder="How many games did you play?"
                    type="number"
                    min="1"
                    max="1000"
                    value={formData.gamesCount?.toString() || ''}
                    onChange={(e) => handleFieldChange('gamesCount', parseInt(e.target.value) || undefined)}
                    isInvalid={!!errors.gamesCount}
                    errorMessage={errors.gamesCount}
                  />

                  {costPerGame && (
                    <div className="text-sm text-foreground-600">
                      <Chip size="sm" color="primary" variant="flat">
                        ~{costPerGame.toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })} per game
                      </Chip>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Description */}
          <Textarea
            label="Description (Optional)"
            placeholder="Add any additional details..."
            value={formData.description || ''}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            maxLength={255}
            rows={3}
          />

          {/* Form Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
              className="flex-1"
            >
              Add Spending Entry
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="flat"
                onPress={onCancel}
                isDisabled={isLoading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardBody>
    </Card>
  );
};
