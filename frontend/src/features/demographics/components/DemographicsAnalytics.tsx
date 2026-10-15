import React, { useEffect, useRef } from 'react';
import * as echarts from 'echarts';
import { useQuery } from '@tanstack/react-query';
import { createApiClient } from '../../../api/client';

// The API endpoint we just created
const fetchAnalytics = async () => {
  const client = createApiClient();
  const res = await client.get('/analytics/demographics');
  return res.data;
};

export interface DemographicsAnalyticsProps {
  onRiskClick?: (riskLevel: string) => void;
}

export const DemographicsAnalytics: React.FC<DemographicsAnalyticsProps> = ({ onRiskClick }) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['demographics-analytics'],
    queryFn: fetchAnalytics,
  });

  const pieChartRef = useRef<HTMLDivElement>(null);
  const barChartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data) return;

    let pieChart: echarts.ECharts | null = null;
    let barChart: echarts.ECharts | null = null;

    if (pieChartRef.current) {
      pieChart = echarts.init(pieChartRef.current);
      pieChart.setOption({
        title: { text: 'विपद् जोखिम (नदी किनार)', left: 'center' },
        tooltip: { trigger: 'item' },
        legend: { bottom: 0 },
        color: ['#ef4444', '#10b981'],
        series: [
          {
            name: 'घरधुरी',
            type: 'pie',
            radius: ['40%', '70%'],
            data: [
              { value: Number(data.risk.riverbank_households), name: 'जोखिम (नदी किनार)' },
              { value: Number(data.risk.safe_households), name: 'सुरक्षित' }
            ]
          }
        ]
      });

      pieChart.on('click', (params: any) => {
        if (onRiskClick) {
          if (params.name.includes('जोखिम')) {
            onRiskClick('medium');
          } else if (params.name.includes('सुरक्षित')) {
            onRiskClick('low');
          }
        }
      });
    }

    if (barChartRef.current) {
      barChart = echarts.init(barChartRef.current);
      
      const categories = data.gender.map((g: any) => g.headGender === 'male' ? 'पुरुष' : (g.headGender === 'female' ? 'महिला' : 'अन्य'));
      const values = data.gender.map((g: any) => Number(g.count));

      barChart.setOption({
        title: { text: 'घरमुलीको लिङ्ग', left: 'center' },
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: categories },
        yAxis: { type: 'value' },
        color: ['#3b82f6'],
        series: [
          {
            data: values,
            type: 'bar',
            barWidth: '50%',
          }
        ]
      });
    }

    const handleResize = () => {
      pieChart?.resize();
      barChart?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      pieChart?.dispose();
      barChart?.dispose();
    };
  }, [data]);

  if (isLoading) return <div style={{ padding: '2rem', textAlign: 'center' }}>तथ्याङ्क लोड हुँदैछ...</div>;
  if (error) return <div style={{ padding: '2rem', textAlign: 'center', color: 'red' }}>तथ्याङ्क लोड गर्न समस्या भयो।</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', padding: '1rem' }}>
      <div className="dt-card" style={{ padding: '1.5rem' }}>
        <div ref={pieChartRef} style={{ width: '100%', height: '350px' }} />
      </div>
      <div className="dt-card" style={{ padding: '1.5rem' }}>
        <div ref={barChartRef} style={{ width: '100%', height: '350px' }} />
      </div>
    </div>
  );
};
