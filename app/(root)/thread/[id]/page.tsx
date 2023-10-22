import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

const page = async ({ params }: { params: { id: string } }) => {
  if (!params.id) return null;

  const user = await currentUser();

  if (!user) return null;

  const userInfo = await fetchUser(user.id);

  if (!userInfo.onboarded) redirect("/onboarding");

  const thread = await fetchThreadById(params.id);

  return (
    <section className="relative">
      <ThreadCard
        key={thread.id}
        id={thread.id}
        currentUserId={user?.id || ""}
        parentId={thread.parentId}
        content={thread.text}
        title={thread.title}
        author={thread.author}
        community={thread.community}
        createdAt={thread.createdAt}
        comments={thread.comments}
      />
    </section>
  );
};

export default page;
