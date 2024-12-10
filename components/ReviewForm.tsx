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
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
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
import { Record } from "@/types/record";
import { Task } from "@/types/task";
import { User } from "@supabase/supabase-js";
import { Pass, Fail, RESULT_MAP } from '@/config/constants'

const formSchema = z.object({
  result: z.number().refine((v) => v === Pass || v === Fail, {
    message: "请选择审核结果",
  }),
  comment: z.string(),
});

const ReviewForm = (
  {
    onSubmitSuccess,
    record,
    task,
    user,
  }: {
    onSubmitSuccess?: () => void;
    record: Record | null;
    task: Task;
    user: User | null;
  },
  ref: Ref<{
    onSubmit: Function;
  }>
) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const account = useCurrentAccount();

  useImperativeHandle(ref, () => ({
    onSubmit,
  }));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      comment: "",
    },
  });

  async function onSubmit() {
    if (!record) {
      return;
    }
    if (record.result !== 0) {
      toast({
        title: "校验失败",
        description: "申请不能审核",
        variant: "destructive",
      });
      return;
    }
    if (user?.id === record.user_id) {
      toast({
        title: "校验失败",
        description: "不能审核自己的申请",
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
      const formData = new FormData();
      formData.append("result", values.result + '');
      formData.append("comment", values.comment);
      formData.append("id", record.id + '');

      const response = await fetch("/api/reviews", {
        method: "PUT",
        body: formData,
      });

      if (!response.ok) {
        const res = await response.json();
        throw new Error(res.message);
      }

      toast({
        title: "审核提交成功",
        description: "审核提交成功，奖励已发放",
      });
      onSubmitSuccess && onSubmitSuccess();
    } catch (error: any) {
      toast({
        title: "审核提交失败",
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
          name="result"
          render={({ field }) => (
            <FormItem className="grid sm:grid-cols-8 gap-4 items-start">
              <FormLabel className="sm:text-right pt-5 sm:col-span-3">审核结果</FormLabel>
              <div className="sm:col-span-5">
                <FormControl>
                  <RadioGroup
                    defaultValue={field.value?.toString()}
                    onValueChange={(val) => {
                      field.onChange(parseInt(val));
                    }}
                    className="flex"
                  >
                    <div className="flex items-center space-x-2 mr-3">
                      <RadioGroupItem value="1" id="r1" />
                      <Label htmlFor="r1">{RESULT_MAP[1]}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="r2" />
                      <Label htmlFor="r2">
                      {RESULT_MAP[2]}
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormDescription>通过则发放奖励，不通过则不发放</FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem className="grid sm:grid-cols-8 gap-4 items-start">
              <FormLabel className="sm:text-right pt-5 sm:col-span-3">
                评论
              </FormLabel>
              <div className="sm:col-span-5">
                <FormControl>
                  <Textarea
                    placeholder="如果不通过，请说明原因"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  填写审核通过/不通过的原因。如果不通过，请说明原因。
                </FormDescription>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="grid sm:grid-cols-8 gap-4 items-start">
          <FormLabel className="sm:text-right pt-5 sm:col-span-3">
            钱包地址
          </FormLabel>
          <div className="sm:col-span-5">
            <ConnectButton>连接钱包</ConnectButton>
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "提交中..." : "提交"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default forwardRef(ReviewForm);
