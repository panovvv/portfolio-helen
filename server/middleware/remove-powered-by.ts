export default defineEventHandler((event) => {
  const res = event.node.res;
  const originalWriteHead = res.writeHead.bind(res);
  res.writeHead = function (
    ...args: Parameters<typeof res.writeHead>
  ): ReturnType<typeof res.writeHead> {
    res.removeHeader("x-powered-by");
    return originalWriteHead(...args);
  };
});
