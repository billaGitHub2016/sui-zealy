import { AvatarIcon } from "@radix-ui/react-icons";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import Link from "next/link";
import { Button } from "./ui/button";
import React from "react";
import { Database } from "@/types/supabase";
import { ThemedButton } from "./ThemedButton";

export const dynamic = "force-dynamic";

export const revalidate = 0;

export default async function Navbar() {
  const supabase = createServerComponentClient<Database>({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // const { data: credits } = await supabase
  //   .from("credits")
  //   .select("*")
  //   .eq("user_id", user?.id ?? "")
  //   .single();

  return (
    <div className="flex w-full px-4 lg:px-40 py-4 items-center border-b text-center gap-8 justify-between">
      <div className="flex gap-2 h-full">
        <Link href="/">
          <h2 className="font-bold text-xl leading-9 mb-0">SUI-Zealy</h2>
        </Link>

        <div className="hidden sm:flex lg:flex flex-row gap-2 ml-8">
          <Link href="/published-tasks">
            <Button variant={"ghost"}>已发布的任务</Button>
          </Link>
          <Link href="/overview">
            <Button variant={"ghost"}>我的</Button>
          </Link>
        </div>
      </div>
      <div className="flex gap-4 lg:ml-auto items-center">
        <ThemedButton></ThemedButton>
        {!user && (
          <Link href="/login">
            <Button variant={"ghost"}>登录 / 注册</Button>
          </Link>
        )}
        {user && (
          <div className="flex flex-row gap-4 text-center align-middle justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="cursor-pointer">
                <AvatarIcon height={24} width={24} className="text-primary" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56">
                <DropdownMenuLabel className="text-primary text-center overflow-hidden text-ellipsis">
                  {user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <form action="/auth/sign-out" method="post">
                  <Button
                    type="submit"
                    className="w-full text-left"
                    variant={"ghost"}
                  >
                    登出
                  </Button>
                </form>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </div>
  );
}
