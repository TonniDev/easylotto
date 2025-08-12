import React from 'react';
import { Metadata } from 'next';
import { Card, CardBody, Chip } from '@heroui/react';
import { MultiGameCalculator } from '@ui/components/education/MultiGameCalculator';

export const metadata: Metadata = {
  title: 'Multi-Game Strategy Calculator | EasyLotto',
  description: 'Discover the mathematical reality of playing multiple lottery games. Calculate true costs, winning probabilities, and compare with investment alternatives. Educational tool for lottery risk awareness.',
  keywords: [
    'lottery calculator',
    'multi-game strategy',
    'lottery odds',
    'investment alternative',
    'lottery risk',
    'financial education',
    'Lotofácil calculator',
    'Brazilian lottery',
    'probability calculator',
    'compound interest',
  ],
  openGraph: {
    title: 'Multi-Game Strategy Calculator - Understand Lottery Risks',
    description: 'Calculate the true costs and odds of playing multiple lottery games. See why investment alternatives often outperform lottery strategies.',
    type: 'website',
    url: '/education/multi-game-calculator',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Multi-Game Strategy Calculator - Lottery Risk Education',
    description: 'Interactive calculator showing the mathematical reality of multi-game lottery strategies.',
  },
};

/**
 * Multi-Game Strategy Calculator Page
 * 
 * Educational page that helps users understand the risks and costs
 * of playing multiple lottery games over time.
 */
export default function MultiGameCalculatorPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          🎲 Multi-Game Strategy Calculator
        </h1>
        <p className="text-lg text-foreground-600 max-w-3xl mx-auto leading-relaxed">
          Many people believe that playing multiple lottery games daily increases their chances 
          of winning or even guarantees eventual success. This calculator shows the mathematical 
          reality behind these strategies.
        </p>
      </div>

      {/* Educational Context */}
      <Card className="mb-8 border-warning/20 bg-warning/5">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">📚</div>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-warning">
                Common Misconceptions This Calculator Addresses
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color="danger" variant="flat">MYTH</Chip>
                    <span className="text-sm font-medium">"5 games daily guarantees 1-2 wins in lifetime"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color="danger" variant="flat">MYTH</Chip>
                    <span className="text-sm font-medium">"20 games daily guarantees win in 5-10 years"</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color="danger" variant="flat">MYTH</Chip>
                    <span className="text-sm font-medium">"More games = proportionally better odds"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color="danger" variant="flat">MYTH</Chip>
                    <span className="text-sm font-medium">"Replacing winning sets improves odds"</span>
                  </div>
                </div>
              </div>
              <div className="bg-success/10 border border-success/20 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Chip size="sm" color="success" variant="solid">REALITY</Chip>
                  <span className="text-sm font-semibold text-success">Mathematical Truth</span>
                </div>
                <p className="text-sm text-foreground-600">
                  Each lottery draw is independent with odds of 1 in 3,268,760. Playing multiple games 
                  improves odds marginally while costs increase linearly. Most multi-game strategies 
                  result in significant financial losses over time.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Brazilian Lottery Context */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">🇧🇷</div>
            <div>
              <h2 className="text-xl font-semibold text-primary mb-3">
                Brazilian Lotofácil Context
              </h2>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Game Details</p>
                  <p className="text-foreground-600">• Pick 15 from 25 numbers</p>
                  <p className="text-foreground-600">• 6 draws per week (Mon-Sat)</p>
                  <p className="text-foreground-600">• R$ 3,50 per game</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Winning Odds</p>
                  <p className="text-foreground-600">• Jackpot: 1 in 3,268,760</p>
                  <p className="text-foreground-600">• 14 numbers: 1 in 21,792</p>
                  <p className="text-foreground-600">• 13 numbers: 1 in 692</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Prize Structure</p>
                  <p className="text-foreground-600">• Base prize: ~R$ 1.8M</p>
                  <p className="text-foreground-600">• Accumulated: R$ 5-10M</p>
                  <p className="text-foreground-600">• Accumulation: ~2x/month</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Calculator */}
      <MultiGameCalculator />

      {/* Educational Footer */}
      <Card className="mt-8 border-secondary/20 bg-secondary/5">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">🎯</div>
            <div>
              <h2 className="text-xl font-semibold text-secondary mb-3">
                Understanding the Results
              </h2>
              <div className="space-y-3 text-sm text-foreground-600">
                <p>
                  <strong>Probability Calculations:</strong> We use precise mathematical formulas 
                  to calculate your chances of winning at least once over the specified period. 
                  The results often show that even "aggressive" strategies have high chances of never winning.
                </p>
                <p>
                  <strong>Investment Comparison:</strong> The calculator shows what your lottery 
                  spending could become if invested instead. We use compound interest calculations 
                  with conservative to moderate return rates (6-12% annually).
                </p>
                <p>
                  <strong>Educational Purpose:</strong> This tool is designed to promote financial 
                  literacy and help you make informed decisions. While playing the lottery can be 
                  entertainment, understanding the true costs and odds is important for responsible gaming.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Disclaimer */}
      <div className="text-center mt-8 text-xs text-foreground-500">
        <p>
          This calculator is for educational purposes only. Past results do not predict future outcomes. 
          Please play responsibly and within your means.
        </p>
      </div>
    </div>
  );
}
