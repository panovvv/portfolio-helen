export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook("error", async (error, { event }) => {
    if (!event) return;

    const statusCode =
      (error as any).statusCode || (error as any).status || 500;
    const message =
      statusCode === 404 ? "Page not found" : "An unexpected error occurred";

    event.node.res.statusCode = statusCode;
    event.node.res.setHeader("content-type", "text/html; charset=utf-8");
    event.node.res.end(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${statusCode === 404 ? "Page Not Found" : "Error"} — Elena Panova Photography</title>
  <style>
    body { margin: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: system-ui, -apple-system, sans-serif; background: #f3f4f6; color: #111827; }
    .container { text-align: center; padding: 2rem; }
    h1 { font-size: 2.25rem; font-weight: 700; margin-bottom: 1rem; }
    p { font-size: 1.125rem; margin-bottom: 2rem; color: #6b7280; }
    a { display: inline-block; padding: 0.75rem 1.5rem; background: #2563eb; color: #fff; border-radius: 0.5rem; text-decoration: none; font-weight: 500; transition: background 0.2s; }
    a:hover { background: #1d4ed8; }
  </style>
</head>
<body>
  <div class="container">
    <h1>${statusCode === 404 ? "Page Not Found" : `Error ${statusCode}`}</h1>
    <p>${message}</p>
    <a href="/">Go back home</a>
  </div>
</body>
</html>`);
  });
});
