import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Flame, Shield, TrendingUp, Briefcase, Target,
} from "lucide-react";

const FinancialDashboard = () => {
  // Demo data — will connect to real user data when backend integration is complete
  const metrics = {
    disciplineStreak: 12,
    riskLiteracyScore: 68,
    portfolioPerformance: 74,
    cashflowStability: 55,
    entrepreneurialReadiness: 42,
  };

  const metricCards = [
    {
      label: "Financial Discipline Streak",
      value: `${metrics.disciplineStreak} days`,
      score: Math.min(metrics.disciplineStreak * 3, 100),
      icon: <Flame className="w-5 h-5" />,
      color: "text-orange-500",
    },
    {
      label: "Risk Literacy Score",
      value: `${metrics.riskLiteracyScore}/100`,
      score: metrics.riskLiteracyScore,
      icon: <Shield className="w-5 h-5" />,
      color: "text-blue-500",
    },
    {
      label: "Portfolio Simulation",
      value: `${metrics.portfolioPerformance}%`,
      score: metrics.portfolioPerformance,
      icon: <TrendingUp className="w-5 h-5" />,
      color: "text-green-500",
    },
    {
      label: "Cashflow Stability",
      value: `${metrics.cashflowStability}/100`,
      score: metrics.cashflowStability,
      icon: <Target className="w-5 h-5" />,
      color: "text-purple-500",
    },
    {
      label: "Entrepreneurial Readiness",
      value: `${metrics.entrepreneurialReadiness}/100`,
      score: metrics.entrepreneurialReadiness,
      icon: <Briefcase className="w-5 h-5" />,
      color: "text-amber-500",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metricCards.map((metric) => (
          <Card key={metric.label} className="border-border">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className={`${metric.color}`}>{metric.icon}</div>
                <Badge variant="outline" className="text-xs">{metric.value}</Badge>
              </div>
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <Progress value={metric.score} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {metric.score < 40 ? "Getting started" : metric.score < 70 ? "Building momentum" : "Strong progress"}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border">
        <CardHeader>
          <CardTitle className="text-lg">Financial Growth Trajectory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {["Foundation", "Practitioner", "Specialist", "Elite"].map((level, i) => (
              <div key={level} className="flex items-center gap-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  i === 0 ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">{level}</p>
                  <Progress value={i === 0 ? 45 : 0} className="h-1.5 mt-1" />
                </div>
                {i === 0 && <Badge className="bg-accent text-accent-foreground text-xs">Current</Badge>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialDashboard;
