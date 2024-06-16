import { parse } from "date-fns";
import { DATE_FORMAT, COMMANDS, RESPONSES} from "./constants";
import { ServiceState } from "./service_store";
import { parseStringToDate } from "./lib";
function main(lines: string[]) {
  const { getState } = ServiceState;
  const { upload } = getState();
  lines.forEach((v, i) => {
    if (v === "" || !v) return;
    const [command, ...args] = v.split(" ");
    
    switch (command) {
      case COMMANDS.CALC:
        break;

      case COMMANDS.UPGRADE:
        break;
        
      case COMMANDS.CHANGE:
        break;

      case COMMANDS.LAUNCH:
        
        break;
        
      case COMMANDS.STOP:
        break;

      case COMMANDS.UPLOAD:
        upload(
          parseStringToDate(`${args[0]} ${args[1]}`),
          +args[2]
        )
        break;
        
      case COMMANDS.DOWNLOAD:
        break;

      case COMMANDS.DELETE:        
        break;
    }    
  });
}

function readFromStdin(): Promise<string[]> {
  return new Promise(resolve => {
    let data: string = "";
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", d => {
      data += d;
    });
    process.stdin.on("end", () => {
      resolve(data.split("\n"));
    });
  })
}

readFromStdin().then(main)
