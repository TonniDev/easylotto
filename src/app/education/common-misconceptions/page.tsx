import React from 'react';
import { Metadata } from 'next';
import { Card, CardBody, Chip } from '@heroui/react';
import { CommonMisconceptionsDebunker } from '@ui/components/education/CommonMisconceptionsDebunker';

export const metadata: Metadata = {
  title: 'Common Lottery Misconceptions Debunker | EasyLotto',
  description: 'Discover the mathematical truth behind common lottery beliefs. Interactive myth-busting tool that analyzes dangerous misconceptions with real calculations and shows the financial reality.',
  keywords: [
    'lottery misconceptions',
    'lottery myths',
    'myth busting',
    'lottery beliefs',
    'lottery strategy debunked',
    'lottery odds reality',
    'financial education',
    'Lotofácil myths',
    'Brazilian lottery misconceptions',
    'lottery risk awareness',
    'gambling fallacies',
    'probability education',
  ],
  openGraph: {
    title: 'Common Lottery Misconceptions Debunker - Mathematical Truth',
    description: 'Interactive tool that debunks dangerous lottery beliefs with real mathematical calculations. See why common strategies fail and learn the financial reality.',
    type: 'website',
    url: '/education/common-misconceptions',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Lottery Misconceptions Debunker - Stop Believing These Myths',
    description: 'Discover why common lottery beliefs are mathematically wrong and financially dangerous.',
  },
};

/**
 * Common Misconceptions Debunker Page
 * 
 * Educational page that debunks common lottery misconceptions with
 * mathematical analysis and real financial calculations.
 */
export default function CommonMisconceptionsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          🎯 Common Lottery Misconceptions Debunker
        </h1>
        <p className="text-lg text-foreground-600 max-w-3xl mx-auto leading-relaxed">
          Many lottery players hold dangerous beliefs that lead to significant financial losses. 
          This tool uses mathematical analysis to debunk common misconceptions and show the 
          real financial impact of these beliefs.
        </p>
      </div>

      {/* Warning Banner */}
      <Card className="mb-8 border-danger/30 bg-danger/10">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">⚠️</div>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-danger">
                Why Lottery Misconceptions Are Financially Dangerous
              </h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color="danger" variant="solid">EXTREME RISK</Chip>
                    <span className="text-sm font-medium">False guarantee beliefs</span>
                  </div>
                  <p className="text-sm text-foreground-600 ml-6">
                    Believing that multiple daily games "guarantee" wins leads to massive spending 
                    with 60-80% chance of never winning anything significant.
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Chip size="sm" color="warning" variant="solid">HIGH RISK</Chip>
                    <span className="text-sm font-medium">Proportional odds fallacy</span>
                  </div>
                  <p className="text-sm text-foreground-600 ml-6">
                    Thinking "10 games = 10x better odds" causes people to spend 10x more money 
                    for marginal probability improvements.
                  </p>
                </div>
              </div>
              <div className="bg-success/10 border border-success/20 rounded-lg p-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <Chip size="sm" color="success" variant="solid">SOLUTION</Chip>
                  <span className="text-sm font-semibold text-success">Mathematical Education</span>
                </div>
                <p className="text-sm text-foreground-600">
                  Understanding the real mathematics behind lottery odds helps make informed 
                  financial decisions and avoid costly misconceptions.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Statistics Overview */}
      <Card className="mb-8 border-primary/20 bg-primary/5">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">📊</div>
            <div>
              <h2 className="text-xl font-semibold text-primary mb-3">
                Misconception Impact Statistics
              </h2>
              <div className="grid md:grid-cols-4 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Most Dangerous Belief</p>
                  <p className="text-foreground-600">• "5 games daily guarantees wins"</p>
                  <p className="text-foreground-600">• 67% chance of never winning</p>
                  <p className="text-foreground-600">• R$ 273,000 total cost over 50 years</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Most Common Fallacy</p>
                  <p className="text-foreground-600">• "Same numbers become due"</p>
                  <p className="text-foreground-600">• 9/10 commonness rating</p>
                  <p className="text-foreground-600">• Leads to emotional attachment</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Financial Impact</p>
                  <p className="text-foreground-600">• Average loss: R$ 150,000+</p>
                  <p className="text-foreground-600">• Investment alternative: R$ 1M+</p>
                  <p className="text-foreground-600">• Opportunity cost: 500-800%</p>
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-foreground">Reality Check</p>
                  <p className="text-foreground-600">• Each draw: 1 in 3,268,760 odds</p>
                  <p className="text-foreground-600">• No strategy changes this</p>
                  <p className="text-foreground-600">• House edge always wins</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Main Debunker Tool */}
      <CommonMisconceptionsDebunker />

      {/* Educational Context */}
      <Card className="mt-8 border-secondary/20 bg-secondary/5">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">🧠</div>
            <div>
              <h2 className="text-xl font-semibold text-secondary mb-3">
                Psychology Behind Lottery Misconceptions
              </h2>
              <div className="space-y-3 text-sm text-foreground-600">
                <p>
                  <strong>Gambler's Fallacy:</strong> The belief that past events affect future 
                  probabilities in independent events. This leads to thinking numbers are "due" 
                  or that patterns exist in random draws.
                </p>
                <p>
                  <strong>Availability Heuristic:</strong> People overestimate the probability 
                  of winning because lottery winners are highly publicized, while the millions 
                  of losers remain invisible.
                </p>
                <p>
                  <strong>Confirmation Bias:</strong> Players focus on small wins and ignore 
                  total losses, creating a false sense that their strategy is working.
                </p>
                <p>
                  <strong>Sunk Cost Fallacy:</strong> After spending significant money, players 
                  feel they must continue playing to "recover" their investment, leading to 
                  even greater losses.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* How to Use Guide */}
      <Card className="mt-8 border-warning/20 bg-warning/5">
        <CardBody className="p-6">
          <div className="flex items-start gap-4">
            <div className="text-3xl flex-shrink-0">📖</div>
            <div>
              <h2 className="text-xl font-semibold text-warning mb-3">
                How to Use This Debunker Tool
              </h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm text-foreground-600">
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Step 1: Identify Beliefs</h3>
                  <p>Browse through common misconceptions and identify beliefs you or others might hold.</p>
                  
                  <h3 className="font-medium text-foreground mt-3">Step 2: Analyze with Math</h3>
                  <p>Click "Analyze This Myth" to see real mathematical calculations and financial projections.</p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-medium text-foreground">Step 3: Understand Reality</h3>
                  <p>Review the probability calculations, total costs, and investment alternatives.</p>
                  
                  <h3 className="font-medium text-foreground mt-3">Step 4: Share Knowledge</h3>
                  <p>Use the insights to educate others about the mathematical reality of lottery playing.</p>
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      {/* Disclaimer */}
      <div className="text-center mt-8 text-xs text-foreground-500">
        <p>
          This tool is for educational purposes only. All calculations are based on mathematical 
          probability and historical data. Please play responsibly and within your means.
        </p>
      </div>
    </div>
  );
}
