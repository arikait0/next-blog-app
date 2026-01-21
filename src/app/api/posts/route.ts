import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { Post } from "@/generated/prisma/client";

export const GET = async (req: NextRequest) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        categories: {
          select: {
            categoryId: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // categoryIds に変換
    const postsWithCategoryIds = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      coverImageURL: post.coverImageURL,
      categoryIds: post.categories.map((c) => c.categoryId),
    }));

    return NextResponse.json(postsWithCategoryIds);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の一覧の取得に失敗しました" },
      { status: 500 },
    );
  }
};