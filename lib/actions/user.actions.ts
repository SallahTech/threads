"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";

interface Params {
  userId: string;
  username: string;
  bio: string;
  image: string;
  name: string;
  path: string;
}

export async function updateUser({
  userId,
  username,
  bio,
  image,
  name,
  path,
}: Params): Promise<void> {
  connectToDB();

  try {
    await User.findOneAndUpdate(
      {
        id: userId,
      },
      { username: username.toLowerCase(), name, bio, image, onboarded: true },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  connectToDB();
  try {
    return await User.findOne({ id: userId });
    // .populate({
    //     path: 'communities',
    //     model: 'Community',
    // })
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

// fetch user threads
export async function fetchUserThreads(userId: string) {
  connectToDB();

  try {
    return await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: {
        path: "children",
        model: Thread,
        populate: {
          path: "author",
          model: User,
          select: "name image id",
        },
      },
    });
  } catch (error: any) {
    throw new Error(`Failed to fetch user threads: ${error.message}`);
  }
}
