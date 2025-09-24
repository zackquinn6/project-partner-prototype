import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ResponsiveDialog } from "@/components/ResponsiveDialog";
import { Button } from "@/components/ui/button";
import { CommunityPosts } from "./CommunityPosts";

interface CommunityPostsWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommunityPostsWindow({ open, onOpenChange }: CommunityPostsWindowProps) {
  return (
    <ResponsiveDialog
      open={open}
      onOpenChange={onOpenChange}
      size="content-large"
      title="Community Posts"
    >
      <div className="overflow-y-auto flex-1">
        <CommunityPosts />
      </div>
    </ResponsiveDialog>
  );
}