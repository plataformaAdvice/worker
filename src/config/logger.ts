import pino from "pino";
import pinoConfig from "./pino";

const transport = pino.transport(pinoConfig);

export default pino(
  {
    level: "debug",
  },
  transport
);
