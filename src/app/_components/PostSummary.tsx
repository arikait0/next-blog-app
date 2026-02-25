"use client";
import type { Post } from "@/app/_types/Post";
import type { Category } from "@/app/_types/Category";
import Link from "next/link";

type Props = {
  post: Post;
};

const PostSummary: React.FC<Props> = (props) => {
  const { post } = props;
  return (
    <div className="border border-slate-400 p-3">
        <Link href={`/posts/${post.id}`}>
            <div className="mb-1 text-lg font-bold">{post.title}</div>
            <div className="flex gap-2 mb-2">
              {post.categories?.map((category) => (
              <span
              key={category.id}
            className="px-2 py-1 bg-slate-200 text-xs rounded"
            >
              {category.name}
            </span>
          ))}
          </div>
            <div
                className="line-clamp-3"
                dangerouslySetInnerHTML={{ __html: post.content }}
            />
        </Link>
    </div>
  );
};

export default PostSummary;