import fs from 'fs';
import path from 'path';
import { main } from '../../main';

jest.spyOn(global.console, 'log');

test('20_composite_20_UDELSPC', () => {
  const testFiles = path.join(__dirname, '../../../test');
  const input = fs.readFileSync(path.join(testFiles,'/in/basic/20_composite_20_UDELSPC.in'))
  const output = fs.readFileSync(path.join(testFiles,'/out/basic/20_composite_20_UDELSPC.out'))
  const stdIn = Buffer.from(input).toString().split("\n").filter(l => l !== '');
  const stdOut = Buffer.from(output).toString().split("\n").filter(l => l !== '');

  main(stdIn);
  stdOut.forEach((line, i) => {
    if(i > stdIn.length-1) return;
    expect(console.log).toHaveBeenNthCalledWith(i+1, line);
  });
  
});