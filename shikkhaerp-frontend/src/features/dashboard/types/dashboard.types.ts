export interface StatCard {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: number;
}

export interface Activity {
  id: string;
  action: string;
  user: string;
  time: string;
  icon: string;
}
