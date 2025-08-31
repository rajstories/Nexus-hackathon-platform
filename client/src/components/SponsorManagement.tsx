import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Plus, Edit, Trash2, ExternalLink, Building2, ArrowUpDown } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface Sponsor {
  id: number;
  name: string;
  logo_url: string;
  website: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  display_order: number;
}

interface SponsorManagementProps {
  eventId: string;
}

export function SponsorManagement({ eventId }: SponsorManagementProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<Sponsor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: '',
    website: '',
    tier: 'bronze',
    display_order: 999
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch sponsors using React Query
  const { data: sponsorsData, isLoading } = useQuery({
    queryKey: ["/api/sponsors", eventId],
    enabled: !!eventId && eventId !== ''
  });

  const sponsors = sponsorsData?.sponsors || [];

  // Create sponsor mutation
  const createSponsorMutation = useMutation({
    mutationFn: async (sponsorData: typeof formData & { event_id: number }) => {
      return apiRequest("POST", "/api/sponsors", sponsorData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sponsors", eventId] });
      toast({
        title: "Success",
        description: "Sponsor added successfully"
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add sponsor. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Update sponsor mutation
  const updateSponsorMutation = useMutation({
    mutationFn: async (data: { id: number } & typeof formData) => {
      return apiRequest("PUT", `/api/sponsors/${data.id}`, {
        name: data.name,
        logo_url: data.logo_url,
        website: data.website,
        tier: data.tier,
        display_order: data.display_order
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sponsors", eventId] });
      toast({
        title: "Success",
        description: "Sponsor updated successfully"
      });
      setDialogOpen(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update sponsor. Please try again.",
        variant: "destructive"
      });
    }
  });

  // Delete sponsor mutation
  const deleteSponsorMutation = useMutation({
    mutationFn: async (sponsorId: number) => {
      return apiRequest("DELETE", `/api/sponsors/${sponsorId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sponsors", eventId] });
      toast({
        title: "Success",
        description: "Sponsor deleted successfully"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete sponsor. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.logo_url) {
      toast({
        title: "Error",
        description: "Please fill in sponsor name and logo URL.",
        variant: "destructive"
      });
      return;
    }

    if (editingSponsor) {
      updateSponsorMutation.mutate({ ...formData, id: editingSponsor.id });
    } else {
      createSponsorMutation.mutate({ ...formData, event_id: parseInt(eventId) });
    }
  };

  const handleDelete = async (sponsorId: number) => {
    if (!confirm('Are you sure you want to delete this sponsor?')) return;
    deleteSponsorMutation.mutate(sponsorId);
  };

  const handleEdit = (sponsor: Sponsor) => {
    setEditingSponsor(sponsor);
    setFormData({
      name: sponsor.name,
      logo_url: sponsor.logo_url,
      website: sponsor.website,
      tier: sponsor.tier,
      display_order: sponsor.display_order
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingSponsor(null);
    setFormData({
      name: '',
      logo_url: '',
      website: '',
      tier: 'bronze',
      display_order: 999
    });
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-gradient-to-r from-gray-300 to-gray-400';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-amber-500';
      case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-500';
      case 'bronze': return 'bg-gradient-to-r from-orange-600 to-orange-700';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Sponsors & Partners
            </CardTitle>
            <CardDescription>Manage event sponsors and partnership tiers</CardDescription>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button data-testid="button-add-sponsor">
                <Plus className="w-4 h-4 mr-2" />
                Add Sponsor
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>{editingSponsor ? 'Edit' : 'Add'} Sponsor</DialogTitle>
                <DialogDescription>
                  {editingSponsor ? 'Update sponsor information' : 'Add a new sponsor to your event'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="sponsor-name">Sponsor Name *</Label>
                  <Input
                    id="sponsor-name"
                    placeholder="e.g., Microsoft"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    data-testid="input-sponsor-name"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sponsor-logo">Logo URL</Label>
                  <Input
                    id="sponsor-logo"
                    placeholder="https://example.com/logo.png"
                    value={formData.logo_url}
                    onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                    data-testid="input-sponsor-logo"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Provide a URL to the sponsor's logo (SVG or PNG preferred)
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="sponsor-website">Website</Label>
                  <Input
                    id="sponsor-website"
                    placeholder="https://example.com"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    data-testid="input-sponsor-website"
                  />
                </div>
                
                <div>
                  <Label htmlFor="sponsor-tier">Sponsorship Tier</Label>
                  <Select
                    value={formData.tier}
                    onValueChange={(value) => setFormData({ ...formData, tier: value as any })}
                  >
                    <SelectTrigger id="sponsor-tier" data-testid="select-sponsor-tier">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="platinum">Platinum Partner</SelectItem>
                      <SelectItem value="gold">Gold Sponsor</SelectItem>
                      <SelectItem value="silver">Silver Sponsor</SelectItem>
                      <SelectItem value="bronze">Bronze Sponsor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="sponsor-order">Display Order</Label>
                  <Input
                    id="sponsor-order"
                    type="number"
                    placeholder="0"
                    value={formData.display_order}
                    onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
                    data-testid="input-sponsor-order"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Lower numbers appear first within the same tier
                  </p>
                </div>
                
                <Button 
                  onClick={handleSubmit} 
                  className="w-full"
                  disabled={!formData.name}
                  data-testid="button-submit-sponsor"
                >
                  {editingSponsor ? 'Update' : 'Add'} Sponsor
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="animate-pulse">
                <div className="h-16 bg-gray-100 rounded"></div>
              </div>
            ))}
          </div>
        ) : sponsors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Building2 className="w-12 h-12 mx-auto mb-4" />
            <p>No sponsors added yet</p>
            <p className="text-sm mt-2">Add sponsors to showcase your event partners</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sponsors.map((sponsor) => (
              <div 
                key={sponsor.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  {sponsor.logo_url ? (
                    <img
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      className="w-12 h-12 object-contain"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium" data-testid={`text-sponsor-${sponsor.id}`}>
                        {sponsor.name}
                      </h4>
                      <Badge className={`${getTierColor(sponsor.tier)} text-white text-xs`}>
                        {sponsor.tier}
                      </Badge>
                    </div>
                    {sponsor.website && (
                      <a 
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        {sponsor.website}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Order: {sponsor.display_order}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(sponsor)}
                    data-testid={`button-edit-sponsor-${sponsor.id}`}
                  >
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(sponsor.id)}
                    data-testid={`button-delete-sponsor-${sponsor.id}`}
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}