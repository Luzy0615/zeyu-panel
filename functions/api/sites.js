export async function onRequestGet(context) {
  try {
    const { results } = await context.env.DB.prepare("SELECT * FROM sites").all();
    return Response.json(results);
  } catch (e) {
    return Response.json([]);
  }
}

export async function onRequestPost(context) {
  try {
    const { title, desc, url, icon } = await context.request.json();
    const info = await context.env.DB.prepare(
      "INSERT INTO sites (title, desc, url, icon) VALUES (?, ?, ?, ?)"
    ).bind(title, desc, url, icon).run();
    return Response.json({ message: "Success", id: info.meta.last_row_id });
  } catch (err) {
    return new Response(err.message, { status: 500 });
  }
}
