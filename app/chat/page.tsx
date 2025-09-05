import { redirect } from "next/navigation"
import { cookies } from "next/headers"
import ChatBox from "@/components/chat/chat-box"
import { getServerSupabase } from "@/lib/supabase/server"

export default async function ChatPage() {
  const cookieStore = cookies()
  const supabase = await getServerSupabase()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold mb-4 text-balance">AI Assistant</h1>
      <p className="text-sm text-muted-foreground mb-4">
        Ask about carbon calculations, project economics, or how credits are computed for your land.
      </p>
      <ChatBox />
    </div>
  )
}
