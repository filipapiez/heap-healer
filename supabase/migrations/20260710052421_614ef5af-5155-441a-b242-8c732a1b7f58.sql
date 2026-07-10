ALTER TABLE public.workspaces
ADD COLUMN IF NOT EXISTS watermark JSONB NOT NULL DEFAULT jsonb_build_object(
  'enabled', false,
  'position', 'bottom-right',
  'opacity', 0.7,
  'text', null,
  'image_url', null
);