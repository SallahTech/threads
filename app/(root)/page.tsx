// "use client";
import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreads } from "@/lib/actions/thread.actions";
import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
  const result = await fetchThreads({ pageNumber: 1, pageSize: 10 });

  return (
    <>
      <h1 className="head-text text-left">Home</h1>
      <section className="mt-9 flex flex-col gap-10">
        {result.threads.length === 0 ? (
          <p className="no-result">No Threads found</p>
        ) : (
          <>
            {result.threads.map((thread) => (
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
            ))}
          </>
        )}
      </section>
    </>
  );
}
