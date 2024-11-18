import pino from "pino";
import pinoConfig from "../config/pino";

const transport = pino.transport(pinoConfig);

export default pino(
  {
    level: "debug",
  },
  transport
);
