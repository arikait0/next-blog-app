import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export const GET = async (req: NextRequest, routeParams: RouteParams) => {
  try {
    const { id } = await routeParams.params;
    const post = await prisma.post.findUnique({
      where: {
        id: String(id),
      },
      include: {
        categories: {
          select: {
            categoryId: true,
          },
        },
      },
    });

    if (!post) {
      return NextResponse.json(
        { error: "投稿記事が見つかりません" },
        { status: 404 }
      );
    }

    // categoryIds に変換
    const postWithCategoryIds = {
      id: post.id,
      title: post.title,
      content: post.content,
      coverImageURL: post.coverImageURL,
      categoryIds: post.categories.map((c) => c.categoryId),
    };

    return NextResponse.json(postWithCategoryIds);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の取得に失敗しました" },
      { status: 500 }
    );
  }
};