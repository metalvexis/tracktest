import fs from 'fs';
import path from 'path';
import { main } from '../../main';

jest.spyOn(global.console, 'log');

test('10_single_e_20_UDELS', () => {
  const testFiles = path.join(__dirname, '../../../test');
  const input = fs.readFileSync(path.join(testFiles,'/in/basic/10_single_e_20_UDELS.in'))
  const output = fs.readFileSync(path.join(testFiles,'/out/basic/10_single_e_20_UDELS.out'))
  const stdIn = Buffer.from(input).toString().split("\n").filter(l => l !== '');
  const stdOut = Buffer.from(output).toString().split("\n").filter(l => l !== '');

  main(stdIn);
  stdOut.forEach((line, i) => {
    expect(console.log).toHaveBeenNthCalledWith(i+1, line);
  });
  
});