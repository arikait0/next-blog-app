"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";

type PostApiResponse = {
  id: string;
  title: string;
  content: string;
  coverImageURL: string;
  categoryIds: string[];
};

const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const [posts, setPosts] = useState<PostApiResponse[] | null>(null);
  const router = useRouter();
  // ウェブAPI (/api/posts) から投稿記事の一覧をフェッチする関数の定義
  const fetchPosts = async () => {
    try {
      setIsLoading(true);

      const requestUrl = "/api/posts";
      const res = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        setPosts(null);
        throw new Error(
          `投稿記事の一覧のフェッチに失敗しました: (${res.status}: ${res.statusText})`
        );
      }

      const apiResBody = (await res.json()) as PostApiResponse[];
      setPosts(apiResBody);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : `予期せぬエラーが発生しました ${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // コンポーネントがマウントされたとき (初回レンダリングのとき) に1回だけ実行
  useEffect(() => {
    fetchPosts();
  }, []);

  // 投稿記事の一覧を取得中の画面
  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  // 投稿記事の一覧を取得失敗したときの画面
  if (!posts) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  const handleDelete = async (postId: string) => {
    if (!window.confirm("この投稿記事を削除してもよろしいですか？")) {
      return;
    }
      setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/posts/${postId}`, {
        method: "DELETE",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`削除に失敗しました: (${res.status}: ${res.statusText})`);
      }

      setPosts(posts?.filter((post) => post.id !== postId) ?? null);
            // 投稿記事の一覧ページに移動
      router.replace("/admin/posts");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `投稿記事のDELETEリクエストに失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main>
      <div className="mb-4 text-2xl font-bold">投稿記事の一覧</div>

      <div className="mb-6">
        <Link
          href="/admin/posts/new"
          className={twMerge(
            "rounded-md px-4 py-2 font-bold",
            "bg-indigo-500 text-white hover:bg-indigo-600"
          )}
        >
          新しい投稿記事を作成
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="text-gray-500">
          （投稿記事は1個も作成されていません）
        </div>
      ) : (
        <div className="space-y-2">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/admin/posts/${post.id}`}
              className="block rounded-md border-2 border-gray-300 p-4 hover:border-indigo-500 hover:bg-indigo-50"
            >
              <div className="font-bold">{post.title}</div>
              <div className="text-sm text-gray-500">
                {post.content.substring(0, 100)}...
              </div>
              <div className="mt-2 flex justify-end">
                <button
                    type="button"
                    className={twMerge(
                      "rounded-md px-5 py-1 font-bold",
                      "bg-red-500 text-white hover:bg-red-600"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(post.id);
                    }}
                    disabled={isLoading}
                  >
                    削除
                </button>
              </div>
            </Link>
            
          ))}
          </div>
        )}
      </main>      
  );
};


export default Page;

