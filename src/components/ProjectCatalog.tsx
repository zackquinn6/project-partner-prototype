import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Clock, Layers, Target, Hammer, Home, Palette, Zap, Shield } from 'lucide-react';

interface ProjectTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  phases: number;
  image: string;
  color: string;
  icon: React.ComponentType<any>;
}

const ProjectCatalog: React.FC = () => {
  const navigate = useNavigate();
  const { setCurrentProject, addProject } = useProject();

  // Sample project templates based on the projects mentioned in Home component
  const projectTemplates: ProjectTemplate[] = [
    {
      id: 'interior-painting',
      name: 'Interior Painting',
      description: 'Transform your space with professional interior painting techniques',
      category: 'Interior',
      difficulty: 'Beginner',
      estimatedTime: '2-3 days',
      phases: 4,
      image: '/placeholder.svg',
      color: 'from-blue-500 to-purple-600',
      icon: Palette
    },
    {
      id: 'tile-flooring',
      name: 'Tile Flooring',
      description: 'Complete tile flooring installation from planning to finish',
      category: 'Flooring',
      difficulty: 'Intermediate',
      estimatedTime: '1-2 weeks',
      phases: 3,
      image: '/placeholder.svg',
      color: 'from-orange-500 to-red-600',
      icon: Layers
    },
    {
      id: 'lvp-flooring',
      name: 'LVP Flooring',
      description: 'Luxury vinyl plank flooring installation made simple',
      category: 'Flooring',
      difficulty: 'Beginner',
      estimatedTime: '3-5 days',
      phases: 3,
      image: '/placeholder.svg',
      color: 'from-green-500 to-teal-600',
      icon: Layers
    },
    {
      id: 'tile-backsplash',
      name: 'Tile Backsplash',
      description: 'Add style and protection with a beautiful tile backsplash',
      category: 'Kitchen',
      difficulty: 'Intermediate',
      estimatedTime: '1-2 days',
      phases: 3,
      image: '/placeholder.svg',
      color: 'from-purple-500 to-pink-600',
      icon: Target
    },
    {
      id: 'landscaping',
      name: 'Landscaping',
      description: 'Design and create beautiful outdoor spaces',
      category: 'Exterior',
      difficulty: 'Intermediate',
      estimatedTime: '1-3 weeks',
      phases: 5,
      image: '/placeholder.svg',
      color: 'from-green-600 to-lime-600',
      icon: Home
    },
    {
      id: 'power-washing',
      name: 'Power Washing',
      description: 'Restore surfaces with proper power washing techniques',
      category: 'Exterior',
      difficulty: 'Beginner',
      estimatedTime: '1 day',
      phases: 2,
      image: '/placeholder.svg',
      color: 'from-cyan-500 to-blue-600',
      icon: Zap
    },
    {
      id: 'smart-home',
      name: 'Smart Home',
      description: 'Install and configure smart home automation systems',
      category: 'Technology',
      difficulty: 'Advanced',
      estimatedTime: '1-2 weeks',
      phases: 4,
      image: '/placeholder.svg',
      color: 'from-indigo-500 to-purple-600',
      icon: Zap
    },
    {
      id: 'drywall',
      name: 'Drywall',
      description: 'Master drywall installation and finishing techniques',
      category: 'Interior',
      difficulty: 'Intermediate',
      estimatedTime: '1 week',
      phases: 4,
      image: '/placeholder.svg',
      color: 'from-gray-500 to-slate-600',
      icon: Hammer
    },
    {
      id: 'lighting',
      name: 'Lighting',
      description: 'Install and upgrade lighting fixtures safely',
      category: 'Electrical',
      difficulty: 'Intermediate',
      estimatedTime: '1-2 days',
      phases: 3,
      image: '/placeholder.svg',
      color: 'from-yellow-500 to-orange-600',
      icon: Zap
    },
    {
      id: 'home-maintenance',
      name: 'Home Maintenance',
      description: 'Essential maintenance tasks to keep your home in top condition',
      category: 'Maintenance',
      difficulty: 'Beginner',
      estimatedTime: 'Ongoing',
      phases: 6,
      image: '/placeholder.svg',
      color: 'from-emerald-500 to-green-600',
      icon: Shield
    }
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSelectProject = (template: ProjectTemplate) => {
    // Create a new project based on the template
    const newProject = {
      id: Date.now().toString(),
      name: template.name,
      description: template.description,
      createdAt: new Date(),
      updatedAt: new Date(),
      phases: [] // Start with empty phases, user can build from template
    };

    addProject(newProject);
    setCurrentProject(newProject);
    
    // Navigate back to home with user view
    navigate('/', { state: { view: 'user' } });
  };

  const categories = [...new Set(projectTemplates.map(p => p.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Button>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold mb-4">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-primary to-orange-500 bg-clip-text text-transparent">
              Project
            </span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Select from our expertly crafted project guides to get started with confidence
          </p>
        </div>

        {/* Project Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projectTemplates.map((template) => {
            const IconComponent = template.icon;
            
            return (
              <Card 
                key={template.id} 
                className="group hover:shadow-xl transition-all duration-300 cursor-pointer border-0 overflow-hidden"
                onClick={() => handleSelectProject(template)}
              >
                <div className={`h-32 bg-gradient-to-br ${template.color} relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/20" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <IconComponent className="w-8 h-8" />
                  </div>
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {template.category}
                    </Badge>
                  </div>
                </div>
                
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {template.name}
                  </CardTitle>
                  <CardDescription className="text-sm line-clamp-2">
                    {template.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock className="w-4 h-4" />
                      {template.estimatedTime}
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Layers className="w-4 h-4" />
                      {template.phases} phases
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge className={getDifficultyColor(template.difficulty)} variant="secondary">
                      {template.difficulty}
                    </Badge>
                    <Button 
                      size="sm" 
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectProject(template);
                      }}
                    >
                      Start Project
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Categories Filter (Future Enhancement) */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground">
            More project templates coming soon! Can't find what you're looking for?{" "}
            <Button variant="link" className="p-0 h-auto text-sm" onClick={() => navigate('/?view=admin')}>
              Create a custom project
            </Button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProjectCatalog;