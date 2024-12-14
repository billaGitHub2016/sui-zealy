import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const WaitingForMagicLink = ({
  toggleState,
}: {
  toggleState: () => void;
}) => {
  return (
    <>
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col gap-4 bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 p-4 rounded-xl max-w-sm w-full">
          <h1 className="text-xl">请查看您的邮箱</h1>
          <div className="flex flex-col gap-2">
            <p className="text-sm">
              我们已经发送了一封带有magic link的电子邮件到您的邮箱。
            </p>
            <p className="text-xs opacity-60">
              提示：它可能位于您的垃圾邮件文件夹中。
            </p>
          </div>
          <div>
            <Button onClick={toggleState} variant="secondary" size="sm">
              <ArrowLeft size={14} />
              返回
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
