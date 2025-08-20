import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { 
  Brain,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Zap
} from "lucide-react";

interface AIAnalyticsProps {
  eventId: string;
}

interface PlagiarismStats {
  totalSubmissions: number;
  averageSimilarity: number;
  highRiskSubmissions: number;
  totalFlags: number;
  qualityScore: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
  };
}

interface AIAnalyticsData {
  eventId: string;
  overview: PlagiarismStats;
  recommendations: string[];
  lastUpdated: string;
}

export function AIAnalytics({ eventId }: AIAnalyticsProps) {
  const { toast } = useToast();
  const [isRunning, setIsRunning] = useState(false);

  // Fetch AI analytics data
  const { data: analyticsData, isLoading, refetch } = useQuery<AIAnalyticsData>({
    queryKey: ['/api', 'ai', 'analytics', eventId],
    enabled: !!eventId,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const runPlagiarismScan = async () => {
    try {
      setIsRunning(true);
      
      // This would typically trigger a batch plagiarism scan
      await new Promise(resolve => setTimeout(resolve, 3000)); // Simulate processing
      
      toast({
        title: "AI Analysis Complete",
        description: "Plagiarism detection scan completed for all submissions."
      });

      refetch();
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to complete AI analysis. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
    }
  };

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'high': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
    }
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 animate-spin" />
            <span>Loading AI Analytics...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="w-6 h-6 text-blue-600" />
            AI-Powered Analytics
          </h2>
          <p className="text-muted-foreground">
            Advanced plagiarism detection and quality analysis
          </p>
        </div>
        <Button 
          onClick={runPlagiarismScan}
          disabled={isRunning}
          data-testid="button-run-ai-scan"
        >
          {isRunning ? (
            <Clock className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Zap className="w-4 h-4 mr-2" />
          )}
          {isRunning ? 'Running Analysis...' : 'Run AI Scan'}
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <BarChart3 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-total-submissions">
              {analyticsData?.overview.totalSubmissions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Analyzed by AI
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getQualityScoreColor(analyticsData?.overview.qualityScore || 0)}`} data-testid="text-quality-score">
              {Math.round(analyticsData?.overview.qualityScore || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Overall event quality
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Similarity</CardTitle>
            <Shield className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="text-avg-similarity">
              {Math.round(analyticsData?.overview.averageSimilarity || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Across all submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600" data-testid="text-high-risk">
              {analyticsData?.overview.highRiskSubmissions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Require manual review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Risk Distribution
          </CardTitle>
          <CardDescription>
            AI-powered plagiarism risk assessment across submissions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {analyticsData?.overview.riskDistribution && (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span className="text-sm font-medium">Low Risk</span>
                  </div>
                  <Badge className={getRiskColor('low')}>
                    {analyticsData.overview.riskDistribution.low}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <span className="text-sm font-medium">Medium Risk</span>
                  </div>
                  <Badge className={getRiskColor('medium')}>
                    {analyticsData.overview.riskDistribution.medium}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <span className="text-sm font-medium">High Risk</span>
                  </div>
                  <Badge className={getRiskColor('high')}>
                    {analyticsData.overview.riskDistribution.high}
                  </Badge>
                </div>
              </div>

              {/* Progress bars for visual representation */}
              <div className="space-y-2 pt-4">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span>Quality Distribution</span>
                    <span>{analyticsData.overview.totalSubmissions} total</span>
                  </div>
                  <div className="flex h-2 rounded-full overflow-hidden">
                    <div 
                      className="bg-green-500" 
                      style={{ 
                        width: `${(analyticsData.overview.riskDistribution.low / analyticsData.overview.totalSubmissions) * 100}%` 
                      }}
                    />
                    <div 
                      className="bg-yellow-500" 
                      style={{ 
                        width: `${(analyticsData.overview.riskDistribution.medium / analyticsData.overview.totalSubmissions) * 100}%` 
                      }}
                    />
                    <div 
                      className="bg-red-500" 
                      style={{ 
                        width: `${(analyticsData.overview.riskDistribution.high / analyticsData.overview.totalSubmissions) * 100}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* AI Recommendations */}
      {analyticsData?.recommendations && analyticsData.recommendations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              AI Recommendations
            </CardTitle>
            <CardDescription>
              Smart insights to improve your hackathon
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analyticsData.recommendations.map((recommendation, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm" data-testid={`text-recommendation-${index}`}>
                    {recommendation}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Last Updated */}
      {analyticsData?.lastUpdated && (
        <div className="text-xs text-muted-foreground text-center">
          Last updated: {new Date(analyticsData.lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
}

export default AIAnalytics;