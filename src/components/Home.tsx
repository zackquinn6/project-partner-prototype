import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Users, Target, Trophy, CheckCircle, Star, Clock, Shield, Zap, Award, Play } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface HomeProps {
  onProjectsView: () => void;
}

export default function Home({ onProjectsView }: HomeProps) {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleSignIn = () => {
    navigate('/auth?mode=signin');
  };

  const handleSignUp = () => {
    navigate('/auth?mode=signup');
  };

  const features = [
    {
      icon: Target,
      title: "Expert-Crafted Workflows",
      description: "Follow step-by-step processes developed by professional contractors and proven by thousands of successful projects."
    },
    {
      icon: CheckCircle,
      title: "Smart Progress Tracking",
      description: "Never lose your place. Our intelligent system tracks every step and helps you stay on schedule."
    },
    {
      icon: Users,
      title: "Community Support",
      description: "Connect with experienced DIYers and get real-time help when you need it most."
    },
    {
      icon: Zap,
      title: "Adaptive Guidance",
      description: "Get personalized recommendations based on your skill level, available time, and project goals."
    },
    {
      icon: Shield,
      title: "Quality Assurance",
      description: "Built-in quality checkpoints ensure professional results every time, preventing costly mistakes."
    },
    {
      icon: Award,
      title: "Proven Results",
      description: "Join 50,000+ successful DIYers who've completed projects faster and with better outcomes."
    }
  ];

  const testimonials = [
    {
      name: "Sarah Mitchell",
      project: "Kitchen Renovation",
      quote: "Transformed my outdated kitchen in just 3 weekends. The step-by-step guidance made it feel manageable, even as a complete beginner."
    },
    {
      name: "Mike Rodriguez",
      project: "Bathroom Remodel",
      quote: "Saved $8,000 by doing it myself with Project Partner. The quality checkpoints caught issues before they became expensive problems."
    },
    {
      name: "Emma Chen",
      project: "Living Room Makeover",
      quote: "The community support was incredible. Got expert advice within minutes whenever I had questions."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Hero Section */}
      <section className="relative py-20 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]" />
        <div className="relative container mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm font-medium mb-6">
            <Trophy className="w-4 h-4 mr-2" />
            Proven Project Success System
          </div>
          
          <h1 className="text-4xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-foreground via-foreground to-muted-foreground bg-clip-text text-transparent leading-tight">
            Master Every DIY Project
            <br />
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Like a Pro
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Turn weekend projects into championship wins with expert workflows, smart tools, and proven systems.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            {user ? (
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
                onClick={onProjectsView}
              >
                View Projects
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
                  onClick={handleSignUp}
                >
                  Start Your First Project
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="text-lg px-8 py-6 border-2"
                  onClick={handleSignIn}
                >
                  Sign In
                </Button>
              </>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
              No Experience Required
            </div>
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-2 text-blue-500" />
              Expert-Verified Steps
            </div>
            <div className="flex items-center">
              <Clock className="w-4 h-4 mr-2 text-orange-500" />
              Save 50% Time
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Why Champions Choose Project Partner
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every feature designed to keep you moving forward, not stuck in analysis paralysis.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-2 hover:border-primary/50 transition-all duration-300 bg-card/80 backdrop-blur-sm hover:shadow-lg hover:-translate-y-1">
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-6">
              Every Champion Starts with a Gameplan
            </h2>
            <p className="text-xl text-muted-foreground">
              Project Partner is the one-stop shop for running a DIY project. Tools, knowledge, project management, and project enablers built into one place. Our core value is: keep the player on the field. One single app to better DIY - thats our mission.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-card/80 backdrop-blur-sm border-2 hover:border-primary/30 transition-all duration-300">
                <CardHeader>
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      ))}
                    </div>
                  </div>
                  <CardDescription className="text-base italic leading-relaxed">
                    "{testimonial.quote}"
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
                      <span className="font-bold text-primary">{testimonial.name.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.project}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 to-orange-500/10">
        <div className="container mx-auto text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6">
              Ready to Win Your Next Project?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Join thousands of DIYers who've transformed their homes with confidence.
            </p>
            {user ? (
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
                onClick={onProjectsView}
              >
                View Projects
                <Play className="ml-2 w-5 h-5" />
              </Button>
            ) : (
              <Button 
                size="lg" 
                className="text-lg px-8 py-6 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-500/90"
                onClick={handleSignUp}
              >
                Start Your First Project
                <Play className="ml-2 w-5 h-5" />
              </Button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
