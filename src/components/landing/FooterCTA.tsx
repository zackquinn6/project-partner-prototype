import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export const FooterCTA = () => {
  const [email, setEmail] = useState('');
  const [wantsUpdates, setWantsUpdates] = useState(false);
  const [projectType, setProjectType] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email');
      return;
    }
    
    // In a real implementation, this would send to your backend
    toast.success('Thanks! Check your email for next steps.');
    setEmail('');
    setWantsUpdates(false);
    setProjectType('');
  };

  return (
    <div className="sticky bottom-0 bg-card border-t border-border shadow-lg py-4 px-4 z-50">
      <div className="container mx-auto max-w-4xl">
        <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1 space-y-2">
            <Label htmlFor="email" className="text-xs text-muted-foreground">
              Get started today
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10"
            />
          </div>
          
          <div className="w-full md:w-48">
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger className="h-10">
                <SelectValue placeholder="Project type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="painting">Interior Painting</SelectItem>
                <SelectItem value="flooring">Flooring</SelectItem>
                <SelectItem value="bathroom">Bathroom Remodel</SelectItem>
                <SelectItem value="kitchen">Kitchen Update</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" className="h-10 bg-accent hover:bg-accent/90 text-accent-foreground px-8">
            Get Access
          </Button>
        </form>
        
        <div className="flex items-center gap-2 mt-3">
          <Checkbox 
            id="updates" 
            checked={wantsUpdates}
            onCheckedChange={(checked) => setWantsUpdates(checked as boolean)}
          />
          <Label htmlFor="updates" className="text-xs text-muted-foreground cursor-pointer">
            Send me updates and demo scheduling options
          </Label>
        </div>
      </div>
    </div>
  );
};
