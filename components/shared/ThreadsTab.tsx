import { fetchUserThreads } from "@/lib/actions/user.actions";
import { redirect } from "next/navigation";
import React from "react";
import ThreadCard from "../cards/ThreadCard";

interface IThreadsTabProps {
  currentUserId: string;
  accountId: string;
  accountType: string;
}

const ThreadsTab = async ({
  currentUserId,
  accountId,
  accountType,
}: IThreadsTabProps) => {
  // TODO: fetch profile threads
  const result = await fetchUserThreads(accountId);

  if (!result) redirect("/");

  return (
    <section className="mt-9 flex flex-col gap-10">
      {result.threads.map((thread: any) => (
        <ThreadCard
          key={thread._id}
          id={thread._id}
          currentUserId={currentUserId}
          parentId={thread.parentId}
          content={thread.text}
          author={
            accountType === "User"
              ? {
                  id: result._id,
                  name: result.name,
                  image: result.image,
                }
              : {
                  id: thread.author._id,
                  name: thread.author.name,
                  image: thread.author.image,
                }
          }
          community={thread.community}
          createdAt={thread.createdAt}
          comments={thread.children}
        />
      ))}
    </section>
  );
};

export default ThreadsTab;
