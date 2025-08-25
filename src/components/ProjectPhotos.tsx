import React, { useState } from 'react';
import { useProject } from '@/contexts/ProjectContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface ProjectPhoto {
  id: string;
  url: string;
  caption?: string;
  uploadedAt: string;
}

interface ProjectPhotosProps {
  projectRunId: string;
}

export const ProjectPhotos: React.FC<ProjectPhotosProps> = ({ projectRunId }) => {
  const { projectRuns, updateProjectRun } = useProject();
  const [uploadingCategory, setUploadingCategory] = useState<'before' | 'during' | 'after' | null>(null);
  const [viewingPhoto, setViewingPhoto] = useState<{ url: string; caption?: string } | null>(null);

  const currentProjectRun = projectRuns.find(pr => pr.id === projectRunId);
  const photos = currentProjectRun?.project_photos || { before: [], during: [], after: [] };

  const uploadPhoto = async (file: File, category: 'before' | 'during' | 'after') => {
    setUploadingCategory(category);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${projectRunId}/${category}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('project-photos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('project-photos')
        .getPublicUrl(fileName);

      const newPhoto: ProjectPhoto = {
        id: `photo-${Date.now()}`,
        url: urlData.publicUrl,
        uploadedAt: new Date().toISOString()
      };

      const updatedPhotos = {
        ...photos,
        [category]: [...photos[category], newPhoto]
      };

      if (currentProjectRun) {
        await updateProjectRun({
          ...currentProjectRun,
          project_photos: updatedPhotos
        });
      }

      toast.success(`${category.charAt(0).toUpperCase() + category.slice(1)} photo uploaded successfully`);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast.error('Failed to upload photo');
    } finally {
      setUploadingCategory(null);
    }
  };

  const deletePhoto = async (category: 'before' | 'during' | 'after', photoId: string) => {
    try {
      const updatedPhotos = {
        ...photos,
        [category]: photos[category].filter(photo => photo.id !== photoId)
      };

      if (currentProjectRun) {
        await updateProjectRun({
          ...currentProjectRun,
          project_photos: updatedPhotos
        });
      }

      toast.success('Photo deleted successfully');
    } catch (error) {
      console.error('Error deleting photo:', error);
      toast.error('Failed to delete photo');
    }
  };

  const handleFileUpload = (files: FileList | null, category: 'before' | 'during' | 'after') => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    uploadPhoto(file, category);
  };

  const renderPhotoCategory = (category: 'before' | 'during' | 'after', title: string, color: string) => {
    const categoryPhotos = photos[category] || [];
    
    return (
      <Card key={category}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5" />
              {title}
              <Badge variant="outline" className={color}>
                {categoryPhotos.length} photos
              </Badge>
            </CardTitle>
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleFileUpload(e.target.files, category)}
                className="absolute inset-0 opacity-0 cursor-pointer"
                disabled={uploadingCategory === category}
              />
              <Button 
                size="sm" 
                variant="outline"
                disabled={uploadingCategory === category}
                className="flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {uploadingCategory === category ? 'Uploading...' : 'Add Photo'}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {categoryPhotos.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No {category} photos yet</p>
              <p className="text-sm">Upload photos to track your progress</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categoryPhotos.map((photo) => (
                <div key={photo.id} className="relative group">
                  <img
                    src={photo.url}
                    alt={`${category} photo`}
                    className="w-full h-24 sm:h-32 object-cover rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => setViewingPhoto({ url: photo.url, caption: photo.caption })}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setViewingPhoto({ url: photo.url, caption: photo.caption })}
                        className="p-1 h-6 w-6"
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deletePhoto(category, photo.id)}
                        className="p-1 h-6 w-6"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 text-center">
                    {new Date(photo.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Project Progress Photos</h3>
        <p className="text-muted-foreground">
          Document your DIY journey with before, during, and after photos
        </p>
      </div>

      <div className="grid gap-6">
        {renderPhotoCategory('before', 'Before Photos', 'text-red-600 border-red-200')}
        {renderPhotoCategory('during', 'Progress Photos', 'text-yellow-600 border-yellow-200')}
        {renderPhotoCategory('after', 'Completed Photos', 'text-green-600 border-green-200')}
      </div>

      {/* Photo Viewer Dialog */}
      {viewingPhoto && (
        <Dialog open={!!viewingPhoto} onOpenChange={() => setViewingPhoto(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Project Photo</DialogTitle>
            </DialogHeader>
            <div className="flex justify-center">
              <img
                src={viewingPhoto.url}
                alt="Project photo"
                className="max-w-full max-h-96 object-contain rounded-lg shadow-lg"
              />
            </div>
            {viewingPhoto.caption && (
              <p className="text-center text-muted-foreground mt-4">
                {viewingPhoto.caption}
              </p>
            )}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};