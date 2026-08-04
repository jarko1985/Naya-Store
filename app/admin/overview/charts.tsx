'use client';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/utils';

const Charts = ({
  data: { salesData },
}: {
  data: { salesData: { month: string; totalSales: number }[] };
}) => {
  return (
    <ResponsiveContainer width='100%' height={300} minWidth={0}>
      <BarChart data={salesData}>
        <XAxis
          dataKey='month'
          stroke='#888888'
          fontSize={11}
          tickLine={false}
          axisLine={false}
          interval='preserveStartEnd'
        />
        <YAxis
          stroke='#888888'
          fontSize={11}
          tickLine={false}
          axisLine={false}
          width={40}
          tickFormatter={(value) => formatCurrency(value)}
        />
        <Bar
          dataKey='totalSales'
          fill='currentColor'
          radius={[4, 4, 0, 0]}
          className='fill-primary'
        />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default Charts;