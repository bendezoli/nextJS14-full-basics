"use server";
import error from "@/app/error";
import { connectToDb } from "./utils";
import { Post, User } from "./models";
import { revalidatePath } from "next/cache";
import { signIn, signOut } from "./auth";
import bcrypt from "bcryptjs";

export const addPost = async (formData) => {
  console.log(formData);
  //   const title = formData.get("title");
  //   const desc = formData.get("desc");
  //   const slug = formData.get("slug");

  const { title, desc, slug, userId } = Object.fromEntries(formData);
  console.log(title);

  try {
    connectToDb();

    const newPOst = new Post({ slug, title, desc, userId });

    await newPOst.save();
    console.log("Post saved");

    revalidatePath("/blog");
  } catch (e) {
    console.log(e);
    return { error: "some error" };
  }
};

export const deletePost = async (formData) => {
  console.log(formData);
  const { id } = Object.fromEntries(formData);
  //   console.log(id);

  try {
    connectToDb();

    await Post.findByIdAndDelete(id);
    console.log("deleted from db");

    revalidatePath("/blog");
  } catch (e) {
    console.log(e);
    return { error: "some error" };
  }
};

export const handleGitHubLogin = async () => {
  "use server";
  await signIn("github");
};

export const handleGitHubLogOut = async () => {
  "use server";
  await signOut("github");
};

export const register = async (formData) => {
  // console.log(formData);
  const { username, email, password, passwordRepeat } =
    Object.fromEntries(formData);

  if (password !== passwordRepeat) {
    console.log("Passwords do not match");
  }

  try {
    connectToDb();

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      console.log("User exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();
    console.log("User saved");
  } catch (e) {
    console.log(e);
    return { error: "Something went wrong" };
  }
};

export const login = async (formData) => {
  // console.log(formData);
  const { username, password } = Object.fromEntries(formData);

  try {
    await signIn("credentials", { username, password });
  } catch (e) {
    console.log(e);
    return { error: "Something went wrong" };
  }
};