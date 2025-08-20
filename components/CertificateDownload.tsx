import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, Award, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

interface CertificateDownloadProps {
  teamId: number;
  userName: string;
  eventName: string;
  eventId: number;
  role?: 'participant' | 'judge' | 'winner';
}

export function CertificateDownload({ 
  teamId, 
  userName, 
  eventName, 
  eventId, 
  role = 'participant' 
}: CertificateDownloadProps) {
  const [isEligible, setIsEligible] = useState(false);
  const [isFinalist, setIsFinalist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingEligibility, setCheckingEligibility] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkEligibility();
  }, [teamId]);

  const checkEligibility = async () => {
    try {
      const response = await axios.get(`/api/certificates/check/${teamId}`);
      setIsEligible(response.data.eligible);
      setIsFinalist(response.data.isFinalist);
    } catch (error) {
      console.error('Error checking certificate eligibility:', error);
    } finally {
      setCheckingEligibility(false);
    }
  };

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const response = await axios.post('/api/certificates', {
        name: userName,
        event: eventName,
        role: isFinalist ? 'winner' : role,
        date: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        eventId: eventId
      });

      if (response.data.certificateUrl) {
        // Open the certificate in a new tab
        window.open(response.data.certificateUrl, '_blank');
        
        toast({
          title: 'Certificate Generated!',
          description: 'Your certificate has been generated and opened in a new tab.',
        });
      }
    } catch (error) {
      console.error('Error generating certificate:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate certificate. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (checkingEligibility) {
    return (
      <Button disabled variant="outline" data-testid="button-certificate-loading">
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Checking eligibility...
      </Button>
    );
  }

  return (
    <Button
      onClick={handleDownload}
      disabled={!isEligible || isLoading}
      variant={isEligible ? "default" : "outline"}
      className={isFinalist ? "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600" : ""}
      data-testid="button-download-certificate"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating...
        </>
      ) : (
        <>
          {isFinalist ? (
            <Award className="w-4 h-4 mr-2" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          Download Certificate
        </>
      )}
    </Button>
  );
}