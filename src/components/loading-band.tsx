import { Loader2 } from "lucide-react";

export default function LoadingBand() {
  return (
    <div className="w-full flex items-center justify-center">
      <Loader2 className="animate-spin size-4" />
    </div>
  );
}
