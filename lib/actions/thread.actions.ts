"use server";

import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";

interface Params {
  text: string;
  author: string;
  communityId: string | null;
  path: string;
}

export async function createThread({
  text,
  author,
  communityId,
  path,
}: Params) {
  try {
    connectToDB();

    const createdThread = await Thread.create({
      text,
      author,
      community: null,
    });

    // Update User Model
    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to create thread: ${error.message}`);
  }
}

export async function fetchThreads({ pageNumber = 1, pageSize = 20 }) {
  connectToDB();

  // calculate the number of threads to skip
  const skipAmount = (pageNumber - 1) * pageSize;

  // fetch the threads that have no parents (top level threads...)
  const threadsQuery = Thread.find({
    parentId: {
      $in: [null, undefined],
    },
  })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id parentId image",
      },
    });

  const totalThreadsCount = await Thread.countDocuments({
    parentId: {
      $in: [null, undefined],
    },
  });

  const threads = await threadsQuery.exec();

  const isNext = totalThreadsCount > pageNumber + threads.length;

  return {
    threads,
    isNext,
  };
}

// fetch a single thread by id
export async function fetchThreadById(id: string) {
  connectToDB();

  try {
    // TODO: populate community
    const thread = await Thread.findById(id)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author",
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (error: any) {
    throw new Error(`Failed to fetch thread: ${error.message}`);
  }
}

export async function addCommentToThread({
  threadId,
  commentText,
  userId,
  path,
}: {
  threadId: string;
  commentText: string;
  userId: string;
  path: string;
}) {
  connectToDB();

  try {
    // find the original thread
    const thread = await Thread.findById(threadId);

    if (!thread) {
      throw new Error("Thread not found");
    }

    const commentThread = await new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    const savedCommentThread = await commentThread.save();

    // add the comment to the original thread
    thread.children.push(savedCommentThread._id);

    // save the original thread
    await thread.save();

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to add comment to thread: ${error.message}`);
  }
}
