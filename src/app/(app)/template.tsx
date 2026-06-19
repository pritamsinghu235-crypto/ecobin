import { PageFade } from "@/components/animations/page-fade";

export default function Template({ children }: { children: React.ReactNode }) {
  return <PageFade>{children}</PageFade>;
}
