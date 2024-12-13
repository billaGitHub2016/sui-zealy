"use client";
import Link from "next/link";
import { LineText } from "./LineText";
import { Button } from "@/components/ui/button";


const Hero = () => {
  return (
    <>
      {/* <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 0.3,
          ease: [0, 0.71, 0.2, 1],
          scale: {
            type: "tween", // tween spring
            // damping: 10, // if spring
            // stiffness: 50, // if spring
            // restDelta: 0.001, // if spring
          },
        }}
      > */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pb-16 pt-16 md:pt-24 text-center">
        <h1>
          花小钱 <LineText>办小事</LineText> 
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-2xl tracking-tight text-slate-700 dark:text-slate-400">
          {/* {siteConfig.description} */}
          一个免费的，去中心化的，任务发布和接单平台。欢迎发布各种小任务，也可以在这里完成任务并申请奖励。
        </p>
      </section>
      {/* </motion.div> */}
      <div>
        <Link href="/overview">
          <Button className="mr-4" size={"lg"}>发布任务</Button>
        </Link>
        <Link href="/published-tasks">
          <Button className="" size={"lg"}>看看有啥任务</Button>
        </Link>
      </div>
    </>
  );
};

export default Hero;
