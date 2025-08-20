import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';
import axios from 'axios';

interface Sponsor {
  id: number;
  name: string;
  logo_url: string;
  website: string;
  tier: 'platinum' | 'gold' | 'silver' | 'bronze';
  display_order: number;
}

interface SponsorsShowcaseProps {
  eventId: string;
  className?: string;
}

export function SponsorsShowcase({ eventId, className = '' }: SponsorsShowcaseProps) {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSponsors();
  }, [eventId]);

  const fetchSponsors = async () => {
    try {
      const response = await axios.get(`/api/sponsors/${eventId}`);
      setSponsors(response.data.sponsors || []);
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-900';
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
      case 'silver': return 'bg-gradient-to-r from-gray-400 to-gray-500 text-white';
      case 'bronze': return 'bg-gradient-to-r from-orange-600 to-orange-700 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getTierSize = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'col-span-2 h-32';
      case 'gold': return 'col-span-2 h-28';
      case 'silver': return 'col-span-1 h-24';
      case 'bronze': return 'col-span-1 h-20';
      default: return 'col-span-1 h-20';
    }
  };

  // Group sponsors by tier
  const sponsorsByTier = sponsors.reduce((acc, sponsor) => {
    if (!acc[sponsor.tier]) {
      acc[sponsor.tier] = [];
    }
    acc[sponsor.tier].push(sponsor);
    return acc;
  }, {} as Record<string, Sponsor[]>);

  const tierOrder = ['platinum', 'gold', 'silver', 'bronze'];

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (sponsors.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-8 ${className}`}>
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Our Sponsors & Partners</h2>
        <p className="text-muted-foreground">
          Thank you to our amazing sponsors for making this event possible
        </p>
      </div>

      {tierOrder.map(tier => {
        const tierSponsors = sponsorsByTier[tier];
        if (!tierSponsors || tierSponsors.length === 0) return null;

        return (
          <div key={tier} className="space-y-4">
            <div className="flex items-center justify-center gap-2">
              <Badge className={`${getTierColor(tier)} text-sm uppercase px-3 py-1`}>
                {tier} {tier === 'platinum' ? 'Partners' : 'Sponsors'}
              </Badge>
            </div>

            <div className={`grid gap-4 ${
              tier === 'platinum' ? 'grid-cols-1 md:grid-cols-2' :
              tier === 'gold' ? 'grid-cols-2 md:grid-cols-3' :
              'grid-cols-2 md:grid-cols-4 lg:grid-cols-6'
            }`}>
              {tierSponsors.map(sponsor => (
                <a
                  key={sponsor.id}
                  href={sponsor.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative block"
                  data-testid={`sponsor-link-${sponsor.id}`}
                >
                  <Card className={`
                    ${getTierSize(tier)}
                    relative overflow-hidden
                    flex items-center justify-center p-4
                    transition-all duration-300
                    hover:scale-105 hover:shadow-lg
                    bg-white dark:bg-gray-800
                    border-2 hover:border-primary
                  `}>
                    {sponsor.logo_url ? (
                      <img
                        src={sponsor.logo_url}
                        alt={sponsor.name}
                        className="max-w-full max-h-full object-contain filter dark:brightness-0 dark:invert"
                        loading="lazy"
                      />
                    ) : (
                      <div className="text-center">
                        <p className="font-semibold text-gray-700 dark:text-gray-300">
                          {sponsor.name}
                        </p>
                      </div>
                    )}
                    
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ExternalLink className="w-4 h-4 text-gray-500" />
                    </div>
                  </Card>
                  
                  <p className="text-center text-xs text-muted-foreground mt-2">
                    {sponsor.name}
                  </p>
                </a>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}