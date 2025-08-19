import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Scale, 
  Eye, 
  MessageSquare, 
  Star, 
  Clock,
  Trophy,
  FileText,
  ExternalLink,
  Github,
  CheckCircle
} from "lucide-react";

interface Criteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  maxScore: number;
}

interface Submission {
  id: number;
  team: string;
  project: string;
  track: string;
  description: string;
  githubUrl: string;
  demoUrl: string;
  techStack: string[];
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'scored';
  scores?: Record<string, number>;
  feedback?: string;
}

export function JudgeDashboard() {
  const { toast } = useToast();
  const [feedbackDialogOpen, setFeedbackDialogOpen] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');

  // Mock judging criteria
  const criteria: Criteria[] = [
    { id: 'innovation', name: 'Innovation', description: 'Creativity and originality of the solution', weight: 25, maxScore: 10 },
    { id: 'technical', name: 'Technical Excellence', description: 'Code quality and technical implementation', weight: 25, maxScore: 10 },
    { id: 'impact', name: 'Impact', description: 'Potential real-world impact and value', weight: 25, maxScore: 10 },
    { id: 'presentation', name: 'Presentation', description: 'Quality of demo and presentation', weight: 25, maxScore: 10 }
  ];

  // Mock assigned submissions
  const assignedSubmissions: Submission[] = [
    {
      id: 1,
      team: "Team Alpha",
      project: "Smart City Dashboard",
      track: "AI & Machine Learning",
      description: "An AI-powered dashboard that analyzes city data to optimize traffic flow, energy usage, and public services. Uses machine learning to predict patterns and suggest improvements.",
      githubUrl: "https://github.com/team-alpha/smart-city",
      demoUrl: "https://smart-city-demo.vercel.app",
      techStack: ["React", "Python", "TensorFlow", "PostgreSQL", "FastAPI"],
      submittedAt: "2025-08-27 10:30",
      status: 'pending'
    },
    {
      id: 2,
      team: "Code Warriors",
      project: "EcoTracker",
      track: "Social Impact",
      description: "Mobile app that gamifies environmental conservation by tracking carbon footprint and rewarding eco-friendly behaviors with points and achievements.",
      githubUrl: "https://github.com/code-warriors/ecotracker",
      demoUrl: "https://ecotracker-app.netlify.app",
      techStack: ["React Native", "Node.js", "MongoDB", "Express"],
      submittedAt: "2025-08-27 11:15",
      status: 'reviewed',
      scores: { innovation: 8, technical: 7, impact: 9, presentation: 8 },
      feedback: "Great concept with strong social impact potential. The gamification aspect is well thought out."
    },
    {
      id: 3,
      team: "Innovation Squad",
      project: "DeFi Yield Optimizer",
      track: "Web3 & Blockchain",
      description: "Automated DeFi portfolio management tool that optimizes yield farming strategies across multiple protocols using smart contracts.",
      githubUrl: "https://github.com/innovation-squad/defi-optimizer",
      demoUrl: "https://defi-optimizer.eth.link",
      techStack: ["Solidity", "Web3.js", "React", "Hardhat", "Chainlink"],
      submittedAt: "2025-08-27 09:45",
      status: 'scored'
    }
  ];

  const handleOpenFeedback = (submission: Submission) => {
    setSelectedSubmission(submission);
    setScores(submission.scores || {});
    setFeedback(submission.feedback || '');
    setFeedbackDialogOpen(true);
  };

  const handleScoreChange = (criteriaId: string, value: number[]) => {
    setScores(prev => ({ ...prev, [criteriaId]: value[0] }));
  };

  const handleSubmitScores = () => {
    if (!selectedSubmission) return;

    // Validate all criteria are scored
    const allScored = criteria.every(c => scores[c.id] !== undefined);
    if (!allScored) {
      toast({
        title: "Incomplete Scoring",
        description: "Please score all criteria before submitting.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Scores Submitted",
      description: `Evaluation for ${selectedSubmission.project} has been submitted successfully!`
    });
    setFeedbackDialogOpen(false);
    setSelectedSubmission(null);
    setScores({});
    setFeedback('');
  };

  const calculateTotalScore = () => {
    return criteria.reduce((total, c) => {
      const score = scores[c.id] || 0;
      return total + (score * c.weight / 100);
    }, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-50';
      case 'reviewed': return 'text-blue-600 bg-blue-50';
      case 'scored': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Judge Dashboard</h1>
          <p className="text-muted-foreground">Evaluate and score assigned submissions</p>
        </div>
        <Badge variant="secondary" className="text-sm">
          <Scale className="w-4 h-4 mr-1" />
          Judge
        </Badge>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600" data-testid="text-assigned">
                {assignedSubmissions.length}
              </div>
              <p className="text-sm text-muted-foreground">Assigned Submissions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600" data-testid="text-reviewed">
                {assignedSubmissions.filter(s => s.status === 'reviewed' || s.status === 'scored').length}
              </div>
              <p className="text-sm text-muted-foreground">Reviewed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600" data-testid="text-pending">
                {assignedSubmissions.filter(s => s.status === 'pending').length}
              </div>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="submissions" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="submissions" data-testid="tab-submissions">Assigned Submissions</TabsTrigger>
          <TabsTrigger value="criteria" data-testid="tab-criteria">Judging Criteria</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-6">
          <div className="space-y-4">
            {assignedSubmissions.map((submission) => (
              <Card key={submission.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg" data-testid={`text-project-${submission.id}`}>
                        {submission.project}
                      </CardTitle>
                      <CardDescription>
                        by {submission.team} • {submission.track}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(submission.status)}>
                        {submission.status}
                      </Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleOpenFeedback(submission)}
                        data-testid={`button-evaluate-${submission.id}`}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        {submission.status === 'pending' ? 'Evaluate' : 'View Scores'}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{submission.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {submission.techStack.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      Submitted {submission.submittedAt}
                    </div>
                    <a 
                      href={submission.githubUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-foreground"
                    >
                      <Github className="w-4 h-4 mr-1" />
                      GitHub
                    </a>
                    <a 
                      href={submission.demoUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center hover:text-foreground"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Live Demo
                    </a>
                  </div>

                  {submission.status === 'scored' && submission.scores && (
                    <div className="mt-4 p-3 bg-muted rounded-md">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">Total Score:</span>
                        <span className="font-bold text-lg">
                          {criteria.reduce((total, c) => total + (submission.scores![c.id] || 0) * c.weight / 100, 0).toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="criteria" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Judging Criteria
              </CardTitle>
              <CardDescription>Scoring criteria and weights for evaluation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium" data-testid={`text-criteria-${criterion.id}`}>
                        {criterion.name}
                      </h4>
                      <Badge variant="outline">{criterion.weight}% weight</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{criterion.description}</p>
                    <div className="text-sm text-muted-foreground">
                      Score Range: 1-{criterion.maxScore} points
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Evaluation Dialog */}
      <Dialog open={feedbackDialogOpen} onOpenChange={setFeedbackDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              {selectedSubmission ? `Evaluate: ${selectedSubmission.project}` : 'Evaluate Submission'}
            </DialogTitle>
            <DialogDescription>
              Score each criterion and provide feedback
            </DialogDescription>
          </DialogHeader>
          
          {selectedSubmission && (
            <div className="space-y-6">
              <div className="p-4 bg-muted rounded-lg">
                <h4 className="font-medium mb-2">{selectedSubmission.project}</h4>
                <p className="text-sm text-muted-foreground mb-2">{selectedSubmission.description}</p>
                <div className="flex gap-4 text-sm">
                  <a 
                    href={selectedSubmission.githubUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <Github className="w-4 h-4 mr-1" />
                    GitHub Repository
                  </a>
                  <a 
                    href={selectedSubmission.demoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center text-blue-600 hover:underline"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Live Demo
                  </a>
                </div>
              </div>

              <div className="space-y-6">
                <h4 className="font-medium">Scoring</h4>
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">{criterion.name}</Label>
                        <p className="text-sm text-muted-foreground">{criterion.description}</p>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-lg" data-testid={`score-${criterion.id}`}>
                          {scores[criterion.id] || 0}/{criterion.maxScore}
                        </div>
                        <div className="text-xs text-muted-foreground">{criterion.weight}% weight</div>
                      </div>
                    </div>
                    <Slider
                      value={[scores[criterion.id] || 0]}
                      onValueChange={(value) => handleScoreChange(criterion.id, value)}
                      max={criterion.maxScore}
                      min={1}
                      step={0.5}
                      className="w-full"
                      data-testid={`slider-${criterion.id}`}
                    />
                  </div>
                ))}

                <div className="p-3 bg-muted rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Weighted Score:</span>
                    <span className="font-bold text-xl" data-testid="text-total-score">
                      {calculateTotalScore().toFixed(1)}/10
                    </span>
                  </div>
                  <Progress value={calculateTotalScore() * 10} className="mt-2" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback & Comments</Label>
                <Textarea
                  id="feedback"
                  placeholder="Provide detailed feedback for the team..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[120px]"
                  data-testid="input-feedback"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSubmitScores} 
                  className="flex-1"
                  data-testid="button-submit-scores"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Submit Evaluation
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setFeedbackDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}