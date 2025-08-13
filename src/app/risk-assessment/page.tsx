import React from 'react';
import { Metadata } from 'next';
import { RiskAssessmentDashboard } from '@ui/components/risk-assessment/RiskAssessmentDashboard';

export const metadata: Metadata = {
  title: 'Risk Assessment Dashboard | EasyLotto',
  description: 'Track your spending patterns, set financial goals, and get personalized insights to make better financial decisions. Monitor lottery spending vs investment opportunities.',
  keywords: [
    'risk assessment',
    'spending tracker',
    'financial dashboard',
    'lottery spending',
    'investment comparison',
    'financial goals',
    'spending insights',
    'opportunity cost',
    'financial planning',
    'money management',
    'spending analysis',
    'financial education',
  ],
  openGraph: {
    title: 'Risk Assessment Dashboard - Track Your Financial Health',
    description: 'Personal financial dashboard to track spending, set goals, and discover investment opportunities. Get insights about your lottery spending patterns.',
    type: 'website',
    url: '/risk-assessment',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Risk Assessment Dashboard - Smart Financial Tracking',
    description: 'Track spending, set goals, and discover better investment opportunities with personalized financial insights.',
  },
};

/**
 * Risk Assessment Dashboard Page
 * 
 * Main page for personal financial risk assessment and spending tracking.
 * Provides comprehensive tools for monitoring spending patterns, setting goals,
 * and receiving personalized financial insights.
 */
export default function RiskAssessmentPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <RiskAssessmentDashboard />
    </div>
  );
}
