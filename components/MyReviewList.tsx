"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/use-toast";
import { Record } from "@/types/record";
import AddressLink from "@/components/address-link";
import { RefreshCw } from "lucide-react";
import ReviewDialog from "@/components/ReviewDialog";

export async function fetchReviews({
  pageNo,
  pageSize = 10,
  user_id,
}: {
  pageNo: number;
  pageSize?: number;
  user_id: string;
}): Promise<{
  list: Record[];
  total: number;
}> {
  const response = await fetch(`/api/reviews`, {
    method: "POST",
    body: JSON.stringify({ pageNo, pageSize, user_id }),
  });
  if (!response.ok) {
    const res = await response.json();
    throw new Error(res.message);
  }
  const result = await response.json();
  return result.data;
}

export function RecordListTable({ user }: { user: any }) {
  const [pageNo, setPageNo] = useState(1);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const pageSize = 10;
  const totalPage = Math.ceil(total / pageSize);
  const [records, setRecords] = useState<Record[]>([]);
  const reviewDialog = useRef<{
    setOpen: (open: boolean) => void;
  }>(null);
  const [reviewRecord, setReviewRecord] = useState<Record | null>(null);

  useEffect(() => {
    getReviewsByPage();
  }, [pageNo]);

  const getReviewsByPage = () => {
    setIsLoading(true);
    fetchReviews({ pageNo: pageNo, pageSize, user_id: user?.id })
      .then((result) => {
        if (result) {
          setRecords(result.list);
          setTotal(result.total);
        }
      })
      .catch((err) => {
        toast({
          title: "查询审核记录失败",
          description: err.message,
          variant: "destructive",
        });
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  return (
    <div className="w-full">
      <div className="w-full flex justify-end items-center mb-4">
        <Button
          variant={"outline"}
          onClick={() => {
            setPageNo(1);
            getReviewsByPage();
          }}
        >
          <RefreshCw /> 刷新
        </Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>申请描述</TableHead>
            <TableHead>图片附件</TableHead>
            <TableHead>提交日期</TableHead>
            <TableHead>钱包地址</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                <RecordListSkeleton></RecordListSkeleton>
              </TableCell>
            </TableRow>
          ) : records.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center ">
                暂无数据
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{record.desc}</TableCell>
                <TableCell>
                  {record?.attachments?.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square rounded-lg overflow-hidden"
                    >
                      <Link
                        href={image}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 z-10"
                      >
                        <Image
                          src={image}
                          alt={`image ${index + 1}`}
                          width={50}
                          height={50}
                        />
                      </Link>
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  {record.created_at
                    ? new Date(record.created_at).toLocaleString()
                    : ""}
                </TableCell>
                <TableCell>
                  <AddressLink
                    address={record.wallet_address}
                    type="account"
                  ></AddressLink>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size={"sm"}
                    onClick={() => {
                      setReviewRecord(record);
                      reviewDialog.current?.setOpen(true);
                    }}
                  >
                    审核
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      <div
        className="mt-4 flex justify-end aria-hidden:hidden"
        aria-hidden={records.length == 0}
      >
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPageNo((prev) => Math.max(prev - 1, 1))}
                aria-disabled={pageNo === 1}
                className="aria-disabled:bg-slate-50 aria-disabled:text-gray-500 aria-disabled:cursor-not-allowed"
              />
            </PaginationItem>
            {[...Array(totalPage)].map((_, index) => (
              <PaginationItem key={index}>
                <PaginationLink
                  onClick={() => setPageNo(index + 1)}
                  isActive={pageNo === index + 1}
                >
                  {index + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext
                onClick={() =>
                  setPageNo((prev) => Math.min(prev + 1, totalPage))
                }
                aria-disabled={pageNo === 1}
                className="aria-disabled:bg-slate-50 aria-disabled:text-gray-500 aria-disabled:cursor-not-allowed"
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

      <ReviewDialog
        ref={reviewDialog}
        record={reviewRecord}
        user={user}
        onSubmitSuccess={() => {
          getReviewsByPage();
        }}
      ></ReviewDialog>
    </div>
  );
}

function RecordListSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="border p-4 rounded-lg shadow">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-4 w-1/2 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      ))}
    </div>
  );
}
