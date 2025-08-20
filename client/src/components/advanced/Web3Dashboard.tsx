import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Star, 
  Users, 
  Award, 
  Target, 
  Zap,
  Crown,
  Medal,
  Activity,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Brain,
  MessageSquare,
  Shield
} from 'lucide-react';

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  rarity: string;
  unlocked: boolean;
}

interface UserAchievements {
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  achievements: Achievement[];
  recentUnlocks: Achievement[];
}

interface SentimentAnalysis {
  averageSentiment: number;
  positiveRatio: number;
  negativeRatio: number;
  toxicityLevel: string;
  helpfulnessLevel: string;
  emotionalBreakdown: {
    joy: number;
    anger: number;
    fear: number;
    sadness: number;
    surprise: number;
    disgust: number;
  };
}

interface PerformanceHealth {
  status: string;
  memoryUsage: {
    used: number;
    free: number;
    percentage: number;
  };
  cpuUsage: number;
  responseTime: {
    average: number;
    p95: number;
    p99: number;
  };
  throughput: number;
}

export function Web3Dashboard() {
  const [achievements, setAchievements] = useState<UserAchievements | null>(null);
  const [sentiment, setSentiment] = useState<SentimentAnalysis | null>(null);
  const [performance, setPerformance] = useState<PerformanceHealth | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Mock data for demo
      setAchievements({
        totalPoints: 1250,
        level: 7,
        nextLevelPoints: 1500,
        achievements: [
          {
            id: '1',
            name: 'First Steps',
            description: 'Join your first hackathon event',
            icon: '🚀',
            category: 'participation',
            points: 50,
            rarity: 'common',
            unlocked: true
          },
          {
            id: '2',
            name: 'Team Builder',
            description: 'Create 5 successful teams',
            icon: '🤝',
            category: 'collaboration',
            points: 300,
            rarity: 'rare',
            unlocked: true
          },
          {
            id: '3',
            name: 'Champion',
            description: 'Win 3 hackathon competitions',
            icon: '🏆',
            category: 'performance',
            points: 750,
            rarity: 'legendary',
            unlocked: false
          }
        ],
        recentUnlocks: []
      });

      setSentiment({
        averageSentiment: 0.65,
        positiveRatio: 0.72,
        negativeRatio: 0.18,
        toxicityLevel: 'low',
        helpfulnessLevel: 'high',
        emotionalBreakdown: {
          joy: 0.8,
          anger: 0.1,
          fear: 0.05,
          sadness: 0.1,
          surprise: 0.6,
          disgust: 0.02
        }
      });

      setPerformance({
        status: 'healthy',
        memoryUsage: { used: 245, free: 511, percentage: 32 },
        cpuUsage: 28,
        responseTime: { average: 145, p95: 340, p99: 890 },
        throughput: 12.5
      });

    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'legendary': return 'bg-yellow-500';
      case 'epic': return 'bg-purple-500';
      case 'rare': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className=\"flex items-center justify-center h-64\">
        <div className=\"animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600\"></div>
      </div>
    );
  }

  return (
    <div className=\"space-y-6\">
      <div className=\"flex items-center justify-between\">
        <div>
          <h1 className=\"text-3xl font-bold text-gray-900 dark:text-gray-100\">
            🚀 Advanced Platform Dashboard
          </h1>
          <p className=\"text-gray-600 dark:text-gray-400 mt-1\">
            Web3 Badges • AI Sentiment • Performance Monitoring • Gamification
          </p>
        </div>
        <Button className=\"bg-gradient-to-r from-purple-500 to-pink-500 text-white\">
          <Crown className=\"h-4 w-4 mr-2\" />
          Elite Features
        </Button>
      </div>

      <Tabs defaultValue=\"web3\" className=\"w-full\">
        <TabsList className=\"grid w-full grid-cols-4\">
          <TabsTrigger value=\"web3\">🎖️ Web3 & NFTs</TabsTrigger>
          <TabsTrigger value=\"achievements\">🏆 Achievements</TabsTrigger>
          <TabsTrigger value=\"sentiment\">🧠 AI Analysis</TabsTrigger>
          <TabsTrigger value=\"performance\">⚡ Performance</TabsTrigger>
        </TabsList>

        <TabsContent value=\"web3\" className=\"space-y-4\">
          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center gap-2\">
                  <Medal className=\"h-5 w-5 text-yellow-500\" />
                  NFT Badge Collection
                </CardTitle>
                <CardDescription>
                  Blockchain-verified proof of participation tokens
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className=\"space-y-4\">
                  <div className=\"flex items-center justify-between\">
                    <span>Total POAPs Earned</span>
                    <Badge variant=\"secondary\">7 NFTs</Badge>
                  </div>
                  <div className=\"grid grid-cols-2 gap-4\">
                    <div className=\"text-center p-4 border rounded-lg\">
                      <div className=\"text-2xl mb-2\">🏆</div>
                      <div className=\"font-medium\">Winner Badge</div>
                      <div className=\"text-sm text-gray-600\">Legendary</div>
                    </div>
                    <div className=\"text-center p-4 border rounded-lg\">
                      <div className=\"text-2xl mb-2\">⚖️</div>
                      <div className=\"font-medium\">Judge Badge</div>
                      <div className=\"text-sm text-gray-600\">Rare</div>
                    </div>
                  </div>
                  <Button className=\"w-full\" data-testid=\"button-view-collection\">
                    <Target className=\"h-4 w-4 mr-2\" />
                    View Full Collection
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center gap-2\">
                  <Shield className=\"h-5 w-5 text-blue-500\" />
                  Blockchain Integration
                </CardTitle>
                <CardDescription>
                  Polygon network • IPFS storage • Smart contracts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className=\"space-y-4\">
                  <div className=\"flex items-center justify-between\">
                    <span>Network</span>
                    <Badge className=\"bg-purple-100 text-purple-800\">Polygon Mumbai</Badge>
                  </div>
                  <div className=\"flex items-center justify-between\">
                    <span>Contract Status</span>
                    <Badge className=\"bg-green-100 text-green-800\">
                      <CheckCircle className=\"h-3 w-3 mr-1\" />
                      Active
                    </Badge>
                  </div>
                  <div className=\"flex items-center justify-between\">
                    <span>Gas Efficiency</span>
                    <span className=\"text-green-600 font-medium\">Optimized</span>
                  </div>
                  <Button variant=\"outline\" className=\"w-full\" data-testid=\"button-mint-badge\">
                    <Zap className=\"h-4 w-4 mr-2\" />
                    Mint New Badge
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=\"achievements\" className=\"space-y-4\">
          <div className=\"grid grid-cols-1 md:grid-cols-3 gap-6\">
            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center gap-2\">
                  <Star className=\"h-5 w-5 text-yellow-500\" />
                  Player Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=\"text-center space-y-4\">
                  <div className=\"text-4xl font-bold text-blue-600\">{achievements?.level}</div>
                  <Progress 
                    value={(achievements?.totalPoints || 0) / (achievements?.nextLevelPoints || 1) * 100} 
                    className=\"w-full\" 
                  />
                  <div className=\"text-sm text-gray-600\">
                    {achievements?.totalPoints} / {achievements?.nextLevelPoints} XP
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center gap-2\">
                  <Trophy className=\"h-5 w-5 text-yellow-600\" />
                  Total Points
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=\"text-center space-y-4\">
                  <div className=\"text-4xl font-bold text-purple-600\">
                    {achievements?.totalPoints.toLocaleString()}
                  </div>
                  <div className=\"text-sm text-gray-600\">Achievement Points</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center gap-2\">
                  <Award className=\"h-5 w-5 text-orange-500\" />
                  Unlocked
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=\"text-center space-y-4\">
                  <div className=\"text-4xl font-bold text-green-600\">
                    {achievements?.achievements.filter(a => a.unlocked).length}
                  </div>
                  <div className=\"text-sm text-gray-600\">
                    of {achievements?.achievements.length} achievements
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Achievement Gallery</CardTitle>
              <CardDescription>Your progress across all categories</CardDescription>
            </CardHeader>
            <CardContent>
              <div className=\"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4\">
                {achievements?.achievements.map((achievement) => (
                  <div 
                    key={achievement.id} 
                    className={`p-4 border rounded-lg ${achievement.unlocked ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                  >
                    <div className=\"flex items-center gap-3\">
                      <div className=\"text-2xl\">{achievement.icon}</div>
                      <div className=\"flex-1\">
                        <div className=\"font-medium flex items-center gap-2\">
                          {achievement.name}
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <div className=\"text-sm text-gray-600 mt-1\">
                          {achievement.description}
                        </div>
                        <div className=\"text-xs text-purple-600 mt-2\">
                          +{achievement.points} points
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value=\"sentiment\" className=\"space-y-4\">
          <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center gap-2\">
                  <Brain className=\"h-5 w-5 text-purple-500\" />
                  Sentiment Overview
                </CardTitle>
                <CardDescription>AI-powered community mood analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <div className=\"space-y-4\">
                  <div className=\"flex items-center justify-between\">
                    <span>Overall Sentiment</span>
                    <Badge className=\"bg-green-100 text-green-800\">
                      {((sentiment?.averageSentiment || 0) * 100).toFixed(0)}% Positive
                    </Badge>
                  </div>
                  <div className=\"space-y-2\">
                    <div className=\"flex justify-between text-sm\">
                      <span>Positive</span>
                      <span>{((sentiment?.positiveRatio || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(sentiment?.positiveRatio || 0) * 100} className=\"bg-green-100\" />
                  </div>
                  <div className=\"space-y-2\">
                    <div className=\"flex justify-between text-sm\">
                      <span>Negative</span>
                      <span>{((sentiment?.negativeRatio || 0) * 100).toFixed(0)}%</span>
                    </div>
                    <Progress value={(sentiment?.negativeRatio || 0) * 100} className=\"bg-red-100\" />
                  </div>
                  <div className=\"grid grid-cols-2 gap-4 mt-4\">
                    <div className=\"text-center\">
                      <div className=\"text-sm text-gray-600\">Toxicity</div>
                      <Badge className=\"bg-green-100 text-green-800\">{sentiment?.toxicityLevel}</Badge>
                    </div>
                    <div className=\"text-center\">
                      <div className=\"text-sm text-gray-600\">Helpfulness</div>
                      <Badge className=\"bg-blue-100 text-blue-800\">{sentiment?.helpfulnessLevel}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className=\"flex items-center gap-2\">
                  <MessageSquare className=\"h-5 w-5 text-blue-500\" />
                  Emotional Analysis
                </CardTitle>
                <CardDescription>Deep emotion detection in conversations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className=\"space-y-3\">
                  {Object.entries(sentiment?.emotionalBreakdown || {}).map(([emotion, value]) => (
                    <div key={emotion} className=\"space-y-1\">
                      <div className=\"flex justify-between text-sm capitalize\">
                        <span>{emotion}</span>
                        <span>{(value * 100).toFixed(0)}%</span>
                      </div>
                      <Progress value={value * 100} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value=\"performance\" className=\"space-y-4\">
          <div className=\"grid grid-cols-1 md:grid-cols-4 gap-6\">
            <Card>
              <CardHeader className=\"pb-2\">
                <CardTitle className=\"text-sm flex items-center gap-2\">
                  <Activity className=\"h-4 w-4\" />
                  System Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=\"text-center\">
                  <div className={`text-2xl font-bold ${getStatusColor(performance?.status || 'unknown')}`}>
                    {performance?.status?.toUpperCase()}
                  </div>
                  <div className=\"text-xs text-gray-600 mt-1\">All systems operational</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className=\"pb-2\">
                <CardTitle className=\"text-sm\">Memory Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=\"space-y-2\">
                  <div className=\"text-2xl font-bold\">{performance?.memoryUsage.percentage}%</div>
                  <Progress value={performance?.memoryUsage.percentage} />
                  <div className=\"text-xs text-gray-600\">
                    {performance?.memoryUsage.used}MB used
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className=\"pb-2\">
                <CardTitle className=\"text-sm\">Response Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className=\"space-y-2\">
                  <div className=\"text-2xl font-bold\">{performance?.responseTime.average}ms</div>
                  <div className=\"text-xs text-gray-600\">
                    P95: {performance?.responseTime.p95}ms
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className=\"pb-2\">
                <CardTitle className=\"text-sm flex items-center gap-2\">
                  <TrendingUp className=\"h-4 w-4\" />
                  Throughput
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className=\"space-y-2\">
                  <div className=\"text-2xl font-bold\">{performance?.throughput}</div>
                  <div className=\"text-xs text-gray-600\">req/sec</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className=\"flex items-center gap-2\">
                <AlertTriangle className=\"h-5 w-5 text-yellow-500\" />
                Performance Insights
              </CardTitle>
              <CardDescription>Optimized for 1000+ concurrent users</CardDescription>
            </CardHeader>
            <CardContent>
              <div className=\"grid grid-cols-1 md:grid-cols-2 gap-6\">
                <div className=\"space-y-3\">
                  <h4 className=\"font-medium text-green-600\">✅ Optimizations Active</h4>
                  <ul className=\"space-y-2 text-sm\">
                    <li>• Database connection pooling</li>
                    <li>• Redis caching layer</li>
                    <li>• CDN for static assets</li>
                    <li>• Compressed responses</li>
                    <li>• WebSocket optimization</li>
                  </ul>
                </div>
                <div className=\"space-y-3\">
                  <h4 className=\"font-medium text-blue-600\">📊 Scale Capabilities</h4>
                  <ul className=\"space-y-2 text-sm\">
                    <li>• Azure Auto-scaling enabled</li>
                    <li>• Load balancer configured</li>
                    <li>• Database read replicas</li>
                    <li>• Horizontal pod scaling</li>
                    <li>• Real-time monitoring</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}