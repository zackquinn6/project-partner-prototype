import { ExternalLink, HelpCircle, Calendar as CalendarIcon, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentSection {
  id?: string;
  type: 'text' | 'image' | 'video' | 'link' | 'button';
  content: string;
  title?: string;
  width?: 'full' | 'half' | 'third' | 'two-thirds';
  alignment?: 'left' | 'center' | 'right';
  // Button-specific properties
  buttonAction?: 'project-customizer' | 'project-scheduler' | 'shopping-checklist' | 'materials-selection';
  buttonLabel?: string;
  buttonIcon?: string;
  buttonVariant?: 'default' | 'outline' | 'secondary';
}

interface MultiContentRendererProps {
  sections: ContentSection[];
  onButtonAction?: (action: string) => void;
}

export function MultiContentRenderer({ sections, onButtonAction }: MultiContentRendererProps) {
  const getButtonIcon = (iconName?: string) => {
    switch (iconName) {
      case 'HelpCircle': return <HelpCircle className="w-4 h-4" />;
      case 'Calendar': return <CalendarIcon className="w-4 h-4" />;
      case 'ShoppingCart': return <ShoppingCart className="w-4 h-4" />;
      default: return null;
    }
  };
  const getWidthClass = (width?: string) => {
    switch (width) {
      case 'half': return 'w-1/2';
      case 'third': return 'w-1/3';
      case 'two-thirds': return 'w-2/3';
      default: return 'w-full';
    }
  };

  const getAlignmentClass = (alignment?: string) => {
    switch (alignment) {
      case 'center': return 'mx-auto text-center';
      case 'right': return 'ml-auto text-right';
      default: return 'text-left';
    }
  };

  if (!sections || sections.length === 0) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4">
        {sections.map((section, index) => (
          <div 
            key={section.id || `section-${index}`} 
            className={`${getWidthClass(section.width)} ${getAlignmentClass(section.alignment)}`}
          >
            {section.type === 'text' && (
              <div className="space-y-2">
                {section.title && (
                  <h4 className="text-lg font-semibold text-foreground">{section.title}</h4>
                )}
                <div className="text-muted-foreground whitespace-pre-wrap">
                  {section.content}
                </div>
              </div>
            )}

            {section.type === 'image' && section.content && (
              <div className="space-y-2">
                {section.title && (
                  <h4 className="text-lg font-semibold text-foreground">{section.title}</h4>
                )}
                <img 
                  src={section.content} 
                  alt={section.title || 'Step image'} 
                  className="rounded-lg border shadow-sm max-w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            {section.type === 'video' && section.content && (
              <div className="space-y-2">
                {section.title && (
                  <h4 className="text-lg font-semibold text-foreground">{section.title}</h4>
                )}
                <div className="aspect-video rounded-lg overflow-hidden border shadow-sm">
                  <iframe 
                    src={section.content} 
                    className="w-full h-full" 
                    allowFullScreen 
                    title={section.title || 'Video content'}
                  />
                </div>
              </div>
            )}

            {section.type === 'link' && section.content && section.title && (
              <div className="space-y-2">
                <a 
                  href={section.content} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary hover:underline flex items-center gap-2 font-medium"
                >
                  <ExternalLink className="w-4 h-4" />
                  {section.title}
                </a>
              </div>
            )}

            {section.type === 'button' && section.buttonAction && section.buttonLabel && (
              <div className="flex justify-center pt-4">
                <Button
                  onClick={() => onButtonAction?.(section.buttonAction!)}
                  variant={(section.buttonVariant as "default" | "outline" | "secondary") || "outline"}
                  className="flex items-center gap-2"
                >
                  {getButtonIcon(section.buttonIcon)}
                  {section.buttonLabel}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}