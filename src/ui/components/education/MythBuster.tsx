'use client';

import React, { useState } from 'react';
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Chip,
  Divider,
  Accordion,
  AccordionItem,
  Progress,
} from '@heroui/react';
import { 
  LotteryMisconception, 
  MythBustingScenario 
} from '@lib/definitions/commonMisconceptions';
import { formatBRL } from '@lib/utils/financial/compoundInterest';

interface MythBusterProps {
  misconception: LotteryMisconception;
  scenario?: MythBustingScenario;
  onAnalyze?: (misconceptionId: string) => void;
  isAnalyzing?: boolean;
  className?: string;
}

/**
 * Get color scheme for danger level
 */
const getDangerColor = (dangerLevel: LotteryMisconception['dangerLevel']) => {
  switch (dangerLevel) {
    case 'extreme':
      return {
        chipColor: 'danger' as const,
        cardClass: 'border-danger/30 bg-danger/5',
        progressColor: 'danger' as const,
      };
    case 'high':
      return {
        chipColor: 'warning' as const,
        cardClass: 'border-warning/30 bg-warning/5',
        progressColor: 'warning' as const,
      };
    case 'medium':
      return {
        chipColor: 'primary' as const,
        cardClass: 'border-primary/30 bg-primary/5',
        progressColor: 'primary' as const,
      };
    case 'low':
      return {
        chipColor: 'success' as const,
        cardClass: 'border-success/30 bg-success/5',
        progressColor: 'success' as const,
      };
  }
};

/**
 * Get financial impact icon
 */
const getFinancialImpactIcon = (impact: LotteryMisconception['financialImpact']) => {
  switch (impact) {
    case 'extreme': return '💸💸💸';
    case 'high': return '💸💸';
    case 'medium': return '💸';
    case 'low': return '💰';
  }
};

/**
 * Individual myth-busting card component
 */
export const MythBuster: React.FC<MythBusterProps> = ({
  misconception,
  scenario,
  onAnalyze,
  isAnalyzing = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { chipColor, cardClass, progressColor } = getDangerColor(misconception.dangerLevel);

  const handleAnalyze = () => {
    if (onAnalyze) {
      onAnalyze(misconception.id);
    }
  };

  return (
    <Card className={`${cardClass} border transition-all duration-300 hover:scale-[1.01] ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex flex-col w-full space-y-3">
          {/* Header with title and danger level */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {misconception.title}
              </h3>
              <div className="flex items-center gap-2 flex-wrap">
                <Chip
                  size="sm"
                  color={chipColor}
                  variant="solid"
                  className="font-medium"
                >
                  {misconception.dangerLevel.toUpperCase()} RISK
                </Chip>
                <Chip
                  size="sm"
                  color="secondary"
                  variant="flat"
                  startContent="📊"
                >
                  {misconception.commonness}/10 Common
                </Chip>
                <Chip
                  size="sm"
                  color="default"
                  variant="flat"
                  startContent={getFinancialImpactIcon(misconception.financialImpact)}
                >
                  {misconception.financialImpact} Impact
                </Chip>
              </div>
            </div>
          </div>

          {/* Belief vs Reality */}
          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-danger/10 border border-danger/20">
              <div className="flex items-start gap-2">
                <span className="text-lg">❌</span>
                <div>
                  <p className="text-sm font-medium text-danger mb-1">COMMON BELIEF:</p>
                  <p className="text-sm text-foreground-700">{misconception.belief}</p>
                </div>
              </div>
            </div>
            
            <div className="p-3 rounded-lg bg-success/10 border border-success/20">
              <div className="flex items-start gap-2">
                <span className="text-lg">✅</span>
                <div>
                  <p className="text-sm font-medium text-success mb-1">MATHEMATICAL REALITY:</p>
                  <p className="text-sm text-foreground-700">{misconception.reality}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Analyze Button */}
          <div className="flex justify-center">
            <Button
              color={chipColor}
              variant="solid"
              onPress={handleAnalyze}
              isLoading={isAnalyzing}
              className="min-w-48"
              startContent={!isAnalyzing ? "🔍" : undefined}
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze This Myth'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {/* Analysis Results */}
      {scenario && (
        <>
          <Divider />
          <CardBody className="pt-4">
            <div className="space-y-4">
              {/* Key Results */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="text-center p-3 rounded-lg bg-danger/10 border border-danger/20">
                  <p className="text-lg font-bold text-danger">
                    {((1 - scenario.calculatedResults.actualProbability) * 100).toFixed(1)}%
                  </p>
                  <p className="text-xs text-foreground-600 mt-1">
                    Chance of Never Winning
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <p className="text-lg font-bold text-primary">
                    {formatBRL(scenario.calculatedResults.totalCost)}
                  </p>
                  <p className="text-xs text-foreground-600 mt-1">
                    Total Cost
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-success/10 border border-success/20">
                  <p className="text-lg font-bold text-success">
                    {formatBRL(scenario.calculatedResults.investmentAlternative)}
                  </p>
                  <p className="text-xs text-foreground-600 mt-1">
                    Investment Alternative
                  </p>
                </div>
                <div className="text-center p-3 rounded-lg bg-warning/10 border border-warning/20">
                  <p className="text-lg font-bold text-warning">
                    {formatBRL(scenario.calculatedResults.expectedLoss)}
                  </p>
                  <p className="text-xs text-foreground-600 mt-1">
                    Expected Loss
                  </p>
                </div>
              </div>

              {/* Educational Insights */}
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  💡 Reality Check Insights
                </h4>
                <div className="space-y-2">
                  {scenario.educationalInsights.slice(0, 3).map((insight, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 rounded-lg bg-default/50 border border-default/20"
                    >
                      <span className="text-sm flex-shrink-0 mt-0.5">
                        {index === 0 ? '🚨' : index === 1 ? '💰' : '📊'}
                      </span>
                      <p className="text-sm text-foreground-600 leading-relaxed">
                        {insight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Expandable Details */}
              <Accordion variant="splitted">
                <AccordionItem
                  key="details"
                  aria-label="More Details"
                  title="📋 More Details & Debunking Points"
                  className="text-sm"
                >
                  <div className="space-y-4">
                    {/* Explanation */}
                    <div>
                      <h5 className="font-medium text-foreground mb-2">Why This Belief is Dangerous:</h5>
                      <p className="text-sm text-foreground-600 leading-relaxed">
                        {misconception.explanation}
                      </p>
                    </div>

                    {/* Debunking Points */}
                    <div>
                      <h5 className="font-medium text-foreground mb-2">Mathematical Debunking Points:</h5>
                      <ul className="space-y-1">
                        {misconception.debunkingPoints.map((point, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-foreground-600">
                            <span className="text-primary mt-1">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Examples */}
                    <div>
                      <h5 className="font-medium text-foreground mb-2">Real-World Examples:</h5>
                      <ul className="space-y-1">
                        {misconception.examples.map((example, index) => (
                          <li key={index} className="flex items-start gap-2 text-sm text-foreground-600">
                            <span className="text-secondary mt-1">→</span>
                            <span>{example}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* All Educational Insights */}
                    {scenario.educationalInsights.length > 3 && (
                      <div>
                        <h5 className="font-medium text-foreground mb-2">Additional Insights:</h5>
                        <div className="space-y-2">
                          {scenario.educationalInsights.slice(3).map((insight, index) => (
                            <div
                              key={index + 3}
                              className="flex items-start gap-2 p-2 rounded bg-default/30"
                            >
                              <span className="text-xs flex-shrink-0 mt-0.5">💡</span>
                              <p className="text-xs text-foreground-600 leading-relaxed">
                                {insight}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </AccordionItem>
              </Accordion>
            </div>
          </CardBody>
        </>
      )}
    </Card>
  );
};
