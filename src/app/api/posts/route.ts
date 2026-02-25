import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { Post } from "@/generated/prisma/client";

export const revalidate = 0; // ◀ サーバサイドのキャッシュを無効化する設定
export const dynamic = "force-dynamic"; // ◀ 〃

export const GET = async (req: NextRequest) => {
// 以下省略
  try {
    const posts = await prisma.post.findMany({
      include: {
        categories: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // categories に変換 (id と name を返す)
    const postsWithCategories = posts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      coverImageURL: post.coverImageURL,
      categories: post.categories.map((c) => ({
        id: c.category.id,
        name: c.category.name,
      })),
    }));

    return NextResponse.json(postsWithCategories);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "投稿記事の一覧の取得に失敗しました" },
      { status: 500 },
    );
  }
};

// import { prisma } from "@/lib/prisma";
// import { NextResponse, NextRequest } from "next/server";
// import { Post } from "@/generated/prisma/client";

// export const revalidate = 0; // ◀ サーバサイドのキャッシュを無効化する設定
// export const dynamic = "force-dynamic"; // ◀ 〃

// export const GET = async (req: NextRequest) => {
// // 以下省略
//   try {
//     const posts = await prisma.post.findMany({
//       include: {
//         categories: {
//           select: {
//             categoryId: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     // categoryIds に変換
//     const postsWithCategoryIds = posts.map((post) => ({
//       id: post.id,
//       title: post.title,
//       content: post.content,
//       coverImageURL: post.coverImageURL,
//       categoryIds: post.categories.map((c) => c.categoryId),
//     }));

//     return NextResponse.json(postsWithCategoryIds);
//   } catch (error) {
//     console.error(error);
//     return NextResponse.json(
//       { error: "投稿記事の一覧の取得に失敗しました" },
//       { status: 500 },
//     );
//   }
// };