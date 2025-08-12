'use client';

import React, { useState, useCallback } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Tabs,
  Tab,
  Chip,
  Input,
  Select,
  SelectItem,
  Spinner,
} from '@heroui/react';
import { 
  LotteryMisconception, 
  MythBustingScenario,
  getAllMisconceptions,
  getMostDangerousMisconceptions 
} from '@lib/definitions/commonMisconceptions';
import { MythBuster } from './MythBuster';

interface CommonMisconceptionsDebunkerProps {
  className?: string;
}

/**
 * Main Common Misconceptions Debunker Component
 */
export const CommonMisconceptionsDebunker: React.FC<CommonMisconceptionsDebunkerProps> = ({
  className = '',
}) => {
  // State for misconceptions and scenarios
  const [allMisconceptions] = useState<LotteryMisconception[]>(getAllMisconceptions());
  const [dangerousMisconceptions] = useState<LotteryMisconception[]>(getMostDangerousMisconceptions());
  const [scenarios, setScenarios] = useState<Record<string, MythBustingScenario>>({});
  const [analyzingMisconceptions, setAnalyzingMisconceptions] = useState<Set<string>>(new Set());
  
  // State for filters
  const [selectedDangerLevel, setSelectedDangerLevel] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  /**
   * Analyze a specific misconception
   */
  const analyzeMisconception = useCallback(async (misconceptionId: string) => {
    setAnalyzingMisconceptions(prev => new Set(prev).add(misconceptionId));

    try {
      const response = await fetch('/api/v1/education/myth-busting', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          misconceptionId,
          annualInterestRate: 0.08, // Default 8% annual return
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to analyze misconception');
      }

      setScenarios(prev => ({
        ...prev,
        [misconceptionId]: data.data.scenario,
      }));
    } catch (error) {
      console.error('Error analyzing misconception:', error);
      // TODO: Show error toast
    } finally {
      setAnalyzingMisconceptions(prev => {
        const newSet = new Set(prev);
        newSet.delete(misconceptionId);
        return newSet;
      });
    }
  }, []);

  /**
   * Analyze all dangerous misconceptions
   */
  const analyzeAllDangerous = useCallback(async () => {
    const dangerousIds = dangerousMisconceptions.map(m => m.id);
    
    // Analyze them sequentially to avoid overwhelming the API
    for (const id of dangerousIds) {
      if (!scenarios[id] && !analyzingMisconceptions.has(id)) {
        await analyzeMisconception(id);
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
  }, [dangerousMisconceptions, scenarios, analyzingMisconceptions, analyzeMisconception]);

  /**
   * Filter misconceptions based on current filters
   */
  const filteredMisconceptions = React.useMemo(() => {
    let filtered = allMisconceptions;

    // Filter by danger level
    if (selectedDangerLevel !== 'all') {
      filtered = filtered.filter(m => m.dangerLevel === selectedDangerLevel);
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(m => m.type === selectedType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(query) ||
        m.belief.toLowerCase().includes(query) ||
        m.reality.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [allMisconceptions, selectedDangerLevel, selectedType, searchQuery]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="border-warning/20 bg-gradient-to-r from-warning/5 to-danger/5">
        <CardHeader className="pb-2">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              🎯 Common Misconceptions Debunker
            </h1>
            <p className="text-foreground-600 text-sm">
              Discover the mathematical truth behind common lottery beliefs. Each misconception 
              is analyzed with real calculations to show the financial reality.
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h2 className="text-lg font-semibold">🚨 Most Dangerous Misconceptions</h2>
            <Button
              color="danger"
              variant="solid"
              onPress={analyzeAllDangerous}
              isLoading={dangerousMisconceptions.some(m => analyzingMisconceptions.has(m.id))}
              startContent={!dangerousMisconceptions.some(m => analyzingMisconceptions.has(m.id)) ? "⚡" : undefined}
            >
              Analyze All Dangerous Myths
            </Button>
          </div>
        </CardHeader>
        <CardBody>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dangerousMisconceptions.map((misconception) => (
              <div key={misconception.id} className="p-3 rounded-lg bg-danger/5 border border-danger/20">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="text-sm font-semibold text-foreground">
                    {misconception.title}
                  </h3>
                  <Chip size="sm" color="danger" variant="solid">
                    {misconception.commonness}/10
                  </Chip>
                </div>
                <p className="text-xs text-foreground-600 mb-3 line-clamp-2">
                  {misconception.belief}
                </p>
                <Button
                  size="sm"
                  color="danger"
                  variant="flat"
                  onPress={() => analyzeMisconception(misconception.id)}
                  isLoading={analyzingMisconceptions.has(misconception.id)}
                  className="w-full"
                >
                  {scenarios[misconception.id] ? 'View Analysis' : 'Analyze'}
                </Button>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold">🔍 Explore All Misconceptions</h2>
        </CardHeader>
        <CardBody>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <Input
              placeholder="Search misconceptions..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              className="flex-1"
              startContent="🔍"
            />
            <Select
              placeholder="Filter by danger level"
              selectedKeys={[selectedDangerLevel]}
              onSelectionChange={(keys) => setSelectedDangerLevel(Array.from(keys)[0] as string)}
              className="w-full md:w-48"
            >
              <SelectItem key="all">All Levels</SelectItem>
              <SelectItem key="extreme">🔴 Extreme</SelectItem>
              <SelectItem key="high">🟠 High</SelectItem>
              <SelectItem key="medium">🟡 Medium</SelectItem>
              <SelectItem key="low">🟢 Low</SelectItem>
            </Select>
            <Select
              placeholder="Filter by type"
              selectedKeys={[selectedType]}
              onSelectionChange={(keys) => setSelectedType(Array.from(keys)[0] as string)}
              className="w-full md:w-48"
            >
              <SelectItem key="all">All Types</SelectItem>
              <SelectItem key="guarantee_belief">Guarantee Beliefs</SelectItem>
              <SelectItem key="proportional_odds">Proportional Odds</SelectItem>
              <SelectItem key="replacement_strategy">Replacement Strategy</SelectItem>
              <SelectItem key="same_numbers_daily">Same Numbers Daily</SelectItem>
              <SelectItem key="hot_cold_numbers">Hot/Cold Numbers</SelectItem>
              <SelectItem key="time_guarantee">Time Guarantee</SelectItem>
            </Select>
          </div>

          {/* Results Summary */}
          <div className="flex items-center gap-4 mb-4">
            <Chip color="primary" variant="flat">
              {filteredMisconceptions.length} misconception{filteredMisconceptions.length !== 1 ? 's' : ''} found
            </Chip>
            <Chip color="secondary" variant="flat">
              {Object.keys(scenarios).length} analyzed
            </Chip>
            {analyzingMisconceptions.size > 0 && (
              <Chip color="warning" variant="flat" startContent={<Spinner size="sm" />}>
                {analyzingMisconceptions.size} analyzing...
              </Chip>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Misconceptions Grid */}
      <div className="space-y-6">
        {filteredMisconceptions.length === 0 ? (
          <Card>
            <CardBody className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No misconceptions found
              </h3>
              <p className="text-foreground-600">
                Try adjusting your search criteria or filters.
              </p>
            </CardBody>
          </Card>
        ) : (
          filteredMisconceptions.map((misconception) => (
            <MythBuster
              key={misconception.id}
              misconception={misconception}
              scenario={scenarios[misconception.id]}
              onAnalyze={analyzeMisconception}
              isAnalyzing={analyzingMisconceptions.has(misconception.id)}
            />
          ))
        )}
      </div>

      {/* Educational Footer */}
      <Card className="border-secondary/20 bg-secondary/5">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">🎓</div>
            <div>
              <h2 className="text-xl font-semibold text-secondary mb-3">
                Understanding Lottery Misconceptions
              </h2>
              <div className="space-y-3 text-sm text-foreground-600">
                <p>
                  <strong>Why These Beliefs Are Dangerous:</strong> Lottery misconceptions lead people 
                  to spend significant money based on false mathematical assumptions. Understanding 
                  the real odds helps make informed financial decisions.
                </p>
                <p>
                  <strong>The Mathematics:</strong> Each lottery draw is independent with fixed odds. 
                  No strategy, pattern, or belief can change the fundamental mathematics of probability.
                </p>
                <p>
                  <strong>Financial Reality:</strong> The calculations show that even "guaranteed" 
                  strategies often result in significant losses. Investment alternatives typically 
                  provide much better long-term returns.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};
