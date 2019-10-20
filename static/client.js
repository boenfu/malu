const socket = io("localhost:9710", { path: "/ws" });

socket.emit("login", { account: "boen", password: "123456", csr: true }, res =>
  console.log(`登录${res ? "成功" : "失败"}...`)
);
