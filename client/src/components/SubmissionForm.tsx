import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Upload, FileText, Link, Github, ExternalLink, Download, Calendar, User, CheckCircle } from 'lucide-react';
import { ObjectUploader } from './ObjectUploader';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { Team } from '@shared/schema';

interface SubmissionFormProps {
  currentTeam: Team | null;
}

interface SubmissionData {
  title: string;
  repo_url: string;
  demo_url: string;
  team_id: string;
}

interface ExistingSubmission {
  id: string;
  title: string;
  repo_url?: string;
  demo_url?: string;
  file_url?: string;
  file_name?: string;
  file_size?: string;
  submitted_by: string;
  submitted_at: string;
  event_title: string;
}

export function SubmissionForm({ currentTeam }: SubmissionFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    title: '',
    repo_url: '',
    demo_url: ''
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Query to get existing submissions
  const { data: submissionsData, isLoading: submissionsLoading } = useQuery({
    queryKey: ['/api/submissions/team', currentTeam?.id],
    enabled: !!currentTeam?.id,
  });

  const existingSubmissions = (submissionsData as any)?.data?.submissions || [];

  // Mutation to create submission
  const createSubmissionMutation = useMutation({
    mutationFn: async (data: { formData: SubmissionData; file: File | null }) => {
      const { formData, file } = data;
      
      const form = new FormData();
      form.append('title', formData.title);
      form.append('repo_url', formData.repo_url);
      form.append('demo_url', formData.demo_url);
      form.append('team_id', formData.team_id);
      
      if (file) {
        form.append('file', file);
      }

      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${(window as any).__auth_token__}`,
        },
        body: form,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create submission');
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Submission Created!",
        description: "Your project has been submitted successfully!",
      });
      setFormData({ title: '', repo_url: '', demo_url: '' });
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ['/api/submissions/team', currentTeam?.id] });
    },
    onError: (error: any) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Failed to submit project. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleFileAdded = (file: any) => {
    console.log('File selected:', file);
    setSelectedFile(file.data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentTeam) {
      toast({
        title: "No Team",
        description: "You must be part of a team to submit a project.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your submission.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      await createSubmissionMutation.mutateAsync({
        formData: {
          ...formData,
          team_id: currentTeam.id
        },
        file: selectedFile
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatFileSize = (bytes: string) => {
    const size = parseInt(bytes);
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentTeam) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Join a Team First</h3>
          <p className="text-muted-foreground mb-4">
            You need to be part of a team to submit a project
          </p>
          <Button variant="outline" onClick={() => window.location.hash = '#team'}>
            Go to Team Tab
          </Button>
        </CardContent>
      </Card>
    );
  }

  const hasExistingSubmission = existingSubmissions.length > 0;

  return (
    <div className="space-y-6">
      {/* Existing Submissions */}
      {hasExistingSubmission && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Team Submissions
            </CardTitle>
            <CardDescription>Your team's submitted projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {existingSubmissions.map((submission: ExistingSubmission) => (
                <div key={submission.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h4 className="font-semibold" data-testid={`text-submission-title-${submission.id}`}>
                        {submission.title}
                      </h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {submission.submitted_by}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(submission.submitted_at)}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary">Submitted</Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {submission.repo_url && (
                      <a 
                        href={submission.repo_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        data-testid={`link-repo-${submission.id}`}
                      >
                        <Github className="w-3 h-3" />
                        Repository
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {submission.demo_url && (
                      <a 
                        href={submission.demo_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        data-testid={`link-demo-${submission.id}`}
                      >
                        <Link className="w-3 h-3" />
                        Live Demo
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {submission.file_url && (
                      <a 
                        href={submission.file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-600 hover:underline"
                        data-testid={`link-file-${submission.id}`}
                      >
                        <Download className="w-3 h-3" />
                        {submission.file_name} 
                        {submission.file_size && `(${formatFileSize(submission.file_size)})`}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* New Submission Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Project Submission
          </CardTitle>
          <CardDescription>
            Submit your project for the hackathon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Project Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter your project title"
                required
                data-testid="input-submission-title"
              />
            </div>

            {/* Repository URL */}
            <div className="space-y-2">
              <Label htmlFor="repo_url">Repository URL</Label>
              <Input
                id="repo_url"
                type="url"
                value={formData.repo_url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, repo_url: e.target.value }))}
                placeholder="https://github.com/username/project"
                data-testid="input-repo-url"
              />
            </div>

            {/* Demo URL */}
            <div className="space-y-2">
              <Label htmlFor="demo_url">Live Demo URL</Label>
              <Input
                id="demo_url"
                type="url"
                value={formData.demo_url}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, demo_url: e.target.value }))}
                placeholder="https://your-project-demo.com"
                data-testid="input-demo-url"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label>Project Files (Optional)</Label>
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                <div className="text-center space-y-2">
                  <ObjectUploader
                    maxNumberOfFiles={1}
                    maxFileSize={50 * 1024 * 1024} // 50MB
                    onFileAdded={handleFileAdded}
                    buttonClassName="mx-auto"
                  >
                    <div className="flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Choose Files
                    </div>
                  </ObjectUploader>
                  
                  {selectedFile && (
                    <div className="mt-4 p-3 bg-muted rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <FileText className="w-4 h-4" />
                        <span className="font-medium">{selectedFile.name}</span>
                        <span className="text-muted-foreground">
                          ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <p className="text-xs text-muted-foreground">
                    Upload project files, documentation, or additional resources (Max: 50MB)
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || createSubmissionMutation.isPending}
              data-testid="button-submit-project"
            >
              {isSubmitting || createSubmissionMutation.isPending ? (
                <>
                  <Upload className="w-4 h-4 mr-2 animate-spin" />
                  Submitting Project...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Submit Project
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}