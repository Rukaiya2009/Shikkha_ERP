import React from 'react';
import { Users, BookOpen, DollarSign, Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: keyof typeof iconMap;
  color: string;
  trend?: number;
}

const iconMap = {
  Users, BookOpen, DollarSign, Calendar
};

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => {
  const Icon = iconMap[icon];
  return (
    <div className="group relative overflow-hidden rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-1">
              {trend >= 0 ? (
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <TrendingDown className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={`text-xs ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(trend)}% from last month
              </span>
            </div>
          )}
        </div>
        <div className={`rounded-full p-3 ${color} transition-all group-hover:scale-110`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

interface StatsCardsProps {
  stats: StatCardProps[];
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
};
