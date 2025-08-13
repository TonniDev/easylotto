'use client';

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Input,
  Select,
  SelectItem,
  Pagination,
  Spinner,
} from '@heroui/react';
import { UserSpending, SpendingCategory } from '@lib/definitions/riskAssessment';
import { formatCurrency } from '@lib/definitions/riskAssessment';

interface SpendingHistoryProps {
  spending: UserSpending[];
  isLoading?: boolean;
  onLoadMore?: () => void;
  hasMore?: boolean;
  className?: string;
}

/**
 * Get category color and icon
 */
const getCategoryDisplay = (category: SpendingCategory) => {
  switch (category) {
    case 'lottery':
      return { color: 'danger' as const, icon: '🎲', label: 'Lottery' };
    case 'investment':
      return { color: 'success' as const, icon: '📈', label: 'Investment' };
    case 'other':
      return { color: 'default' as const, icon: '🛍️', label: 'Other' };
  }
};

/**
 * Format date for display
 */
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date));
};

/**
 * Format relative date
 */
const formatRelativeDate = (date: Date) => {
  const now = new Date();
  const diffTime = now.getTime() - new Date(date).getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};

/**
 * Spending history table component
 */
export const SpendingHistory: React.FC<SpendingHistoryProps> = ({
  spending,
  isLoading = false,
  onLoadMore,
  hasMore = false,
  className = '',
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter spending data
  const filteredSpending = spending.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.gameType?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || entry.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Paginate filtered data
  const totalPages = Math.ceil(filteredSpending.length / itemsPerPage);
  const paginatedSpending = filteredSpending.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Calculate totals
  const totalAmount = filteredSpending.reduce((sum, entry) => sum + entry.amount, 0);
  const categoryTotals = filteredSpending.reduce((acc, entry) => {
    acc[entry.category] = (acc[entry.category] || 0) + entry.amount;
    return acc;
  }, {} as Record<SpendingCategory, number>);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header with filters */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 w-full">
            <div>
              <h2 className="text-lg font-semibold">📋 Spending History</h2>
              <p className="text-sm text-foreground-600">
                {filteredSpending.length} entries • Total: {formatCurrency(totalAmount)}
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <Input
                placeholder="Search descriptions..."
                value={searchQuery}
                onValueChange={setSearchQuery}
                startContent="🔍"
                className="w-full sm:w-64"
                size="sm"
              />
              
              <Select
                placeholder="All Categories"
                selectedKeys={[categoryFilter]}
                onSelectionChange={(keys) => setCategoryFilter(Array.from(keys)[0] as string)}
                className="w-full sm:w-40"
                size="sm"
              >
                <SelectItem key="all">All Categories</SelectItem>
                <SelectItem key="lottery">🎲 Lottery</SelectItem>
                <SelectItem key="investment">📈 Investment</SelectItem>
                <SelectItem key="other">🛍️ Other</SelectItem>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Category Summary */}
      {Object.keys(categoryTotals).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {Object.entries(categoryTotals).map(([category, amount]) => {
            const display = getCategoryDisplay(category as SpendingCategory);
            return (
              <Chip
                key={category}
                color={display.color}
                variant="flat"
                startContent={display.icon}
              >
                {display.label}: {formatCurrency(amount)}
              </Chip>
            );
          })}
        </div>
      )}

      {/* Spending Table */}
      <Card>
        <CardBody className="p-0">
          {isLoading && paginatedSpending.length === 0 ? (
            <div className="flex justify-center items-center py-12">
              <Spinner size="lg" />
            </div>
          ) : paginatedSpending.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {searchQuery || categoryFilter !== 'all' ? 'No matching entries' : 'No spending entries yet'}
              </h3>
              <p className="text-foreground-600">
                {searchQuery || categoryFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Add your first spending entry to start tracking your financial patterns'
                }
              </p>
            </div>
          ) : (
            <Table aria-label="Spending history table">
              <TableHeader>
                <TableColumn>DATE</TableColumn>
                <TableColumn>CATEGORY</TableColumn>
                <TableColumn>AMOUNT</TableColumn>
                <TableColumn>DESCRIPTION</TableColumn>
                <TableColumn>DETAILS</TableColumn>
              </TableHeader>
              <TableBody>
                {paginatedSpending.map((entry) => {
                  const categoryDisplay = getCategoryDisplay(entry.category);
                  
                  return (
                    <TableRow key={entry.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {formatDate(entry.date)}
                          </div>
                          <div className="text-xs text-foreground-500">
                            {formatRelativeDate(entry.date)}
                          </div>
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <Chip
                          color={categoryDisplay.color}
                          variant="flat"
                          size="sm"
                          startContent={categoryDisplay.icon}
                        >
                          {categoryDisplay.label}
                        </Chip>
                      </TableCell>
                      
                      <TableCell>
                        <div className="font-semibold text-foreground">
                          {formatCurrency(entry.amount)}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="max-w-48">
                          {entry.description ? (
                            <div className="text-sm text-foreground truncate">
                              {entry.description}
                            </div>
                          ) : (
                            <div className="text-xs text-foreground-400 italic">
                              No description
                            </div>
                          )}
                        </div>
                      </TableCell>
                      
                      <TableCell>
                        <div className="space-y-1">
                          {entry.gameType && (
                            <Chip size="sm" variant="flat" color="primary">
                              {entry.gameType}
                            </Chip>
                          )}
                          {entry.gamesCount && (
                            <div className="text-xs text-foreground-500">
                              {entry.gamesCount} game{entry.gamesCount !== 1 ? 's' : ''}
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardBody>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            total={totalPages}
            page={currentPage}
            onChange={setCurrentPage}
            showControls
            showShadow
            color="primary"
          />
        </div>
      )}

      {/* Load More Button */}
      {hasMore && onLoadMore && (
        <div className="flex justify-center">
          <Button
            variant="flat"
            onPress={onLoadMore}
            isLoading={isLoading}
          >
            Load More Entries
          </Button>
        </div>
      )}
    </div>
  );
};
