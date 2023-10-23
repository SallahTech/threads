import ThreadCard from "@/components/cards/ThreadCard";
import Comment from "@/components/forms/Comment";
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
        author={thread.author}
        community={thread.community}
        createdAt={thread.createdAt}
        comments={thread.comments}
      />
      <div className="mt-7">
        <Comment
          threadId={thread.id}
          currentUserImg={userInfo.image || ""}
          currentUserId={userInfo._id || ""}
        />
      </div>
      <div className="mt-10">
        {
          // @ts-ignore
          thread.children.map((comment) => (
            <ThreadCard
              key={comment.id}
              id={comment.id}
              currentUserId={user?.id || ""}
              parentId={comment.parentId}
              content={comment.text}
              author={comment.author}
              community={comment.community}
              createdAt={comment.createdAt}
              comments={comment.children}
              isComment
            />
          ))
        }
      </div>
    </section>
  );
};

export default page;
