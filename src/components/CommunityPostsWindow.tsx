import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CommunityPosts } from "./CommunityPosts";

interface CommunityPostsWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommunityPostsWindow({ open, onOpenChange }: CommunityPostsWindowProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Community Posts</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-y-auto max-h-[80vh] pr-2">
          <CommunityPosts />
        </div>
      </DialogContent>
    </Dialog>
  );
}