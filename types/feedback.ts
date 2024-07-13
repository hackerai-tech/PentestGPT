import { Database } from "@/supabase/types"

export type Feedback = Database["public"]["Tables"]["feedback"]["Row"]

export type FeedbackWithReview = Feedback & {
  feedback_reviews: {
    id: string
    reviewed_by: string
    reviewed_at: string
    notes: string | null
  } | null
}
