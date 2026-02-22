import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数が無い場合にエラーで落とさないためのガード
if (!supabaseUrl || !supabaseAnonKey) {
  // 開発者に気づかせるための警告（オプション）
  if (process.env.NODE_ENV !== 'production') {
    console.warn("Supabase environment variables are missing.");
  }
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', // ビルドを通すためのダミーURL
  supabaseAnonKey || 'placeholder-key'
);
// import { createClient } from "@supabase/supabase-js";

// export const supabase = createClient(
//   process.env.NEXT_PUBLIC_SUPABASE_URL!,
//   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
// );