import { PostForm } from "@/components/admin/PostForm";

export default function NewBlogPostPage() {
  return (
    <div className="space-y-8 pt-8 md:pt-0">
      <div className="border-l-2 border-phosphor/40 pl-5">
        <p className="font-mono text-[10px] tracking-[0.3em] text-muted-foreground uppercase mb-1">
          Transmissions
        </p>
        <h1 className="text-2xl font-medium text-foreground">Write Entry</h1>
      </div>

      <PostForm />
    </div>
  );
}
