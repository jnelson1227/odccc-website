-- Carvers now carry two photos: the sculpture they competed with (photo_path,
-- already there) and the photo of the carver themselves that they submitted to
-- the Chamber (portrait_path). The Carvers grid leads with the portrait; the
-- carver's own page shows both.
alter table public.carvers
  add column if not exists portrait_path text,
  add column if not exists portrait_alt text;

comment on column public.carvers.photo_path is 'Sculpture the carver competed with';
comment on column public.carvers.portrait_path is 'Photo of the carver, as submitted';
