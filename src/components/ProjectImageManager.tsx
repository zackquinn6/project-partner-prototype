import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Upload, Image as ImageIcon, X, Save } from 'lucide-react';

export const ProjectImageManager = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [currentImage, setCurrentImage] = useState<string>('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProject) {
      const project = projects.find(p => p.id === selectedProject);
      if (project?.cover_image) {
        setCurrentImage(project.cover_image);
      } else {
        setCurrentImage('');
      }
    }
  }, [selectedProject, projects]);

  const fetchProjects = async () => {
    const { data, error } = await supabase
      .from('projects')
      .select('id, name, cover_image, category')
      .neq('id', '00000000-0000-0000-0000-000000000000') // Exclude manual template
      .order('name');

    if (error) {
      toast.error('Failed to load projects');
      console.error(error);
      return;
    }

    setProjects(data || []);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedProject) {
      toast.error('Please select both a project and an image');
      return;
    }

    setUploading(true);

    try {
      // Create a unique filename
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${selectedProject}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('project-images')
        .upload(filePath, selectedFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('project-images')
        .getPublicUrl(filePath);

      // Update project with image URL
      const { error: updateError } = await supabase
        .from('projects')
        .update({ cover_image: publicUrl })
        .eq('id', selectedProject);

      if (updateError) throw updateError;

      toast.success('Image uploaded and assigned successfully!');
      
      // Reset form
      setSelectedFile(null);
      setPreviewUrl('');
      setCurrentImage(publicUrl);
      
      // Refresh projects
      await fetchProjects();

    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = async () => {
    if (!selectedProject) return;

    try {
      const { error } = await supabase
        .from('projects')
        .update({ cover_image: null })
        .eq('id', selectedProject);

      if (error) throw error;

      toast.success('Image removed from project');
      setCurrentImage('');
      await fetchProjects();

    } catch (error: any) {
      console.error('Remove error:', error);
      toast.error('Failed to remove image');
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreviewUrl('');
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ImageIcon className="h-5 w-5" />
          Project Image Manager
        </CardTitle>
        <CardDescription>
          Upload and assign cover images to projects in the catalog
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Project Selection */}
        <div className="space-y-2">
          <Label>Select Project</Label>
          <Select value={selectedProject} onValueChange={setSelectedProject}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a project..." />
            </SelectTrigger>
            <SelectContent>
              {projects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name} {project.category && `(${project.category})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Current Image Display */}
        {currentImage && (
          <div className="space-y-2">
            <Label>Current Image</Label>
            <div className="relative border rounded-lg p-2">
              <img 
                src={currentImage} 
                alt="Current project image" 
                className="w-full h-48 object-cover rounded"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-4 right-4"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4 mr-1" />
                Remove
              </Button>
            </div>
          </div>
        )}

        {/* File Upload */}
        <div className="space-y-2">
          <Label>Upload New Image</Label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              disabled={!selectedProject || uploading}
              className="flex-1"
            />
            {selectedFile && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSelection}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            Max size: 5MB. Formats: JPG, PNG, WebP
          </p>
        </div>

        {/* Preview */}
        {previewUrl && (
          <div className="space-y-2">
            <Label>Preview</Label>
            <img 
              src={previewUrl} 
              alt="Preview" 
              className="w-full h-48 object-cover rounded-lg border"
            />
          </div>
        )}

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !selectedProject || uploading}
          className="w-full"
        >
          {uploading ? (
            <>Processing...</>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              Upload and Assign Image
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};
