Half-figure poses, roughly 5:6. Filenames renamed from the originals to plain
kebab-case: a colon (natural:smiling), a space (looking-to-the right) and an
unbalanced bracket (watching-a-tablet(monitoring) are all trouble in a URL.

  hamad/   agreeing asking curious explaining listening monitoring
           reading talking thinking thumbs-up
  rouda/   asking curious excited explaining listening looking-aside
           pointing satisfied scared smiling talking thinking thumbs-up

The set is not symmetric, and components/cyber/Character.tsx falls back rather
than 404s: a pose one of them does not have degrades to talking or listening.

Backgrounds are solid warm cream (#ebe0d7), not transparent, so a figure is
always drawn inside a rounded plate with a cream ground behind it. Do not drop
one straight onto a coloured panel; the rectangle will show.

Adding a pose: drop the PNG in, add its name to POSES in Character.tsx.
