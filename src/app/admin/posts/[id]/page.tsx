"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { twMerge } from "tailwind-merge";
import { Post } from "@/app/_types/Post";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";

// カテゴリをフェッチしたときのレスポンスのデータ型
type CategoryApiResponse = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type PostApiResponse = {
  id: string;
  title: string;
  content: string;
  coverImageURL: string;
  categoryIds: string[];
};

// 投稿記事の編集・削除のページ
const Page: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fetchErrorMsg, setFetchErrorMsg] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newTitleError, setNewTitleError] = useState("");

  const [newContent, setNewContent] = useState("");
  const [newContentError, setNewContentError] = useState("");

  const [newCoverImageURL, setNewCoverImageURL] = useState("");
  const [newCoverImageURLError, setNewCoverImageURLError] = useState("");

  const [categoryOptions, setCategoryOptions] = useState<
    CategoryApiResponse[]
  >([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  const [currentPost, setCurrentPost] = useState<PostApiResponse | undefined>(
    undefined
  );

  // 動的ルートパラメータから id を取得 （URL:/admin/posts/[id]）
  const { id } = useParams() as { id: string };

  // ページの移動に使用するフック
  const router = useRouter();

  // 投稿記事配列 (State)。取得中と取得失敗時は null、既存投稿記事が0個なら []
  const [posts, setPosts] = useState<PostApiResponse[] | null>(null);

  // ウェブAPI (/api/posts) から投稿記事の一覧をフェッチする関数の定義
  const fetchPosts = async () => {
    try {
      setIsLoading(true);

      // フェッチ処理の本体
      const requestUrl = "/api/posts";
      const res = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });

      // レスポンスのステータスコードが200以外の場合 (投稿記事のフェッチに失敗した場合)
      if (!res.ok) {
        setPosts(null);
        throw new Error(
          `投稿記事の一覧のフェッチに失敗しました: (${res.status}: ${res.statusText})`
        ); // -> catch節に移動
      }

      // レスポンスのボディをJSONとして読み取り投稿記事配列 (State) にセット
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
      // 成功した場合も失敗した場合もローディング状態を解除
      setIsLoading(false);
    }
  };

  // ウェブAPI (/api/categories) からカテゴリの一覧をフェッチする関数の定義
  const fetchCategories = async () => {
    try {
      const requestUrl = "/api/categories";
      const res = await fetch(requestUrl, {
        method: "GET",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(
          `カテゴリの一覧のフェッチに失敗しました: (${res.status}: ${res.statusText})`
        );
      }

      const apiResBody = (await res.json()) as CategoryApiResponse[];
      setCategoryOptions(apiResBody);
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? error.message
          : `予期せぬエラーが発生しました ${error}`;
      console.error(errorMsg);
    }
  };

  // コンポーネントがマウントされたとき (初回レンダリングのとき) に1回だけ実行
  useEffect(() => {
    fetchPosts();
    fetchCategories();
  }, []);

  // posts または id が変更されたときにコールされる関数
  useEffect(() => {
    // id に対応する投稿記事を取得
    const post = posts?.find((c) => c.id === id);
    if (post !== undefined) {
      setCurrentPost(post);
      setNewTitle(post.title);
      setNewContent(post.content);
      setNewCoverImageURL(post.coverImageURL);
      setSelectedCategoryIds(post.categoryIds);
    }
  }, [posts, id]);

  // タイトルのバリデーション
  const isValidTitle = (title: string): string => {
    if (title.length < 1 || title.length > 100) {
      return "1文字以上100文字以内で入力してください。";
    }
    return "";
  };

  // コンテンツのバリデーション
  const isValidContent = (content: string): string => {
    if (content.length < 1) {
      return "1文字以上で入力してください。";
    }
    return "";
  };

  // カバー画像URLのバリデーション
  const isValidCoverImageURL = (url: string): string => {
    if (url.length < 1) {
      return "カバー画像のURLを入力してください。";
    }
    try {
      new URL(url);
      return "";
    } catch {
      return "有効なURLではありません。";
    }
  };

  // タイトルを設定するテキストボックスの値が変更されたときにコールされる関数
  const updateNewTitle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewTitleError(isValidTitle(e.target.value));
    setNewTitle(e.target.value);
  };

  // コンテンツを設定するテキストボックスの値が変更されたときにコールされる関数
  const updateNewContent = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewContentError(isValidContent(e.target.value));
    setNewContent(e.target.value);
  };

  // カバー画像URLを設定するテキストボックスの値が変更されたときにコールされる関数
  const updateNewCoverImageURL = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewCoverImageURLError(isValidCoverImageURL(e.target.value));
    setNewCoverImageURL(e.target.value);
  };

  // カテゴリ選択が変更されたときにコールされる関数
  const handleCategoryChange = (categoryId: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCategoryIds([...selectedCategoryIds, categoryId]);
    } else {
      setSelectedCategoryIds(
        selectedCategoryIds.filter((id) => id !== categoryId)
      );
    }
  };

  // 「投稿記事を更新」のボタンが押下されたときにコールされる関数
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // これを実行しないと意図せずページがリロードされるので注意
    setIsSubmitting(true);

    try {
      const requestUrl = `/api/admin/posts/${id}`;
      const res = await fetch(requestUrl, {
        method: "PUT",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: newTitle,
          content: newContent,
          coverImageURL: newCoverImageURL,
          categoryIds: selectedCategoryIds,
        }),
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }

      await fetchPosts(); // 投稿記事の一覧を再取得
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `投稿記事のPUTリクエストに失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 「削除」のボタンが押下されたときにコールされる関数
  const handleDelete = async () => {
    // prettier-ignore
    if (!window.confirm(`投稿記事「${currentPost?.title}」を本当に削除しますか？`)) {
      return;
    }

    setIsSubmitting(true);
    try {
      const requestUrl = `/api/admin/posts/${id}`;
      const res = await fetch(requestUrl, {
        method: "DELETE",
        cache: "no-store",
      });

      if (!res.ok) {
        throw new Error(`${res.status}: ${res.statusText}`);
      }
      // 投稿記事の一覧ページに移動
      router.replace("/admin/posts");
    } catch (error) {
      const errorMsg =
        error instanceof Error
          ? `投稿記事のDELETEリクエストに失敗しました\n${error.message}`
          : `予期せぬエラーが発生しました\n${error}`;
      console.error(errorMsg);
      window.alert(errorMsg);
      setIsSubmitting(false);
    }
  };

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

  // プレースホルダの id に一致する投稿記事が存在しないときの画面
  if (currentPost === undefined) {
    return (
      <div className="text-red-500">
        指定された id の投稿記事は存在しません。
      </div>
    );
  }

  return (
    <main>
      <div className="mb-4 text-2xl font-bold">投稿記事の編集・削除</div>

      <form
        onSubmit={handleSubmit}
        className={twMerge("mb-4 space-y-4", isSubmitting && "opacity-50")}
      >
        <div className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="title" className="block font-bold">
              タイトル
            </label>
            <input
              type="text"
              id="title"
              name="title"
              className="w-full rounded-md border-2 px-2 py-1"
              placeholder="タイトルを記入してください"
              value={newTitle}
              onChange={updateNewTitle}
              autoComplete="off"
              required
            />
            {newTitleError && (
              <div className="flex items-center space-x-1 text-sm font-bold text-red-500">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="mr-0.5"
                />
                <div>{newTitleError}</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="block font-bold">
              コンテンツ
            </label>
            <textarea
              id="content"
              name="content"
              className="w-full rounded-md border-2 px-2 py-1"
              placeholder="コンテンツを記入してください"
              value={newContent}
              onChange={updateNewContent}
              rows={10}
              required
            />
            {newContentError && (
              <div className="flex items-center space-x-1 text-sm font-bold text-red-500">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="mr-0.5"
                />
                <div>{newContentError}</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="coverImageURL" className="block font-bold">
              カバー画像URL
            </label>
            <input
              type="text"
              id="coverImageURL"
              name="coverImageURL"
              className="w-full rounded-md border-2 px-2 py-1"
              placeholder="カバー画像のURLを記入してください"
              value={newCoverImageURL}
              onChange={updateNewCoverImageURL}
              autoComplete="off"
              required
            />
            {newCoverImageURLError && (
              <div className="flex items-center space-x-1 text-sm font-bold text-red-500">
                <FontAwesomeIcon
                  icon={faTriangleExclamation}
                  className="mr-0.5"
                />
                <div>{newCoverImageURLError}</div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block font-bold">カテゴリ</label>
            <div className="space-y-2">
              {categoryOptions.map((category) => (
                <label key={category.id} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={selectedCategoryIds.includes(category.id)}
                    onChange={(e) =>
                      handleCategoryChange(category.id, e.target.checked)
                    }
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <button
            type="submit"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-indigo-500 text-white hover:bg-indigo-600",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
            disabled={
              isSubmitting ||
              newTitleError !== "" ||
              newTitle === "" ||
              newContentError !== "" ||
              newContent === "" ||
              newCoverImageURLError !== "" ||
              newCoverImageURL === ""
            }
          >
            投稿記事を更新
          </button>

          <button
            type="button"
            className={twMerge(
              "rounded-md px-5 py-1 font-bold",
              "bg-red-500 text-white hover:bg-red-600"
            )}
            onClick={handleDelete}
          >
            削除
          </button>
        </div>
      </form>
       {isSubmitting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="flex items-center rounded-lg bg-white px-8 py-4 shadow-lg">
            <FontAwesomeIcon
              icon={faSpinner}
              className="mr-2 animate-spin text-gray-500"
            />
            <div className="flex items-center text-gray-500">処理中...</div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Page;