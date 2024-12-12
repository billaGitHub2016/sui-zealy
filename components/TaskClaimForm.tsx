"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useState,
  Ref,
} from "react";
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
import { DatePicker } from "@/components/date-picker";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { DateBefore } from "react-day-picker";
import { Task } from "@/types/task";
import { User } from "@supabase/supabase-js";
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

const SUI_MIST = 1000000000;

const formSchema = z.object({
  desc: z.string().min(1, {
    message: "申请描述至少需要10个字符。",
  }),
  attachments: z.array(z.instanceof(File)),
});

const TaskClaimForm = (
  {
    onSubmitSuccess,
    task,
    user
  }: {
    onSubmitSuccess?: () => void;
    task?: Task | null;
    user: User
  },
  ref: Ref<{
    onSubmit: Function;
  }>
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previews, setPreviews] = useState<string[]>([]);

  useImperativeHandle(ref, () => ({
    onSubmit,
  }));

  useEffect(() => {
    
  }, [task]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      desc: "",
      attachments: [],
    },
  });

  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute } = useSignAndExecuteTransaction({
    execute: async ({ bytes, signature }) =>
      await suiClient.executeTransactionBlock({
        transactionBlock: bytes,
        signature,
        options: {
          // Raw effects are required so the effects can be reported back to the wallet
          showRawEffects: true,
          showEffects: true,
          showEvents: true,
        },
      }),
  });

  const addRecord = async (values: any) => {
    
  }

  async function onSubmit() {
    if (!task) {
      return;
    }
    if (task.status !== 1) {
      toast({
        title: "校验失败",
        description: "任务不能申请",
        variant: "destructive",
      });
      return;
    }
    if (user.id === task.user_id) {
      toast({
        title: "校验失败",
        description: "不能申请自己的任务",
        variant: "destructive",
      });
      return;
    }
    if (!account) {
      toast({
        title: "校验失败",
        description: "请先连接钱包",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const validateResult = await new Promise((resolve) => {
        form.handleSubmit(
          () => {
            resolve(true);
          },
          (error) => {
            resolve(false);
            const keys = Object.keys(error);
            toast({
              title: "校验失败",
              description: error[keys[0] as keyof typeof error]?.message,
              variant: "destructive",
            });
          }
        )();
      });
      if (!validateResult) {
        return;
      }

      const values = form.getValues();
      const txb = new Transaction();
      txb.setGasBudget(100000000);

      return await new Promise((resolve, reject) => {
        txb.moveCall({
          target: `${process.env.NEXT_PUBLIC_PACKAGE_ID}::task::add_task_record`,
          arguments: [
            txb.object(task.address as string),
            txb.pure.string(values.desc as string),
            txb.pure.vector('string', ['1', '2']),
            txb.object("0x6"),
          ],
          typeArguments: [],
        });
        signAndExecute(
          {
            transaction: txb,
          },
          {
            onSuccess: async (data) => {
              console.log('claim = ', data);
              if (
                ((data.effects &&
                  data.effects.status.status) as unknown as string) === "success"
              ) {
                let record_address =
                  data.effects?.created && Array.isArray(data.effects.created) && (data.effects.created?.length > 0) && (data.effects.created[0].reference as any).objectId
  
                  const formData = new FormData();
                  formData.append("desc", values.desc);
                  values.attachments.forEach((file: File, index: number) => {
                    formData.append(`attachments${index}`, file);
                  });
                  formData.append("wallet_address", account.address);
                  formData.append("task_id", task?.id as unknown as string);
                  formData.append("record_address", record_address as string);
            
                  const response = await fetch("/api/claimTask", {
                    method: "PUT",
                    body: formData,
                  });
            
                  if (!response.ok) {
                    const res = await response.json();
                    reject(new Error(res.message));
                  }

                  resolve('');
            
                  toast({
                    title: "申请提交成功",
                    description: "您的申请已提交，请耐心等待审核结果。",
                  });
              } else {
                toast({
                  title: "发布失败",
                  description: "发布链上任务失败，请稍后再试",
                  variant: "destructive",
                });
                reject(new Error("发布链上任务失败，请稍后再试"));
              }
            },
            onError: (err) => {
              console.log("transaction error: " + err);
              toast({
                title: "发布失败",
                description: `发布链上任务失败:${err.message}，请稍后再试`,
                variant: "destructive",
              });
              reject(err);
            },
          }
        );
      })
    } catch (error: any) {
      toast({
        title: "申请提交失败",
        description: error.message,
        variant: "destructive",
      });
      console.error("提交失败", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="desc"
          render={({ field }) => (
            <FormItem className="grid sm:grid-cols-8 gap-4 items-start">
              <FormLabel className="sm:text-right pt-5 sm:col-span-3">申请描述</FormLabel>
              <div className="sm:col-span-5">
                <FormControl>
                  <Textarea
                    placeholder="简单描述一下任务的完成情况"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  描述任务的完成情况，必要时说明审核的注意点。
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="attachments"
          render={({ field: { onChange, value, ...rest } }) => (
            <FormItem className="grid sm:grid-cols-8 gap-4 items-start">
              <FormLabel className="sm:text-right pt-5 sm:col-span-3">图片附件</FormLabel>
              <div className="sm:col-span-5">
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
              </div>
            </FormItem>
          )}
        />

        <div className="grid sm:grid-cols-8 gap-4 items-start">
          <FormLabel className="sm:text-right pt-5 sm:col-span-3">钱包地址</FormLabel>
          <div className="sm:col-span-5">
            <ConnectButton>连接钱包</ConnectButton>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "提交中..." : "申请奖励"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default forwardRef(TaskClaimForm);
