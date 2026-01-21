"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { Category } from "@/app/_types/Category";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

// カテゴリをフェッチしたときのレスポンスのデータ型
type CategoryApiResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

// カテゴリの新規作成 (追加) のページ
const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);
  const router = useRouter();
  // カテゴリ配列 (State)。取得中と取得失敗時は null、既存カテゴリが0個なら []
  const [categories, setCategories] = useState<Category[] | null>(null);

  // ウェブAPI (/api/categories) からカテゴリの一覧をフェッチする関数の定義
  const fetchCategories = async () => {
    try {
      setIsLoading(true);

      // フェッチ処理の本体
      const requestUrl = "/api/categories";
      const res = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });

      // レスポンスのステータスコードが200以外の場合 (カテゴリのフェッチに失敗した場合)
      if (!res.ok) {
        setCategories(null);
        throw new Error(`${res.status}: ${res.statusText}`); // -> catch節に移動
      }

      // レスポンスのボディをJSONとして読み取りカテゴリ配列 (State) にセット
      const apiResBody = (await res.json()) as CategoryApiResponse[];
      setCategories(
        apiResBody.map((body) => ({
          id: body.id,
          name: body.name,
        }))
      );
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリの一覧のフェッチに失敗しました: ${error.message}`
          : `予期せぬエラーが発生しました ${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    } finally {
      // 成功した場合も失敗した場合もローディング状態を解除
      setIsLoading(false);
    }
  };

  // コンポーネントがマウントされたとき (初回レンダリングのとき) に1回だけ実行
  useEffect(() => {
    fetchCategories();
  }, []);

  // カテゴリをウェブAPIから取得中の画面
  if (isLoading) {
    return (
      <div className="text-gray-500">
        <FontAwesomeIcon icon={faSpinner} className="mr-1 animate-spin" />
        Loading...
      </div>
    );
  }

  // カテゴリをウェブAPIから取得することに失敗したときの画面
  if (!categories) {
    return <div className="text-red-500">{fetchErrorMsg}</div>;
  }

  const handleDelete = async (categoryId: string) => {
    if (!window.confirm("このカテゴリを削除してもよろしいですか？")) {
      return;
    }
      setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/categories/${categoryId}`, {
        method: "DELETE",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`削除に失敗しました: (${res.status}: ${res.statusText})`);
      }

      setCategories(categories?.filter((category) => category.id !== categoryId) ?? null);
            // カテゴリの一覧ページに移動
      router.replace("/admin/categories");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `カテゴリのDELETEリクエストに失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      setFetchErrorMsg(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // カテゴリ取得完了後の画面
  return (
    <main>
      <div className="mb-2 text-2xl font-bold">作成されたカテゴリの一覧</div>
      {categories.length === 0 ? (
        <div className="text-gray-500">
          （カテゴリは1個も作成されていません）
        </div>
      ) : (
        <div>
      <div className="mb-6">
        <Link
          href="/admin/categories/new"
          className={twMerge(
            "rounded-md px-4 py-2 font-bold",
            "bg-indigo-500 text-white hover:bg-indigo-600"
          )}
        >
          新しいカテゴリを作成
        </Link>
      </div>

          <div className="mb-2">
            クリックすると各カテゴリの名前編集・削除画面に移動します。
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <div
                key={category.id}
                className={twMerge(
                  "rounded-md px-2 py-0.5",
                  "border border-slate-400 text-slate-500"
                )}
              >
                <Link href={`/admin/categories/${category.id}`}>
                  {category.name}
                <div className="mt-2 flex justify-end">
                <button
                    type="button"
                    className={twMerge(
                        "ml-2 rounded bg-red-100 px-2 py-1 text-xs", 
                        "font-bold text-red-600 hover:bg-red-200"
                    )}
                    onClick={(e) => {
                      e.preventDefault();
                      handleDelete(category.id);
                    }}
                    disabled={isLoading}
                  >
                    削除
                </button>
                </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;