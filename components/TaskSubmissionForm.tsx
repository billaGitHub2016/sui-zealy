"use client";

import { useEffect, useState } from "react";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DateRangePicker } from "@/components/date-range-picker"
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "任务名称至少需要2个字符。",
  }),
  description: z.string().min(1, {
    message: "任务描述至少需要10个字符。",
  }),
  reward_method: z.number(),
  one_pass_reward: z.number(),
  pool: z.number(),
  claim_limit: z.number().int().min(1, {
    message: "至少发放1个奖励。",
  }),
  dateRange: z.object({
    from: z.date(),
    to: z.date(),
  }),
  attachment: z
    .array(z.instanceof(File))
    .refine((files) => files.length > 0, "请至少上传一个图片附件。"),
});

export function TaskSubmissionForm({
  onSubmitSuccess,
}: {
  onSubmitSuccess: () => void;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      reward_method: 1,
      claim_limit: 1,
      one_pass_reward: 0,
      pool: 0,
      description: "",
      dateRange: {
        from: new Date(),
        to: new Date(new Date().setDate(new Date().getDate() + 7)), // Default to 7 days from now
      },
      attachment: [],
    },
  });

  const onePassReward = form.watch("one_pass_reward");
  const claimLimit = form.watch("claim_limit");
  const rewardMethod = form.watch("reward_method");
  useEffect(() => {
    form.setValue("pool", claimLimit * onePassReward);
  }, [onePassReward, claimLimit, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description);
      values.attachment.forEach((file, index) => {
        formData.append(`attachment${index}`, file);
      });

      const response = await fetch("/api/tasks", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("提交失败");
      }

      toast({
        title: "任务创建成功",
        description: "您的新任务已经成功创建。",
      });
      onSubmitSuccess();
    } catch (error) {
      toast({
        title: "提交失败",
        description: "创建任务时出现错误,请稍后重试。",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>任务名称</FormLabel>
              <FormControl>
                <Input placeholder="输入任务名称" {...field} />
              </FormControl>
              <FormDescription>
                请在任务名称中简要说明任务的内容
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="dateRange"
          render={({ field }) => (
            <FormItem className="grid sm:grid-cols-4 gap-4 items-start">
              <FormLabel className="sm:text-right pt-2">任务时间范围</FormLabel>
              <div className="sm:col-span-3">
                <FormControl>
                  <DateRangePicker
                    value={field.value}
                    onChange={(value) => {
                      console.log('日期change~~~~~~~~~~~', value);
                      debugger
                      if (value?.from && value?.to) {
                        field.onChange(value);
                      }
                    }}
                  />
                </FormControl>
                <FormDescription className="mt-1">
                  选择任务的开始和结束日期。
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>任务描述</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="详细描述您的任务"
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                请详细描述任务的要求、目标和具体内容。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="reward_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>奖励发放方式</FormLabel>
              <FormControl>
                <RadioGroup
                  defaultValue={field.value?.toString()}
                  onValueChange={(val) => {
                    field.onChange(parseInt(val));
                  }}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="1" id="r1" />
                    <Label htmlFor="r1">通过审核就送单个申请奖励</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="2" id="r2" />
                    <Label htmlFor="r2">
                      从通过审核者中抽取1位幸运儿独得奖池的奖励
                    </Label>
                  </div>
                </RadioGroup>
              </FormControl>
              <FormDescription>任务的奖励发放方式</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="claim_limit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>通过数量</FormLabel>
              <FormControl>
                <Input
                  placeholder="通过数量"
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormDescription>有多少个申请可以通过审核。</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {rewardMethod === 1 && (
          <FormField
            control={form.control}
            name="one_pass_reward"
            render={({ field }) => (
              <FormItem>
                <FormLabel>单个申请奖励SUI数量</FormLabel>
                <FormControl>
                  <Input
                    placeholder="单个申请奖励SUI数量"
                    type="number"
                    {...field}
                    onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  />
                </FormControl>
                <FormDescription>
                  每个通过的申请发放的SUI奖励数量。
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name="pool"
          render={({ field }) => (
            <FormItem>
              <FormLabel>奖池SUI数量</FormLabel>
              <FormControl>
                <Input
                  placeholder="质押SUI数量"
                  type="number"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  disabled={rewardMethod === 1}
                />
              </FormControl>
              <FormDescription>
                {rewardMethod === 1
                  ? "奖池SUI数量 = 通过数量 * 单个申请奖励SUI数量"
                  : "中奖者奖独得奖池的SUI"}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* <FormField
          control={form.control}
          name="attachment"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem>
              <FormLabel>图片附件</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      onChange(files);
                      setPreviews(
                        files.map((file) => URL.createObjectURL(file))
                      );
                    }}
                    {...rest}
                  />
                  {previews.length > 0 && (
                    <div className="grid grid-cols-3 gap-4">
                      {previews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded-md"
                          />
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 h-6 w-6"
                            onClick={() => {
                              const newFiles = [...value];
                              newFiles.splice(index, 1);
                              onChange(newFiles);
                              const newPreviews = [...previews];
                              newPreviews.splice(index, 1);
                              setPreviews(newPreviews);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                上传一张或多张与任务相关的图片(支持jpg、png格式)。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        /> */}

        
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "提交中..." : "提交任务"}
        </Button>
      </form>
    </Form>
  );
}
