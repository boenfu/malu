/* eslint-disable @typescript-eslint/explicit-function-return-type */

const socket = io("localhost:9710", { path: "/ws" });

socket.emit("login", { account: "dll", password: "123456", csr: true }, res =>
  console.log(`登录${res ? "成功" : "失败"}...`)
);

function send() {
  socket.emit(
    "msg:send",
    { content: msg.value, to: "5dac6cf8d169824710fc0939" },
    console.log
  );
}
