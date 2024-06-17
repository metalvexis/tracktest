import { parse } from "date-fns";
import { DATE_FORMAT, COMMANDS, RESPONSES } from "./constants";
import { ServiceState } from "./service_store";
import { parseStringToDate } from "./lib";
function main(lines: string[]) {
  const { getState } = ServiceState;
  const { calcEndOfMonth, upload, download, remove, launch, stop, upgrade, change } = getState();
  lines.forEach((v, i) => {
    if (v === "" || !v) return;
    const [command, ...args] = v.split(" ");

    switch (command) {
      case COMMANDS.CALC:
        calcEndOfMonth();
        break;

      case COMMANDS.UPGRADE:
        const upgradeDate = parseStringToDate(`${args[0]} ${args[1]}`);
        upgrade(upgradeDate, +args[2]);
        break;

      case COMMANDS.CHANGE:
        const changeDate = parseStringToDate(`${args[0]} ${args[1]}`);
        change(changeDate, args[2], +args[3] );
        break;

      case COMMANDS.LAUNCH:
        const launchDate = parseStringToDate(`${args[0]} ${args[1]}`);
        launch(launchDate, +args[2]);
        break;

      case COMMANDS.STOP:
        const stopDate = parseStringToDate(`${args[0]} ${args[1]}`);
        const startDate = parseStringToDate(`${args[2]} ${args[3]}`);
        stop(stopDate, startDate, +args[4]);
        break;

      case COMMANDS.UPLOAD:
        const uploadDate = parseStringToDate(`${args[0]} ${args[1]}`);
        upload(uploadDate, +args[2]);
        break;

      case COMMANDS.DOWNLOAD:
        const downloadDate = parseStringToDate(`${args[0]} ${args[1]}`);
        download(downloadDate, +args[2]);
        break;

      case COMMANDS.DELETE:
        const removeDate = parseStringToDate(`${args[0]} ${args[1]}`);
        remove(removeDate, +args[2]);
        break;
    }
  });
}

function readFromStdin(): Promise<string[]> {
  return new Promise((resolve) => {
    let data: string = "";
    process.stdin.resume();
    process.stdin.setEncoding("utf8");

    process.stdin.on("data", (d) => {
      data += d;
    });
    process.stdin.on("end", () => {
      resolve(data.split("\n"));
    });
  });
}

readFromStdin().then(main);
