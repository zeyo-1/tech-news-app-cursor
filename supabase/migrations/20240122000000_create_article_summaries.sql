-- Create article_summaries table
CREATE TABLE article_summaries (
  id BIGSERIAL PRIMARY KEY,
  url TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on url
CREATE UNIQUE INDEX article_summaries_url_idx ON article_summaries(url);

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at
CREATE TRIGGER update_article_summaries_updated_at
  BEFORE UPDATE ON article_summaries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 