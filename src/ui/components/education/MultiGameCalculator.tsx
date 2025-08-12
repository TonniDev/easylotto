'use client';

import React, { useState, useCallback, useMemo } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Slider,
  Input,
  Divider,
  Spinner,
  Chip,
  Tabs,
  Tab,
} from '@heroui/react';
import { MultiGameCalculationResult } from '@lib/definitions/multiGameScenario';
import { formatBRL } from '@lib/utils/financial/compoundInterest';
import { InvestmentGrowthChart } from '@ui/components/charts/InvestmentGrowthChart';
import { ProbabilityChart, ProbabilityBarChart } from '@ui/components/charts/ProbabilityChart';
import { EducationalInsights } from '@ui/components/education/EducationalInsights';

interface MultiGameCalculatorProps {
  className?: string;
}

/**
 * Main Multi-Game Strategy Calculator Component
 */
export const MultiGameCalculator: React.FC<MultiGameCalculatorProps> = ({
  className = '',
}) => {
  // State for calculator inputs
  const [gamesPerDraw, setGamesPerDraw] = useState<number>(5);
  const [years, setYears] = useState<number>(10);
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(8);
  
  // State for calculation results
  const [result, setResult] = useState<MultiGameCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Calculate the multi-game scenario
   */
  const calculateScenario = useCallback(async () => {
    setIsCalculating(true);
    setError(null);

    try {
      const response = await fetch('/api/v1/education/multi-game-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          gamesPerDraw,
          years,
          annualInterestRate: annualInterestRate / 100, // Convert percentage to decimal
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to calculate scenario');
      }

      setResult(data.data.result);
    } catch (err) {
      console.error('Error calculating scenario:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsCalculating(false);
    }
  }, [gamesPerDraw, years, annualInterestRate]);

  /**
   * Auto-calculate when inputs change (debounced)
   */
  const debouncedCalculate = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(calculateScenario, 500);
    };
  }, [calculateScenario]);

  // Auto-calculate on input changes
  React.useEffect(() => {
    debouncedCalculate();
  }, [debouncedCalculate]);

  /**
   * Reset to default values
   */
  const resetToDefaults = () => {
    setGamesPerDraw(5);
    setYears(10);
    setAnnualInterestRate(8);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader className="pb-2">
          <div className="flex flex-col space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              🎲 Multi-Game Strategy Calculator
            </h1>
            <p className="text-foreground-600 text-sm">
              Discover the mathematical reality of playing multiple lottery games. 
              See the true costs and compare with investment alternatives.
            </p>
          </div>
        </CardHeader>
      </Card>

      {/* Input Controls */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center w-full">
            <h2 className="text-lg font-semibold">📊 Scenario Parameters</h2>
            <Button
              size="sm"
              variant="ghost"
              onPress={resetToDefaults}
              className="text-foreground-500"
            >
              Reset to Defaults
            </Button>
          </div>
        </CardHeader>
        <CardBody className="space-y-6">
          {/* Games per Draw */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">
                Games per Draw
              </label>
              <Chip size="sm" color="primary" variant="flat">
                {gamesPerDraw} game{gamesPerDraw !== 1 ? 's' : ''}
              </Chip>
            </div>
            <Slider
              size="lg"
              step={1}
              minValue={1}
              maxValue={50}
              value={gamesPerDraw}
              onChange={(value) => setGamesPerDraw(Array.isArray(value) ? value[0] : value)}
              className="max-w-full"
              color="primary"
              showTooltip
              tooltipProps={{
                content: `${gamesPerDraw} games × R$ 3,50 = R$ ${(gamesPerDraw * 3.5).toFixed(2)} per draw`,
              }}
            />
            <p className="text-xs text-foreground-500">
              Cost per draw: {formatBRL(gamesPerDraw * 3.5)} • 
              Weekly cost: {formatBRL(gamesPerDraw * 3.5 * 6)}
            </p>
          </div>

          {/* Years */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">
                Years of Playing
              </label>
              <Chip size="sm" color="secondary" variant="flat">
                {years} year{years !== 1 ? 's' : ''}
              </Chip>
            </div>
            <Slider
              size="lg"
              step={1}
              minValue={1}
              maxValue={50}
              value={years}
              onChange={(value) => setYears(Array.isArray(value) ? value[0] : value)}
              className="max-w-full"
              color="secondary"
              showTooltip
              tooltipProps={{
                content: `${years} years = ${years * 52 * 6} total draws`,
              }}
            />
            <p className="text-xs text-foreground-500">
              Total draws: {(years * 52 * 6).toLocaleString()} • 
              Total games: {(gamesPerDraw * years * 52 * 6).toLocaleString()}
            </p>
          </div>

          {/* Interest Rate */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-foreground">
                Investment Return Rate (Annual)
              </label>
              <Chip size="sm" color="success" variant="flat">
                {annualInterestRate}%
              </Chip>
            </div>
            <Slider
              size="lg"
              step={0.5}
              minValue={1}
              maxValue={15}
              value={annualInterestRate}
              onChange={(value) => setAnnualInterestRate(Array.isArray(value) ? value[0] : value)}
              className="max-w-full"
              color="success"
              showTooltip
              tooltipProps={{
                content: `${annualInterestRate}% annual return (${(annualInterestRate / 12).toFixed(2)}% monthly)`,
              }}
            />
            <p className="text-xs text-foreground-500">
              Conservative: 6-8% • Moderate: 8-10% • Aggressive: 10-12%
            </p>
          </div>

          {/* Calculate Button */}
          <div className="flex justify-center pt-4">
            <Button
              color="primary"
              size="lg"
              onPress={calculateScenario}
              isLoading={isCalculating}
              className="min-w-48"
            >
              {isCalculating ? 'Calculating...' : 'Calculate Scenario'}
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-danger/20 bg-danger/5">
          <CardBody>
            <div className="flex items-center gap-2 text-danger">
              <span className="text-lg">⚠️</span>
              <p className="text-sm font-medium">{error}</p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Loading State */}
      {isCalculating && (
        <Card>
          <CardBody className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <Spinner size="lg" color="primary" />
              <p className="text-foreground-600">
                Calculating your lottery scenario...
              </p>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Results */}
      {result && !isCalculating && (
        <div className="space-y-6">
          {/* Key Statistics */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">📈 Key Statistics</h2>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 rounded-lg bg-danger/10 border border-danger/20">
                  <p className="text-2xl font-bold text-danger">
                    {result.neverWinningPercentage.toFixed(1)}%
                  </p>
                  <p className="text-xs text-foreground-600 mt-1">
                    Chance of Never Winning
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-2xl font-bold text-primary">
                    {formatBRL(parseFloat(result.totalCost))}
                  </p>
                  <p className="text-xs text-foreground-600 mt-1">
                    Total Cost
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-2xl font-bold text-success">
                    {formatBRL(parseFloat(result.investmentReturn))}
                  </p>
                  <p className="text-xs text-foreground-600 mt-1">
                    Investment Alternative
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-2xl font-bold text-warning">
                    {result.totalGames.toLocaleString()}
                  </p>
                  <p className="text-xs text-foreground-600 mt-1">
                    Total Games Played
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          {/* Visualizations */}
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold">📊 Visual Analysis</h2>
            </CardHeader>
            <CardBody>
              <Tabs aria-label="Analysis tabs" color="primary" variant="underlined">
                <Tab key="probability" title="Winning Probability">
                  <div className="py-4">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-md font-semibold mb-4">Probability Breakdown</h3>
                        <ProbabilityChart
                          winningPercentage={result.probabilityPercentage}
                          neverWinningPercentage={result.neverWinningPercentage}
                          height={250}
                        />
                      </div>
                      <div>
                        <h3 className="text-md font-semibold mb-4">Reality Check</h3>
                        <ProbabilityBarChart
                          winningPercentage={result.probabilityPercentage}
                          neverWinningPercentage={result.neverWinningPercentage}
                        />
                      </div>
                    </div>
                  </div>
                </Tab>
                <Tab key="investment" title="Investment Growth">
                  <div className="py-4">
                    <h3 className="text-md font-semibold mb-4">
                      Lottery Spending vs Investment Growth Over Time
                    </h3>
                    <InvestmentGrowthChart
                      data={result.investmentGrowthData}
                      height={350}
                    />
                  </div>
                </Tab>
              </Tabs>
            </CardBody>
          </Card>

          {/* Educational Insights */}
          <EducationalInsights insights={result.insights} />
        </div>
      )}
    </div>
  );
};
