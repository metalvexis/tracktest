import { parse } from "date-fns";
import { DATE_FORMAT, COMMANDS, RESPONSES} from "./constants";
import { ServiceStore } from "./service_store";
function main(lines: string[]) {
  /**
   * このコードは標準入力と標準出力を用いたサンプルコードです。
   * このコードは好きなように編集・削除してもらって構いません。
   *
   * This is a sample code to use stdin and stdout.
   * You can edit and even remove this code as you like.
  */
  const { getState } = ServiceStore;
  const { upload } = getState();
  lines.forEach((v, i) => {
    if (v === "" || !v) return;
    const [command, ...args] = v.split(" ");
    const isUseRequest = [
      COMMANDS.UPLOAD,
      COMMANDS.DOWNLOAD,
      COMMANDS.DELETE,
      COMMANDS.LAUNCH,
      COMMANDS.STOP
    ].includes(command as COMMANDS);

    if (getState().service.is_fee_overrun && isUseRequest) {
      return console.log(RESPONSES.EXCEED_USAGE_LIMIT(COMMANDS[command as COMMANDS]))
    };
    
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
          parse(`${args[0]} ${args[1]}`, DATE_FORMAT, new Date()),
          +args[2]
        )
        break;
        
      case COMMANDS.DOWNLOAD:        
        break;

      case COMMANDS.DELETE:        
        break;
    }
    
    console.log('Allocation: ', getState().service.allocation);
    console.log('Fees: ', getState().service.calculated_fees);
    
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
