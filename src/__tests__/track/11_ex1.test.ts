import fs from 'fs';
import path from 'path';
import { main } from '../../main';

jest.spyOn(global.console, 'log');

test('11_ex1', () => {
  const testFiles = path.join(__dirname, '../../../test');
  const input = fs.readFileSync(path.join(testFiles,'/in/basic/11_ex1.in'))
  const output = fs.readFileSync(path.join(testFiles,'/out/basic/11_ex1.out'))
  const stdIn = Buffer.from(input).toString().split("\n").filter(l => l !== '');
  const stdOut = Buffer.from(output).toString().split("\n").filter(l => l !== '');

  main(stdIn);
  stdOut.forEach((line, i) => {
    expect(console.log).toHaveBeenNthCalledWith(i+1, line);
  });
  
});