ALTER TABLE knowledge_entries ADD COLUMN status TEXT DEFAULT 'pending';
UPDATE knowledge_entries SET status = 'pending' WHERE status IS NULL;
