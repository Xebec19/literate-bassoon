import Lottie from "lottie-react";
import { cn } from "../lib/utils";

export default function LottieContainer({
  className,
  animationData,
}: {
  className: string;
  animationData: unknown;
}) {
  return (
    <div className={cn(className)}>
      <Lottie animationData={animationData} autoplay={true} />
    </div>
  );
}
