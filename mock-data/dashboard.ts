import type { StatCardData, RadarChartSeries } from '@/types';

export const mockStatCards: StatCardData[] = [
  {
    title: 'Total Users',
    value: '1,284',
    description: 'Registered accounts',
    trend: { value: 12, label: 'vs last month' },
  },
  {
    title: 'Average Score',
    value: 78,
    description: 'Across all participants',
    trend: { value: 5, label: 'vs last month' },
  },
  {
    title: 'Completion Rate',
    value: '64%',
    description: 'Tasks completed',
    trend: { value: -3, label: 'vs last month' },
  },
  {
    title: 'Active Today',
    value: 42,
    description: 'Users online now',
  },
];

export const mockRadarSeries: RadarChartSeries[] = [
  {
    key: 'score',
    label: 'Current',
    color: '#3b82f6',
    data: [
      { subject: 'Rhythm', value: 80 },
      { subject: 'Lyrics', value: 65 },
      { subject: 'Flow',   value: 90 },
      { subject: 'Tone',   value: 70 },
      { subject: 'Energy', value: 85 },
    ],
  },
  {
    key: 'target',
    label: 'Target',
    color: '#10b981',
    data: [
      { subject: 'Rhythm', value: 90 },
      { subject: 'Lyrics', value: 80 },
      { subject: 'Flow',   value: 85 },
      { subject: 'Tone',   value: 80 },
      { subject: 'Energy', value: 90 },
    ],
  },
];
