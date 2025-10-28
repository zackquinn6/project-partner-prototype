-- Copy images from archived Tile Flooring project to published one
UPDATE projects 
SET 
  images = ARRAY[
    'https://drshvrukkavtpsprfcbc.supabase.co/storage/v1/object/public/project-images/0c3cecc0-bf7d-49e7-a94a-071f5d80fea3-1761666272341.png',
    'https://drshvrukkavtpsprfcbc.supabase.co/storage/v1/object/public/project-images/0c3cecc0-bf7d-49e7-a94a-071f5d80fea3-1761673563746.png'
  ],
  cover_image = 'https://drshvrukkavtpsprfcbc.supabase.co/storage/v1/object/public/project-images/0c3cecc0-bf7d-49e7-a94a-071f5d80fea3-1761673563746.png'
WHERE id = '04e8b010-9987-4e33-a671-3c8b337a8f45';