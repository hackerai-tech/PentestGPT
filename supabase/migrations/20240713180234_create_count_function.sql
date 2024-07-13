CREATE OR REPLACE FUNCTION get_feedback_summary()
RETURNS TABLE (
  feedback_good BIGINT,
  feedback_bad BIGINT,
  plugin_used BIGINT,
  plugin_not_used BIGINT,
  rag_used BIGINT,
  rag_not_used BIGINT,
  reviewed BIGINT,
  not_reviewed BIGINT,
  all_time BIGINT,
  last_6h BIGINT,
  last_12h BIGINT,
  last_24h BIGINT,
  last_7d BIGINT
) AS $$
BEGIN
  IF is_moderator(auth.uid()) THEN
    RETURN QUERY
    SELECT
      SUM(CASE WHEN feedback = 'good' THEN 1 ELSE 0 END) AS feedback_good,
      SUM(CASE WHEN feedback = 'bad' THEN 1 ELSE 0 END) AS feedback_bad,
      SUM(CASE WHEN plugin != 'none' THEN 1 ELSE 0 END) AS plugin_used,
      SUM(CASE WHEN plugin = 'none' THEN 1 ELSE 0 END) AS plugin_not_used,
      SUM(CASE WHEN f.rag_used = true THEN 1 ELSE 0 END) AS rag_used,
      SUM(CASE WHEN f.rag_used = false THEN 1 ELSE 0 END) AS rag_not_used,
      SUM(CASE WHEN fr.reviewed_by IS NOT NULL THEN 1 ELSE 0 END) AS reviewed,
      SUM(CASE WHEN fr.reviewed_by IS NULL THEN 1 ELSE 0 END) AS not_reviewed,
      COUNT(*) AS all_time,
      SUM(CASE WHEN created_at >= NOW() - INTERVAL '6 hours' THEN 1 ELSE 0 END) AS last_6h,
      SUM(CASE WHEN created_at >= NOW() - INTERVAL '12 hours' THEN 1 ELSE 0 END) AS last_12h,
      SUM(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 ELSE 0 END) AS last_24h,
      SUM(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 ELSE 0 END) AS last_7d
    FROM feedback f
    LEFT JOIN feedback_reviews fr ON fr.feedback_id = f.id;
  END IF;
END;
$$ LANGUAGE plpgsql;
