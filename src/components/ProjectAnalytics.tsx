import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell } from 'recharts';
import { CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { useProject } from '@/contexts/ProjectContext';

const ProjectAnalytics: React.FC = () => {
  const { projects } = useProject();

  // Mock analytics data for prototyping
  const analyticsData = {
    totalCompletions: 847,
    averageDuration: 12.5, // days
    completionRate: 89.2, // percentage
    issueReportRate: 23.4 // percentage
  };

  // Mock project duration distribution (bell curve data)
  const durationData = [
    { days: 5, projects: 12 },
    { days: 7, projects: 34 },
    { days: 9, projects: 67 },
    { days: 11, projects: 89 },
    { days: 13, projects: 125 }, // peak around average
    { days: 15, projects: 98 },
    { days: 17, projects: 72 },
    { days: 19, projects: 45 },
    { days: 21, projects: 23 },
    { days: 23, projects: 11 },
    { days: 25, projects: 6 }
  ];

  // Mock time spent at each step data
  const stepTimeData = [
    { step: 'Planning & Prep', avgHours: 3.2, completions: 847 },
    { step: 'Material Gathering', avgHours: 1.8, completions: 820 },
    { step: 'Surface Preparation', avgHours: 4.5, completions: 798 },
    { step: 'Primary Work', avgHours: 8.3, completions: 785 },
    { step: 'Quality Check', avgHours: 1.1, completions: 761 },
    { step: 'Final Cleanup', avgHours: 2.2, completions: 751 },
    { step: 'Documentation', avgHours: 0.8, completions: 742 }
  ];

  // Mock issue distribution data
  const issueData = [
    { name: 'No Issues', value: 76.6, count: 649 },
    { name: 'Material Issues', value: 12.3, count: 104 },
    { name: 'Unclear Instructions', value: 7.2, count: 61 },
    { name: 'Tool Problems', value: 2.8, count: 24 },
    { name: 'Safety Concerns', value: 1.1, count: 9 }
  ];

  const COLORS = ['hsl(var(--primary))', 'hsl(var(--destructive))', 'hsl(var(--warning))', 'hsl(var(--secondary))', 'hsl(var(--muted))'];

  const formatTooltipValue = (value: any, name: string) => {
    if (name === 'avgHours') return [`${value} hours`, 'Average Time'];
    if (name === 'projects') return [`${value} projects`, 'Count'];
    if (name === 'completions') return [`${value} completions`, 'Completed'];
    return [value, name];
  };

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="gradient-card border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Completions</p>
                <p className="text-2xl font-bold">{analyticsData.totalCompletions.toLocaleString()}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{analyticsData.averageDuration} days</p>
              </div>
              <Clock className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{analyticsData.completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="gradient-card border-0 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Issue Reports</p>
                <p className="text-2xl font-bold">{analyticsData.issueReportRate}%</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Duration Distribution */}
        <Card className="gradient-card border-0 shadow-card">
          <CardHeader>
            <CardTitle>Project Duration Distribution</CardTitle>
            <CardDescription>
              Bell curve showing project completion times (avg: {analyticsData.averageDuration} days)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={durationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="days" 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Days to Complete', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  label={{ value: 'Number of Projects', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={formatTooltipValue}
                  labelFormatter={(value) => `${value} days`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="projects" 
                  stroke="hsl(var(--primary))" 
                  fill="hsl(var(--primary))"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Issue Report Distribution */}
        <Card className="gradient-card border-0 shadow-card">
          <CardHeader>
            <CardTitle>Issue Report Distribution</CardTitle>
            <CardDescription>
              Breakdown of issues reported during project completion
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={issueData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {issueData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value, name) => [`${value}% (${issueData.find(d => d.name === name)?.count} projects)`, name]}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--background))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Time at Each Step */}
      <Card className="gradient-card border-0 shadow-card">
        <CardHeader>
          <CardTitle>Average Time Spent at Each Step</CardTitle>
          <CardDescription>
            Column chart showing how long users spend on each workflow step
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={stepTimeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="step" 
                stroke="hsl(var(--muted-foreground))"
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis 
                stroke="hsl(var(--muted-foreground))"
                label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={formatTooltipValue}
                labelFormatter={(value) => `Step: ${value}`}
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px'
                }}
              />
              <Bar 
                dataKey="avgHours" 
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
          
          {/* Step completion rates */}
          <div className="mt-6 space-y-2">
            <h4 className="font-semibold text-sm text-muted-foreground">Step Completion Rates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {stepTimeData.map((step, index) => {
                const completionRate = ((step.completions / analyticsData.totalCompletions) * 100).toFixed(1);
                return (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                    <span className="text-sm truncate">{step.step}</span>
                    <Badge variant="outline" className="ml-2">
                      {completionRate}%
                    </Badge>
                  </div>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectAnalytics;